---
layout: default
title: Switching it on
parent: Launch validation
nav_order: 1
---

# Switching it on
{: .no_toc }

For the whole instance, or for one form
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Launch validation has two settings. **The stricter of the two applies.**

---

## For the whole instance: `LAUNCH_VALIDATION`

The environment variable [`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) applies to every form:

- `off` - no server-side check: the job runs the extravars the browser or the caller sent.
- `log` - every launch is checked; what would be refused is written to the log as a
  warning, and the launch still runs as before.
- `enforce` (default) - an invalid launch is refused, and a valid one runs the extravars the
  server builds.

An empty or unknown value also means `enforce`. Changes take effect without a restart.

{: .warning }
> **Upgrading changes behaviour.** An instance that does not set `LAUNCH_VALIDATION` enforces
> every launch after the upgrade. Scripts that call `POST /api/v2/job` without `rawFormData`,
> or with values that break a form's rules, are refused with a `422`. Set
> `LAUNCH_VALIDATION=log` before upgrading to see what would be refused, or `off` to keep the
> old behaviour (see [Rolling it out](rolling-it-out.html)).

---

## For one form: `launchValidation`

A form can set its own level:

```yaml
- name: Create VM
  type: ansible
  roles:
    - default
  playbook: vm.yml
  launchValidation: enforce   # off | log | enforce
  fields:
    - name: vm_name
      type: text
      required: true
```

Use this setting on an instance that runs on `off` or `log`, for a form you know will be
launched over REST: that form is enforced, while the rest of the instance is not. It can also be set in the designer, in the
form settings.

**A form can be made stricter than the instance, never looser.** With `LAUNCH_VALIDATION`
on `enforce`, a form's `launchValidation: off` has no effect: a form cannot override
an operator's decision.

Wizard forms use it too: a wizard launch is checked step by step, each step against its own
subform (see [Wizard forms](rolling-it-out.html#wizard-forms)).
