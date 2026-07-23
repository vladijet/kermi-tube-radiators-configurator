import { base44 } from '@/api/base44Client';

let cachedPartner = null;
let fetchPromise = null;

export function getWidgetIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('widget') || '';
}

export async function loadPartner(widgetId) {
  if (!widgetId) return null;
  if (cachedPartner) return cachedPartner;
  if (fetchPromise) return fetchPromise;

  fetchPromise = base44.entities.Partner.filter({ widget_id: widgetId })
    .then((res) => {
      cachedPartner = res && res[0] ? res[0] : null;
      return cachedPartner;
    })
    .catch(() => {
      cachedPartner = null;
      return null;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function applyPartnerTheme(partner) {
  if (!partner?.widget_config) return;
  const root = document.documentElement;
  const cfg = partner.widget_config;
  if (cfg.background) root.style.setProperty('--background', cfg.background);
  if (cfg.primary) {
    root.style.setProperty('--primary', cfg.primary);
    root.style.setProperty('--ring', cfg.primary);
    root.style.setProperty('--sidebar-primary', cfg.primary);
    root.style.setProperty('--sidebar-ring', cfg.primary);
  }
  if (cfg.foreground) root.style.setProperty('--foreground', cfg.foreground);
  if (cfg.accent) {
    root.style.setProperty('--accent', cfg.accent);
    root.style.setProperty('--sidebar-accent', cfg.accent);
  }
}

export async function trackWidgetEvent(eventType) {
  const widgetId = getWidgetIdFromUrl();
  if (!widgetId) return;
  const partner = await loadPartner(widgetId);
  if (!partner) return;
  if (partner.analytics_enabled === false) return;

  try {
    await base44.entities.WidgetEvent.create({
      partner_id: partner.id,
      widget_id: widgetId,
      event_type: eventType,
    });
  } catch (e) {
    // silent fail — tracking should never block UX
  }
}

export const EVENT_TYPES = {
  OPEN: 'open',
  CALCULATION: 'calculation',
  ORDER_ADDED: 'order_added',
  APPLICATION_SENT: 'application_sent',
  EXCEL_DOWNLOAD: 'excel_download',
};