/**
 * Pure combat math. No Phaser imports — everything here is unit-testable
 * in a plain Node environment (see tests/combat-math.test.ts).
 */

export interface Vec2 {
  x: number;
  y: number;
}

/**
 * Velocity to fling a target away from an attacker.
 * If the two positions coincide, falls back to +x so a hit never no-ops.
 */
export function knockbackVelocity(
  attacker: Vec2,
  target: Vec2,
  force: number,
): Vec2 {
  const dx = target.x - attacker.x;
  const dy = target.y - attacker.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { x: force, y: 0 };
  return { x: (dx / len) * force, y: (dy / len) * force };
}

export interface DamageResult {
  /** Remaining health, never below 0. */
  hp: number;
  /** Damage actually dealt — capped at the health that existed. */
  dealt: number;
  died: boolean;
}

/**
 * Applies damage with overkill capped: `dealt` never exceeds the target's
 * remaining health. This is the same "credit what you actually removed"
 * rule the M2 attack-XP system will build on.
 */
export function applyDamage(hp: number, damage: number): DamageResult {
  const dealt = Math.min(Math.max(damage, 0), Math.max(hp, 0));
  const next = hp - dealt;
  return { hp: next, dealt, died: next <= 0 && hp > 0 };
}

/** Point `range` pixels from `origin` along a (not necessarily unit) facing vector. */
export function strikePoint(origin: Vec2, facing: Vec2, range: number): Vec2 {
  const len = Math.hypot(facing.x, facing.y);
  const fx = len === 0 ? 1 : facing.x / len;
  const fy = len === 0 ? 0 : facing.y / len;
  return { x: origin.x + fx * range, y: origin.y + fy * range };
}

/** Circle-vs-circle overlap test used for melee hit checks. */
export function circlesOverlap(
  a: Vec2,
  aRadius: number,
  b: Vec2,
  bRadius: number,
): boolean {
  const r = aRadius + bRadius;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= r * r;
}
