import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * PRD invariant: the input abstraction is lintable. Every physical key
 * or button literal lives in src/input/bindings.ts and nowhere else —
 * game code speaks only Actions. This test IS the lint.
 */
const SRC = join(__dirname, '..', 'src');
const BINDINGS_FILE = join(SRC, 'input', 'bindings.ts');

// Patterns that indicate game code is reaching for physical inputs directly.
const FORBIDDEN: { pattern: RegExp; why: string }[] = [
  { pattern: /KeyCodes\./, why: 'raw Phaser key codes' },
  { pattern: /addKey\s*\(\s*['"]/, why: 'addKey with a key literal' },
  { pattern: /addKeys\s*\(\s*['"]/, why: 'addKeys with a key-list literal' },
  { pattern: /keydown-/, why: 'keydown event with a hardcoded key' },
  { pattern: /createCursorKeys/, why: 'cursor-key helper bypasses Action mapping' },
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
  });
}

describe('input abstraction', () => {
  const files = walk(SRC).filter((f) => f !== BINDINGS_FILE);

  it('finds source files to scan (sanity check)', () => {
    expect(files.length).toBeGreaterThan(3);
  });

  for (const file of files) {
    it(`${relative(SRC, file)} contains no physical input literals`, () => {
      const source = readFileSync(file, 'utf8');
      const violations = FORBIDDEN.filter(({ pattern }) => pattern.test(source)).map(
        ({ pattern, why }) => `${pattern} (${why})`,
      );
      expect(violations).toEqual([]);
    });
  }
});
