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

The environment variable [`LAUNCH_VALIDATION`](../customization) applies to every form:

- `off` (default) - no server-side check. Upgrading does not change existing behaviour.
- `log` - every launch is checked; what would be refused is written to the log as a
  warning, and the launch still runs as before.
- `enforce` - an invalid launch is refused, and a valid one runs the extravars the server
  builds.

Changes take effect without a restart.

---

## For one form: `launchValidation`

A form can set its own level:

```yaml
- name: Create VM
  type: ansible
  roles:
    - public
  playbook: vm.yml
  launchValidation: enforce   # off | log | enforce
  fields:
    - name: vm_name
      type: text
      required: true
```

Use this setting when you know a form will be launched over REST: that form is enforced,
while the rest of the instance can stay on `off`. It can also be set in the designer, in the
form settings.

**A form can be made stricter than the instance, never looser.** With `LAUNCH_VALIDATION`
on `enforce`, a form's `launchValidation: off` has no effect: a form cannot override
an operator's decision.

Wizard forms cannot use it yet (see [Limitations](rolling-it-out.html#limitations)): a wizard form with
`launchValidation` does not load, and the form configuration reports the error.
