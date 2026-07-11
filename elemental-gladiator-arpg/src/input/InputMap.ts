import Phaser from 'phaser';
import {
  Action,
  GAMEPAD_BINDINGS,
  GAMEPAD_DEADZONE,
  KEYBOARD_BINDINGS,
} from './bindings';

/**
 * The only interface between the game and physical inputs.
 * Entities ask "is Attack down?" or "what is the move vector?" —
 * never "is the J key down?".
 *
 * Controller-first: gamepad and keyboard are polled together; whichever
 * is active wins (vectors are combined then clamped).
 */
export class InputMap {
  private keys = new Map<Action, Phaser.Input.Keyboard.Key[]>();
  private scene: Phaser.Scene;
  private padAttackWasDown = false;
  private padAttackJustPressed = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const keyboard = scene.input.keyboard;
    if (keyboard) {
      for (const action of Object.values(Action)) {
        this.keys.set(
          action,
          KEYBOARD_BINDINGS[action].map((name) => keyboard.addKey(name)),
        );
      }
    }
  }

  /** Call once per frame from the scene, before entities read input. */
  update(): void {
    const pad = this.getPad();
    const down = pad
      ? GAMEPAD_BINDINGS.attack.some((i) => pad.buttons[i]?.pressed)
      : false;
    this.padAttackJustPressed = down && !this.padAttackWasDown;
    this.padAttackWasDown = down;
  }

  isDown(action: Action): boolean {
    const keysDown = (this.keys.get(action) ?? []).some((k) => k.isDown);
    if (keysDown) return true;
    if (action === Action.Attack) return this.padAttackWasDown;
    return false;
  }

  justPressed(action: Action): boolean {
    const keyJust = (this.keys.get(action) ?? []).some((k) =>
      Phaser.Input.Keyboard.JustDown(k),
    );
    if (action === Action.Attack) return keyJust || this.padAttackJustPressed;
    return keyJust;
  }

  /** Combined keyboard + gamepad movement, normalized to length <= 1. */
  moveVector(): Phaser.Math.Vector2 {
    const v = new Phaser.Math.Vector2(0, 0);

    if (this.isDown(Action.MoveLeft)) v.x -= 1;
    if (this.isDown(Action.MoveRight)) v.x += 1;
    if (this.isDown(Action.MoveUp)) v.y -= 1;
    if (this.isDown(Action.MoveDown)) v.y += 1;

    const pad = this.getPad();
    if (pad) {
      if (pad.left) v.x -= 1;
      if (pad.right) v.x += 1;
      if (pad.up) v.y -= 1;
      if (pad.down) v.y += 1;
      const stick = pad.leftStick;
      if (stick && stick.length() > GAMEPAD_DEADZONE) {
        v.x += stick.x;
        v.y += stick.y;
      }
    }

    if (v.length() > 1) v.normalize();
    return v;
  }

  private getPad(): Phaser.Input.Gamepad.Gamepad | null {
    const gamepad = this.scene.input.gamepad;
    if (!gamepad || gamepad.total === 0) return null;
    return gamepad.getPad(0) ?? null;
  }
}
