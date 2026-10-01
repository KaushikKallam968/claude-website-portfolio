import { describe, expect, it } from 'vitest';
import { createObservation, type RawEvent } from './observe';

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

  it('names the page a pointing note is about, and never doubles a full stop', () => {
    const obs = createObservation();
    expect(obs.record({ type: 'point', t: 10, tag: 'lens.toggle', label: 'the tracking lens', pageName: 'Chegg Mexico' })?.shows).toBe('You pointed at the tracking lens on Chegg Mexico.');
    expect(obs.record({ type: 'point', t: 20, tag: 'case.watched', label: 'watched.', pageName: 'the journey' })?.shows).toBe('You pointed at watched. on the journey.');
    expect(obs.record({ type: 'point', t: 30, tag: 'case.watched', label: 'watched.' })?.shows).toBe('You pointed at watched.');
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

  it('notes opening a Case once, and stays quiet when the visit began on that Case', () => {
    const obs = createObservation();
    expect(obs.record({ type: 'open', t: 1000, id: 'watched', title: 'watched.' })).toMatchObject({
      event: 'open',
      shows: 'You opened watched.',
      cannotShow: 'Whether it was what you came for.',
    });
    expect(obs.record({ type: 'open', t: 2000, id: 'watched', title: 'watched.' })).toBeNull();
    const shared = createObservation();
    shared.record({ type: 'arrive', t: 0, page: '/work/chegg-mexico/', pageName: 'Chegg Mexico' });
    expect(shared.record({ type: 'open', t: 10, id: 'chegg-mexico', title: 'Chegg Mexico' })).toBeNull();
  });

  it('notes depth separately for each page', () => {
    const obs = createObservation();
    obs.record({ type: 'depth', t: 1000, page: '/', fraction: 1 });
    expect(obs.record({ type: 'depth', t: 2000, page: '/work/watched/', pageName: 'watched.', fraction: 0.3 })?.shows).toBe('You scrolled past a quarter of watched.');
    expect(obs.record({ type: 'depth', t: 3000, page: '/', fraction: 1 })).toBeNull();
  });

  it('notes copying out of a tagged control once per page, in the control’s own words', () => {
    const obs = createObservation();
    const copy = { type: 'copy' as const, page: '/', tag: 'contact.email', label: 'my email address', cannotShow: 'Whether you will write.' };
    expect(obs.record({ ...copy, t: 4000 })).toEqual({
      t: 4000,
      event: 'copy',
      tag: 'contact.email',
      quality: 'tagged',
      shows: 'You copied my email address.',
      cannotShow: 'Whether you will write.',
    });
    expect(obs.record({ ...copy, t: 5000 })).toBeNull();
    // The résumé is another page: the same address is noted there once too.
    expect(obs.record({ ...copy, t: 6000, page: '/resume/' })?.shows).toBe('You copied my email address.');
    // A control that does not say what copying it can't show gets the general line, and a name that ends in a full stop is not doubled.
    expect(obs.record({ type: 'copy', t: 7000, page: '/', tag: 'case.watched', label: 'watched.' })).toMatchObject({
      shows: 'You copied watched.',
      cannotShow: 'What you will do with it.',
    });
  });

  it('notes the time the device keeps once per visit, and cannot tell whether the reader is there', () => {
    const obs = createObservation();
    expect(obs.record({ type: 'clock', t: 2000, kept: 'the same time as Singapore' })).toEqual({
      t: 2000,
      event: 'clock',
      tag: null,
      quality: 'tagged',
      shows: 'Your device keeps the same time as Singapore.',
      cannotShow: 'Whether you’re there, or only your clock is.',
    });
    // Later pages replay the notes of the visit; the visit has already said it.
    expect(obs.record({ type: 'clock', t: 9000, kept: 'the same time as Singapore' })).toBeNull();
  });

  it('says a city’s time as it is given, for a zone that is no Journey place', () => {
    expect(createObservation().record({ type: 'clock', t: 2000, kept: 'London time' })?.shows).toBe('Your device keeps London time.');
  });

  // A tab left open across a deploy replays events saved in the shape before it: the clock event then named a place.
  it('builds the clock note from the old place field of an event saved before the clock named a time', () => {
    expect(createObservation().record({ type: 'clock', t: 2000, place: 'Texas' })).toMatchObject({
      event: 'clock',
      shows: 'Your device keeps the same time as Texas.',
      cannotShow: 'Whether you’re there, or only your clock is.',
    });
  });

  it('writes no clock note for a stored event that says nothing about what the clock keeps', () => {
    // What sessionStorage hands back is not checked by the compiler: an event with neither field, or an empty one.
    const obs = createObservation();
    expect(obs.record({ type: 'clock', t: 2000 } as unknown as RawEvent)).toBeNull();
    expect(obs.record({ type: 'clock', t: 2500, kept: '' })).toBeNull();
    // Nothing was said, so a clock event that does say something still can be.
    expect(obs.record({ type: 'clock', t: 3000, kept: 'London time' })?.shows).toBe('Your device keeps London time.');
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
