# GitHub Copilot Instructions

## Repository Purpose

This is a **demonstration repository** for GitHub Agentic Workflows. Its primary goal is to show how AI-powered workflows can analyze sprint dependencies, identify blocked downstream issues, and act on them when a sprint item is cancelled or delayed.

The static web app ("TechMart") exists solely as a realistic-looking project backlog — it is not a production application. Its incomplete features are **intentional props** for the sprint board demo.

## Application Architecture

- **Stack**: Vanilla HTML, CSS, and JavaScript — no frameworks, no npm, no build step.
- **Entry point**: `index.html` (loads `style.css` and `app.js` inline).
- **Hosting**: GitHub Pages, deployed directly from the `main` branch root.
- **CSS**: Uses CSS custom properties (`--var-name`) for theming. Do not introduce preprocessors.
- **JS**: Plain ES6+, no module bundler. All state lives in `app.js` global scope.

## Intentional Stubs — Do Not Implement

The following features in `app.js` are **deliberately unimplemented** and must stay that way:

| Feature | Ticket | Sprint |
|---|---|---|
| User Authentication (Login / Sign Up / Register) | AUTH-001/002 | Sprint 2 |
| Shopping Cart Checkout | CART-003 | Sprint 1 |
| Promotions / Deals Engine | PROMO-007/008 | Sprint 3 |
| Order History | ACC-012 | Sprint 4 |
| Wishlist | ACC-005 | Sprint 2 |
| Help Center & Contact | SUP-001/002 | Sprint 4–5 |
| Returns Portal | OPS-009 | Sprint 4 |

The `STUB_INFO` map in `app.js` links each stub to its ticket number and sprint. Clicking a stubbed feature opens a modal with this metadata — that modal behaviour is the intended UX. Do not replace stubs with real implementations.

## GitHub Issues Format

The `sprint-impact-analysis` agentic workflow parses issue bodies to build its dependency graph. Every issue that blocks or is blocked by another **must** include a `## Depends On` section:

```markdown
## Depends On
- #5 (AUTH-001 — User Authentication)
- #3 (CART-003 — Cart API Integration)
```

- Reference format: `#<number>` (plain issue references, not full URLs).
- Issues without dependencies may omit the section entirely.
- Do not rename this section heading — the workflow matches it literally.

## Labels and Milestones

These names are load-bearing for the workflow and the demo; do not rename or delete them:

- **Sprint labels**: `sprint-1`, `sprint-2`, `sprint-3`, `sprint-4`, `sprint-5`
- **State label**: `blocked` (applied automatically by the workflow to impacted issues)
- **Milestones**: `Sprint 1: Foundation & Core Shopping` through `Sprint 5: …`

## GitHub Agentic Workflow Conventions

The sprint impact analysis is implemented as a **GitHub Agentic Workflow** (`gh-aw`), not a standard GitHub Actions workflow. Key rules:

### Two-file structure

| File | Purpose | Edit how? |
|---|---|---|
| `.github/workflows/sprint-impact-analysis.md` | Human-readable source (YAML frontmatter + Markdown agent instructions) | Edit directly on GitHub.com or locally |
| `.github/workflows/sprint-impact-analysis.lock.yml` | Compiled Actions YAML — **do not edit directly** | Regenerate with `gh aw compile sprint-impact-analysis` |

### When recompilation is required

Only changes to the **YAML frontmatter** (triggers, permissions, tools, safe-outputs) require recompiling. The Markdown body (everything after the closing `---`) is loaded at agent runtime — edit it and push; changes take effect on the next workflow run without recompiling.

### Safe-outputs model

The agent job is **strictly read-only** (`contents: read`, `issues: read`, `pull-requests: read`). All write operations go through `safe-outputs`:

```yaml
safe-outputs:
  add-comment:
    max: 100
  add-labels:
    max: 100
  close-issue:
    max: 100
```

Do not add `issues: write` or any other write permission directly to the agent job. This bypasses the safe-outputs audit and rate-limit protections.

### GitHub MCP toolset

The workflow uses `tools: github: toolsets: [default]` for all GitHub API reads. Do not add direct `github.rest.*` calls or `actions/github-script` steps — that would revert to the old non-agentic approach.

## Copilot Prompt Template

`.github/prompts/inspect-delay.prompt.md` is a reusable fill-in-the-blanks prompt for ad-hoc impact analysis in Copilot Chat. It is separate from the automated workflow and intended for human use during sprint planning sessions. Keep it generic (bracketed placeholders) — do not hardcode specific issue numbers.

## Files Overview

```
agentic-workflows-projects/
├── index.html                               # TechMart store (GitHub Pages entry point)
├── style.css                                # Responsive stylesheet (CSS custom properties)
├── app.js                                   # Product catalog, cart state, stub modals
├── demo.md                                  # Presenter walkthrough — 6 demo scenarios
├── SETUP.md                                 # Full replication guide with exact prompts used
├── README.md                                # Project overview
├── .gitattributes                           # Marks *.lock.yml as linguist-generated
└── .github/
    ├── copilot-instructions.md              # This file
    ├── prompts/
    │   └── inspect-delay.prompt.md          # Reusable ad-hoc impact analysis prompt
    └── workflows/
        ├── sprint-impact-analysis.md        # gh-aw source — edit this file
        ├── sprint-impact-analysis.lock.yml  # Compiled lock — do not edit directly
        └── reset-demo.yml                   # Resets demo state between runs
```
