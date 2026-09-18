/** Runs async tasks with at most `maxConcurrent` in flight — GetSongBPM's rate limits are undocumented. */
export function createConcurrencyLimiter(maxConcurrent: number) {
  let active = 0;
  const queue: Array<() => void> = [];

  const releaseNext = () => {
    active -= 1;
    const runNext = queue.shift();
    if (runNext) runNext();
  };

  return function limit<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = () => {
        active += 1;
        task().then(
          (value) => {
            releaseNext();
            resolve(value);
          },
          (error: unknown) => {
            releaseNext();
            reject(error as Error);
          },
        );
      };

      if (active < maxConcurrent) {
        run();
      } else {
        queue.push(run);
      }
    });
  };
}
