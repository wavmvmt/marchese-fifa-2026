export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, interest } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/marchese_email_subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ email: email.toLowerCase().trim(), interest: interest || 'fifa_collection', source: 'fifa_landing' })
      });
      if (!r.ok && r.status !== 409) {
        const err = await r.text();
        console.error('Supabase error:', err);
      }
    }

    // Always succeed to user
    return res.status(200).json({ success: true, message: "You're in the drop list." });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ success: true, message: "You're in." });
  }
}
