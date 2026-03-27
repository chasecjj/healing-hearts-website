---
name: deploy-check
description: Run the pre-deploy quality gate checklist before pushing to master
---

Dispatch the quality-gate agent to run the full 7-check pre-deploy checklist on the current state of the codebase. Present results clearly — if DEPLOY BLOCKED, list every failing check with remediation steps.
