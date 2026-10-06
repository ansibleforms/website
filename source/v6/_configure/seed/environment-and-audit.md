---
layout: default
title: Editing and audit
parent: Config seed
nav_order: 5
---

# Editing and audit
{: .no_toc }

Lock the settings pages, and what the audit log records
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Turning off environment editing

`ALLOW_ENV_EDIT=0` makes the settings pages read-only. Every variable is still shown with
the value in force and the reason it cannot be changed, and the save endpoint responds with
403.

Use it whenever the environment is declared elsewhere. Otherwise the settings page writes
`persistent/.env`, which on an ephemeral volume is silently lost at the next restart, and on
a durable one drifts away from the manifest that is meant to be authoritative.

{: .note }
> Backups include `persistent/.env` as `managed.env`, so a rebuild gets the database, Vault
> and path settings back. **`ENCRYPTION_SECRET` and `ACCESS_TOKEN_SECRET` are stripped out**:
> the dump beside it holds every stored credential as AES ciphertext, and writing the key that
> decrypts it into the same folder would make a copied backup enough to read them all. Set
> those two on the target host instead; a comment in the file states this.
>
> What remains can still hold credentials (`VAULT_TOKEN`, a mail password), so the file is
> written `0600`. Restoring it is a separate opt-in step rather than part of a normal restore,
> because the database host and paths in it describe the machine the backup came from. The
> restore dialog lists the file and offers its own *Restore environment* button
> (`POST /api/v2/backup/:folder/restore-env`), which keeps the previous file as `.env.bak`.

## What is recorded

Each apply that changes something writes one `seed.apply` entry to the audit log, naming
the objects created, updated, released and pruned. Values are never recorded, because most
of them are secrets. A no-op apply writes nothing, which keeps the trail meaningful. A
poll that finds the file unchanged is a no-op, so the trail does not gain a row every minute.

An apply requested through the endpoint is deliberately recorded twice, and the two rows
record different things: `config-seed.apply.create` is **who** asked for it, `seed.apply` is
**what** it changed.

The Status page reports the seed twice: a **check** that the file is still readable and parses,
and that the last reload succeeded, and an **information** row saying how many records it
currently owns. The check is the only place that reports when the file on disk and the configuration
in force have diverged, because a failed reload leaves the instance running.
