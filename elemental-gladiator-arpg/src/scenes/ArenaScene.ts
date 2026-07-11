import Phaser from 'phaser';
import { ATTACKS } from '../combat/attacks';
import { assertValidAttacks } from '../combat/validate';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { InputMap } from '../input/InputMap';
import { Juice } from '../juice/Juice';

const ENEMY_CONTACT_DAMAGE = 8;
const ENEMY_RESPAWN_MS = 900;

/**
 * M1 test arena: one room, one gladiator, an endless supply of chasers.
 * Exists to answer exactly one question: does hitting things feel great?
 */
export class ArenaScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private inputMap!: InputMap;
  private juice!: Juice;
  private hud!: Phaser.GameObjects.Text;

  constructor() {
    super('arena');
  }

  create(): void {
    assertValidAttacks(ATTACKS); // fail loudly on a bad config, not mid-swing

    this.makeTextures();
    this.add.rectangle(0, 0, this.scale.width * 2, this.scale.height * 2, 0x1a1a24);

    this.inputMap = new InputMap(this);
    this.juice = new Juice(this);
    this.player = new Player(this, this.scale.width / 2, this.scale.height / 2, this.inputMap, this.juice);

    // A couple of pillars so knockback has something to slam enemies into.
    const pillars = this.physics.add.staticGroup();
    for (const [px, py] of [
      [this.scale.width * 0.25, this.scale.height * 0.3],
      [this.scale.width * 0.75, this.scale.height * 0.7],
    ]) {
      pillars.add(this.add.rectangle(px, py, 48, 48, 0x3a3a4c));
    }
    this.physics.add.collider(this.player, pillars);

    this.spawnEnemy();

    this.hud = this.add
      .text(12, 10, '', { fontFamily: 'monospace', fontSize: '14px', color: '#cccccc' })
      .setDepth(20);

    // Collisions among enemies and vs pillars/player are (re)wired per spawn.
    this.registerColliders(pillars);
  }

  private registerColliders(pillars: Phaser.Physics.Arcade.StaticGroup): void {
    this.events.on('enemy-spawned', (enemy: Enemy) => {
      this.physics.add.collider(enemy, pillars);
      for (const other of this.enemies) {
        if (other !== enemy) this.physics.add.collider(enemy, other);
      }
      this.physics.add.overlap(this.player, enemy, () => {
        if (!enemy.active) return;
        this.player.takeHit({ x: enemy.x, y: enemy.y }, ENEMY_CONTACT_DAMAGE, this.time.now);
      });
    });
    this.events.emit('enemy-spawned', this.enemies[0]);
  }

  private spawnEnemy(): void {
    const margin = 60;
    const x = Phaser.Math.Between(margin, this.scale.width - margin);
    const y = Phaser.Math.Between(margin, this.scale.height - margin);
    const enemy = new Enemy(this, x, y, this.juice, (dead) => {
      this.enemies = this.enemies.filter((e) => e !== dead);
      this.time.delayedCall(ENEMY_RESPAWN_MS, () => this.spawnEnemy());
    });
    this.enemies.push(enemy);
    this.events.emit('enemy-spawned', enemy);
  }

  override update(): void {
    const now = this.time.now;
    this.inputMap.update();
    this.player.update(this.enemies, now);
    for (const enemy of this.enemies) {
      enemy.chase({ x: this.player.x, y: this.player.y }, now);
    }
    this.hud.setText(
      `HP ${this.player.hp}/${this.player.maxHp}   ` +
        `WASD/arrows or left stick: move   J/Space or A(pad): punch`,
    );
  }

  /** Placeholder art: generated shapes, replaced by real sprites later. */
  private makeTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);

    g.fillStyle(0x4da6ff);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0xffffff);
    g.fillCircle(21, 12, 3);
    g.generateTexture('player', 32, 32);
    g.clear();

    g.fillStyle(0xff6b5e);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x330000);
    g.fillCircle(11, 12, 3);
    g.fillCircle(21, 12, 3);
    g.generateTexture('enemy', 32, 32);
    g.clear();

    g.fillStyle(0xffe066);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('spark', 4, 4);
    g.destroy();
  }
}
