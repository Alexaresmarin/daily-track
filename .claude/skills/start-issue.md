# start-issue

Start work on a GitHub issue: sync with dev, create the right branch.

## Usage
`/start-issue <issue-number>`

## Steps

1. Check the current git status — if there are uncommitted changes, warn the user and stop.
2. Fetch the issue title using: `gh issue view <number> --json title,body`
3. Generate a branch name in the format `feat/<number>-<slug>` where slug is the issue title lowercased, spaces replaced with hyphens, special characters removed, max 40 chars. Use `chore/` prefix for chore issues and `fix/` for bug issues.
4. Checkout `dev` and pull latest: `git checkout dev && git pull origin dev`
5. Create and switch to the new branch: `git checkout -b <branch-name>`
6. Tell the user the branch name and show a one-line summary of the issue so they know what they're working on.
