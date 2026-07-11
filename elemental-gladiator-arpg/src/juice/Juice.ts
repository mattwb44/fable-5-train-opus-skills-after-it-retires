import Phaser from 'phaser';
import type { ShakeConfig } from '../combat/types';

/**
 * The "every hit lands hard" toolkit: hit-pause, screen shake, hit sparks.
 * One instance per scene; entities never touch the camera or physics
 * world directly for feedback.
 */
export class Juice {
  private scene: Phaser.Scene;
  private sparks: Phaser.GameObjects.Particles.ParticleEmitter;
  private pauseTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.sparks = scene.add.particles(0, 0, 'spark', {
      speed: { min: 80, max: 260 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: { min: 120, max: 260 },
      quantity: 0,
      emitting: false,
    });
    this.sparks.setDepth(10);
  }

  /**
   * Freeze the physics world briefly so a connected hit has weight.
   * Overlapping pauses extend rather than stack. Timers run on game time,
   * which keeps ticking while physics is paused.
   */
  hitPause(ms: number): void {
    if (ms <= 0) return;
    this.scene.physics.world.pause();
    this.pauseTimer?.remove();
    this.pauseTimer = this.scene.time.delayedCall(ms, () => {
      this.scene.physics.world.resume();
      this.pauseTimer = null;
    });
  }

  shake(config: ShakeConfig): void {
    if (config.durationMs <= 0 || config.intensity <= 0) return;
    this.scene.cameras.main.shake(config.durationMs, config.intensity);
  }

  hitSpark(x: number, y: number, count = 8): void {
    this.sparks.explode(count, x, y);
  }
}
