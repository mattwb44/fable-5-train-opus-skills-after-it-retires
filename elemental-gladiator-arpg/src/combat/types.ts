/**
 * Data-driven attack definitions. Adding an attack means adding a config
 * (and, later, an animation) — never touching combat code.
 */

export interface ShakeConfig {
  /** Camera shake length in milliseconds. */
  durationMs: number;
  /** Phaser camera shake intensity (fraction of viewport, e.g. 0.006). */
  intensity: number;
}

export interface AttackConfig {
  id: string;
  name: string;
  /** Flat damage per hit (stat scaling arrives in M2). */
  damage: number;
  /** Distance from the attacker's center to the strike point, in pixels. */
  range: number;
  /** Radius of the circular hit area around the strike point, in pixels. */
  hitboxRadius: number;
  /** Impulse applied to the target away from the attacker, in px/s. */
  knockback: number;
  /** How long the world freezes on a connected hit (the hit-pause). */
  hitPauseMs: number;
  shake: ShakeConfig;
  /** Minimum time between uses. */
  cooldownMs: number;
  /** Forward lunge applied to the attacker on use, in px/s (0 = none). */
  lunge: number;
}
