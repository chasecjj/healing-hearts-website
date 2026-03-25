# Build Marketing Agent Team — Output Summary

## What Was Built

A Claude Code plugin at `.claude/plugins/healing-hearts-marketing/` containing 6 marketing agents organized in two phases.

### Plugin Structure

```
.claude/plugins/healing-hearts-marketing/
├── plugin.json                      (manifest)
└── agents/
    ├── scout.md                     (11KB — Phase 1, active)
    ├── storyteller.md               (19KB — Phase 1, active)
    ├── qualifier.md                 (16KB — Phase 1, active)
    ├── nurture-writer.md            (2.6KB — Phase 2, stub)
    ├── partnership-scout.md         (2.5KB — Phase 2, stub)
    └── campaign-analyst.md          (2.6KB — Phase 2, stub)
```

### Phase 1 Agents (Active Now)

Each Phase 1 agent includes the complete 8-section directive from the design spec:

1. **Scout** — Market intelligence & targeting. Finds communities, influencers, keywords, and competitors. Output formats: Community Map, Influencer Brief, Keyword/Hashtag Report, Competitor Alert. All with gold standard examples and anti-examples.

2. **Storyteller** — Content creation from HH frameworks. Produces Jeff-voiced teaching prompts, spouse-facing content blocks, podcast episode briefs, and email sequence blocks. Includes Adaptive Voice Learning system and Podcast Transcript Mining process. All 5 HH frameworks documented as source material.

3. **Qualifier** — Lead scoring & funnel architecture. Designs scoring models, lead magnet specs, funnel maps, segmentation rules, and segment gap reports. Includes full inter-agent handoff contracts table.

### Phase 2 Agents (Post-Stripe Stubs)

Each Phase 2 agent includes:
- Clear "PHASE 2 — NOT YET ACTIVE" banner
- Full Phase Gate criteria (5 conditions that must all be true)
- Mission statement and key distinction from other agents
- Core output list
- Pipeline position (feeds from / feeds to)
- Key operational constraint

Agents: Nurture Writer, Partnership Scout, Campaign Analyst.

### Design Decisions

- **Model:** All agents use `model: opus` for complex reasoning tasks
- **Pattern:** Follows the established `healing-hearts-email` plugin pattern (plugin.json + agents/*.md with YAML frontmatter)
- **Trigger descriptions:** Each agent has comprehensive trigger word lists in the `description` field for reliable invocation
- **No context/ directory:** Unlike the email plugin (which has 6 context files for its 3-stage pipeline), the marketing agents are self-contained — the design spec IS the prompt, with all domain knowledge baked into each agent file
- **Phase 2 agents are stubs, not empty:** They contain enough design intent for Phase 1 agents to build compatible handoffs, but defer the full 8-section expansion until Phase 2 approaches

### How to Use

Invoke any agent by describing a task that matches its triggers:
- `"Find physician spouse communities on Reddit"` → Scout
- `"Create a LinkedIn post for Jeff about Critter Brain"` → Storyteller
- `"Design a lead magnet quiz"` → Qualifier

### Source Spec

Full design spec: `C:\Users\chase\Documents\Mind Vault\Projects\healing-hearts\plans\2026-03-20-marketing-agent-team-design.md`
