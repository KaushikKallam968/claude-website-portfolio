import { daylightWord, sunAltitude } from '../lib/sun';
import { livePaused } from './navigation';

const formatters = new Map<string, Intl.DateTimeFormat>();
export const clockFormat = (tz: string) => {
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
    const t = clockFormat(el.dataset.clock!).format(now);
    if (el.textContent !== t) el.textContent = t;
  });
  document.querySelectorAll<HTMLElement>('[data-daylight]').forEach((el) => {
    const [lat, lon] = el.dataset.daylight!.split(',').map(Number);
    el.textContent = `· ${daylightWord(sunAltitude(lat, lon, now))}`;
  });
}

/**
 * Every clock on the page turns over together, on the minute, so a Time Shift and the map's labels never
 * disagree. Other live parts listen for `clock:minute`.
 */
export function startClocks() {
  tick();
  const next = () =>
    setTimeout(() => {
      if (!livePaused()) {
        tick();
        document.dispatchEvent(new CustomEvent('clock:minute'));
      }
      next();
    }, 60000 - (Date.now() % 60000) + 20);
  next();
}
