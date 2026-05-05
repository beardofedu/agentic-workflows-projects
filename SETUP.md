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
| GitHub Actions workflow | `sprint-impact-analysis.md` (+ compiled `.lock.yml`) — auto-detects cancelled/delayed issues and notifies downstream |
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

**`.github/workflows/sprint-impact-analysis.md`**  
GitHub Actions workflow that:
- Triggers on `issues.closed` (where `state_reason == 'not_planned'`), `issues.demilestoned`, or `workflow_dispatch`
- Fetches all open issues and parses `## Depends On` sections to build a reverse-dependency map
- Runs BFS traversal to find all transitively impacted issues
- Calls GitHub Models (`gpt-4o-mini`) to generate a human-readable impact summary
- Posts idempotent `⚠️ Sprint Impact Alert` comments on every downstream issue
- Adds the `blocked` label to each impacted issue
- Writes a structured summary table to the Actions run summary page

**`.github/prompts/inspect-delay.prompt.md`**  
A fill-in-the-blanks Copilot Chat prompt template that produces a standardized 5-section impact report (blast radius, sprint-by-sprint impact, critical path, recommendations, quick wins).

**`demo.md`**  
A full presentation guide with 6 demo scenarios, timing guide, presenter tips, and reset instructions.

---

## Adapting This for Your Own Project

### Change the domain
Replace the TechMart product catalog in `app.js` (`PRODUCTS` array and `STUB_INFO` map) with your own application's features and stubs.

### Change the dependency structure
The workflow reads `## Depends On` sections from issue bodies. As long as your issues include that section with `#N` references, the graph traversal works automatically. No code changes needed.

### Change the sprint count
Create as many or as few project boards and milestones as needed. The workflow is sprint-agnostic — it reads milestone names directly from issue data.

### Make the workflow update project board Status
By default, the workflow adds the `blocked` label but does not update the GitHub Projects v2 Status field (this requires a GitHub App or PAT with `project` scope, which `GITHUB_TOKEN` in Actions does not cover). To add this:
1. Create a GitHub App or PAT with `project` scope
2. Store it as a repository secret (e.g., `PROJECT_TOKEN`)
3. Add a GraphQL mutation step after the comment loop using that token

---

## Total Time to Build

The entire repository — web app, 24 issues, labels, milestones, 5 project boards, workflow, and demo guide — was built in a single Copilot CLI session of approximately **65 minutes**, including the `project` scope authentication step.

| Phase | Approximate time |
|---|---|
| Web app (Step 2) | ~5 min |
| Issues + labels + milestones (Step 3) | ~15 min |
| Project boards + field setup + issue population (Step 4) | ~25 min (includes auth) |
| Demo guide + workflow + prompt template (Step 5) | ~20 min |

---

## Files in This Repository

```
agentic-workflows-projects/
├── index.html                          # TechMart store (GitHub Pages)
├── style.css                           # Responsive stylesheet
├── app.js                              # Product catalog, cart, stub modals
├── demo.md                             # Presentation walkthrough (6 scenarios)
├── SETUP.md                            # This file — replication guide
├── README.md                           # Project overview
└── .github/
    ├── prompts/
    │   └── inspect-delay.prompt.md     # Reusable Copilot Chat prompt template
    └── workflows/
        ├── sprint-impact-analysis.md  # Agentic workflow source
        └── sprint-impact-analysis.lock.yml  # Compiled workflow
```
