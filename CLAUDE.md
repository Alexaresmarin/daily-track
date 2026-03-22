# daily-track

## Git workflow

- Base branch for all feature branches and PRs is `dev`, not `main`
- Branch naming: `feat/<issue-number>-<slug>`, `fix/<issue-number>-<slug>`, `chore/<slug>`
- Always create feature branches from `dev` and open PRs targeting `dev`
- Never create PRs without explicit user approval — always stop and ask for review first
- Always add a label when creating PRs: `feat` for features, `bug` for bug fixes, `chore` for maintenance, `documentation` for docs
- When addressing PR review comments: resolve the thread directly once fixed, no reply comments — only leave a comment for genuine follow-ups that aren't addressed yet
