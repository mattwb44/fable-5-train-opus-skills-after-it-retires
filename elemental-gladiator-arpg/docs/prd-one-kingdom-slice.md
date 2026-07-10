# PRD: One-Kingdom Vertical Slice (Elemental Gladiator ARPG)

*Format: engineering-os `templates/prd-template.md`. Source of truth for design detail: `docs/design-bible.md` (v0.1). This PRD covers the sellable one-kingdom slice — milestones M1–M11 of the design bible's roadmap.*

## User Stories

As a **player**, I want every hit to land with knockback, hit-pause, screen shake, and hit effects, so that combat feels arcade-snappy and impactful from the first swing.

As a **player**, I want to grab and throw an enemy into another enemy or a wall for collision damage, so that positioning and improvisation feel powerful.

As a **player**, I want to move through a hub with a themed portal into a set of combat rooms that lock until cleared, ending in an elemental leader fight, so that a kingdom run has clear structure and a climax.

As a **player**, I want the attacks I use to level up (damage, speed, accuracy → crits), so that my personal fighting style deepens the more I commit to it.

As a **player**, I want to break destructible terrain to uncover hidden shrine rooms where touching an ancient drawing (with a slow, weighty zoom) teaches me a new technique, so that exploration — not vendors or menus — is how my arsenal grows. My first technique is guaranteed so I can never be softlocked underpowered.

As a **player**, I want to learn each enemy type's telegraphed attacks through fighting them, and once I know a type, see its weakpoint windows glow so I can land bonus-damage read hits, so that knowledge earned alive — not grinding — makes me visibly better.

As a **player**, I want four D-pad-selectable loadouts of four attacks each, unlocked progressively by player level and assigned in a clean UI, so that a controller in hand gives me my whole arsenal without menus mid-fight.

As a **player**, I want death to cost me: the ruler siphons a wisp from my global soul meter and hardens slightly (capped, decaying as I fight back), and the kingdom's rooms re-lock, so that dying always stings but never spirals — and never pays.

As a **player**, when my soul meter nears empty I want the world to freeze and my own will-to-live to manifest as a Ghost of myself for a scripted brink duel — win and my soul resets with a short power surge; lose and I face the true loss, so that the whole game has one dramatic fail-gate.

As a **player**, I want my character (level, stats, techniques, attack XP, loadouts, conquests, soul meter) to persist across deaths and sessions, while the current kingdom attempt resets, so that runs are risky but my growth is safe.

As a **player with limited tolerance for punishment mechanics**, I want an accessibility setting for the Victor's Boon (off / capped / full), so that the death economy can be tuned to my needs.

As the **developer**, I want the slice playable in a browser and publishable on itch.io, so that it is instantly shareable and sellable the moment it's polished.

## Implementation Decisions

(Reasoning lives in the design bible; decisions marked *provisional* are open questions to confirm during early milestones. No file paths — behavior and structure only.)

