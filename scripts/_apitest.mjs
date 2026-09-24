// Lightweight API test runner. Tracks the rabnix_session cookie per "session".
const BASE = process.env.BASE || 'http://localhost:3000';
let pass = 0, fail = 0;
const results = [];

function rec(id, ok, detail) {
  results.push({ id, ok, detail });
  if (ok) pass++; else fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id.padEnd(6)} ${detail}`);
}

// A session = a mutable cookie holder.
function newSession() { return { cookie: '' }; }

async function req(sess, method, path, { body, form } = {}) {
  const headers = {};
  if (sess?.cookie) headers.cookie = sess.cookie;
  let payload;
  if (form) { payload = form; }
  else if (body !== undefined) { headers['content-type'] = 'application/json'; payload = JSON.stringify(body); }
  const res = await fetch(BASE + path, { method, headers, body: payload, redirect: 'manual' });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie && sess) {
    const m = setCookie.match(/rabnix_session=[^;]*/);
    if (m) sess.cookie = m[0];
  }
  let data = null;
  const txt = await res.text();
  try { data = JSON.parse(txt); } catch { data = txt; }
  return { status: res.status, data };
}

async function login(sess, emailOrPhone, password) {
  return req(sess, 'POST', '/api/auth/login', { body: { emailOrPhone, password } });
}

async function main() {
  const guest = newSession();
  const admin = newSession();
  const buyer = newSession();
  const owner = newSession();

  // ---------- 1. AUTH ----------
  {
    const r = await login(admin, 'admin@rabnixestate.com', 'admin123');
    rec('1.5a', r.status === 200 && r.data?.success && r.data?.user?.role === 'admin', `admin login -> ${r.status} role=${r.data?.user?.role}`);
  }
  {
    const r = await login(buyer, 'buyer@rabnix.com', 'password123');
    rec('1.3', r.status === 200 && r.data?.user?.role === 'buyer', `buyer login -> ${r.status} role=${r.data?.user?.role}`);
  }
  {
    const r = await login(owner, 'owner@rabnix.com', 'password123');
    rec('1.5b', r.status === 200 && r.data?.user?.role === 'owner', `owner login -> ${r.status}`);
  }
  {
    const r = await login(newSession(), 'buyer@rabnix.com', 'wrongpass');
    rec('1.6', r.status === 401, `wrong password -> ${r.status} (expect 401)`);
  }
  {
    const r = await req(newSession(), 'POST', '/api/auth/login', { body: { emailOrPhone: '', password: '' } });
    rec('1.b', r.status === 400, `empty creds -> ${r.status} (expect 400)`);
  }
  const testEmail = `qa_${Date.now()}@example.com`;
  const reg = newSession();
  {
    const r = await req(reg, 'POST', '/api/auth/register', { body: { name: 'QA Bot', email: testEmail, phone: '9876500000', password: 'secret123', role: 'owner' } });
    rec('1.1', r.status === 200 && r.data?.user?.email === testEmail && r.data?.user?.role === 'owner', `register -> ${r.status} role=${r.data?.user?.role}`);
  }
  {
    const r = await req(newSession(), 'POST', '/api/auth/register', { body: { name: 'X', email: testEmail, phone: '9', password: 'secret123', role: 'owner' } });
    rec('1.2a', r.status === 409, `dup email -> ${r.status} (expect 409)`);
  }
  {
    const r = await req(newSession(), 'POST', '/api/auth/register', { body: { name: 'X', email: `x_${Date.now()}@e.com`, phone: '9', password: '123' } });
    rec('1.2b', r.status === 400, `short pwd -> ${r.status} (expect 400)`);
  }
  {
    const r = await req(newSession(), 'POST', '/api/auth/register', { body: { name: 'Hacker', email: `adm_${Date.now()}@e.com`, phone: '9', password: 'secret123', role: 'admin' } });
    rec('1.1b', r.data?.user?.role === 'buyer', `admin self-register blocked -> role=${r.data?.user?.role} (expect buyer)`);
  }
  {
    const r = await req(admin, 'GET', '/api/auth/me');
    rec('1.8a', r.data?.user?.role === 'admin', `me(admin) -> ${r.data?.user?.role}`);
  }
  {
    const r = await req(guest, 'GET', '/api/auth/me');
    rec('1.8b', r.data?.user == null, `me(guest) -> ${JSON.stringify(r.data?.user)} (expect null)`);
  }
  {
    const r = await req(reg, 'PATCH', '/api/auth/profile', { body: { city: 'Pune', companyName: 'QA Realty' } });
    rec('1.9a', r.data?.user?.city === 'Pune', `profile update -> city=${r.data?.user?.city}`);
  }
  {
    const r = await req(guest, 'PATCH', '/api/auth/profile', { body: { city: 'X' } });
    rec('1.9b', r.status === 401, `profile update guest -> ${r.status} (expect 401)`);
  }

  // ---------- 2. PROPERTIES ----------
  {
    const r = await req(guest, 'GET', '/api/properties?scope=public');
    rec('2.1', r.data?.success && Array.isArray(r.data?.properties) && r.data.properties.length > 0, `public list -> ${r.data?.properties?.length} items`);
  }
  {
    const r = await req(buyer, 'GET', '/api/properties?scope=all');
    rec('2.2a', r.status === 403, `scope=all as buyer -> ${r.status} (expect 403)`);
  }
  {
    const r = await req(admin, 'GET', '/api/properties?scope=all');
    rec('2.2b', r.status === 200 && r.data?.properties?.length >= 21, `scope=all as admin -> ${r.data?.properties?.length} items`);
  }
  {
    const r = await req(guest, 'GET', '/api/properties?mine=1');
    rec('2.3', r.status === 401, `mine=1 guest -> ${r.status} (expect 401)`);
  }
  let newPropId = null;
  {
    const r = await req(owner, 'POST', '/api/properties', { body: { title: 'QA Test Flat', city: 'Bangalore', locality: 'Whitefield', price: 5000000, bhk: 2, carpetAreaSqFt: 1000 } });
    newPropId = r.data?.property?.id;
    rec('2.5', r.status === 200 && r.data?.property?.verificationStatus === 'pending', `create -> ${r.status} status=${r.data?.property?.verificationStatus} id=${newPropId}`);
  }
  {
    const r = await req(owner, 'POST', '/api/properties', { body: { title: 'No price' } });
    rec('2.5b', r.status === 400, `create missing fields -> ${r.status} (expect 400)`);
  }
  {
    const r = await req(guest, 'POST', '/api/properties', { body: { city: 'X', locality: 'Y', price: 1 } });
    rec('2.5c', r.status === 401, `create as guest -> ${r.status} (expect 401)`);
  }
  {
    const r = await req(guest, 'GET', `/api/properties/${newPropId}`);
    rec('2.7', r.data?.property?.id === newPropId, `get by id -> ${r.status}`);
  }
  {
    const r = await req(guest, 'GET', '/api/properties/does-not-exist-xyz');
    rec('2.7b', r.status === 404, `get missing id -> ${r.status} (expect 404)`);
  }
  {
    const r = await req(owner, 'PATCH', `/api/properties/${newPropId}`, { body: { price: 5500000 } });
    rec('2.8a', r.data?.property?.price === 5500000, `owner edit -> price=${r.data?.property?.price}`);
  }
  {
    const r = await req(buyer, 'PATCH', `/api/properties/${newPropId}`, { body: { price: 1 } });
    rec('2.8b', r.status === 403, `non-owner edit -> ${r.status} (expect 403)`);
  }
  {
    const r = await req(owner, 'PATCH', `/api/properties/${newPropId}`, { body: { verificationStatus: 'approved' } });
    rec('2.9a', r.status === 403, `owner self-approve -> ${r.status} (expect 403)`);
  }
  {
    const r = await req(admin, 'PATCH', `/api/properties/${newPropId}`, { body: { verificationStatus: 'approved' } });
    rec('2.9b', r.data?.property?.verificationStatus === 'approved' && r.data?.property?.isVerified === true, `admin approve -> ${r.data?.property?.verificationStatus} verified=${r.data?.property?.isVerified}`);
  }

  // ---------- 4. INQUIRIES ----------
  let inqId = null;
  {
    const r = await req(buyer, 'POST', '/api/inquiries', { body: { propertyId: newPropId, buyerName: 'Rahul', buyerPhone: '9998887776', message: 'Interested' } });
    inqId = r.data?.inquiry?.id;
    rec('4.2', r.status === 200 && !!inqId, `create inquiry -> ${r.status} id=${inqId}`);
  }
  {
    const r = await req(buyer, 'POST', '/api/inquiries', { body: { buyerName: 'X' } });
    rec('4.2b', r.status === 400, `inquiry missing fields -> ${r.status} (expect 400)`);
  }
  {
    const r = await req(owner, 'GET', '/api/inquiries');
    rec('4.1', Array.isArray(r.data?.inquiries) && r.data.inquiries.some(i => i.id === inqId), `owner sees received inquiry -> ${r.data?.inquiries?.length}`);
  }
  {
    const r = await req(owner, 'PATCH', `/api/inquiries/${inqId}`, { body: { status: 'contacted' } });
    rec('4.3a', r.data?.inquiry?.status === 'contacted', `seller update status -> ${r.data?.inquiry?.status}`);
  }
  {
    const r = await req(buyer, 'PATCH', `/api/inquiries/${inqId}`, { body: { status: 'closed' } });
    rec('4.3b', r.status === 403, `non-seller update -> ${r.status} (expect 403)`);
  }

  // ---------- 3. USERS (admin) ----------
  let someUserId = null;
  {
    const r = await req(admin, 'GET', '/api/users');
    someUserId = r.data?.users?.find(u => u.email === testEmail)?.id;
    const noHash = Array.isArray(r.data?.users) && r.data.users.every(u => !('passwordHash' in u));
    rec('3.1a', r.status === 200 && noHash, `admin list users -> ${r.data?.users?.length} (no hashes=${noHash})`);
  }
  {
    const r = await req(buyer, 'GET', '/api/users');
    rec('3.1b', r.status === 403, `buyer list users -> ${r.status} (expect 403)`);
  }
  {
    const r = await req(admin, 'PATCH', `/api/users/${someUserId}`, { body: { isBlocked: true, blockedReason: 'QA test' } });
    rec('3.2', r.data?.user?.isBlocked === true, `admin block user -> blocked=${r.data?.user?.isBlocked}`);
  }
  {
    // blocked user cannot login
    const r = await login(newSession(), testEmail, 'secret123');
    rec('1.7', r.status === 403, `blocked user login -> ${r.status} (expect 403)`);
  }
  {
    const r = await req(admin, 'PATCH', `/api/users/${someUserId}`, { body: { isBlocked: false } });
    rec('3.2b', r.data?.user?.isBlocked === false, `admin unblock -> blocked=${r.data?.user?.isBlocked}`);
  }
  {
    const r = await req(admin, 'PATCH', `/api/users/${someUserId}`, { body: { role: 'agent' } });
    rec('3.3', r.data?.user?.role === 'agent', `admin change role -> ${r.data?.user?.role}`);
  }

  // ---------- 5. ACTIVITY ----------
  {
    const r = await req(admin, 'GET', '/api/activity');
    rec('5.1a', r.status === 200 && Array.isArray(r.data?.logs) && r.data.logs.length > 0, `admin activity -> ${r.data?.logs?.length} logs`);
  }
  {
    const r = await req(buyer, 'GET', '/api/activity');
    rec('5.1b', r.status === 403, `buyer activity -> ${r.status} (expect 403)`);
  }

  // ---------- 8. CATALOG ----------
  const catalog = [
    ['8.1', '/api/builders', 'builders'],
    ['8.3', '/api/projects?section=featured', 'projects'],
    ['8.5', '/api/agents', 'agents'],
    ['8.7', '/api/collections', 'collections'],
  ];
  for (const [id, path, key] of catalog) {
    const r = await req(guest, 'GET', path);
    rec(id, r.data?.success && Array.isArray(r.data?.[key]) && r.data[key].length > 0, `${path} -> ${r.data?.[key]?.length} items`);
  }
  {
    const r = await req(guest, 'GET', '/api/localities?city=Bangalore');
    rec('8.9', r.data?.success && Array.isArray(r.data?.localities), `localities -> ${r.data?.localities?.length} tiles`);
  }
  // catalog detail (grab first id from list)
  {
    const list = await req(guest, 'GET', '/api/builders');
    const bid = list.data?.builders?.[0]?.id || list.data?.builders?.[0]?.slug;
    const r = await req(guest, 'GET', `/api/builders/${bid}`);
    rec('8.2', !!(r.data?.builder), `builder detail ${bid} -> ${r.status}`);
  }

  // ---------- 7. AI valuation (heuristic, no key needed) ----------
  {
    const r = await req(guest, 'POST', '/api/valuation', { body: { city: 'Mumbai', locality: 'Andheri', carpetArea: 1000, propertyType: 'apartment', bedrooms: 2 } });
    rec('7.1', r.data?.estimatedPriceMin > 0 && r.data?.avgPricePerSqFt > 0, `valuation -> ${r.data?.estimatedPriceDisplay}`);
  }
  {
    const r = await req(guest, 'POST', '/api/gemini/advisor', { body: { action: 'bogus' } });
    rec('7.5', r.status === 400, `advisor invalid action -> ${r.status} (expect 400)`);
  }

  // ---------- 2.10 DELETE (cleanup) ----------
  {
    const r = await req(buyer, 'DELETE', `/api/properties/${newPropId}`);
    rec('2.10a', r.status === 403, `non-owner delete -> ${r.status} (expect 403)`);
  }
  {
    const r = await req(admin, 'DELETE', `/api/properties/${newPropId}`);
    rec('2.10b', r.status === 200 && r.data?.success, `admin delete listing -> ${r.status}`);
  }
  {
    const r = await req(admin, 'DELETE', `/api/users/${someUserId}`);
    rec('3.4a', r.status === 200, `admin delete test user -> ${r.status}`);
  }
  {
    // admin cannot delete self — need real admin id; demo admin id is demo-admin
    const meR = await req(admin, 'GET', '/api/auth/me');
    const r = await req(admin, 'DELETE', `/api/users/${meR.data?.user?.id}`);
    rec('3.4b', r.status === 400, `admin delete self -> ${r.status} (expect 400)`);
  }

  // ---------- 1.10 LOGOUT ----------
  {
    await req(admin, 'POST', '/api/auth/logout');
    const r = await req(admin, 'GET', '/api/auth/me');
    rec('1.10', r.data?.user == null, `logout then me -> ${JSON.stringify(r.data?.user)} (expect null)`);
  }

  console.log(`\n===== ${pass} passed, ${fail} failed / ${pass + fail} total =====`);
  if (fail > 0) {
    console.log('FAILURES:', results.filter(r => !r.ok).map(r => r.id).join(', '));
    process.exit(1);
  }
}
main().catch(e => { console.error('RUNNER ERROR', e); process.exit(2); });
