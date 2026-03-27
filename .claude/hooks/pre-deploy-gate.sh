#!/bin/bash
# Pre-deploy quality gate — blocks git push to master unless /deploy-check was run
# Reads tool input JSON from stdin, checks for deploy patterns

INPUT=$(cat)

# Extract command from JSON — check for git push to master/origin
if echo "$INPUT" | grep -qE '(git push|git push origin master|vercel deploy|vercel --prod)'; then
  echo "Deploy detected. Run /deploy-check first to verify the codebase is ready."
  exit 2  # Block
fi

exit 0  # Allow
