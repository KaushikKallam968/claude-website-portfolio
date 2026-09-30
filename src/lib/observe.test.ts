import { describe, expect, it } from 'vitest';
import { createObservation } from './observe';

describe('observation notes', () => {
  it('says what pointing at a tagged element shows and what it cannot', () => {
    const obs = createObservation();
    const note = obs.record({ type: 'point', t: 3800, tag: 'cta.selected-work', label: 'Selected work' });
    expect(note).toEqual({
      t: 3800,
      event: 'point',
      tag: 'cta.selected-work',
      quality: 'tagged',
      shows: 'You pointed at Selected work.',
      cannotShow: 'Whether you meant to open it.',
    });
  });

  it('lets an element say what pointing at it cannot show', () => {
    const obs = createObservation();
    const note = obs.record({ type: 'point', t: 1200, tag: 'hero.name', label: 'my name', cannotShow: 'Whether you were reading it or passing through.' });
    expect(note?.cannotShow).toBe('Whether you were reading it or passing through.');
  });

  it('calls a click on something untagged a coverage gap', () => {
    const obs = createObservation();
    expect(obs.record({ type: 'press', t: 5100, tag: null })).toEqual({
      t: 5100,
      event: 'press',
      tag: null,
      quality: 'untagged',
      shows: 'You clicked something I never tagged.',
      cannotShow: 'What it was. That is a coverage gap.',
    });
  });

  it('notes each quarter of scroll depth once', () => {
    const obs = createObservation();
    const depths = [0.1, 0.26, 0.3, 0.52, 0.49, 0.8, 1].map((fraction, i) => obs.record({ type: 'depth', t: i * 1000, page: '/', pageName: 'the journey', fraction }));
    // Notes are read on later pages too, so each names the page it is about.
    expect(depths.map((n) => n?.shows ?? null)).toEqual([
      null,
      'You scrolled past a quarter of the journey.',
      null,
      'You scrolled past half of the journey.',
      null,
      'You scrolled past three quarters of the journey.',
      'You reached the end of the journey.',
    ]);
    // Each depth says something different it can't tell, so the margin does not repeat itself.
    expect(depths.filter(Boolean).map((n) => n!.cannotShow)).toEqual([
      'Whether you read it or skimmed it.',
      'Whether you were looking for something in particular.',
      'Whether you are reading closely or heading for the end.',
      'Whether you read everything on the way down.',
    ]);
  });

  it('notes reaching a marked part of a page once, in that page\'s own words', () => {
    const obs = createObservation();
    const reach = { type: 'reach' as const, page: '/work/instrumentation/', id: 'limits', shows: 'You reached what the evidence can’t show.', cannotShow: 'Whether it changed how you read the rest.' };
    const first = obs.record({ ...reach, t: 1000 });
    expect(first).toMatchObject({ event: 'reach', quality: 'tagged', shows: 'You reached what the evidence can’t show.', cannotShow: 'Whether it changed how you read the rest.' });
    expect(obs.record({ ...reach, t: 2000 })).toBeNull();
    expect(obs.record({ ...reach, t: 3000, page: '/work/watched/' })?.shows).toBe('You reached what the evidence can’t show.');
  });

  it('notes where the visit began, by name, as its first note', () => {
    const obs = createObservation();
    expect(obs.record({ type: 'arrive', t: 0, page: '/work/chegg-mexico/', pageName: 'Chegg Mexico' })).toMatchObject({
      event: 'arrive',
      shows: 'You arrived at Chegg Mexico.',
      cannotShow: 'From where, or what you hoped to find.',
    });
  });

  it('notes depth separately for each page', () => {
    const obs = createObservation();
    obs.record({ type: 'depth', t: 1000, page: '/', fraction: 1 });
    expect(obs.record({ type: 'depth', t: 2000, page: '/work/watched/', pageName: 'watched.', fraction: 0.3 })?.shows).toBe('You scrolled past a quarter of watched.');
    expect(obs.record({ type: 'depth', t: 3000, page: '/', fraction: 1 })).toBeNull();
  });

  it('only notes a pause once it is long enough to mean something', () => {
    const obs = createObservation();
    expect(obs.record({ type: 'idle', t: 9000, ms: 2400 })).toBeNull();
    expect(obs.record({ type: 'idle', t: 20000, ms: 8200 })).toMatchObject({
      event: 'idle',
      shows: 'The page sat still for 8 seconds.',
      cannotShow: 'Whether you were reading, thinking or away.',
    });
  });
});

describe('the visit readout', () => {
  it('adds up time in each Chapter across return visits, closing the current one at readout time', () => {
    const obs = createObservation();
    obs.record({ type: 'enter', t: 1000, id: 'nyc', title: 'New York' });
    obs.record({ type: 'leave', t: 31000, id: 'nyc' });
    obs.record({ type: 'enter', t: 31000, id: 'texas-career', title: 'Texas: career' });
    obs.record({ type: 'leave', t: 41000, id: 'texas-career' });
    obs.record({ type: 'enter', t: 50000, id: 'nyc', title: 'New York' });
    const r = obs.readout(62000);
    expect(r.chapters).toEqual([
      { id: 'nyc', title: 'New York', ms: 42000 },
      { id: 'texas-career', title: 'Texas: career', ms: 10000 },
    ]);
    expect(r.totalMs).toBe(62000);
  });

  it('lists the Cases opened, in order, once each', () => {
    const obs = createObservation();
    obs.record({ type: 'open', t: 1, id: 'chegg-discord', title: 'Chegg Discord' });
    obs.record({ type: 'open', t: 2, id: 'watched', title: 'watched.' });
    obs.record({ type: 'open', t: 3, id: 'chegg-discord', title: 'Chegg Discord' });
    expect(obs.readout(4).casesOpened).toEqual([
      { id: 'chegg-discord', title: 'Chegg Discord' },
      { id: 'watched', title: 'watched.' },
    ]);
  });
});
