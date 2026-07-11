# Untitled Elemental Gladiator ARPG — Design Bible & Build Plan (v0.1)

*A living document. Captures what we decided, why, what's still open, and the roadmap to build it with Fable 5. Naming the game is a later task.*

---

## Concept

You are a gladiator captured by four elemental rulers, each convinced their kingdom is the strongest. Fight through their domains, defeat each leader (they taunt each other as they fall), and when all four are beaten they fuse their powers into a combined final boss for a last stand — beat it to win your freedom.

Top-down action RPG: **arcade combat with RPG progression.** Inspirations: *A Link to the Past* (world feel, discovery) and *Enter the Gungeon* (snappy, impactful combat).

---

## Locked decisions (the spine)

- **Stack:** TypeScript + Phaser 3. Chosen over Godot because Godot 4 struggles on 2015 Intel Macs, TS is a top target for AI code generation, and a browser-playable build is instantly shareable/sellable.
- **Physics:** Arcade physics base + hand-rolled ("faked") throws and knockback. Matter.js only if prototyping proves faked throws feel dead. *(provisional — confirm)*
- **World structure:** A central hub / nexus with four themed portals, each leaking biome-appropriate particles (snowflakes, embers, etc.). Each portal leads to a **small set of room-based themed levels**, ending in that kingdom's elemental leader. Not a large explorable overworld.
- **Difficulty scaling:** All four kingdoms start at Level 1. Each leader you defeat bumps the *surviving* kingdoms +1. You choose the order; whatever you save for last is hardest. This is a rising climax and makes order a real strategic choice.
- **Progression — three axes, no overlap:**
  - **Acquire** new attacks by discovery (see below). First technique is guaranteed so no one softlocks underpowered.
  - **Deepen** attacks by using them — leveling an attack scales its damage / speed / accuracy (→ critical hits).
  - **Equip** more at once as your player level unlocks loadout slots.
- **Discovery mechanic:** Certain rooms have destructible terrain (ice walls, brush, rock). Break it to reveal a hidden shrine room containing ancient drawings of fighting arts. Touch a drawing for a couple seconds — a slow, small zoom toward the character gives the moment weight — to learn that technique.
- **Attack-XP credit:** Damage-weighted — every attack banks XP proportional to the health it actually removed (overkill capped). Avoids the last-hit farming exploit. *(provisional — confirm)*
- **Save model:** Persistent character, resettable kingdom-run (Hades-style hybrid). Permanent across deaths: player level, stats, unlocked techniques, attack XP, loadout assignments, conquered kingdoms, soul-meter state. Reset on death: your progress *within the current kingdom attempt* (its rooms re-lock; you return to the hub and re-enter). See **Death & mastery model** below.
- **Input:** One abstracted input layer (InputMap-style — never hardcode keys). Controller-first (D-pad loadouts + face-button attacks); keyboard/mouse falls out as a fallback.
- **Scope:** Build **ONE kingdom end to end** — rooms, hazards, discovery shrine, miniboss, leader — polished and sellable. Then clone the pattern for kingdoms 2–4 and the final boss.
- **Selling:** itch.io natively (browser or download). Steam later via an Electron/Tauri wrapper.

---

## Combat feel (the juice)

Every hit should land hard: knockback, hit-pause (brief freeze on impact), screen shake, particles, hit-sparks, shockwaves. Throwing an enemy into another enemy or into a wall deals collision damage — implemented by turning a thrown enemy into a fast-moving projectile that runs damage checks against whatever it strikes. **Prototype the throw early** to confirm the faked version feels satisfying before committing.

---

## Death & mastery model

The premise — a captured gladiator whose *will to live* is the real prize — drives the whole death economy. **Nothing about dying is ever a net gain**, so there's never an incentive to die on purpose. Mastery is earned alive; death is only ever a cost.

**Study (mastery — earned alive).** The "read your opponent" fantasy, and the *only* source of learning-based power. Each enemy *type* has 2–3 telegraphed attacks: a readable wind-up ("tell") with sound + animation, and a brief weakpoint window (~0.5s) as it commits. Two alive-only gates:
- *Ability to Study* unlocks at a set player level ("you've fought enough to read opponents").
- *Per-enemy-type knowledge* fills over the first few fights with a type after that unlock (Prey-style scan). Once full, that type's weakpoint windows visibly **glow** when they open.

Hitting a glowing weakpoint inside its window = a **read hit** (bonus damage) — skill-gated, not RNG. Delivers the *Outer Wilds* "knowledge is power" feel: identical level/stats, very different performance based on how well you read. The real cost is combat-design (authoring readable movesets), not engineering — code is just data (tell timings + weakpoint hitboxes) + a highlight VFX + a damage modifier. Ship **passive** (glow once known) for the slice; **active** (focus button / slow-time) is a later depth option.

**Soul meter = the whole-game health bar.** One global "will to live" bar. Rulers siphon essence from it each time you die; individual deaths are chip damage. When it nears empty, the Ghost triggers. This is the true fail-gate of the game.

