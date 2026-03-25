// api/check-payment.js
// Vercel Serverless Function - Cek status pembayaran

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { order_id, amount } = req.query;

  if (!order_id || !amount) {
    return res.status(400).json({ error: 'order_id dan amount wajib diisi' });
  }

  const PAKASIR_SLUG = process.env.PAKASIR_SLUG || 'nanzmarket';
  const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY || 'Zjt3qfgV67oLuZkykTA0abPw25PLx0gD';

  try {
    const url = `https://app.pakasir.com/api/transactiondetail?project=${PAKASIR_SLUG}&amount=${amount}&order_id=${order_id}&api_key=${PAKASIR_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json({
      success: true,
      status: data.transaction?.status,
      amount: data.transaction?.amount,
      order_id: data.transaction?.order_id,
    });

  } catch (error) {
    console.error('Check payment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
