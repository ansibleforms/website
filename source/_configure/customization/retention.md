---
layout: default
title: Backups and retention
parent: Environment Variables
nav_order: 3
---

# Backups and retention
{: .no_toc }

The backup commands, and how long backups, jobs and audit records are kept
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Change these to control how much history the database keeps, and how many backups stay on disk.

---

## Example

Keep finished jobs for 90 days and the audit trail for two years. In the compose project's `.env`:

```bash
JOB_RETENTION_DAYS=90
AUDIT_RETENTION_DAYS=730
```

A daily task removes finished jobs older than this at 2:30 AM and audit entries at 3:30 AM. A running job, or one that waits for
approval, is never removed. Both variables apply without a restart when they are changed on the settings page.

---

## Variables

Every variable of this group, with its type, default and description:

{% include env_vars_table.html group="retention" %}
