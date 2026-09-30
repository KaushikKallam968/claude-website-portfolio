import { daylightWord, sunAltitude } from '../lib/sun';

const formatters = new Map<string, Intl.DateTimeFormat>();
const fmt = (tz: string) => {
  let f = formatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
    formatters.set(tz, f);
  }
  return f;
};

function tick() {
  const now = new Date();
  document.querySelectorAll<HTMLElement>('[data-clock]').forEach((el) => {
    const t = fmt(el.dataset.clock!).format(now);
    if (el.textContent !== t) el.textContent = t;
  });
  document.querySelectorAll<HTMLElement>('[data-daylight]').forEach((el) => {
    const [lat, lon] = el.dataset.daylight!.split(',').map(Number);
    el.textContent = `· ${daylightWord(sunAltitude(lat, lon, now))}`;
  });
}

export function startClocks() {
  tick();
  setInterval(tick, 15000);
}
