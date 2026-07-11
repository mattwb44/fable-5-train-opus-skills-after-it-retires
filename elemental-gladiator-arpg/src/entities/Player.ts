import Phaser from 'phaser';
import { ATTACKS } from '../combat/attacks';
import { circlesOverlap, strikePoint } from '../combat/math';
import type { AttackConfig } from '../combat/types';
import { Action } from '../input/bindings';
import type { InputMap } from '../input/InputMap';
import type { Juice } from '../juice/Juice';
import type { Enemy } from './Enemy';

const MOVE_SPEED = 200; // px/s — Agility scaling arrives in M2
const HURT_KNOCKBACK = 260;
const HURT_IFRAMES_MS = 600;

/**
 * The gladiator. Reads intent from InputMap only (never raw keys),
 * moves top-down, and swings the equipped attack at whatever is in reach.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  hp = 100;
  readonly maxHp = 100;
  readonly bodyRadius = 14;
  private inputMap: InputMap;
  private juice: Juice;
  private facing = new Phaser.Math.Vector2(1, 0);
  private attack: AttackConfig = ATTACKS.punch;
  private nextAttackAt = 0;
  private invulnerableUntil = 0;
  private swing: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, inputMap: InputMap, juice: Juice) {
    super(scene, x, y, 'player');
    this.inputMap = inputMap;
    this.juice = juice;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCircle(this.bodyRadius, this.width / 2 - this.bodyRadius, this.height / 2 - this.bodyRadius);
    this.setCollideWorldBounds(true);

    // Brief flash showing the strike area, until real animations exist.
    this.swing = scene.add.circle(0, 0, this.attack.hitboxRadius, 0xffffff, 0.35);
    this.swing.setVisible(false);
    this.swing.setDepth(5);
  }

  update(enemies: Enemy[], now: number): void {
    const move = this.inputMap.moveVector();
    this.setVelocity(move.x * MOVE_SPEED, move.y * MOVE_SPEED);
    if (move.length() > 0.01) this.facing.copy(move).normalize();

    if (this.inputMap.justPressed(Action.Attack) && now >= this.nextAttackAt) {
      this.nextAttackAt = now + this.attack.cooldownMs;
      this.performAttack(enemies, now);
    }

    // I-frame flicker after taking a hit.
    this.setAlpha(now < this.invulnerableUntil ? 0.5 + 0.5 * Math.sin(now / 30) : 1);
  }

  private performAttack(enemies: Enemy[], now: number): void {
    const point = strikePoint(
      { x: this.x, y: this.y },
      { x: this.facing.x, y: this.facing.y },
      this.attack.range,
    );

    this.swing.setPosition(point.x, point.y);
    this.swing.setVisible(true);
    this.scene.time.delayedCall(70, () => this.swing.setVisible(false));

    if (this.attack.lunge > 0) {
      this.setVelocity(this.facing.x * this.attack.lunge, this.facing.y * this.attack.lunge);
    }

    let connected = false;
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      if (
        circlesOverlap(point, this.attack.hitboxRadius, { x: enemy.x, y: enemy.y }, enemy.bodyRadius)
      ) {
        connected = true;
        enemy.takeHit({ x: this.x, y: this.y }, this.attack.damage, this.attack.knockback, now);
        this.juice.hitSpark(
          (point.x + enemy.x) / 2,
          (point.y + enemy.y) / 2,
        );
      }
    }

    // The juice only fires on contact — whiffs must feel empty by design.
    if (connected) {
      this.juice.hitPause(this.attack.hitPauseMs);
      this.juice.shake(this.attack.shake);
    }
  }

  /** Contact damage from an enemy. Returns true if the hit landed (not i-framed). */
  takeHit(from: { x: number; y: number }, damage: number, now: number): boolean {
    if (now < this.invulnerableUntil) return false;
    this.invulnerableUntil = now + HURT_IFRAMES_MS;
    this.hp = Math.max(0, this.hp - damage);

    const dx = this.x - from.x;
    const dy = this.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    this.setVelocity((dx / len) * HURT_KNOCKBACK, (dy / len) * HURT_KNOCKBACK);

    this.juice.shake({ durationMs: 120, intensity: 0.008 });
    this.juice.hitSpark(this.x, this.y, 6);

    if (this.hp <= 0) this.hp = this.maxHp; // M1: no death flow yet, just reset
    return true;
  }
}
