---
layout: default
title: Reloading and startup
parent: Config seed
nav_order: 3
---

# Reloading and startup
{: .no_toc }

Change the file without a restart, and what happens at startup
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Changing the file without restarting

The seed is re-read by the **Config seed reload** system task, every minute by default, and
re-applied when its content has changed. A change committed to git therefore reaches a
running instance automatically: on Kubernetes, a `ConfigMap` is remounted under the pod within
about a minute, and the next check picks it up. There is no rollout and no restart, and no
hook needs to call anything.

Since 7.8.0 its timing is a cron of 5 fields in `CONFIG_SEED_RELOAD_CRON` (`* * * * *` by default), set on the task's own page
under **Jobs > System** (see [Jobs](../jobs/)) or in the environment. Without `CONFIG_SEED_PATH` the task is off.

`CONFIG_SEED_RELOAD_SECONDS`, its setting before, is deprecated since 7.8.0 and removed in 8. It is still read while
`CONFIG_SEED_RELOAD_CRON` is not set, with a warning in the log at start: `60` reads as `* * * * *`, a multiple of 60 up to 3600 as
every so many minutes, and `0` still turns the reload off. Set `CONFIG_SEED_RELOAD_CRON` instead.

For an unchanged file, the poll computes one hash and stops, so it never rewrites a row it has
already applied.

To apply the file immediately instead of waiting for the next check, use either of these:

```
POST /api/v2/config-seed/apply     # settings admin ; answers with what it did
kill -HUP 1                        # inside the container, no credentials needed
```

Both **force** an apply even when the file has not changed. A forced apply re-asserts a
managed record that was edited directly in the database, and re-clones a declared repository
whose working tree is missing.

{: .note }
> A reload is **never fatal**, unlike the apply at startup. An instance that is already
> serving keeps its current configuration, the reason is logged, and the *Config seed* row
> on the Status page turns red and names it. A typo pushed to git must not be able to take
> down a running instance without any operator action.
>
> The same broken content is also not retried on every check; otherwise one bad edit would
> write the same error to the log indefinitely. Fix the file, or call the endpoint to retry
> immediately.

---

## A broken seed refuses to start

An unreadable file, invalid YAML, an unknown field, a duplicate name or an unresolved
`${VARIABLE}` makes the server **exit** rather than start. This is the **startup** path
only: see the note above for what the same file does to an instance that is already up.

This is deliberate. Continuing with the previous configuration would leave an instance whose
behaviour no longer matches the manifest that is supposed to describe it, with nothing
reporting the mismatch. The reason is written to standard error as well as to the log file, so
`kubectl logs` and `docker logs` show it.

Validation is strict: unknown fields are rejected rather than ignored, and the error names
the offending key:

```
Config seed failed, refusing to start: Seed file validation failed: /awx/items/0 must NOT have additional properties 'tokenn'
```

---

## An empty database provisions itself

With `ALLOW_SCHEMA_CREATION` on (the default), a database that holds **no AnsibleForms
tables at all** gets its schema created at startup. A fresh deployment therefore starts
without anyone having to call the `/schema` endpoint manually.

The precondition is strict on purpose: creating the schema **drops every table first**, so
it only ever runs against a database that is completely empty. A database that is missing
one column, or that has tables but no user accounts, is *not* empty and is left untouched;
the schema patches handle those cases.
