/**
 * Start-up work runs in phases, with a turn for the browser between them, so a frame or a tap never waits for
 * all of it. scheduler.yield() where there is one (the work then resumes ahead of other queued tasks), a
 * timeout elsewhere.
 */
export function yieldToMain(): Promise<void> {
  if ('scheduler' in globalThis && 'yield' in scheduler) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve));
}
