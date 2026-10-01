import { defineConfig, configDefaults } from 'vitest/config';

// Agent worktrees under .claude/ hold full copies of the source; their tests are not this checkout's.
export default defineConfig({
  test: { exclude: [...configDefaults.exclude, '.claude/**'] },
});
