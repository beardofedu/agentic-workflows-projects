# How This Repository Was Built

A complete replication guide for creating a GitHub Copilot agentic workflows demonstration environment from scratch — including the exact prompts used, manual steps required, and all tooling involved.

This was built in a single session using the **GitHub Copilot CLI** (`gh copilot` extension) running locally against a new, empty repository.

---

## What Gets Created

| Artifact | Description |
|---|---|
| Static web app | `index.html`, `style.css`, `app.js` — a fictional "TechMart" store hosted on GitHub Pages |
| 24 GitHub Issues | A realistic product backlog with ticket numbers, acceptance criteria, and explicit inter-dependencies |
| 15 custom labels | Domain labels (`cart`, `auth`, `orders`, etc.) + sprint labels + `blocked` |
| 5 sprint milestones | Sprint 1–5 with due dates |
| 5 GitHub Project boards | One board per sprint, each linked to the repo with Status + Priority fields |
| `demo.md` | Step-by-step presentation guide covering 6 demo scenarios |
| GitHub Actions workflow | `sprint-impact-analysis.md` (+ compiled `.lock.yml`) — auto-detects cancelled/delayed issues, flags blocked downstream work, and auto-closes directly blocked issues when dependencies are cancelled |
| Copilot prompt template | `inspect-delay.prompt.md` — reusable structured impact analysis prompt |

---

## Prerequisites

Before starting, make sure you have:

