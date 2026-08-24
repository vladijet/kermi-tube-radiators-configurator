import { base44 } from '@/api/base44Client';

let cachedPartner = null;
let fetchPromise = null;
let cachedSitePartner = null;
let siteFetchPromise = null;

export function getWidgetIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('widget') || '';
}

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    referrer: document.referrer || '',
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
  };
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

async function loadSitePartner() {
  if (cachedSitePartner !== null) return cachedSitePartner;
  if (siteFetchPromise) return siteFetchPromise;

  siteFetchPromise = base44.entities.Partner.filter({ is_site: true })
    .then((res) => {
      cachedSitePartner = res && res[0] ? res[0] : null;
      return cachedSitePartner;
    })
    .catch(() => {
      cachedSitePartner = null;
      return null;
    })
    .finally(() => {
      siteFetchPromise = null;
    });

  return siteFetchPromise;
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
  const utm = getUtmParams();

  try {
    let partner;
    let source;
    if (widgetId) {
      partner = await loadPartner(widgetId);
      source = 'widget';
    } else {
      partner = await loadSitePartner();
      source = 'site';
    }
    if (!partner) return;
    if (partner.analytics_enabled === false) return;

    await base44.entities.WidgetEvent.create({
      partner_id: partner.id,
      widget_id: widgetId || '',
      event_type: eventType,
      source,
      ...utm,
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