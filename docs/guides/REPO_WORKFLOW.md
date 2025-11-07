# Repository Workflow Cheatsheet

## Branching
- Create branches per feature or bugfix: `name/feat-short-description` or `name/fix-issue-123`.
- Branch off `main` unless a release branch exists.
- Keep scope focused (one logical change per branch).

## Daily Flow
- Sync `main`: `git checkout main && git pull`.
- Rebase your working branch before opening a PR: `git pull --rebase origin main`.
- Resolve conflicts locally; rerun tests/linters after rebasing.

## Commits & PRs
- Write descriptive commits (present tense).
- Keep PRs small; include summary, testing notes, screenshots/gifs when relevant.
- Request review before merging; avoid self-merging unless trivial.

## Reviews & Merges
- Address feedback in follow-up commits; avoid force-push once review starts unless rebasing.
- Prefer squash merge to keep history linear.
- Delete feature branches after merge.

## Issue Hygiene
- Link issues in PR description (`Closes #123`).
- Update issue status when starting work and after merge.

## Local Quality Checks
- Run `npm test` / `npm run format --fix` / `npm run lint` (or project equivalents) before pushing.
- Validate UI changes in the app when possible.

## Communication
- Share WIP in stand-ups or Discord. Ask for help if blocked > 1 hour.
- Document noteworthy decisions in `/docs/guides` so future contributors benefit.
