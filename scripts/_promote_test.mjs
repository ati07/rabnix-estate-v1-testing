// Verify admin-only promotion flags: owner blocked (403), admin allowed, and the
// promoted listing then qualifies for the "Exclusive/Popular Owner" home rails.
const BASE = process.env.BASE || 'http://localhost:3000';
const PID = process.env.PID; // pass the property id
const OWNER_EMAIL = process.env.OWNER_EMAIL, OWNER_PASS = process.env.OWNER_PASS || 'secret123';
function S(){return{cookie:''};}
async function req(s,m,p,{body}={}){const h={};if(s?.cookie)h.cookie=s.cookie;let pl;if(body!==undefined){h['content-type']='application/json';pl=JSON.stringify(body);}const r=await fetch(BASE+p,{method:m,headers:h,body:pl,redirect:'manual'});const sc=r.headers.get('set-cookie');if(sc&&s){const mm=sc.match(/rabnix_session=[^;]*/);if(mm)s.cookie=mm[0];}let d;const t=await r.text();try{d=JSON.parse(t);}catch{d=t;}return{status:r.status,data:d};}
let pass=0,fail=0; const rec=(id,ok,d)=>{ok?pass++:fail++;console.log(`${ok?'PASS':'FAIL'}  ${id.padEnd(7)} ${d}`);};

const owner=S(), admin=S(), guest=S();
await req(admin,'POST','/api/auth/login',{body:{emailOrPhone:'admin@rabnixestate.com',password:'admin123'}});
await req(owner,'POST','/api/auth/login',{body:{emailOrPhone:OWNER_EMAIL,password:OWNER_PASS}});

// A) owner cannot self-promote
let r=await req(owner,'PATCH',`/api/properties/${PID}`,{body:{isExclusiveOwner:true}});
rec('owner-block', r.status===403, `owner set isExclusiveOwner -> ${r.status} (expect 403) msg="${r.data?.error||''}"`);

// B) owner normal edit still works (proves we only blocked the promo flag)
r=await req(owner,'PATCH',`/api/properties/${PID}`,{body:{description:'Updated by owner - still editable.'}});
rec('owner-edit', r.status===200, `owner edit description -> ${r.status}`);

// C) admin can promote both flags
r=await req(admin,'PATCH',`/api/properties/${PID}`,{body:{isExclusiveOwner:true,isFeatured:true}});
rec('admin-promo', r.data?.property?.isExclusiveOwner===true && r.data?.property?.isFeatured===true,
  `admin promote -> isExclusiveOwner=${r.data?.property?.isExclusiveOwner}, isFeatured=${r.data?.property?.isFeatured}`);

// D) now it qualifies for the Owner rail (isExclusiveOwner && city match)
r=await req(guest,'GET','/api/properties?scope=public');
const p=r.data?.properties?.find(x=>x.id===PID);
rec('rail-owner', !!p && p.isExclusiveOwner===true, `public feed shows it with isExclusiveOwner=${p?.isExclusiveOwner} (Popular/Exclusive Owner rail eligible)`);

// E) admin can also demote (toggle off)
r=await req(admin,'PATCH',`/api/properties/${PID}`,{body:{isFeatured:false}});
rec('admin-demote', r.data?.property?.isFeatured===false, `admin demote isFeatured -> ${r.data?.property?.isFeatured}`);

// F) promotion was logged
r=await req(admin,'GET','/api/activity');
const logged=r.data?.logs?.some(l=>l.action==='property_promoted');
rec('activity', logged, `activity log has 'property_promoted' entry -> ${logged}`);

console.log(`\n===== ${pass} passed, ${fail} failed =====`);
process.exit(fail?1:0);
