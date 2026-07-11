# Elemental Gladiator ARPG (working title)

A top-down action RPG: arcade combat with RPG progression. You are a gladiator captured by four elemental rulers; fight through their kingdoms, defeat each leader, and face their fused final form to win your freedom. Inspirations: *A Link to the Past* (world feel, discovery) and *Enter the Gungeon* (snappy, impactful combat).

**Stack:** TypeScript + Phaser 3, browser-first, shipping to itch.io.

**Status:** Milestone 1 (skeleton) built — awaiting the feel-gate playtest. See [`docs/systems/m1-skeleton.md`](docs/systems/m1-skeleton.md).

## Run it

```bash
npm install
npm run dev     # dev server with hot reload — open the printed localhost URL
npm test        # unit tests (combat math, attack schema, input-abstraction lint)
npm run build   # type-check + production build to dist/
```

Controls: **WASD/arrows** or **left stick** to move, **J/Space** or **pad A** to punch.

## Documents

| Document | What it is |
|----------|------------|
| [`docs/design-bible.md`](docs/design-bible.md) | Design source of truth: concept, locked decisions, death & mastery model, milestone roadmap (M1–M11), open questions. |
| [`docs/prd-one-kingdom-slice.md`](docs/prd-one-kingdom-slice.md) | Active PRD for the sellable one-kingdom vertical slice. |
| [`ENGINEERING_OS.md`](ENGINEERING_OS.md) | How this repo plugs into the [Engineering OS](https://github.com/mattwb44/engineering-os): agents, playbook, templates, journaling. |
| [`docs/systems/m1-skeleton.md`](docs/systems/m1-skeleton.md) | M1 system notes: architecture decisions, feel-tuning knobs, playtest gate. |

## Working agreement

Every milestone follows the Engineering OS `build-a-feature` playbook and ends in a playable browser build. The design bible is authoritative for *what*; the PRD is authoritative for *done*; naming the game comes later.
