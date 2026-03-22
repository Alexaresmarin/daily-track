# review-pr

Fetch and summarise all open (unresolved) review comments on the current branch's PR.

## Steps

1. Get the current branch: `git branch --show-current`
2. Find the open PR for this branch: `gh pr view --json number,title,url,state`
3. If no open PR exists, say so and stop.
4. Fetch all review comments: `gh api repos/{owner}/{repo}/pulls/{number}/comments`
5. Fetch review threads to check which are resolved: use GraphQL to get `reviewThreads` with `isResolved` status.
6. Filter to only unresolved threads.
7. For each unresolved thread, show:
   - File and line number
   - The original comment
   - Any replies already made
8. Group by: **needs code change** vs **needs a reply only**.
9. Ask the user how they want to proceed — address all, pick specific ones, or skip.
