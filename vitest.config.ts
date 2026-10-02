import { defineConfig, configDefaults } from 'vitest/config';

// Agent worktrees under .claude/ hold full copies of the source; their tests are not this checkout's.
// Vitest hands back an empty string for any CSS it is asked to import; claims.test.ts reads the stylesheet as text, so its raw form is let through.
export default defineConfig({
  test: { exclude: [...configDefaults.exclude, '.claude/**'], css: { include: /\.css\?raw$/ } },
});
