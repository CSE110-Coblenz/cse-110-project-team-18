# Documentation Workflow

## Where to Put Things
- Use `/docs/guides` for how-to or conceptual articles.
- Keep README-level notes short; link to guides for details.
- Code comments should explain *why* when logic is non-obvious.

## Adding a New Guide
1. Pick a concise name (e.g., `PROJECTILE_LOADING.md`).
2. Start with purpose + overview.
3. Favor lists and short snippets over large dumps.
4. Include pointers to code paths (`src/...`) instead of duplicating every line.
5. End with troubleshooting or best practices when relevant.

## Updating an Existing Guide
- Verify referenced files/functions still exist.
- Replace long code sections with focused excerpts or pseudo-code.
- Note architectural changes (e.g., managers initialized on `show()`/`hide()`).
- Add changelog entries if the update is significant.

## Style Tips
- Keep headings sentence case (`## Player lifecycle`).
- Use unordered lists for steps unless order matters.
- Prefer present tense and active voice.
- Link to other guides when topics overlap (e.g., ``See `REPO_WORKFLOW.md` for branching``).

## Review & Publishing
- Run spell-check or linting tools if available.
- Ask a teammate to skim for clarity when introducing new concepts.
- Mention documentation updates in the PR description.
