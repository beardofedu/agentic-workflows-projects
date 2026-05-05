# TechMart — Agentic Workflows Demo Guide

A step-by-step walkthrough demonstrating GitHub Copilot's agentic capabilities using the TechMart dummy store backlog.

---

## Repository at a Glance

| What | Where |
|---|---|
| Live app | [GitHub Pages](https://beardofedu.github.io/agentic-workflows-projects/) |
| 24 backlog issues | [Issues tab](../../issues) — tagged with sprint labels and inter-dependencies |
| 5 sprint boards | [Projects tab](../../projects) — Sprint 1 through Sprint 5 |
| Impact workflow | [`.github/workflows/sprint-impact-analysis.yml`](.github/workflows/sprint-impact-analysis.yml) |
| Delay prompt template | [`.github/prompts/inspect-delay.prompt.md`](.github/prompts/inspect-delay.prompt.md) |

### The Dependency Chain (the star of the show)

```
#3 CART-003 (Cart API)  ← currently BLOCKED in Sprint 1
    ├── #9  Wishlist
    ├── #11 Promotions Engine
    │     ├── #12 Flash Sale Page      (Blocked)
    │     └── #13 Coupon Codes         (Blocked)
    └── #14 Order Service
          ├── #15 Order Confirmation
          ├── #17 Order History        (Blocked)
          │     └── #18 Returns Portal (Blocked)
          ├── #19 Notification Service
          └── #20 Product Reviews
                └── #22 Contact/Support
```

If **#3 slips**, **9 issues across Sprints 2–5 are directly or transitively impacted**.

---

## Prerequisites

- GitHub account with access to this repository  
- [Copilot subscription](https://github.com/features/copilot) (Individual, Business, or Enterprise)  
- GitHub Copilot Coding Agent enabled (repo **Settings → Copilot → Coding agent**)
- For the automated workflow: GitHub Models must be enabled for the repository

---

## Demo A — Copilot Coding Agent: Implementing a Feature from an Issue

**What this shows:** Copilot can read an issue, understand the codebase, implement the feature, and open a pull request — all autonomously.

**Best issue to use:** [#4 PDP-001 — Product Detail Page](../../issues/4)  
*(self-contained, no upstream dependencies, clear acceptance criteria)*

### Steps

**1. Open the issue**
- Navigate to [Issue #4](../../issues/4)
- Read through the acceptance criteria — note the specific requirements (route, breadcrumbs, cart integration, 404 state)

**2. Assign the issue to Copilot**
- On the issue page, click **Assignees → Copilot** (the robot avatar)
- Alternatively, leave a comment: `@copilot please implement this`

> **Expected:** Within a few seconds, Copilot replies in the issue thread confirming it's starting work. A "Copilot is working" indicator appears.

**3. Watch the session**
- Click the session link that appears in the issue comments
- You can observe Copilot's plan, tool calls, and file edits in real time
- It will: read the existing `index.html`, `style.css`, and `app.js`; plan a `product.html` page; implement routing via URL params; wire up the cart module

> **Expected:** Copilot opens a pull request titled something like `[PDP-001] Add Product Detail Page` with a description that references the acceptance criteria checklist.

**4. Review the pull request**
- Open the PR and review the diff
- Notice that Copilot has followed the existing CSS variable conventions and code style
- Check the acceptance criteria: is each item addressed?

**5. Request a change (optional live demo step)**
- Leave a review comment: *"The breadcrumb should also link back to the specific category, not just the homepage"*
- Watch Copilot push an updated commit addressing your feedback

**6. Merge**
- Approve and merge the PR
- Visit the GitHub Pages URL to see the new product detail page live

> **Talking point:** The entire feature — from issue to merged PR — required zero manual coding. Copilot read the spec, understood the existing codebase conventions, and shipped it. This is the foundation of agentic software delivery.

---

## Demo B — Copilot Chat: Ad-hoc Sprint Dependency Analysis

**What this shows:** Using Copilot Chat on GitHub.com as an intelligent sprint planning analyst — no setup required.

**Scenario:** A stakeholder asks: *"What happens to our roadmap if the Cart API (#3) doesn't ship in Sprint 1?"*

### Steps

**1. Open Copilot Chat on GitHub.com**
- Navigate to the repository
- Click the **Copilot** button (top right) to open the chat panel

**2. Attach context**
- Click the **`+` (attach)** button and select **"This repository"**

**3. Ask the question**

Paste this message:
```
Issue #3 CART-003 is currently blocked and might not ship in Sprint 1.
Looking at the issue bodies and their "Depends On" sections, which other
issues would be impacted? Group your answer by sprint and tell me which
issues are directly vs transitively blocked.
```

> **Expected response:** Copilot reads the issue bodies, identifies the dependency chain, and returns a sprint-grouped breakdown — e.g., "Sprint 2 loses #9 (Wishlist), Sprint 3 loses #11 (Promo Engine) and #14 (Orders)..."

**4. Ask a follow-up**

```
If we accept that #3 slips to Sprint 2, is there anything the Sprint 1
team could start work on that doesn't require the Cart API to be ready?
```

> **Expected:** Copilot identifies #4 PDP-001 and #16 SEARCH-001 as work that can proceed independently, and notes #1/#2 are already in progress.

> **Talking point:** No workflow, no custom tooling — just Copilot reading real issue data and reasoning about it. This is ad-hoc analysis. The next demo shows how to make it repeatable.

---

## Demo C — Structured Delay Analysis: The `inspect-delay` Prompt Template

**What this shows:** A reusable, standardized prompt template that produces a consistent impact report any team member can run.

**Template location:** [`.github/prompts/inspect-delay.prompt.md`](.github/prompts/inspect-delay.prompt.md)

> **Difference from Demo B:** Demo B was an ad-hoc question. This is a structured, reusable template that produces a standardized report format — suitable for sprint planning meetings, stakeholder updates, or automated documentation.

### Steps

**1. Open the prompt template**
- Navigate to [`.github/prompts/inspect-delay.prompt.md`](.github/prompts/inspect-delay.prompt.md) in the repo

**2. Copy the template and fill in the blanks**

Replace the `[BRACKETED]` values:
```
#[ISSUE_NUMBER]  →  #3
[ISSUE_TITLE]    →  CART-003: Cart API: Backend integration for persistent cart
[delayed to Sprint X / cancelled entirely]  →  delayed to Sprint 2
```

**3. Paste into Copilot Chat (GitHub.com, VS Code, or CLI) with the repo attached**

> **Expected output:** A structured report with 5 sections:
> - **Blast radius** — table of all 9 impacted issues with sprint and dependency type
> - **Sprint-by-sprint impact** — what Sprint 2, 3, 4 each lose
> - **Critical path** — `#3 → #14 → #17 → #18` as the longest chain (4 sprints deep)
> - **Recommendations** — three concrete options with trade-offs
> - **Quick wins** — confirms #4 PDP-001, #16 SEARCH-001, #24 A11Y-001 can proceed

**4. Run it again for a different issue**

Try `#5 AUTH-001` (User Login):
```
#[ISSUE_NUMBER]  →  #5
[ISSUE_TITLE]    →  AUTH-001: User login flow
[delayed to Sprint X / cancelled]  →  cancelled entirely
```

> **Expected:** Different blast radius — AUTH cancellation impacts #6–10 (all Sprint 2 account features), #11 (Promo Engine), #17 (Order History), #20 (Reviews), and #22 (Support). Copilot should flag that cancelling auth is effectively cancelling 14+ downstream features.

> **Talking point:** The same prompt template is reusable for any issue on any project. Teams can standardize impact analysis across all their repos.

---

## Demo D — Automated Agentic Workflow: Real-time Impact Detection

**What this shows:** A GitHub Actions workflow that automatically detects when an issue is cancelled or removed from a sprint, traverses the dependency graph, and notifies every downstream issue — with an AI-written impact summary.

**Workflow file:** [`.github/workflows/sprint-impact-analysis.yml`](.github/workflows/sprint-impact-analysis.yml)

### How it works

```
Issue closed as "not planned"  ──▶  workflow triggers
         OR
Issue milestone removed        ──▶  workflow triggers
         OR
Manual workflow_dispatch       ──▶  workflow triggers (for demos)
         │
         ▼
  Fetch all open issues
         │
         ▼
  Parse "Depends On" sections from issue bodies
  Build reverse-dependency map
  BFS traversal → find ALL transitively blocked issues
         │
         ▼
  Call GitHub Models (gpt-4o-mini)
  → generate human-readable impact summary
         │
         ▼
  For each impacted issue:
    • Post idempotent comment with sprint impact alert
    • Add "blocked" label
         │
         ▼
  Write structured summary to Actions workflow run page
```

> **Key design principle:** The dependency graph and blast radius are computed **deterministically in code** — the AI is only used to write the human-readable narrative. This makes the automation trustworthy and auditable.

### Steps — Manual Trigger (safe for demos)

**1. Navigate to the workflow**
- Go to **Actions → Sprint Impact Analysis**

**2. Click "Run workflow"**
- Set **Issue number** to `3`
- Set **Scenario** to `cancelled`
- Click **Run workflow**

> **Expected:** The workflow starts within a few seconds.

**3. Watch the run**
- Open the running workflow
- Expand the `Analyze downstream impact` step log to see the dependency traversal in real time
- After ~30 seconds, the run completes

**4. Check the workflow summary**
- Click the **Summary** tab on the completed run
- You should see a table of all 9 impacted issues with their sprints and dependency types
- Below it, an AI-generated impact narrative

**5. Check the impacted issues**
- Navigate to [Issue #9](../../issues/9), [#11](../../issues/11), [#14](../../issues/14)
- Each should now have a **⚠️ Sprint Impact Alert** comment with:
  - Which issue was cancelled and why it matters
  - Whether this issue is directly or transitively blocked
  - An expandable full impact report (the AI summary)
  - A link back to the workflow run

**6. Check the labels**
- On the [Issues list](../../issues), filter by `blocked`
- All downstream issues should now carry the `blocked` label

---

## Demo E — Full Live Scenario: Cancel a Sprint Item and Watch It Cascade

**What this shows:** The complete end-to-end story — a realistic sprint planning situation where a single blocked issue forces a cascade of delays across multiple sprints.

> **Best for:** Live audience demos, recorded walkthroughs, stakeholder presentations.  
> **Reset note:** To re-run this demo, reopen the closed issue and remove the `blocked` labels that were added.

### The Story

> *"It's Sprint 1 planning. The Cart API (#3) has been waiting 3 weeks on the backend team to provision an API endpoint. The decision has been made: we're cancelling this sprint item and deferring the feature entirely."*

### Steps

**1. Set the scene — show the sprint board**
- Open [Project: Sprint 1](../../projects) 
- Point out that `#3 CART-003` is currently marked **Blocked / 🔴 High**
- Show issues `#1` and `#2` are In Progress — the groundwork is done, but #3 is stalled
- Open [Issue #3](../../issues/3) and read the **"Blocks"** section aloud to the audience

**2. Make the decision — close the issue as "not planned"**
- On [Issue #3](../../issues/3), click **Close issue**
- In the dropdown, select **"Close as not planned"**
- Click **Close issue**

> **Expected:** The issue closes. Within seconds, the **Sprint Impact Analysis** workflow appears in the Actions tab with a yellow ⏳ indicator.

**3. Watch the workflow run**
- Click into **Actions → Sprint Impact Analysis**
- Open the running job
- Watch the log scroll:
  - `Fetched 21 open issues`
  - `Building dependency graph...`
  - `Impacted issues: 9, 11, 13, 14, 15, 17, 18, 19, 20`
  - `Calling GitHub Models for impact summary...`
  - `Notified #9`  
  - `Notified #11`  
  - *(and so on for all 9 issues)*

**4. Show the impact comments**

Navigate to these issues in sequence to show the cascade:

- **[#9 Wishlist](../../issues/9)** — *Sprint 2, direct dependency*: "Cannot save wishlist items without the Cart API to handle 'Move to Cart'."
- **[#11 Promotions Engine](../../issues/11)** — *Sprint 3, direct dependency*: "Discount evaluation requires real cart contents."
- **[#14 Order Service](../../issues/14)** — *Sprint 3, direct dependency*: "Cannot create orders without a server-side cart to convert."
- **[#17 Order History](../../issues/17)** — *Sprint 4, transitive*: "Order history has no data if orders can never be placed."
- **[#18 Returns Portal](../../issues/18)** — *Sprint 4, transitive*: "Returns depend on Order History which depends on Order Service which depends on Cart API."

**5. Show the workflow summary**
- Go back to the completed Actions run and click **Summary**
- Show the table: 9 issues, their sprints, direct vs transitive classification
- Read the AI-generated narrative aloud

> **Talking point:** *"In a traditional workflow, a developer would need to manually trace each dependency, post individual comments, and update the project board. This entire cascade — 9 notifications across 4 sprints — happened automatically in 30 seconds, triggered by a single issue status change."*

**6. Discuss the "delay" scenario (optional extension)**

Ask the audience: *"What if instead of cancelling, we delayed #3 to Sprint 2?"*

- Remove the `blocked` label from Issue #3
- Change its milestone to **Sprint 2**

> **Expected:** The `demilestoned` event fires the workflow again, posting a second wave of comments on all dependent issues — this time with "delayed" language instead of "cancelled".

---

## Demo F — The Compound Scenario: Auth + Cart Both Slip

**What this shows:** When two foundational issues are blocked simultaneously, the blast radius compounds dramatically.

### Steps

**1. Trigger the workflow manually for #5 AUTH-001**
- Go to **Actions → Sprint Impact Analysis → Run workflow**
- Issue number: `5`, Scenario: `delayed`

> **Expected:** Copilot now identifies all auth-dependent issues: #6, #7, #8, #9, #10 (Sprint 2), #11, #14 (Sprint 3), #17, #20 (Sprint 4), #22 (Sprint 5) — **10 additional issues** on top of the #3 cascade.

**2. Show the union of both blast radii**
- Filter [Issues](../../issues) by label `blocked`
- The full picture: nearly the entire post-Sprint-1 backlog is now flagged

> **Talking point:** *"With two foundational issues at risk, the team has real choices: staff up the Cart API work, de-scope authentication, or reorder the roadmap entirely. Copilot surfaced the full picture instantly — the team can focus on decision-making, not detective work."*

---

## Tips for Presenters

### Timing Guide
| Demo | Time |
|---|---|
| A — Coding Agent | 8–10 min |
| B — Ad-hoc Chat | 4–5 min |
| C — Prompt Template | 3–4 min |
| D — Workflow Overview | 3–4 min |
| E — Live Cancel Cascade | 5–7 min |
| F — Compound Scenario | 3–4 min |

**Short demo (15 min):** Run A + E  
**Medium demo (25 min):** Run A + C + E  
**Full demo (40 min):** Run all sections

### Before the Demo
- [ ] Ensure GitHub Copilot Coding Agent is enabled in repository Settings
- [ ] Verify GitHub Models is enabled (check Actions → Settings → Models)
- [ ] Pre-close Issue #3 and re-open it so the workflow has already run once (avoids live wait)
- [ ] Have the Sprint 1 project board open in a browser tab
- [ ] Have the Actions tab open in a second tab

### Resetting Between Runs
To re-run Demo E cleanly:
1. Re-open Issue #3 (click **Reopen issue**)
2. Remove the `blocked` label from issues #9, #11, #13, #14, #15, #17, #18, #19, #20
3. Delete the sprint impact comments from those issues
4. Reset Issue #3 milestone back to **Sprint 1**

A convenience label `demo-reset-needed` can be applied to all affected issues after a run to make them easy to find.

### If Copilot Coding Agent Seems Slow
- The agent sometimes takes 2–5 minutes to start — pre-assign the issue before the demo
- Show the live session URL from the issue comments while it works
- Use the "watch session" view to show the agent's reasoning in real time

### If the Workflow Fails
- Check **Actions → Sprint Impact Analysis** for error details
- Most common cause: GitHub Models not enabled → the workflow will still comment on issues, just without the AI summary
- Manual fallback: run Demo C (prompt template) instead to show the same analysis via Chat

---

## What's Next — Ideas for Extending This Demo

| Extension | Complexity | What it shows |
|---|---|---|
| Add a second workflow that **re-opens** blocked issues when their dependency is resolved | Low | Full bidirectional automation |
| Create a **Copilot Extension** that adds a true `/inspect-delay` slash command in chat | Medium | Custom Copilot tooling |
| Add a **project board auto-update** to set Status → Blocked via GraphQL when the workflow fires | Medium | End-to-end board management |
| Integrate **real product images** and ask Copilot to implement them from an issue | Low | More realistic coding agent demo |
| Build a **sprint velocity dashboard** that tracks blocked issues over time | High | Metrics-driven agile with AI |
