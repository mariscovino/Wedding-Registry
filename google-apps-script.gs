/**
 * Casamento Mari & Ethan — backend gratuito (Google Apps Script)
 *
 * O que ele faz:
 *  - Guarda cada presente e cada RSVP numa planilha Google (abas "Presentes" e "RSVP")
 *  - Envia e-mail automático para os noivos a cada presente e a cada RSVP (sem ativação)
 *  - Serve os totais de cotas para o site — as barras enchem sozinhas para todos
 *
 * Como instalar: veja SETUP.md neste repositório.
 */

const GIFT_EMAIL = 'gifts@mariandethan.com';
const RSVP_EMAIL = 'rsvp@mariandethan.com';

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

const GIFT_HEADERS = ['Data', 'Nome', 'Método', 'Total BRL', 'Total CAD', 'Presentes', 'Recado', 'ItensJSON', 'Confirmado no extrato?'];
const RSVP_HEADERS = ['Data', 'Nome', 'Contato', 'Acompanhante'];

// GET → totais de cotas por presente, em JSON: { "gelato": 3, "suite": 1, ... }
function doGet(e) {
  const sh = sheet_('Presentes', GIFT_HEADERS);
  const rows = sh.getDataRange().getValues().slice(1);
  const totals = {};
  rows.forEach(function (r) {
    let itens = [];
    try { itens = JSON.parse(r[7] || '[]'); } catch (err) {}
    itens.forEach(function (it) {
      totals[it.id] = (totals[it.id] || 0) + Number(it.q || 0);
    });
  });
  return ContentService.createTextOutput(JSON.stringify(totals))
    .setMimeType(ContentService.MimeType.JSON);
}

// POST → registra presente ou RSVP e dispara o e-mail
function doPost(e) {
  const p = (e && e.parameter) || {};

  if (p.type === 'gift') {
    sheet_('Presentes', GIFT_HEADERS).appendRow([
      new Date(), p.nome || '', p.metodo || '', p.totalBRL || '', p.totalCAD || '',
      p.presentes || '', p.recado || '', p.itens || '[]', '',
    ]);
    MailApp.sendEmail(
      GIFT_EMAIL,
      'Presente — ' + (p.nome || 'Convidado') + ' (' + (p.totalBRL || '') + ')',
      'Nome: ' + (p.nome || '—') +
      '\nMétodo: ' + (p.metodo || '—') +
      '\nTotal: ' + (p.totalBRL || '—') + ' (' + (p.totalCAD || '—') + ')' +
      '\nPresentes: ' + (p.presentes || '—') +
      '\nRecado: ' + (p.recado || '—') +
      '\n\nRegistrado na planilha. Confira o extrato e marque a coluna "Confirmado no extrato?".'
    );
  } else if (p.type === 'rsvp') {
    const sh = sheet_('RSVP', RSVP_HEADERS);
    // o telefone entra depois, numa célula já formatada como texto puro —
    // sem isso, valores começando com "+" viram erro de fórmula
    sh.appendRow([
      new Date(), p.nome || '', '', p.acompanhante || '—',
    ]);
    const phoneCell = sh.getRange(sh.getLastRow(), 3);
    phoneCell.setNumberFormat('@');
    phoneCell.setValue(p.contato || '—');
    MailApp.sendEmail(
      RSVP_EMAIL,
      'RSVP — ' + (p.nome || '?') + ' (confirmado)',
      'Nome: ' + (p.nome || '—') +
      '\nContato: ' + (p.contato || '—') +
      '\nAcompanhante: ' + (p.acompanhante || '—') +
      '\n\nRegistrado na planilha.'
    );
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
