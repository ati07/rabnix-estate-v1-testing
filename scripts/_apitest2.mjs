// Re-test the property/inquiry lifecycle with a REAL registered user (real DB row),
// to isolate the demo-user FK bug from genuine endpoint bugs.
const BASE = process.env.BASE || 'http://localhost:3000';
let pass = 0, fail = 0; const fails = [];
function rec(id, ok, detail){ if(ok)pass++;else{fail++;fails.push(id);} console.log(`${ok?'PASS':'FAIL'}  ${id.padEnd(6)} ${detail}`);}
function S(){return{cookie:''};}
async function req(s,m,p,{body}={}){const h={};if(s?.cookie)h.cookie=s.cookie;let pl;if(body!==undefined){h['content-type']='application/json';pl=JSON.stringify(body);}const r=await fetch(BASE+p,{method:m,headers:h,body:pl,redirect:'manual'});const sc=r.headers.get('set-cookie');if(sc&&s){const mm=sc.match(/rabnix_session=[^;]*/);if(mm)s.cookie=mm[0];}let d;const t=await r.text();try{d=JSON.parse(t);}catch{d=t;}return{status:r.status,data:d};}

async function main(){
  const admin=S(), realOwner=S(), realBuyer=S();
  await req(admin,'POST','/api/auth/login',{body:{emailOrPhone:'admin@rabnixestate.com',password:'admin123'}});
  const oEmail=`owner_${Date.now()}@ex.com`, bEmail=`buyer_${Date.now()}@ex.com`;
  await req(realOwner,'POST','/api/auth/register',{body:{name:'Real Owner',email:oEmail,phone:'9800011111',password:'secret123',role:'owner'}});
  await req(realBuyer,'POST','/api/auth/register',{body:{name:'Real Buyer',email:bEmail,phone:'9800022222',password:'secret123',role:'buyer'}});

  let pid=null;
  {const r=await req(realOwner,'POST','/api/properties',{body:{title:'Real QA Flat',city:'Bangalore',locality:'Whitefield',price:6000000,bhk:3,carpetAreaSqFt:1400}});pid=r.data?.property?.id;rec('2.5',r.status===200&&r.data?.property?.verificationStatus==='pending',`create -> ${r.status} status=${r.data?.property?.verificationStatus}`);}
  {const r=await req(realOwner,'GET','/api/properties?mine=1');rec('2.3',r.data?.properties?.some(p=>p.id===pid),`mine=1 -> ${r.data?.properties?.length}`);}
  {const r=await req(realOwner,'PATCH',`/api/properties/${pid}`,{body:{price:6500000}});rec('2.8a',r.data?.property?.price===6500000,`owner edit -> ${r.data?.property?.price}`);}
  {const r=await req(realBuyer,'PATCH',`/api/properties/${pid}`,{body:{price:1}});rec('2.8b',r.status===403,`non-owner edit -> ${r.status} (exp 403)`);}
  {const r=await req(realOwner,'PATCH',`/api/properties/${pid}`,{body:{verificationStatus:'approved'}});rec('2.9a',r.status===403,`owner self-approve -> ${r.status} (exp 403)`);}
  {const r=await req(admin,'PATCH',`/api/properties/${pid}`,{body:{verificationStatus:'approved'}});rec('2.9b',r.data?.property?.isVerified===true,`admin approve -> verified=${r.data?.property?.isVerified}`);}

  let iid=null;
  {const r=await req(realBuyer,'POST','/api/inquiries',{body:{propertyId:pid,buyerName:'Real Buyer',buyerPhone:'9800022222',message:'Interested'}});iid=r.data?.inquiry?.id;rec('4.2',r.status===200&&!!iid,`create inquiry -> ${r.status}`);}
  {const r=await req(realOwner,'GET','/api/inquiries');rec('4.1',r.data?.inquiries?.some(i=>i.id===iid),`owner sees inquiry -> ${r.data?.inquiries?.length}`);}
  {const r=await req(realOwner,'PATCH',`/api/inquiries/${iid}`,{body:{status:'contacted'}});rec('4.3a',r.data?.inquiry?.status==='contacted',`seller update -> ${r.data?.inquiry?.status}`);}
  {const r=await req(realBuyer,'PATCH',`/api/inquiries/${iid}`,{body:{status:'closed'}});rec('4.3b',r.status===403,`non-seller update -> ${r.status} (exp 403)`);}

  {const r=await req(realBuyer,'DELETE',`/api/properties/${pid}`);rec('2.10a',r.status===403,`non-owner delete -> ${r.status} (exp 403)`);}
  {const r=await req(realOwner,'DELETE',`/api/properties/${pid}`);rec('2.10b',r.status===200,`owner delete -> ${r.status}`);}

  // cleanup users
  const list=await req(admin,'GET','/api/users');
  for(const e of [oEmail,bEmail]){const u=list.data?.users?.find(x=>x.email===e);if(u)await req(admin,'DELETE',`/api/users/${u.id}`);}

  console.log(`\n===== ${pass} passed, ${fail} failed =====`); if(fail)console.log('FAILURES:',fails.join(', '));
  process.exit(fail?1:0);
}
main().catch(e=>{console.error('RUNNER ERROR',e);process.exit(2);});