- **A GitHub account** with a new empty repository created
- **[GitHub CLI](https://cli.github.com/)** installed and authenticated (`gh auth login`)
- **[GitHub Copilot CLI extension](https://githubnext.com/projects/copilot-cli/)** installed:
  ```bash
  gh extension install github/gh-copilot
  ```
- **A Copilot subscription** (Individual, Business, or Enterprise)
- **`jq`** installed (used by the project board automation scripts)
- **Git** configured with your user name and email

### Optional (for the full agentic workflow demo)
- **GitHub Copilot Coding Agent** enabled in repo Settings → Copilot → Coding agent
- **GitHub Models** enabled for the repository (required for AI-generated impact summaries in the workflow)

---

## Step-by-Step Replication

### Step 1 — Create the repository and clone it

```bash
gh repo create YOUR_USERNAME/agentic-workflows-projects --public --clone
cd agentic-workflows-projects
```

Or if the repo already exists and is empty:
```bash
git clone https://github.com/YOUR_USERNAME/agentic-workflows-projects
cd agentic-workflows-projects
echo "# agentic-workflows-projects" > README.md
git add README.md && git commit -m "Initial commit" && git push
```

---

### Step 2 — Build the static web application

Open the **GitHub Copilot CLI** chat session in your terminal:

```bash
gh copilot
```

> **Prompt used (exact):**
>
> *"I want to create a demonstration repository that will create a basic web application and utilizing github project boards organiized in sprints to show how agentic workflows could be used to identify which work items could be delayed to another sprint and the downhill effects of that. for now, can you build a basic web application that will run in a github page, so it could be a dummy store with missing functionality or just something that could be displayed as a static html page without any real functional use case."*

**What Copilot created:**

- `index.html` — TechMart store with hero, product grid, deals banner, about section, stub modal
- `style.css` — full responsive stylesheet using CSS custom properties
- `app.js` — product catalog, category filtering, cart state, stub modal with ticket/sprint metadata
- Updated `README.md` with project description and GitHub Pages setup instructions

**What to verify:**
- Open `index.html` in a browser locally — all products render, filter buttons work, clicking stubbed features opens a modal with sprint/ticket info
- Check that `app.js` contains the `STUB_INFO` map linking feature names to ticket numbers and sprint assignments

**Commit and push:**
```bash
git add -A
git commit -m "Add TechMart demo static web app"
git push
```

**Enable GitHub Pages:**  
Go to **Settings → Pages → Source: Deploy from branch → `main` / `(root)` → Save**

---

### Step 3 — Create GitHub Issues

Still in the Copilot CLI session:

> **Prompt used (exact):**
>
> *"Can you create fully fleshed out and interdependent issues that correspond to the Stubbed Features backlog? If needed to create a more complete demo, please add additional backlog items and corresponding issues."*

**What Copilot did:**

1. Created **15 custom labels** with colors and descriptions:
   ```bash
   gh label create "cart" --color "F97316" --description "Shopping cart features"
   gh label create "auth" --color "EC4899" --description "Authentication & sessions"
   # ... (auth, accounts, promotions, orders, operations, support, platform,
   #      blocked, sprint-1 through sprint-5)
   ```

2. Created **5 sprint milestones** via the GitHub API:
   ```bash
   gh api repos/OWNER/REPO/milestones --method POST \
     -f title="Sprint 1: Foundation & Core Shopping" \
     -f due_on="2026-05-16T00:00:00Z"
   # Repeat for Sprints 2–5 with 2-week intervals
   ```

3. Created **24 issues** across 5 sprints using `gh issue create` with:
   - Full body including Overview, Acceptance Criteria, Depends On, and Blocks sections
   - Appropriate labels (`cart,enhancement,sprint-1`, etc.)
   - Milestone assignments

**Issue map (issue number → ticket ID → sprint):**

| # | Ticket | Sprint | Depends On |
|---|---|---|---|
| 1 | CART-001 | 1 | — |
| 2 | CART-002 | 1 | #1 |
| 3 | CART-003 | 1 | #2 |
| 4 | PDP-001 | 1 | — |
| 5 | AUTH-001 | 2 | — |
| 6 | AUTH-002 | 2 | #5 |
| 7 | AUTH-003 | 2 | #5 |
| 8 | AUTH-004 | 2 | #5 |
| 9 | ACC-005 | 2 | #5, #3 |
| 10 | ACC-006 | 2 | #5 |
| 11 | PROMO-007 | 3 | #5, #3 |
| 12 | PROMO-008 | 3 | #11 |
| 13 | PROMO-009 | 3 | #11, #3 |
| 14 | ORD-001 | 3 | #3, #5 |
| 15 | ORD-002 | 3 | #14 |
| 16 | SEARCH-001 | 3 | #4 |
| 17 | ACC-012 | 4 | #14, #5 |
| 18 | OPS-009 | 4 | #14, #17 |
| 19 | NOTIF-001 | 4 | #14 |
| 20 | REVIEW-001 | 4 | #5, #14 |
| 21 | SUP-001 | 5 | — |
| 22 | SUP-002 | 5 | #5, #19 |
| 23 | PERF-001 | 5 | #4, #16 |
| 24 | A11Y-001 | 5 | — |

> **Important:** The issue numbers must match this table exactly for the dependency graph in the automated workflow to work correctly. Create issues in order (1 through 24) in a fresh repository with no existing issues.

---

### Step 4 — Create Sprint Project Boards

> **Prompt used (exact):**
>
> *"Can you create the sprint project boards for me and link them back to this specific repository?"*

**Authentication note — required manual step:**

The `project` scope is not included in the default `gh auth login` token. Copilot ran:
```bash
gh auth refresh -s project,read:project
```
This opens a browser device-flow authorization. You will see a one-time code — visit `https://github.com/login/device`, enter the code, and authorize.

**What Copilot did after auth:**

1. Created 5 projects and captured their numbers:
   ```bash
   gh project create --owner OWNER --title "Sprint 1: Foundation & Core Shopping" --format json
   # Repeat for Sprints 2–5 — note the returned project numbers
   ```

2. Linked all projects to the repository:
   ```bash
   gh project link PROJECT_NUM --owner OWNER --repo OWNER/REPO
   ```

3. Added a **Priority** single-select field to each project:
   ```bash
   gh project field-create PROJECT_NUM --owner OWNER \
     --name "Priority" --data-type "SINGLE_SELECT" \
     --single-select-options "🔴 High,🟡 Medium,🟢 Low"
   ```

4. Added a **"Blocked"** option to the built-in Status field via GraphQL:
   ```bash
   gh api graphql -f query='
   mutation {
     updateProjectV2Field(input: {
       fieldId: "STATUS_FIELD_ID"
       singleSelectOptions: [
         {name: "Todo",        color: GRAY,  description: "Not started"},
         {name: "In Progress", color: BLUE,  description: "Actively being worked on"},
         {name: "Blocked",     color: RED,   description: "Cannot proceed due to dependency"},
         {name: "Done",        color: GREEN, description: "Complete"}
       ]
     }) { projectV2Field { ... on ProjectV2SingleSelectField { name } } }
   }'
   ```
   > Get the Status field ID first: `gh project field-list PROJECT_NUM --owner OWNER --format json | jq -r '.fields[] | select(.name=="Status") | .id'`

5. Added issues to their respective boards:
   ```bash
   # Sprint 1 issues (#1–4) → project 2
   gh project item-add 2 --owner OWNER \
     --url "https://github.com/OWNER/REPO/issues/1"
   # Repeat for each issue / project pairing
   ```

6. Set Status and Priority on every item using `gh project item-edit` with `--single-select-option-id` flags

**Status assignments applied:**

| Issues | Status | Priority |
|---|---|---|
| #1, #2 | In Progress | 🔴 High |
| #3 | Blocked | 🔴 High |
| #4 | Todo | 🟡 Medium |
| #5, #6, #8 | Todo | 🔴 High |
| #7, #9, #10 | Todo | 🟡 Medium |
| #11, #14 | Todo | 🔴 High |
| #12, #17 | Blocked | 🔴 High |
| #13, #18 | Blocked | 🟡 Medium |
| #15, #19 | Todo | 🟡 Medium / 🔴 High |
| #16, #23, #24 | Todo | 🟢 Low |
| #20, #21, #22 | Todo | 🟡 Medium |

---

### Step 5 — Create the Demo Walkthrough and Automation

> **Prompt used (exact):**
>
> *"Now that the repository exists, can we create a demonstration walkthrough with complete steps and what the user should expect in a file named `/demo.md`? provide multiple ways to show off the capabilities of copilot coding agent (implementing a feature), copilot agentic workflows, and leveraging copilot to identify the impact of changing the delivery date of a sprint item or cancelling a sprint item altogeher, this might be best accomplished with either a slash command (something like `inspect delay` or an agentic workflow if an issue is closed before a PR is merged)"*

**What Copilot created:**

Three files committed together:

**`.github/prompts/inspect-delay.prompt.md`**  
A fill-in-the-blanks Copilot Chat prompt template that produces a standardized 5-section impact report (blast radius, sprint-by-sprint impact, critical path, recommendations, quick wins).

**`demo.md`**  
A full presentation guide with 6 demo scenarios, timing guide, presenter tips, and reset instructions.

**`.github/workflows/sprint-impact-analysis.yml`** *(initial version — replaced in Step 6)*  
A standard GitHub Actions workflow using `actions/github-script` to traverse the dependency graph and post comments. This was later replaced with a proper gh-aw agentic workflow (see Step 6).

---

### Step 6 — Convert the Workflow to a Proper GitHub Agentic Workflow

> **Prompt used (exact):**
>
> *"can you update the SETUP.md file to retroactively fix the workflow to be a proper agentic workflow based on this issue: https://github.com/beardofedu/agentic-workflows-projects/issues/27?"*

Issue #27 noted that the original `sprint-impact-analysis.yml` was a standard `github-script` workflow, not a true **GitHub Agentic Workflow**. The key differences:

| | Old approach | Proper gh-aw approach |
|---|---|---|
| Engine | `actions/github-script` (Node.js code) | GitHub Copilot AI agent |
| GitHub API reads | Direct `github.rest.*` calls in JS | GitHub MCP toolsets (`tools: github:`) |
| GitHub writes (comments, labels) | `issues: write` permission on job | `safe-outputs:` with no write permission on agent job |
| Dependency traversal | Hardcoded BFS in JavaScript | Agent reasons through the graph using natural language instructions |
| Impact narrative | `gpt-4o-mini` API call via `fetch()` | Native to the agent (Copilot generates it inline) |
| Workflow file format | YAML only | Markdown with YAML frontmatter + compiled `.lock.yml` |

**Why this matters:** In the gh-aw model, the agent job must be **strictly read-only**. All write operations (comments, labels, issue closures) go through the `safe-outputs` system, which enforces rate limits and audit trails and protects against runaway or compromised AI behaviour. Granting `issues: write` directly on the agent job (as the old approach did) bypasses these safeguards.

This step was completed by the **Copilot Coding Agent** — issue #27 was assigned to Copilot, which opened PR #28 with the gh-aw conversion, iterated on the prompt based on review comments, and merged.

#### Prerequisites

Install and verify the `gh-aw` CLI extension:
```bash
gh aw version 2>/dev/null || curl -sL https://raw.githubusercontent.com/github/gh-aw/main/install-gh-aw.sh | bash
gh extension upgrade aw
```

#### What Copilot did

1. **Removed** the old `sprint-impact-analysis.yml` (standard Actions workflow)

2. **Scaffolded** a new gh-aw workflow:
   ```bash
   gh aw new sprint-impact-analysis
   # Creates .github/workflows/sprint-impact-analysis.md
   ```

3. **Wrote the workflow file** (`.github/workflows/sprint-impact-analysis.md`) with:
   - YAML frontmatter configuring triggers, read-only permissions, GitHub MCP toolsets, and safe-outputs
   - A Markdown body containing the agent's natural language instructions for dependency traversal, impact notification, and optional issue closure

   Key frontmatter (the part that requires recompilation when changed):
   ```yaml
   on:
     issues:
       types: [closed, demilestoned]
     workflow_dispatch:
       inputs:
         issue_number: { required: true, type: number }
         scenario: { default: cancelled, type: choice, options: [cancelled, delayed] }

   permissions:         # agent job is strictly read-only
     contents: read
     issues: read
     pull-requests: read

   tools:
     github:
       toolsets: [default]   # MCP server for all GitHub API reads

   safe-outputs:        # controlled write channels — the only way the agent writes
     add-comment:
       max: 100
     add-labels:
       max: 100
     close-issue:
       max: 100
   ```

   The Markdown body instructs the agent to:
   - Identify the trigger issue and scenario type
   - Fetch all open issues via the GitHub MCP toolset
   - Parse `## Depends On` sections and build a reverse-dependency map
   - Perform BFS to find all transitively impacted issues
   - Compose a concise impact narrative
   - Post idempotent impact alert comments via `add-comment` safe output
   - Apply the `blocked` label via `add-labels` safe output
   - Optionally close directly-blocked issues via `close-issue` safe output when the scenario is `cancelled`

4. **Compiled** the workflow to generate the Actions lock file:
   ```bash
   gh aw compile sprint-impact-analysis
   # Creates .github/workflows/sprint-impact-analysis.lock.yml
   ```

5. **Added `.gitattributes`** so the lock file is treated as generated code:
   ```bash
   echo '.github/workflows/*.lock.yml linguist-generated=true merge=ours' > .gitattributes
   ```

6. **Committed** the three files:
   ```bash
   git add .gitattributes \
     .github/workflows/sprint-impact-analysis.md \
     .github/workflows/sprint-impact-analysis.lock.yml
   git rm .github/workflows/sprint-impact-analysis.yml
   git commit -m "Replace github-script workflow with proper gh-aw agentic workflow"
   git push
   ```

#### Important note on the Markdown body

The Markdown body of a gh-aw workflow (everything after the closing `---`) can be edited **directly on GitHub.com without recompiling**. It is loaded at runtime, so prompt improvements take effect on the next run. Only changes to the YAML frontmatter (triggers, permissions, tools, safe-outputs) require running `gh aw compile` again.

---

## Adapting This for Your Own Project

### Change the domain
Replace the TechMart product catalog in `app.js` (`PRODUCTS` array and `STUB_INFO` map) with your own application's features and stubs.

### Change the dependency structure
The workflow reads `## Depends On` sections from issue bodies. As long as your issues include that section with `#N` references, the graph traversal works automatically. Edit only the Markdown body of `sprint-impact-analysis.md` on GitHub.com — no recompilation needed.

### Change the sprint count
Create as many or as few project boards and milestones as needed. The workflow is sprint-agnostic — it reads milestone names directly from issue data.

### Make the workflow update project board Status
By default, the workflow adds the `blocked` label but does not update the GitHub Projects v2 Status field (this requires a GitHub App or PAT with `project` scope, which `GITHUB_TOKEN` in Actions does not cover). To add this, extend the gh-aw workflow's `safe-outputs` section with a custom job that calls the Projects v2 GraphQL API using a stored secret, then recompile with `gh aw compile`.

---

## Total Time to Build

The entire repository — web app, 24 issues, labels, milestones, 5 project boards, agentic workflow, and demo guide — was built in a single Copilot CLI session of approximately **75 minutes**.

| Phase | Approximate time |
|---|---|
| Web app (Step 2) | ~5 min |
| Issues + labels + milestones (Step 3) | ~15 min |
| Project boards + field setup + issue population (Step 4) | ~25 min (includes auth) |
| Demo guide + initial workflow + prompt template (Step 5) | ~20 min |
| gh-aw workflow conversion via Copilot Coding Agent (Step 6) | ~10 min |

---

## Files in This Repository

```
agentic-workflows-projects/
├── index.html                               # TechMart store (GitHub Pages)
├── style.css                                # Responsive stylesheet
├── app.js                                   # Product catalog, cart, stub modals
├── demo.md                                  # Presentation walkthrough (6 scenarios)
├── SETUP.md                                 # This file — replication guide
├── README.md                                # Project overview
├── .gitattributes                           # Marks lock files as linguist-generated
└── .github/
    ├── prompts/
    │   └── inspect-delay.prompt.md          # Reusable Copilot Chat prompt template
    └── workflows/
        ├── sprint-impact-analysis.md        # Agentic workflow (gh-aw markdown source — edit this)
        ├── sprint-impact-analysis.lock.yml  # Compiled Actions workflow (do not edit directly)
        └── reset-demo.yml                   # Helper workflow to reset demo state between runs
```
