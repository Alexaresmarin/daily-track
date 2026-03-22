# sync

Sync the current branch with the latest dev.

## Steps

1. Check current branch name with `git branch --show-current`. If on `main` or `dev`, warn and stop — don't rebase protected branches.
2. Stash any uncommitted changes: `git stash` (only if there are changes).
3. Fetch and pull latest dev: `git fetch origin dev`
4. Rebase current branch onto dev: `git rebase origin/dev`
5. If there are stashed changes, pop them: `git stash pop`
6. If rebase conflicts occur, stop and clearly list the conflicting files. Do not auto-resolve conflicts.
7. Report the result: how many commits were rebased, and whether the branch is now up to date.
