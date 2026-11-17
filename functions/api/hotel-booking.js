// POST /api/hotel-booking — saves a hotel pick-up booking sent from the website form.
// Stored in KV (binding ORDERS, or ACCOUNTS if ORDERS is not set) under keys "hb:<time>-<random>", no expiry.
// Nothing is sent to a customer from here; the team reads the bookings and calls the number given.
import { json } from '../_lib/store.js';

const clean = (v, n) => String(v ?? '').trim().slice(0, n);
const PHONE = /^\+?\d{7,15}$/;
const SERVICES = ['Eye examination', 'Try on frames', 'Frame consultation', 'Pick up my glasses'];

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: 'Bad request' }, 400); }

  const d = {
    name: clean(b.name, 80),
    phone: clean(b.phone, 20).replace(/[\s-]/g, ''),
    hotel: clean(b.hotel, 120),
    room: clean(b.room, 20),
    date: clean(b.date, 10),
    time: clean(b.time, 30),
    service: clean(b.service, 60),
    notes: clean(b.notes, 300),
  };

  const today = new Date().toISOString().slice(0, 10);
  if (!d.name || !PHONE.test(d.phone) || !d.hotel || !SERVICES.includes(d.service)
      || !/^\d{4}-\d{2}-\d{2}$/.test(d.date) || d.date < today) {
    return json({ ok: false, error: 'Please check the required fields: name, mobile number, hotel, a date from today, and a service.' }, 400);
  }

  const kv = env.ORDERS || env.ACCOUNTS;
  if (!kv) return json({ ok: false, error: 'Booking is not available right now. Please message us on WhatsApp.' }, 503);

  const id = 'hb:' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  await kv.put(id, JSON.stringify({ ...d, created: new Date().toISOString(), source: 'website' }));
  return json({ ok: true });
}
