import { describe, expect, it } from 'vitest';
import { applyDamage, circlesOverlap, knockbackVelocity, strikePoint } from '../src/combat/math';

describe('knockbackVelocity', () => {
  it('points from attacker toward target', () => {
    const v = knockbackVelocity({ x: 0, y: 0 }, { x: 10, y: 0 }, 100);
    expect(v.x).toBeCloseTo(100);
    expect(v.y).toBeCloseTo(0);
  });

  it('has magnitude equal to force regardless of distance', () => {
    for (const target of [{ x: 3, y: 4 }, { x: 300, y: 400 }, { x: -5, y: 12 }]) {
      const v = knockbackVelocity({ x: 0, y: 0 }, target, 250);
      expect(Math.hypot(v.x, v.y)).toBeCloseTo(250);
    }
  });

  it('handles diagonal directions', () => {
    const v = knockbackVelocity({ x: 0, y: 0 }, { x: 1, y: 1 }, 100);
    expect(v.x).toBeCloseTo(100 / Math.SQRT2);
    expect(v.y).toBeCloseTo(100 / Math.SQRT2);
  });

  it('falls back to +x when attacker and target overlap exactly', () => {
    const v = knockbackVelocity({ x: 5, y: 5 }, { x: 5, y: 5 }, 100);
    expect(v).toEqual({ x: 100, y: 0 });
  });
});

describe('applyDamage', () => {
  it('subtracts damage from hp', () => {
    expect(applyDamage(30, 10)).toEqual({ hp: 20, dealt: 10, died: false });
  });

  it('never leaves hp negative', () => {
    expect(applyDamage(5, 10).hp).toBe(0);
  });

  it('caps dealt at remaining hp (overkill does not inflate attack XP later)', () => {
    expect(applyDamage(5, 10).dealt).toBe(5);
  });

  it('flags death exactly when hp crosses zero', () => {
    expect(applyDamage(10, 10).died).toBe(true);
    expect(applyDamage(10, 9).died).toBe(false);
  });

  it('does not report death for an already-dead target', () => {
    expect(applyDamage(0, 10).died).toBe(false);
    expect(applyDamage(0, 10).dealt).toBe(0);
  });

  it('ignores negative damage', () => {
    expect(applyDamage(30, -5)).toEqual({ hp: 30, dealt: 0, died: false });
  });
});

describe('strikePoint', () => {
  it('projects range along facing', () => {
    const p = strikePoint({ x: 100, y: 100 }, { x: 0, y: 1 }, 26);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(126);
  });

  it('normalizes an unnormalized facing vector', () => {
    const p = strikePoint({ x: 0, y: 0 }, { x: 10, y: 0 }, 26);
    expect(p.x).toBeCloseTo(26);
  });

  it('defaults to +x when facing is zero', () => {
    const p = strikePoint({ x: 0, y: 0 }, { x: 0, y: 0 }, 26);
    expect(p).toEqual({ x: 26, y: 0 });
  });
});

describe('circlesOverlap', () => {
  it('detects overlap', () => {
    expect(circlesOverlap({ x: 0, y: 0 }, 10, { x: 15, y: 0 }, 10)).toBe(true);
  });

  it('detects separation', () => {
    expect(circlesOverlap({ x: 0, y: 0 }, 10, { x: 25, y: 0 }, 10)).toBe(false);
  });

  it('treats exact touching as overlap', () => {
    expect(circlesOverlap({ x: 0, y: 0 }, 10, { x: 20, y: 0 }, 10)).toBe(true);
  });
});