- **Stack: TypeScript + Phaser 3.** Runs on the 2015 Intel Mac dev machine (Godot 4 does not), TS is a strong AI-codegen target, and browser builds are inherently shippable to itch.io.
- **Physics: Phaser Arcade physics with hand-rolled throws and knockback.** A thrown enemy becomes a fast-moving projectile that runs damage checks against whatever it strikes. *Provisional:* the throw is prototyped in the first combat milestone; Matter.js is adopted only if the faked version feels dead.
- **World structure: hub-and-portals, not overworld.** A central nexus with themed portals (biome particles leaking through); each portal opens a small set of room-based levels ending in the kingdom's leader. The slice builds exactly one kingdom end to end, then the pattern is cloned.
- **Difficulty scaling: surviving kingdoms level up (+1) each time a leader falls.** The slice implements the scaling hook even though only one kingdom exists, so kingdoms 2–4 drop in without rework.
- **Progression: three non-overlapping axes.** Acquire attacks by discovery; deepen attacks by use; equip more via level-gated loadout slots. No axis grants what another grants.
- **Attack XP is damage-weighted** — credit proportional to health actually removed, overkill capped — to kill the last-hit farming exploit. *Provisional — confirm during progression milestone.*
- **Study is passive for the slice.** Enemy movesets are authored as data (tell timings, weakpoint hitboxes, windows ~0.5s); once per-type knowledge fills, weakpoints glow and hits inside the window apply a bonus-damage modifier. Study ability unlocks at a set player level. An active focus/slow-time layer is deferred.
- **Death economy invariant: dying is never a net gain.** Victor's Boon is small, capped (~+3 stacks), and decays on the player's progress; the soul meter only ever ticks down on death; the Ghost's victory reward (soul reset + ~10s surge) is only reachable through near-failure. Exposed as an accessibility setting (off / capped / full).
- **The Ghost is a scripted echo, not mirror AI.** A hand-authored mini-boss with a fixed, tunable pattern that merely looks like the player — no live cloning of player state, no balance hell.
- **Save model: persistent character + resettable run.** Permanent: player level, stats, techniques, attack XP, loadout assignments, conquered kingdoms, soul meter. Reset on death: progress within the current kingdom attempt.
- **Input: one abstracted input layer; no hardcoded keys anywhere.** Controller-first (D-pad loadout select, face-button attacks); keyboard/mouse falls out of the same mapping.
- **Architecture: data-driven and decoupled.** Attacks and enemies are config/data, so new content never touches combat code. Managers (waves, progression, saves) are independent from entity classes. Entities favor composition over inheritance.
- **Build process: milestone by milestone (M1–M11), vertically.** Each milestone is one focused build-and-playtest loop; the feel milestone (M1) and the throw prototype gate everything after them.

## Testing Philosophy

What must be true for this slice to be considered correct:

- **The feel gate is a real gate.** M1 is not passed by code review — knockback, hit-pause, and screen shake must feel good in a manual playtest, and the faked throw must feel satisfying before any later milestone builds on it. Feel gates are human-judged and recorded (a short note per milestone: what was tested, verdict).
- **Progression math is deterministic and unit-tested.** Damage-weighted XP credit (including the overkill cap), player-level curves, attack-depth scaling, boon stacking/cap/decay, and soul-meter arithmetic are pure functions testable without a running game.
- **The no-death-incentive invariant is provable.** For any state, the expected value of dying deliberately is negative. Tested at the math level (boon + soul costs always outweigh anything death touches) and re-checked whenever the death economy is tuned.
- **Data-driven means testable-as-data.** Attack configs, enemy movesets (tells, windows, weakpoints), and wave tables are validated by schema — a content error fails a test, not a playtest.
- **Save round-trips are lossless and partitioned correctly.** Serialize → deserialize preserves every persistent field; a simulated death resets exactly the run-scoped state and nothing else.
- **Input abstraction is enforced.** No key/button literal appears outside the input layer (lintable). Both controller and keyboard paths drive the same actions.
- **Every milestone ends playable.** The game boots, runs, and is playtestable in the browser at the end of each milestone — no milestone merges in a broken state.

## Out of Scope

This PRD does not cover:

- Kingdoms 2–4 and the combined final boss (post-slice expansion; the slice only ensures the *hooks* — scaling, portal pattern — exist).
- Naming the game (explicitly a later task).
- Steam release and the Electron/Tauri wrapper (itch.io browser build only).
- Active Study mode (focus button / slow-time) — passive glow only.
- Matter.js physics (only entertained if the M1 throw prototype fails the feel gate).
- Mirror-AI for the Ghost (scripted echo only).
- The final cost of losing to the Ghost (open question #1 — the brink fight ships; its loss consequence is decided before the slice's death-economy milestone completes).
- Original soundtrack/audio direction beyond placeholder combat SFX needed for tells and juice.
- Localization, mobile/touch input, accessibility beyond the Boon setting.

## Open Questions

Carried from the design bible; each must be resolved no later than the milestone that implements it:

1. **Ghost-loss consequence** (resolve before M9): bad-ending-with-persistence ⟷ true loss/enslavement.
2. **Which element to build first** (resolve before M7).
3. **Boon tuning numbers** (during M9): stack cap, decay rate, magnitudes; soul meter stays generous.
4. **Physics confirmation** (during M1): Arcade + faked throws vs. Matter.js prototype.
5. **Attack-XP confirmation** (during M2): damage-weighted credit.
6. **Boss trigger** (during M7/M8): clear-N-rooms (default) vs. key item vs. gating miniboss.
