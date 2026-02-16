# Quick Reference: Cleanup Closed PR Branch

## TL;DR
```bash
# Run the automated script
./.github/scripts/cleanup-closed-pr-branch.sh

# Or manually
git push origin --delete copilot/update-profile-dashboard
git branch -D copilot/update-profile-dashboard  # if exists locally
git fetch --prune origin
```

## What This Does
- Deletes the `copilot/update-profile-dashboard` branch (closed PR #1)
- Removes local and remote references
- Keeps the repository clean

## Important Notes
- ⚠️ PR #1 will still be visible in GitHub (this is normal - PRs cannot be deleted)
- ✅ The branch `copilot/update-profile-dashboard` will be deleted
- 🔒 Requires push access to the repository

## Full Documentation
See [CLEANUP_CLOSED_PR.md](CLEANUP_CLOSED_PR.md) for detailed information.
