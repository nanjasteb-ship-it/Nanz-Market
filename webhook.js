// api/webhook.js
// Vercel Serverless Function - Terima notifikasi pembayaran dari Pakasir

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, order_id, project, status, payment_method, completed_at } = req.body;

    console.log('Webhook received:', { order_id, status, amount });

    if (status === 'completed') {
      // Update status order di Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status: 'sukses' })
        .eq('order_number', order_id);

      if (error) {
        console.error('Supabase error:', error);
      }

      // Simpan status ke settings untuk polling buyer
      const key = 'order_status_' + order_id;
      const { data: existing } = await supabase
        .from('settings')
        .select('key')
        .eq('key', key)
        .single();

      if (existing) {
        await supabase.from('settings').update({ value: 'sukses' }).eq('key', key);
      } else {
        await supabase.from('settings').insert({ key, value: 'sukses' });
      }

      // Log aktivitas
      await supabase.from('admin_logs').insert({
        action: 'Pembayaran Sukses',
        detail: `Order ${order_id} - Rp ${amount} via ${payment_method}`
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
