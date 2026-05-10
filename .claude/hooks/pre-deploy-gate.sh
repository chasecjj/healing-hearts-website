#!/bin/bash
# Pre-deploy quality gate — blocks git push to master unless /deploy-check was run
# Reads tool input JSON from stdin, checks for deploy patterns

INPUT=$(cat)

# Extract command from JSON — check for pushes to master or prod deploys
# (feature-branch pushes flow freely; only master/prod is gated)
if echo "$INPUT" | grep -qE '(git push.*(origin[[:space:]]+)?master|vercel deploy|vercel --prod)'; then
  echo "Deploy to master/prod detected. Run /deploy-check first to verify the codebase is ready."
  exit 2  # Block
fi

exit 0  # Allow
