import { describe, expect, it } from 'vitest';
import { ATTACKS } from '../src/combat/attacks';
import type { AttackConfig } from '../src/combat/types';
import { assertValidAttacks, validateAttackConfig } from '../src/combat/validate';

const good: AttackConfig = {
  id: 'test',
  name: 'Test',
  damage: 10,
  range: 26,
  hitboxRadius: 20,
  knockback: 380,
  hitPauseMs: 70,
  shake: { durationMs: 90, intensity: 0.006 },
  cooldownMs: 240,
  lunge: 140,
};

describe('validateAttackConfig', () => {
  it('accepts a well-formed config', () => {
    expect(validateAttackConfig(good)).toEqual([]);
  });

  it('accepts zero for the optional-feel fields (pause, lunge, shake)', () => {
    const flat = { ...good, hitPauseMs: 0, lunge: 0, shake: { durationMs: 0, intensity: 0 } };
    expect(validateAttackConfig(flat)).toEqual([]);
  });

  it.each([
    ['damage', 0],
    ['range', -1],
    ['hitboxRadius', 0],
    ['knockback', 0],
    ['cooldownMs', 0],
  ] as const)('rejects non-positive %s', (field, value) => {
    const errors = validateAttackConfig({ ...good, [field]: value });
    expect(errors.some((e) => e.includes(field))).toBe(true);
  });

  it.each([
    ['hitPauseMs', -1],
    ['lunge', -1],
  ] as const)('rejects negative %s', (field, value) => {
    const errors = validateAttackConfig({ ...good, [field]: value });
    expect(errors.some((e) => e.includes(field))).toBe(true);
  });

  it('rejects negative shake values', () => {
    const errors = validateAttackConfig({ ...good, shake: { durationMs: -1, intensity: -1 } });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it('requires id and name', () => {
    const errors = validateAttackConfig({ ...good, id: '', name: '' });
    expect(errors.some((e) => e.includes('id'))).toBe(true);
    expect(errors.some((e) => e.includes('name'))).toBe(true);
  });

  it('reports multiple problems at once, not just the first', () => {
    const errors = validateAttackConfig({ ...good, damage: 0, knockback: -5, id: '' });
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('assertValidAttacks', () => {
  it('passes every attack the game actually ships', () => {
    expect(() => assertValidAttacks(ATTACKS)).not.toThrow();
  });

  it('throws with the offending attack named', () => {
    expect(() => assertValidAttacks({ broken: { ...good, id: 'broken', damage: 0 } })).toThrow(
      /broken/,
    );
  });
});
