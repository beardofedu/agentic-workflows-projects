---
name: Sprint Impact Analysis
description: Agentically identify issues blocked by cancelled or delayed dependencies and close or flag them.
on:
  issues:
    types: [closed, demilestoned]
  workflow_dispatch:
    inputs:
      issue_number:
        description: Issue number to analyze as cancelled or delayed
        required: true
        type: number
      scenario:
        description: Scenario type
        required: true
        default: cancelled
        type: choice
        options:
          - cancelled
          - delayed

permissions:
  contents: read
  issues: read
  pull-requests: read

tools:
  github:
    toolsets: [default]

network: defaults

safe-outputs:
  add-comment:
    max: 100
  add-labels:
    max: 100
  close-issue:
    max: 100

---

# Sprint Impact Analysis

When work is cancelled or moved out of a sprint, find all downstream issues that depend on it and act on issues that are now stuck.

## Inputs and trigger handling

1. Determine the source issue and scenario:
   - `workflow_dispatch`: use inputs `issue_number` and `scenario`.
   - `issues.demilestoned`: source is `${{ github.event.issue.number }}` and scenario is `delayed`.
   - `issues.closed`: fetch the issue and only continue if its `state_reason` is `not_planned`; otherwise do nothing.
2. If the event is not one of the supported cases above, do nothing.

## Dependency analysis

1. Read all **open issues** in this repository (ignore pull requests).
2. Parse each issue body for dependencies listed in the `## Depends On` section using `#<number>` references.
3. Build a reverse dependency graph and find all transitively impacted open issues downstream from the source issue.
4. Determine whether each impacted issue is:
   - **Directly blocked** (depends directly on the source issue), or
   - **Transitively blocked**.

## Required actions for impacted issues

For every impacted issue:

1. Add the `blocked` label.
2. Add a comment with marker `<!-- sprint-impact-bot:source-<source_issue_number> -->` so notifications are idempotent.
3. In the comment, include:
   - whether the source issue was cancelled or delayed,
   - whether the impacted issue is direct or transitive,
   - a short actionable recommendation.
4. If the scenario is **cancelled** and the issue is **directly blocked**, close the issue because its dependency is no longer planned.
5. Do not duplicate comments if the marker for the same source issue already exists.

## Comment tone and format

- Keep comments concise and actionable.
- Use markdown.
- Include a link back to the workflow run: `${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}`.

## No-op behavior

- If no impacted issues are found, perform no write actions.
