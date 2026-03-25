// api/create-payment.js
// Vercel Serverless Function - Buat transaksi QRIS via Pakasir

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, order_id, product_name } = req.body;

  if (!amount || !order_id) {
    return res.status(400).json({ error: 'amount dan order_id wajib diisi' });
  }

  const PAKASIR_SLUG = process.env.PAKASIR_SLUG || 'nanzmarket';
  const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY || 'Zjt3qfgV67oLuZkykTA0abPw25PLx0gD';

  try {
    const response = await fetch(`https://app.pakasir.com/api/transactioncreate/qris`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project: PAKASIR_SLUG,
        order_id: order_id,
        amount: parseInt(amount),
        api_key: PAKASIR_API_KEY,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: data.message || 'Gagal membuat transaksi' });
    }

    // Return QRIS data ke frontend
    return res.status(200).json({
      success: true,
      payment: data.payment,
      qr_string: data.payment?.payment_number,
      total: data.payment?.total_payment,
      expired_at: data.payment?.expired_at,
      order_id: order_id,
    });

  } catch (error) {
    console.error('Pakasir error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
