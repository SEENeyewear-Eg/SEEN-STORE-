// SEEN order alerts — Google Apps Script (paste into a Google Sheet: Extensions → Apps Script).
// The website sends every paid order here once. This script:
//   1. adds a row to the "Orders" sheet (the owner's orders sheet),
//   2. emails the team (owner, branch manager, WhatsApp team) with what to invoice in Shoof,
//   3. emails the customer a confirmation, in Arabic or English, when they gave an email.
// Settings live in Project Settings → Script properties (never in this file):
//   SECRET       the same value as ORDER_WEBHOOK_SECRET in Cloudflare
//   TEAM_EMAILS  comma-separated team addresses
// Deploy → New deployment → Web app, execute as Me, access Anyone. The web app URL goes into ORDER_WEBHOOK_URL in Cloudflare.

const COLS = ['Order', 'Paid at', 'Customer', 'Phone', 'Email', 'Delivery', 'Branch / address', 'Items (brand · model · colour × qty)',
  'Shoof item ids', 'Total EGP', 'Payment', 'Paymob transaction', 'Check', 'Shoof invoice no.'];

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  let data;
  try { data = JSON.parse(e.postData.contents); } catch (x) { return out({ ok: false }); }
  if (!data || data.secret !== props.getProperty('SECRET')) return out({ ok: false });
  const o = data.order || {};

  // One row per order: a repeated call for the same order number is ignored.
  const sh = sheet();
  const nos = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat().map(String) : [];
  if (nos.includes(String(o.no))) return out({ ok: true, repeat: true });

  const items = (o.items || []).map(i => i.brand + ' · ' + i.model + ' · ' + i.colour + ' × ' + i.qty).join('\n');
  const ids = (o.items || []).map(i => (i.shoofIds || []).join('/')).join('\n');
  const where = o.delivery === 'home' && o.address ? o.address.gov + ', ' + o.address.city + ', ' + o.address.addr : (o.branch || '');
  const p = o.payment || {};
  const check = o.unknown ? 'Paid, but the site has no saved order: check Paymob' : o.amountMismatch ? 'Amount paid differs from the order total' : '';
  const c = o.customer || {};
  sh.appendRow([o.no, o.paidAt || p.at || '', c.name || '', c.phone || '', c.email || '', o.delivery || '', where, items, ids,
    o.total != null ? o.total : p.amount, p.method || '', p.paymobTransaction || '', check, '']);

  const team = (props.getProperty('TEAM_EMAILS') || '').split(',').map(s => s.trim()).filter(Boolean);
  if (team.length) {
    MailApp.sendEmail({
      to: team.join(','),
      subject: (check ? '⚠️ ' : '') + 'طلب أونلاين مدفوع ' + o.no + ' — ' + (o.total != null ? o.total : p.amount) + ' ج.م',
      body: [
        'طلب جديد مدفوع على الموقع. اعمل الفاتورة في Shoof على فرع الأونلاين، واكتب رقمها في شيت الطلبات.',
        check ? '\n⚠️ ' + check : '',
        '\nرقم الطلب: ' + o.no,
        'العميل: ' + (c.name || '') + ' — ' + (c.phone || '') + (c.email ? ' — ' + c.email : ''),
        'الاستلام: ' + (o.delivery === 'home' ? 'توصيل إلى ' + where : 'من فرع ' + where),
        '\nالمنتجات:\n' + (o.items || []).map(i => '- ' + i.brand + ' ' + i.model + ' — لون ' + i.colour + ' × ' + i.qty + ' — ' + i.price + ' ج.م — رقم الصنف في Shoof: ' + (i.shoofIds || []).join(' أو ')).join('\n'),
        '\nالإجمالي: ' + (o.total != null ? o.total : p.amount) + ' ج.م' + (o.discount ? ' (خصم ' + o.discount + ')' : '') + (o.fee ? ' (توصيل ' + o.fee + ')' : ''),
        'الدفع: ' + (p.method || '') + ' — عملية Paymob رقم ' + (p.paymobTransaction || ''),
      ].join('\n'),
    });
  }

  if (c.email && !o.unknown) {
    const ar = String(o.lang || '').startsWith('ar');
    const lines = (o.items || []).map(i => '- ' + i.brand + ' ' + i.model + ' (' + i.colour + ') × ' + i.qty).join('\n');
    MailApp.sendEmail({
      to: c.email,
      subject: ar ? 'تم تأكيد طلبك من SEEN Eyewear — ' + o.no : 'Your SEEN Eyewear order is confirmed — ' + o.no,
      body: ar
        ? 'أهلاً ' + (c.name || '') + '،\n\nاستلمنا طلبك ودفعك بنجاح.\n\nرقم الطلب: ' + o.no + '\n' + lines + '\nالإجمالي: ' + o.total + ' ج.م\n\n'
          + (o.delivery === 'home' ? 'هنكلمك لتأكيد ميعاد التوصيل.' : 'هنبلغك لما الطلب يجهز للاستلام من فرع ' + where + '.') + '\n\nSEEN Eyewear'
        : 'Hello ' + (c.name || '') + ',\n\nWe have received your order and payment.\n\nOrder: ' + o.no + '\n' + lines + '\nTotal: EGP ' + o.total + '\n\n'
          + (o.delivery === 'home' ? 'We will contact you to arrange delivery.' : 'We will let you know when it is ready for pick-up at ' + where + '.') + '\n\nSEEN Eyewear',
      name: 'SEEN Eyewear',
    });
  }
  return out({ ok: true });
}

function sheet() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName('Orders');
  if (!sh) { sh = ss.insertSheet('Orders'); sh.appendRow(COLS); sh.setFrozenRows(1); }
  return sh;
}

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