**Victor's Boon (normal death — common, no ceremony).** The ruler who killed you siphons a wisp of essence (soul meter ticks down) and *hardens*: a small, **capped** stat bump (a little HP, maybe one extra move at max stacks) that **decays** as you land hits and clear rooms, plus visible menace (larger, darker aura, mouthier taunts). You respawn at the hub and re-enter the kingdom (rooms re-lock). Anti-death-spiral safeguards: cap stacks (~+3), decay on progress, keep the stat magnitude minor, and expose an accessibility setting (off / capped / full). *Watch the compounding-punishment risk for weak players.*

**The Ghost (brink — rare, earned, cinematic).** When the soul meter nears empty: the world freezes, the colosseum blows away as sand particles, and your will-to-live manifests as a Ghost of yourself. It's a **weakened scripted echo** — a hand-authored mini-boss with a few telegraphed moves that *looks* like you but runs a fixed, tunable pattern (no live mirror AI, no balance-hell). Beat it → soul meter resets + a ~10-second power surge (an earned, triumphant comeback). Lose → true loss (final cost still to be decided — see open questions).

---

## Stats & attacks

**Stats (extensible — designed so new ones drop in easily):**
- **Strength** — melee & throw damage
- **Agility** — movement, dodge, attack speed
- **Jumping** — traversal / evasion (future mechanics)
- **Chi** — beam & energy attacks (future magic)

**Attack categories (data-driven config, so new attacks never require rewriting combat):**
- **Melee** — punch (fast combo starter), kick (reach + knockback), grab (enables throw), throw (enemy becomes projectile), headbutt (heavy, stuns, slow recovery)
- **Beam** — burst fire (up to 3 quick shots), continuous beam (drains Chi, sustained damage)
- **Area** — charge ball (ranged, explodes), power burst (radial knockback clear)

**Loadouts:** Four directional loadouts (D-pad up/right/down/left), each holding four assigned attacks. Start with one loadout unlocked; leveling unlocks the 2nd, 3rd, 4th. Clean assignment UI required.

---

## Open questions (resolve next)

1. **What losing to the Ghost ultimately costs.** In a persistent-character game a hard save-wipe is brutal; options range from "bad ending, character persists" to "true loss / enslaved to that ruler." Decide the real stake.
2. **Which element to build first** for the vertical slice.
3. **Study: passive vs. active** — ship passive (glow once known); decide later whether to add an active focus/slow-time layer.
4. **Boon tuning** — exact stack cap, decay rate, and stat magnitude; confirm the accessibility setting (off / capped / full). Keep the soul meter generous.
5. **Physics** — confirm Arcade + faked throws (recommended) vs. prototyping Matter.js.
6. **Attack-XP** — confirm damage-weighted credit.
7. **Boss trigger detail** — clear N rooms (default) vs. a key item vs. a gating miniboss.

---

## How Fable 5 builds this

Not one-shot generation. **Milestone by milestone:** each milestone below is scoped tightly enough to become one focused build prompt. Fable 5 generates and debugs that system; you integrate it into your Phaser project and playtest before moving on. Build vertically — one kingdom fully — not horizontally.

---

## Milestone roadmap (re-cut for Phaser + this design)

| # | Milestone | Delivers |
|---|-----------|----------|
| M1 | **Skeleton** | Phaser project scaffold, abstracted input layer, top-down movement, one enemy, one melee attack, with knockback + hit-pause + screen shake. *Proves the feel.* |
| M2 | **Progression core** | Damage-weighted attack-XP, player XP & leveling, stat points, stat effects wired in. |
| M3 | **Rooms & waves** | Room scene, door lock/unlock, scaling wave spawner, clear-to-open. |
| M4 | **Combat breadth + Study** | Kick, grab, throw (+ collision damage), one beam; attack-depth leveling (dmg/speed/crit); Study read-hits (enemy tells + weakpoint windows + glow). |
| M5 | **Loadouts** | 4×4 directional loadout system, assignment UI, slot unlocks by level. |
| M6 | **Discovery** | Destructible terrain, hidden shrine room, drawing → learn ritual (slow zoom). |
| M7 | **Kingdom shell** | Hub + one portal, themed room set, environmental hazards, one miniboss. |
| M8 | **Leader boss** | One elemental leader fight, taunt lines, stepwise-scaling hook. |
| M9 | **Death economy** | Soul meter, Victor's Boon (capped/decaying + accessibility setting), back-to-hub reset, Ghost brink fight (scripted echo) + triumph boost. |
| M10 | **Save/load** | Persistent character + resettable-run state. |
| M11 | **Juice + UI pass** | Full HUD (health/Chi/XP/wave/boss/soul), menus, victory/defeat, polish. |
| — | **= Sellable one-kingdom slice** | Ship candidate. |
| Post | **Expansion** | Clone kingdoms 2–4, combined final boss, full release. |

---

## Architecture principles

- **Data-driven** attacks and enemies (config/JSON), so content scales without touching combat code.
- **Decoupled managers** — WaveManager, ProgressionManager, SaveManager, etc. — independent from entity classes.
- **Component-based** entities; favor composition over deep inheritance for attacks and enemy behavior.
- **Git-friendly** folder structure; systems documented as they're built (what it does, why, how it connects, how to extend).
