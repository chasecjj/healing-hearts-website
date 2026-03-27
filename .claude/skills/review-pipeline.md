---
name: review-pipeline
description: Trigger this skill when the user says "review my changes", "check my code", "run the review pipeline", "before merging", "before deploying", or "/review". Also trigger it when the user asks for a pre-merge or pre-deploy code check.
---

You are the Healing Hearts Review Pipeline orchestrator. Your job is to determine scope, dispatch the right agents in parallel, and consolidate their reports into a single verdict. You do NOT review code yourself — you coordinate agents that do.

---

## Step 1: Determine Scope

Run these commands to determine what to review. Check in order and stop at the first match:

**1a. Staged changes:**
```bash
git diff --cached --stat
```
If the output lists one or more files -> scope is **staged changes** (`git diff --cached`).

**1b. Recent commit (if no staged changes):**
```bash
git log --oneline -1
```
If a commit exists and there were no staged changes -> scope is **HEAD~1..HEAD** (last commit).

**1c. Branch diff (if on a feature branch):**
```bash
git symbolic-ref --short HEAD 2>/dev/null
git diff --stat master..HEAD 2>/dev/null
```
If the current branch is not `master` and the diff is non-empty -> scope is **master..HEAD**.

**1d. None of the above:**
Ask the user: "I couldn't find staged changes, a recent commit, or a branch diff. What would you like me to review? (e.g., a specific commit SHA, a file path, or a branch name)"
Do not proceed until the user provides a scope.

---

## Step 2: Detect Deploy Mode

Scan the user's original message for the words: `deploy`, `ship`, `deploy-check`, `pre-deploy`, or `push`.

If any of those words appear -> **deploy mode is ON** (quality-gate will be dispatched alongside the other two agents).

---

## Step 3: Dispatch Agents in Parallel

Using the Agent tool, dispatch the agents simultaneously — do not wait for one to finish before starting the next.

**Always dispatch (in parallel):**

- **Agent: `code-reviewer`**
  - Task prompt: `"Review the following scope and produce a full 6-dimension code review report: [scope description]. Scope: [staged changes | HEAD~1..HEAD | master..HEAD | <user-provided scope>]. Run the appropriate git diff command to get the changeset, then review every modified file against all 6 dimensions."`

- **Agent: `security-auditor`**
  - Task prompt: `"Audit the following scope for security vulnerabilities and produce a full security audit report: [scope description]. Scope: [staged changes | HEAD~1..HEAD | master..HEAD | <user-provided scope>]. Use git diff to identify which files were modified, then audit those files against all 5 security dimensions."`

**If deploy mode is ON, also dispatch (in parallel with the above):**

- **Agent: `quality-gate`**
  - Task prompt: `"Run the full 7-check deploy gate for the following scope: [scope description]. Scope: [staged changes | HEAD~1..HEAD | master..HEAD | <user-provided scope>]. Execute all checks and produce the deploy gate report."`

Inform the user while the agents run: "Running parallel review — code-reviewer and security-auditor dispatched[, plus quality-gate for deploy check]. This may take a minute..."

---

## Step 4: Consolidate Results

After all agents complete, produce a single consolidated report in the format below. Do not reproduce each agent's full report — extract and summarize the signal.

```markdown
## Review Pipeline: [scope description]

---

### Security Verdict (security-auditor)

**Result:** Pass | Fail
**Critical/High findings:**
- [file:line] **Category** — Description (if any)

*(If none: "No critical or high security findings.")*

---

### Code Quality Verdict (code-reviewer)

**Result:** Ready to Merge | Needs Attention | Needs Work
**Critical/High findings:**
- [file:line] **Category** — Description (if any)

*(If none: "No critical or high code quality findings.")*

---

### Deploy Gate Verdict (quality-gate)

*(Include this section only if quality-gate was dispatched)*

**Result:** DEPLOY APPROVED | DEPLOY BLOCKED
**Failing checks:**
- [Check N — reason] (if any)

*(If all passed: "All 7 checks passed.")*

---

### Deduplicated Critical/High Issues

*(List findings that both agents flagged for the same file:line — avoid showing the same issue twice. If no overlap: omit this section.)*

| file:line | Security Finding | Code Quality Finding |
|-----------|-----------------|---------------------|
| ...       | ...             | ...                 |

---

### Medium/Low Summary

- Security: N medium, N low findings
- Code Quality: N medium, N low findings

*(Point the user to the full agent reports above for details.)*

---

### Recommendation

[One sentence: what the user should do next — e.g., "Fix the 2 critical issues before merging", "Safe to merge — 3 medium items worth addressing soon", or "DEPLOY BLOCKED — resolve the failing build and the dangerouslySetInnerHTML finding first."]
```

---

## Design Notes

- This skill coordinates; it does not review. All actual review logic lives in the three agents.
- Agents run in parallel — do not serialize them.
- The quality-gate agent is optional and only runs when deploy intent is detected in the user's message.
- If an agent returns an error or times out, note it in the relevant section and recommend the user re-run that agent individually.
- Severity deduplication: if security-auditor and code-reviewer both flag the same file:line, merge them into one row in the deduplicated table rather than listing it twice in the recommendation.
