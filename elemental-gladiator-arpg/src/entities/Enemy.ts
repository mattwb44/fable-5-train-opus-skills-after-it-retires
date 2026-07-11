import Phaser from 'phaser';
import { KNOCKBACK_DRAG, KNOCKBACK_STUN_MS } from '../combat/attacks';
import { applyDamage, knockbackVelocity, type Vec2 } from '../combat/math';
import type { Juice } from '../juice/Juice';

/**
 * M1 enemy: a simple chaser with HP, knockback response, and a stun
 * window while flung. Enough to prove the combat feel; real movesets
 * (tells, weakpoints) arrive in M4.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp = 30;
  readonly maxHp = 30;
  readonly bodyRadius = 14;
  private chaseSpeed = 90;
  private stunnedUntil = 0;
  private juice: Juice;
  private onDied: (enemy: Enemy) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    juice: Juice,
    onDied: (enemy: Enemy) => void,
  ) {
    super(scene, x, y, 'enemy');
    this.juice = juice;
    this.onDied = onDied;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCircle(this.bodyRadius, this.width / 2 - this.bodyRadius, this.height / 2 - this.bodyRadius);
    this.setCollideWorldBounds(true);
    this.setBounce(0.4);
    this.setDamping(false);
  }

  chase(target: Vec2, now: number): void {
    if (!this.active) return;
    if (now < this.stunnedUntil) return; // knockback owns the body right now
    this.setDrag(0);
    const v = knockbackVelocity({ x: this.x, y: this.y }, target, this.chaseSpeed);
    this.setVelocity(v.x, v.y);
  }

  /** Returns damage actually dealt (overkill capped). */
  takeHit(attackerPos: Vec2, damage: number, knockback: number, now: number): number {
    if (!this.active) return 0;
    const result = applyDamage(this.hp, damage);
    this.hp = result.hp;

    const v = knockbackVelocity(attackerPos, { x: this.x, y: this.y }, knockback);
    this.setVelocity(v.x, v.y);
    this.setDrag(KNOCKBACK_DRAG);
    this.stunnedUntil = now + KNOCKBACK_STUN_MS;

    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });

    if (result.died) this.die();
    return result.dealt;
  }

  private die(): void {
    this.juice.hitSpark(this.x, this.y, 16);
    const cb = this.onDied;
    this.destroy();
    cb(this);
  }
}
