/**
 * ALL physical input bindings live in this file and nowhere else.
 * The rest of the game speaks only in Actions via InputMap.
 * (Enforced by tests/input-abstraction.test.ts, which scans src/ for key literals.)
 */

export enum Action {
  MoveUp = 'MoveUp',
  MoveDown = 'MoveDown',
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
  Attack = 'Attack',
}

/** Key names as accepted by Phaser's keyboard plugin (addKey). */
export const KEYBOARD_BINDINGS: Record<Action, string[]> = {
  [Action.MoveUp]: ['W', 'UP'],
  [Action.MoveDown]: ['S', 'DOWN'],
  [Action.MoveLeft]: ['A', 'LEFT'],
  [Action.MoveRight]: ['D', 'RIGHT'],
  [Action.Attack]: ['J', 'SPACE'],
};

/**
 * Standard-mapping gamepad button indices (https://w3c.github.io/gamepad/#remapping):
 * 0 = A/Cross, 2 = X/Square. Movement reads the left stick and D-pad directly.
 */
export const GAMEPAD_BINDINGS: { attack: number[] } = {
  attack: [0, 2],
};

/** Ignore stick input below this magnitude. */
export const GAMEPAD_DEADZONE = 0.25;
