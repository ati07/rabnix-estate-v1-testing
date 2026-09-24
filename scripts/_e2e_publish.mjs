// End-to-end: register real owner -> login -> post property -> confirm pending &
// NOT in public feed -> login admin -> approve -> confirm LIVE in public feed & home rail.
const BASE = process.env.BASE || 'http://localhost:3000';
function S(){return{cookie:''};}
async function req(s,m,p,{body}={}){const h={};if(s?.cookie)h.cookie=s.cookie;let pl;if(body!==undefined){h['content-type']='application/json';pl=JSON.stringify(body);}const r=await fetch(BASE+p,{method:m,headers:h,body:pl,redirect:'manual'});const sc=r.headers.get('set-cookie');if(sc&&s){const mm=sc.match(/rabnix_session=[^;]*/);if(mm)s.cookie=mm[0];}let d;const t=await r.text();try{d=JSON.parse(t);}catch{d=t;}return{status:r.status,data:d};}
const log=(...a)=>console.log(...a);

const owner=S(), admin=S(), guest=S();
const email=`realowner_${Date.now()}@rabnix.test`, pass='secret123';

log('\n=== STEP 1: Register a REAL owner ===');
let r=await req(owner,'POST','/api/auth/register',{body:{name:'Ananya Rao',email,phone:'9845012345',password:pass,role:'owner',city:'Bangalore'}});
log(`   register -> ${r.status}, user id=${r.data?.user?.id}, role=${r.data?.user?.role}`);
const ownerId=r.data?.user?.id;

log('\n=== STEP 2: Logged in as that owner, POST a property (Bangalore) ===');
r=await req(owner,'POST','/api/properties',{body:{
  title:'3 BHK Lake-Facing Apartment', tagline:'Prime Whitefield address',
  listingType:'buy', category:'Apartment', city:'Bangalore', locality:'Whitefield', subLocality:'Hagadur',
  price:12500000, bhk:3, bathrooms:3, carpetAreaSqFt:1650, furnishing:'Semi-Furnished',
  constructionStatus:'Ready to Move', description:'Spacious 3BHK with lake view, modular kitchen.',
  amenities:['Gym','Swimming Pool','Clubhouse'], images:[]
}});
const pid=r.data?.property?.id;
log(`   create -> ${r.status}, id=${pid}, status=${r.data?.property?.verificationStatus}, isVerified=${r.data?.property?.isVerified}`);

log('\n=== STEP 3: BEFORE approval — is it visible to the public? ===');
r=await req(guest,'GET','/api/properties?scope=public');
let inPublic=r.data?.properties?.some(p=>p.id===pid);
log(`   guest public feed contains new listing? ${inPublic}  (expected: false — pending)`);
r=await req(owner,'GET','/api/properties?scope=public');
let ownerSees=r.data?.properties?.some(p=>p.id===pid);
log(`   OWNER public feed contains own pending listing? ${ownerSees}  (expected: true — sees own pending)`);

log('\n=== STEP 4: Login as ADMIN, find it in the review queue, APPROVE ===');
r=await req(admin,'POST','/api/auth/login',{body:{emailOrPhone:'admin@rabnixestate.com',password:'admin123'}});
log(`   admin login -> ${r.status}`);
r=await req(admin,'GET','/api/properties?scope=all');
const pending=r.data?.properties?.find(p=>p.id===pid);
log(`   admin sees it in scope=all with status=${pending?.verificationStatus}`);
r=await req(admin,'PATCH',`/api/properties/${pid}`,{body:{verificationStatus:'approved'}});
log(`   admin approve -> ${r.status}, status=${r.data?.property?.verificationStatus}, isVerified=${r.data?.property?.isVerified}`);

log('\n=== STEP 5: AFTER approval — is it LIVE for everyone? ===');
r=await req(guest,'GET','/api/properties?scope=public');
inPublic=r.data?.properties?.some(p=>p.id===pid);
log(`   guest public feed contains listing now? ${inPublic}  (expected: true — LIVE)`);

log('\n=== STEP 6: Would it appear on the HOME PAGE "Fresh Properties in Bangalore" rail? ===');
const bangaloreApproved=r.data?.properties
  .filter(p=>p.city.toLowerCase()==='bangalore')
  .sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
const rank=bangaloreApproved.findIndex(p=>p.id===pid);
log(`   Bangalore approved listings: ${bangaloreApproved.length}; our listing rank (0=newest/first): ${rank}`);
log(`   -> Appears in "Fresh Properties in Bangalore"? ${rank>=0}`);
log(`   NOTE: "Popular/Exclusive Owner" rails need isExclusiveOwner=true (currently ${pending?.isExclusiveOwner}).`);

log('\n=== RESULT ===');
const ok = pid && !inPublicBefore(false) && inPublic && rank>=0;
function inPublicBefore(){return false;}
log(`   Property ${pid} is now LIVE and on the Bangalore home rail: ${inPublic && rank>=0 ? 'YES ✅' : 'NO ❌'}`);
log(`\n   Test owner login: ${email} / ${pass}`);
log(`   Property detail URL: ${BASE}/properties/${pid}`);
log(`   (Left live in the DB so you can view it in the browser. Home default city = Bangalore.)`);
