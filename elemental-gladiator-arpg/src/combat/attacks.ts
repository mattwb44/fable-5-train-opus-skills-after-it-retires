import type { AttackConfig } from './types';

/**
 * The attack roster. M1 ships punch only; the rest of the melee/beam/area
 * families land in M4+ by adding entries here.
 *
 * Tuning notes (feel gate): hitPauseMs 60–90 reads as "impact" without
 * feeling laggy; knockback ~380 px/s with drag 1200 travels about a body
 * length. Adjust here, not in entity code.
 */
export const ATTACKS: Record<string, AttackConfig> = {
  punch: {
    id: 'punch',
    name: 'Punch',
    damage: 10,
    range: 26,
    hitboxRadius: 20,
    knockback: 380,
    hitPauseMs: 70,
    shake: { durationMs: 90, intensity: 0.006 },
    cooldownMs: 240,
    lunge: 140,
  },
};

/** Drag applied to knocked-back bodies, px/s^2. Shared so it tunes in one place. */
export const KNOCKBACK_DRAG = 1200;

/** How long a knocked-back enemy loses AI control, in ms. */
export const KNOCKBACK_STUN_MS = 220;
