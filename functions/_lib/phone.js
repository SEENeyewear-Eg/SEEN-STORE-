// One shape for every mobile number, used as the account key and on orders.
// Egyptian numbers keep the shape they always had (01012345678), so existing accounts and orders still match.
// Any other country is stored as +<country code><number> (e.g. +491511234567). +20 / 0020 forms of an Egyptian number map back to 01...
export function normPhone(raw) {
  const s = String(raw || '').replace(/[\s\-().]/g, '');
  if (/^01[0125]\d{8}$/.test(s)) return s;
  const m = s.match(/^(?:\+|00)(\d{7,15})$/);
  if (!m) return '';
  const d = m[1];
  if (/^201[0125]\d{8}$/.test(d)) return '0' + d.slice(2);
  return d[0] === '0' ? '' : '+' + d;
}