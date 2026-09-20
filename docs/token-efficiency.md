# Token efficiency

Applies to **every AI coding agent** in this repo (Claude Code, Cursor, Codex, any other) and every task. It changes **how** context is spent, never **which** gates, validations or reports apply (see "Never traded away").

Wired in through: `AGENTS.md` (Codex, Cursor, others), `.cursor/rules/token-efficiency.mdc` (Cursor), `CLAUDE.md` (Claude Code). This file is the source of truth; `.cursor` and `CLAUDE.md` only point here, and `AGENTS.md` carries a 5-line summary to keep in sync.

## Why this exists

Measured 2026-09-20 from the two Talki Claude Code sessions to date (`~/.claude/projects/D--Git-talki/*.jsonl`, `usage` fields). Cursor and Codex sessions were not measured, but the mechanism is the same for any agent loop: every turn re-sends the whole conversation, so anything a tool returned earlier is paid for again on every later turn. Cost is **turns x context size**; prompt wording is a rounding error.

| Measured | Value |
|---|---|
| Prompt text | 5-170 tokens normally; longest (Phase 29 continuation) ~1.1K |
| Home-mock session, cache-read vs output tokens | 81.1M vs 0.29M |
| One prompt ("make it exactly like the mock... don't miss anything... then plan") | 211 turns, 76M cache-read (94% of the session), context 78K -> 577K |
| `fix ci` sent into that session | ran at 578K context; 544K re-cached after hours idle, for a task that needed <60K |
| Carried context by source | Bash output 27% - image reads 24% - text reads 15% - whole-file Writes 12% - inline Bash scripts 12% |
| Fixed session overhead | 58K tokens x every turn = ~17% of all cache reads |
| Thinking | ~75% of output tokens (inferred: 292K output vs ~70K visible; transcripts store none of it) |

An item added at turn *t* costs `tokens x turns remaining`. A 1.6K-token image viewed at turn 60 of 240 costs ~290K cache-read tokens.

## Never traded away

- AGENTS.md gates: pre-flight, only the requested phase, phase report, stop.
- Visual validation on **Pixel 9 and iPhone 17 Pro** landscape, Chromium, ad strip reserved. The 900x467 canvas rig is a measuring instrument only.
- No weakened or skipped tests. Missing art stays DESIGN-BLOCKED; never fake parity.
- If trimming output would hide the cause of a failure, expand it. A wrong fix costs more than the lines saved.

## Rules

### 1. Session shape (biggest lever)
- **One goal per session.** "Fix X, then plan Y" is two sessions; Y starts from the doc X wrote.
- **Start a new session** when the task changes, context passes ~150K, or after >=1 h idle (prompt caches expire; resuming re-processes the whole context).
- **Checkpoint to the repo before switching**: decisions, numbers, next step in the relevant doc (e.g. `docs/migration/android-home-pixel-qa.md`). The next session starts there instead of re-deriving.
- **Every iterative task has a stop test and a round cap** (prompt B). At the cap, report what remains and stop; never start another round unasked.
- Use a cheaper model or lower reasoning effort for mechanical work (git, CI logs, running the rig); the strongest setting for design and architecture calls.

### 2. Tool output
- Never dump whole files with `cat` (one `cat spec + helpers` returned 15.9K chars). Search (`rg -n -C 3`) or read a line range.
- Cap every command: `| tail -n 40`, `--reporter=line`, `grep -E "passed|failed|Error"`. Long runs go to a log in the background; read the tail.
- CI: `gh run view <id> --log-failed | tail -n 80` first; widen only if the cause isn't there.
- Wait loops (`until ...; do sleep`) print one final line.
- Batch independent tool calls into one step. Every extra turn re-sends the whole context.

### 3. Images
- **Numbers first.** `align_report.py`, `pixel_report.py`, `chrome_diff.py` print deltas as text. View an image only when the numbers can't explain a diff.
- View crops (<= ~600 px long side) or one contact sheet (`contact_sheet.py`) instead of several images. Never a full-resolution screenshot.
- Never view the same image twice (seen: `home.png` x3, `games.png` x2, `iphone-17-pro-sheet-2.jpg` x2).
- Mocks are committed (`apps/mobile/assets/v3/mocks/`). Cite the path; don't paste them into the prompt again.

### 4. Edits
- Targeted edits (search-and-replace, patch, or your editor's edit tool). Never read then rewrite a whole source file to change a few lines (`LandscapeHeroPanel.tsx`: 11.9K read + 12.6K rewritten, both carried 100+ turns).
- No inline `python - <<EOF` patch scripts for source edits (14 seen). Use a replace-all edit, or one `sed`.
- Write a new file once, complete. Don't rewrite it to change a constant.

### 5. Reading
- Read each file once per session. Don't re-read after an edit.
- Big docs by section: `rg -n "^## " <file>`, then read that line range. Start from `docs/migration/CURSOR-RUN-LOG.md` (1.6 KB index). A previous phase report is evidence: read Summary, Acceptance criteria and status (`phase-29-report.md` is 24 KB); open the rest only if a criterion you depend on is unclear.
- Still read everything the phase contract lists. This governs *how*, not *whether*.

### 6. Reuse
- The fidelity rig exists: `apps/mobile/tools/home-fidelity/` (recipe: `docs/migration/android-home-pixel-qa.md`). Reuse it; don't write new capture or diff scripts.
- Missing measurement? Extend the rig, not a scratch script that dies with the session.

## Prompt patterns

Ordered by how prompts are actually used here. Copy, fill the `<>`, send.

**A. Phase run.** Keep what is new (state, gate, scope, finish). Drop what AGENTS.md, CLAUDE.md and `_landscape-shared.md` already say; the Phase 29 prompt restated the reading order and non-negotiables (1.2K of its 4.2K chars). Small saving in tokens, but one source of truth.
```
Run Phase <NN> per AGENTS.md. Start from docs/migration/CURSOR-RUN-LOG.md.
Gate: report must end with "<exact string>", else NO-GO and stop.
Scope: <one line>. Out of scope: <one line>.
Finish: report, run-log line, commit "Phase <NN>: <title> (<status>)", push, no PR. Stop.
```

**B. Visual parity (chrome only).** Replaces "fix everything, pixel by pixel, don't miss anything".
```
Match <screen> to <committed mock path>. Chrome only: geometry, radii, colours, type, borders, shadows. Art is DESIGN-BLOCKED; don't fake it.
Rig: tools/home-fidelity (see android-home-pixel-qa.md). Validate on Pixel 9 + iPhone 17 Pro.
Done when every align_report delta <= 4 px and masked MAE stops improving (last: 18.1). Max <6> rounds, then report what remains and stop.
```

**C. Ops.** One line, one identifier, in a **fresh** session.
```
fix ci - PR #<n>, run <id>          merge origin/master into this branch          run web locally
```

**D. Planning.** Separate session from the work it plans.
```
Plan the next pages from docs/migration/android-home-pixel-qa.md. One contact sheet of the other pages (device-sweep), then write android-pages-plan.md. No implementation.
```

## Anti-patterns seen in real prompts

- "Fix everything... do not miss anything" with no measurable done: a 211-turn loop and 13+ capture rounds.
- Two goals in one prompt (match the mock **and** screenshot every page **and** plan): one context carries all of it.
- A small ops prompt sent into a 500K+ context.
- Pasting images that are already committed.

Re-measure by re-reading the same `usage` fields; update the table above when the numbers move.
