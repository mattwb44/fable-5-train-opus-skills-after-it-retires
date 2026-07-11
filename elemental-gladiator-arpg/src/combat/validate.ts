import type { AttackConfig } from './types';

/**
 * Schema validation for attack configs: a bad config should fail a test
 * (and throw loudly at boot in dev), never surface as a weird playtest.
 */
export function validateAttackConfig(config: AttackConfig): string[] {
  const errors: string[] = [];
  const positive: Array<[string, number]> = [
    ['damage', config.damage],
    ['range', config.range],
    ['hitboxRadius', config.hitboxRadius],
    ['knockback', config.knockback],
    ['cooldownMs', config.cooldownMs],
  ];
  for (const [field, value] of positive) {
    if (!(Number.isFinite(value) && value > 0)) {
      errors.push(`${config.id || '?'}: ${field} must be a positive number`);
    }
  }
  const nonNegative: Array<[string, number]> = [
    ['hitPauseMs', config.hitPauseMs],
    ['lunge', config.lunge],
    ['shake.durationMs', config.shake?.durationMs ?? NaN],
    ['shake.intensity', config.shake?.intensity ?? NaN],
  ];
  for (const [field, value] of nonNegative) {
    if (!(Number.isFinite(value) && value >= 0)) {
      errors.push(`${config.id || '?'}: ${field} must be a non-negative number`);
    }
  }
  if (!config.id) errors.push('attack config missing id');
  if (!config.name) errors.push(`${config.id || '?'}: missing name`);
  return errors;
}

/** Boot-time guard: throws if any registered attack is malformed. */
export function assertValidAttacks(configs: Record<string, AttackConfig>): void {
  const errors = Object.values(configs).flatMap(validateAttackConfig);
  if (errors.length > 0) {
    throw new Error(`Invalid attack config(s):\n${errors.join('\n')}`);
  }
}
