# M1 — Skeleton

> Roadmap: "Phaser project scaffold, abstracted input layer, top-down movement,
> one enemy, one melee attack, with knockback + hit-pause + screen shake.
> *Proves the feel.*"

## What exists

A single arena scene (`ArenaScene`): one player, one chaser enemy that
respawns ~1s after dying, two static pillars to slam enemies into, and a
one-line HUD. Placeholder art is generated at boot (colored circles + a
spark square) — no asset pipeline yet, on purpose.

## Architecture decisions (ADR candidates once proven)

### 1. Input abstraction is a hard wall

All physical key/button literals live in **`src/input/bindings.ts`** and
nowhere else. Game code speaks only `Action` enums through `InputMap`
(`isDown` / `justPressed` / `moveVector`). Keyboard (WASD + arrows) and
gamepad (left stick + d-pad, A/X to attack) both feed the same actions.

**Enforced, not aspirational:** `tests/input-abstraction.test.ts` scans
every file under `src/` (except bindings.ts) for raw-input patterns
(`KeyCodes.`, `addKey('...')`, `keydown-`, `createCursorKeys`). Adding a
hardcoded key anywhere else fails CI.

### 2. Combat math is pure

`src/combat/math.ts` has zero Phaser imports: `knockbackVelocity`,
`applyDamage`, `strikePoint`, `circlesOverlap`. This keeps the numbers
unit-testable and gives M2 a clean seam — `applyDamage` already returns
`dealt` (damage-weighted, overkill-capped), which is exactly the number
the attack-XP system will consume.

### 3. Attacks are data, validated at boot

Attack tuning lives in `src/combat/attacks.ts` as plain config
(`AttackConfig`). `assertValidAttacks` runs in `ArenaScene.create()` and
throws on malformed configs; `tests/attack-validate.test.ts` locks the
schema. Adding an attack in M2+ means adding a record, not a class.

### 4. Juice fires only on connected hits

`Juice` (hit-pause via physics-world pause, camera shake, particle
sparks) is invoked from `Player.performAttack` **only when the swing
connects**. Whiffs are silent and empty by design — the contrast is what
makes landing a hit feel heavy.

## The feel knobs

Everything tunable for the M1 feel gate is in `src/combat/attacks.ts`:

| Knob | Current | What it does |
|---|---|---|
| `damage` | 10 | 3 punches kill the 30 HP chaser |
| `range` | 26 | strike point distance from player center |
| `hitboxRadius` | 20 | swing generosity |
| `knockback` | 380 | launch speed of a hit enemy (px/s) |
| `hitPauseMs` | 70 | physics freeze on contact |
| `shake.durationMs` / `intensity` | 90 / 0.006 | camera shake on contact |
| `cooldownMs` | 240 | min time between swings |
| `lunge` | 140 | forward step into the punch |
| `KNOCKBACK_DRAG` | 1200 | how fast a flung enemy skids to a stop |
| `KNOCKBACK_STUN_MS` | 220 | how long a flung enemy can't steer |

Edit, save, and Vite hot-reloads — tune live during the playtest.

## Feel gate (from the PRD)

M1 passes when a human says punching the chaser feels *great* — snappy,
weighty, readable. Code review can't answer that. Playtest:

```bash
npm install
npm run dev   # open the printed localhost URL
```

WASD/arrows or left stick to move, J/Space or pad A to punch.

## Known M1 simplifications (intentional)

- Player death just resets HP — death flow is M5 (arena loop).
- Enemy has no tells or attack of its own beyond contact damage — M4.
- Placeholder generated art; no animations, so the swing is a white flash.
- No sound. Audio joins the juice stack later.
