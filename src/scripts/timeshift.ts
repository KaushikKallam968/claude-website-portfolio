import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const DIGITS_PER_TURN = 10;

/** Wall-clock hour, minute and calendar date in a time zone. */
function wallClock(tz: string, at: Date) {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(at);
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
  return { y: get('year'), mo: get('month'), d: get('day'), h: get('hour'), m: get('minute') };
}

/** The zone's offset from UTC in minutes at this moment (daylight saving included). */
function utcOffsetMinutes(tz: string, at: Date) {
  const w = wallClock(tz, at);
  return Math.round((Date.UTC(w.y, w.mo - 1, w.d, w.h, w.m) - Math.floor(at.getTime() / 60000) * 60000) / 60000);
}

/** Offset in whole hours between two time zones right now (positive: `to` is ahead). */
function offsetHours(fromTz: string, toTz: string, at: Date) {
  return Math.round((utcOffsetMinutes(toTz, at) - utcOffsetMinutes(fromTz, at)) / 60);
}

const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen'];
const hoursPhrase = (n: number) => `${words[n] ?? n} hour${n === 1 ? '' : 's'}`;

/** Every Time Shift rolls from the previous place's clock to the next place's clock as it enters. */
export function startTimeShifts(reduced: boolean, paused: () => boolean) {
  document.querySelectorAll<HTMLElement>('[data-shift]').forEach((el) => {
    const { fromTz, toTz, from, to } = el.dataset as Record<string, string>;
    const reels = [...el.querySelectorAll<HTMLElement>('[data-reel] .reel__strip')];
    const text = el.querySelector<HTMLElement>('[data-shift-text]')!;
    const day = el.querySelector<HTMLElement>('[data-shift-day]')!;

    const paint = () => {
      const now = new Date();
      const a = wallClock(fromTz, now);
      const b = wallClock(toTz, now);
      const off = offsetHours(fromTz, toTz, now);
      text.textContent =
        off === 0
          ? `${to} keeps the same time as ${from}.`
          : `${to} is ${hoursPhrase(Math.abs(off))} ${off > 0 ? 'ahead of' : 'behind'} ${from}.`;
      const sameDate = a.y === b.y && a.mo === b.mo && a.d === b.d;
      day.textContent = sameDate ? '' : off > 0 ? '+1 day' : '−1 day';
      if (!sameDate) text.textContent += off > 0 ? ' It’s already tomorrow there.' : ' It’s still yesterday there.';
      const digits = (t: { h: number; m: number }) => [Math.floor(t.h / 10), t.h % 10, Math.floor(t.m / 10), t.m % 10];
      return { from: digits(a), to: digits(b), off };
    };

    let state = paint();
    // Position each reel on the middle turn so it can roll either way.
    const place = (values: number[]) =>
      reels.forEach((r, i) => gsap.set(r, { yPercent: (-(values[i] + DIGITS_PER_TURN) * 100) / (DIGITS_PER_TURN * 3) }));

    if (reduced) {
      place(state.to);
      return;
    }
    place(state.from);

    ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      end: 'bottom top',
      onEnter: () => roll(),
      onLeaveBack: () => place((state = paint()).from),
    });
    // Arriving already past this point (a restored position): show where we are, not where we came from.
    if (el.getBoundingClientRect().bottom < 0) place(state.to);

    function roll() {
      state = paint();
      const dir = state.off >= 0 ? 1 : -1;
      const y = (index: number) => (-index * 100) / (DIGITS_PER_TURN * 3);
      reels.forEach((r, i) => {
        const rest = state.to[i] + DIGITS_PER_TURN;
        if (state.from[i] === state.to[i]) {
          gsap.set(r, { yPercent: y(rest) });
          return;
        }
        // A changed digit spins through a full turn in the direction of travel: forward in time rolls up, back rolls down.
        const from = state.from[i] + (dir > 0 ? 0 : 2 * DIGITS_PER_TURN);
        gsap.fromTo(r, { yPercent: y(from) }, { yPercent: y(rest), duration: 1.6, ease: 'scene', delay: i * 0.1 });
      });
    }

    setInterval(() => {
      if (paused() || !ScrollTrigger.isInViewport(el)) return;
      const next = paint();
      if (next.to.join('') !== state.to.join('')) place((state = next).to);
    }, 30000);
  });
}
