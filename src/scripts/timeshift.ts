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

/**
 * Every Time Shift rolls from the previous place's clock to the next place's clock. With the Field running
 * the roll is tied to scroll across the scene (the map flies at the same pace); otherwise it plays once
 * as the band enters.
 */
export function startTimeShifts(reduced: boolean, paused: () => boolean) {
  const scrubbed = document.documentElement.classList.contains('field');
  document.querySelectorAll<HTMLElement>('[data-shift]').forEach((el) => {
    const { fromTz, toTz, from, to } = el.dataset as Record<string, string>;
    const reels = [...el.querySelectorAll<HTMLElement>('[data-reel] .reel__strip')];
    const text = el.querySelector<HTMLElement>('[data-shift-text]')!;
    const day = el.querySelector<HTMLElement>('[data-shift-day]')!;
    const line = el.querySelector<HTMLElement>('[data-shift-progress]');
    let dayText = '';

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
      dayText = sameDate ? '' : off > 0 ? '+1 day' : '−1 day';
      day.textContent = dayText;
      if (!sameDate) text.textContent += off > 0 ? ' It’s already tomorrow there.' : ' It’s still yesterday there.';
      const digits = (t: { h: number; m: number }) => [Math.floor(t.h / 10), t.h % 10, Math.floor(t.m / 10), t.m % 10];
      return { from: digits(a), to: digits(b), off };
    };

    let state = paint();
    const y = (index: number) => (-index * 100) / (DIGITS_PER_TURN * 3);
    // Position each reel on the middle turn so it can roll either way.
    const place = (values: number[]) => reels.forEach((r, i) => gsap.set(r, { yPercent: y(values[i] + DIGITS_PER_TURN) }));
    // A changed digit spins through a full turn in the direction of travel: forward in time rolls up, back rolls down.
    const startIndex = (i: number) => state.from[i] + (state.off >= 0 ? 0 : 2 * DIGITS_PER_TURN);

    if (reduced) {
      place(state.to);
      return;
    }

    if (scrubbed) {
      // The clock counts the hours between the two places, one at a time, like an odometer: every frame is
      // a real time, and the day marker appears at the moment the count passes midnight.
      let last = 0;
      const hourOf = (d: number[]) => d[0] * 10 + d[1];
      // A pinned scene counts through most of its pin. A domestic band is scrubbed across its whole passage
      // (top entering at 90% of the screen to bottom leaving at 10%), and counts while its clock, at the foot
      // of the band, is on screen.
      const near = el.classList.contains('shift--near');
      let count0 = 0.12;
      let countSpan = 0.66;
      const fit = () => {
        if (!near) return;
        const h = el.offsetHeight / innerHeight;
        count0 = (h - 0.1) / (h + 0.8) + 0.02;
        countSpan = 0.3;
      };
      fit();
      // Scroll decides which hour is shown; the roll to it is timed, so the reels always come to rest on a
      // whole digit, never half-way, whenever scrolling stops.
      let shown = -1;
      const at = [0, 0];
      const mod24 = (n: number) => ((n % 24) + 24) % 24;
      const showHour = (count: number, animate: boolean) => {
        if (count === shown && animate) return;
        const step = shown < 0 ? 0 : Math.sign(count - shown) * (state.off >= 0 ? 1 : -1);
        shown = count;
        const from = hourOf(state.from);
        const total = from + (state.off >= 0 ? 1 : -1) * count;
        const h = mod24(total);
        const digits = [Math.floor(h / 10), h % 10];
        digits.forEach((d, i) => {
          const rest = d + DIGITS_PER_TURN;
          let target = rest;
          // Forward in time rolls up, back rolls down, through the neighbouring turn when a digit wraps.
          if (animate && step > 0 && target < at[i]) target += DIGITS_PER_TURN;
          if (animate && step < 0 && target > at[i]) target -= DIGITS_PER_TURN;
          at[i] = target;
          gsap.to(reels[i], {
            yPercent: y(target),
            duration: animate && step !== 0 ? 0.4 : 0,
            ease: 'out',
            overwrite: true,
            onComplete: () => {
              if (at[i] === target && target !== rest) {
                at[i] = rest;
                gsap.set(reels[i], { yPercent: y(rest) });
              }
            },
          });
        });
        const dayShift = Math.floor(total / 24);
        day.textContent = dayShift > 0 ? '+1 day' : dayShift < 0 ? '−1 day' : '';
        day.style.opacity = dayShift !== 0 ? '1' : '0';
      };
      const scrub = (p: number, animate = true) => {
        last = p;
        const steps = Math.abs(state.off);
        const k = Math.min(1, Math.max(0, (p - count0) / countSpan));
        showHour(Math.min(steps, Math.floor(k * steps + 0.45)), animate);
        [2, 3].forEach((i) => gsap.set(reels[i], { yPercent: y(state.to[i] + DIGITS_PER_TURN) }));
        line?.style.setProperty('--p', p.toFixed(3));
      };
      ScrollTrigger.create({
        trigger: el,
        start: near ? 'top 90%' : 'top top',
        end: near ? 'bottom 10%' : 'bottom bottom',
        onUpdate: (self) => scrub(self.progress),
        onRefresh: (self) => {
          fit();
          scrub(self.progress);
        },
        // Arriving at a scene shows the times as they are now, never a minute old.
        onToggle: (self) => {
          if (!self.isActive || paused()) return;
          state = paint();
          scrub(last, false);
        },
      });
      scrub(0);
      setInterval(() => {
        if (paused() || !ScrollTrigger.isInViewport(el)) return;
        state = paint();
        scrub(last, false);
      }, 15000);
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
      reels.forEach((r, i) => {
        const rest = state.to[i] + DIGITS_PER_TURN;
        if (state.from[i] === state.to[i]) {
          gsap.set(r, { yPercent: y(rest) });
          return;
        }
        gsap.fromTo(r, { yPercent: y(startIndex(i)) }, { yPercent: y(rest), duration: 1.6, ease: 'scene', delay: i * 0.1 });
      });
    }

    setInterval(() => {
      if (paused() || !ScrollTrigger.isInViewport(el)) return;
      const next = paint();
      if (next.to.join('') !== state.to.join('')) place((state = next).to);
    }, 30000);
  });
}
