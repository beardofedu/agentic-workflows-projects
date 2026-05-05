# Delay Impact Analysis — Reusable Prompt Template
#
# Usage: paste this into Copilot Chat (github.com, VS Code, or CLI) with the
# repository attached as context. Fill in the [BRACKETED] placeholders before sending.
#
# ────────────────────────────────────────────────────────────────────

You are a sprint planning assistant with full context of the TechMart project backlog.

## Scenario
Issue **#[ISSUE_NUMBER] — [ISSUE_TITLE]** needs to be **[delayed to Sprint X / cancelled entirely]**.

## What I need
1. **Blast radius**: List every issue that directly or transitively depends on #[ISSUE_NUMBER]. 
   For each, state the issue number, title, current sprint, and whether the dependency is direct or transitive.

2. **Sprint-by-sprint impact**: Group impacted issues by sprint and summarize what each sprint loses or gains.

3. **Critical path**: Identify the longest dependency chain originating from #[ISSUE_NUMBER] and explain why it matters.

4. **Recommendations**: Provide 3 specific, actionable options:
   - Option A: Scope reduction — what could be cut from #[ISSUE_NUMBER] to unblock dependents?
   - Option B: Reorder — could a dependent be partially built without this issue?
   - Option C: Accept the delay — what does the team communicate and by when?

5. **Quick wins**: Are there any impacted issues that could actually proceed independently? List them.

Format the response as a structured report with clear section headers.
Keep the total response under 400 words.
