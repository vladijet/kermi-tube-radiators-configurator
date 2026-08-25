import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function fmtEuro(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('ru-RU') + ' €';
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    let body = {};
    try { body = await req.json(); } catch (_) {}
    const orderId = body.order_id;
    if (!orderId) return Response.json({ error: 'order_id required' }, { status: 400 });

    const settings = await base44.asServiceRole.entities.AppSettings.list('-created_date', 1);
    const toEmail = settings && settings[0] ? (settings[0].order_notification_email || '').trim() : '';
    if (!toEmail) return Response.json({ ok: true, skipped: 'no email configured' });

    const order = await base44.asServiceRole.entities.Order.get(orderId);
    if (!order) return Response.json({ ok: true, skipped: 'order not found' });

    const cfg = order.radiator_config || {};
    const qty = Number(cfg.quantity) || 1;
    const unitPrice = qty > 0 ? (Number(order.total_price) || 0) / qty : 0;

    const connParts = [cfg.connGroup, cfg.connCode, cfg.connSize].filter(Boolean);

    const rows = [
      ['Артикул', order.article || '—'],
      ['Модель', order.model || '—'],
      ['Секции', order.sections || '—'],
      ['Рядность', cfg.tubes ? cfg.tubes + ' труб.' : '—'],
      ['Глубина', cfg.depth ? cfg.depth + ' мм' : '—'],
      ['Длина', cfg.length ? cfg.length + ' мм' : '—'],
      ['Высота', cfg.height ? cfg.height + ' мм' : '—'],
      ['Вес', cfg.weight ? cfg.weight + ' кг' : '—'],
      ['ΔT', cfg.deltaT || '—'],
      ['Цвет', cfg.ralCode ? 'RAL ' + cfg.ralCode + (cfg.colorCode ? ' (' + cfg.colorCode + ')' : '') : '—'],
      ['Подключение', connParts.length ? connParts.join(' / ') : '—'],
      ['Давление', cfg.highPressure ? '16 бар' : '10 бар'],
      ['Воздухоотводчик', cfg.ventType ? 'да' : 'нет'],
      ['Дренаж', cfg.drainValve ? 'да' : 'нет'],
      ['Крепления KLK', cfg.includeBracketKLK ? 'в комплекте' : 'нет'],
      ['Количество', qty + ' шт'],
      ['Цена за единицу', fmtEuro(unitPrice)],
      ['Итого', fmtEuro(order.total_price)],
      ['Имя клиента', order.contact_name || '—'],
      ['Телефон', order.contact_phone || '—'],
      ['Email', order.contact_email || '—'],
      ['Дата', order.created_date ? new Date(order.created_date).toLocaleString('ru-RU') : '—'],
    ];

    const tableRows = rows.map((r) =>
      `<tr><td style="padding:6px 12px;color:#666;font-size:13px;border:1px solid #eee;white-space:nowrap">${r[0]}</td><td style="padding:6px 12px;font-weight:600;font-size:14px;border:1px solid #eee">${r[1]}</td></tr>`
    ).join('');

    const subject = 'Новый заказ: ' + (order.article || 'радиатор');
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
      <h2 style="color:#222;margin-bottom:16px">Новый заказ с сайта</h2>
      <table style="border-collapse:collapse;width:100%">${tableRows}</table>
    </div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({ to: toEmail, subject, body: html });
    return Response.json({ ok: true, sent_to: toEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}