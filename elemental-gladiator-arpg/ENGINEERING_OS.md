# Engineering OS

This project uses the [Engineering OS](https://github.com/mattwb44/engineering-os) — a persistent, version-controlled knowledge base and workflow system that survives model swaps and tool changes. Any AI model or coding tool working on this repo should read this file first, then pull what it names from the OS repo.

## What applies to this project

**Agents**
- `agents/senior-engineer.md` — invoke at the start of every milestone (M1–M11) and for any architecture-relevant decision. Additive changes only; tradeoffs stated explicitly; flags ADR candidates.
- `agents/code-reviewer.md` — invoke before every commit of implementation work.
- `agents/programming-tutor.md` — optional, when Matt wants to understand a system rather than just ship it.

**Playbooks**
- `playbooks/build-a-feature.md` — every milestone follows it: Idea → PRD → Architecture → Implementation (TDD where practical) → Review → Tests → Documentation → Reflection (journal entry).

**Templates**
- `templates/prd-template.md` — used for `docs/prd-one-kingdom-slice.md`; use it again for any post-slice feature PRD.

**Knowledge**
- None of the existing `knowledge/` packs apply (fire-service is a different domain). Durable game-dev/Phaser lessons learned here should be added to the OS under a new `knowledge/game-dev/` area.

**Journal**
- End-of-session reflections go to the OS repo's `journal/` as dated entries (see the `learning-os-m*` entries for the expected shape: what shipped, what worked, what was hard, what to remember, project state).

## Project documents of record

- `docs/design-bible.md` — the design source of truth (locked decisions, death economy, roadmap).
- `docs/prd-one-kingdom-slice.md` — the active PRD (one-kingdom sellable vertical slice, milestones M1–M11).
- `docs/adr/` — created when the first ADR lands. Per OS experience (Learning OS journal, 2026-07-06): write ADRs *after* code proves the decision, not speculatively. Expected early ADRs: physics choice after the M1 throw prototype, attack-XP credit model after M2.
