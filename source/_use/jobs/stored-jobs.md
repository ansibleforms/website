---
layout: default
title: Stored jobs
parent: Jobs
nav_order: 5
redirect_from:
  - /schedules/stored-jobs.html
---

# Stored jobs
{: .no_toc }

Keep the data of a form to load it again later
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Stored jobs

Stored jobs keep the values of a form so you can load them again, instead of filling in the same fields every time.

To store, fill in the form, open the dropdown next to **Submit** and choose **Store**. In **Save Form Data**, enter a
**Name**, an optional **Description** and an optional **Expires At** date, then save. Password and constant fields are
never stored. A subform has the same **Store** action next to its **Save** button, and keeps unfinished values without
validating them.

To load, select **Load from Store** at the top of the form. **Load Saved Form** lists your stored jobs for that form, with
their creation and expiry dates; select one to fill in the form with its values. Nothing runs until you submit.

Stored jobs are kept in the AnsibleForms database (table `stored_jobs`), with the form name, your user as
`<type>/<username>` (for example `local/admin`) and the values as JSON. A name must be unique per user and form; storing a
second one with the same name fails with "A saved form with this name already exists".

---

## Manage stored jobs

The **Stored Jobs** page lists stored jobs with their form, user, creation and expiry dates, and needs `allowStoredJobs`.

- **View Stored Job Details** shows the stored values as YAML.
- **Delete Stored Job** removes it. You can delete your own stored jobs; users with `showSettings` can delete any.
- Stored jobs with an **Expires At** date in the past are deleted automatically every day at 04:00 (in `LOG_TZ`).
