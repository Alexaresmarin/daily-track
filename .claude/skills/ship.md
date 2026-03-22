# ship

Commit, push, and open a PR for the current branch.

## Usage
`/ship <issue-number>`

## Steps

1. Run `git status` to see what's changed. If nothing to commit, say so and stop.
2. Run `npm run build` to verify the project builds. If it fails, stop and show the error — do not ship broken code.
3. Run `npm test` to verify tests pass. If any fail, stop and show the error.
4. Stage all changes: `git add -A` — but warn if any `.env` files or secrets appear in the diff.
5. Write a conventional commit message based on the changes:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `chore:` for setup/config/tooling
   - `test:` for test-only changes
   - Keep the subject line under 72 chars
   - Add a body if the change is non-trivial
   - Always end with: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
6. Commit and push: `git push -u origin <current-branch>`
7. Open a PR targeting `dev` using `gh pr create`:
   - Title: same as commit subject
   - Body: summary bullets + `Closes #<issue-number>` + test plan checklist
   - Always `--base dev`
8. Output the PR URL.
