---
layout: default
title: Using channels in a form
parent: Notification channels
nav_order: 5
---

# Using channels in a form
{: .no_toc }

Naming channels in notifications and approvals
{: .fs-6 .fw-300 }

Forms name channels by their name, in `notifications` for job status and job events, and in `approval`:

```yaml
notifications:
  recipients:
    - ops@example.com
  channels:
    - ops-slack
    - ops-teams
  onStatus:
    - failed

approval:
  title: Remove host $(vm.name) ?
  roles:
    - approvers
  channels:
    - approvers-teams
```

- The chat and webhook channels get a short message (the form, the job, what happened) with a link to the job; for an
  approval, the job's page is where it is approved or rejected.
- A **mail** channel in the list sends the usual mail to `recipients` (an approval's `notifications` addresses) through
  that server instead of the default one.
- A name that does not exist, or a chat or webhook channel that is turned off, is skipped and said in the log.
- A **mail** channel that is turned off is not skipped: the mail goes through the default mail channel instead, and the
  log says so.
