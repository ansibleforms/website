---
layout: default
title: Managed objects
parent: Config seed
nav_order: 2
---

# Managed objects
{: .no_toc }

How the seed owns the objects it lists, and how it keeps secrets out
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Single-row sections are all or nothing

`ldap`, `settings` and `chat_assistant` (`chat` before 7.8.0) are a **single row** each, so the seed must declare all their fields.

A seed that omits a field refuses to start and names it:

```
Config seed failed, refusing to start: Seed file validation failed: /settings must have required property 'url'
```

Declare an empty value explicitly with `""` or `false`. A few fields are optional, and one that is omitted is left unchanged:

| Section | Optional fields |
|---|---|
| `ldap` | `description`, `credential` (a credential to bind with) and `groupfilter` |
| `chat_assistant` | `auth_type`, `api_version`, `request_user`, `ignore_certs`, `extra_headers`, and `credential` since 7.8.0 |
| `settings` | The `mail_*` keys, deprecated since 7.6.0 (see [Example](example.html)) |

`settings` covers only the URL, and the deprecated mail keys; all other settings stay editable.

---

## The file holds no secrets

Each `${VARIABLE}` is replaced with that environment variable (on Kubernetes, from a `Secret`), so the file can live in Git.

A variable that is not set is a **fatal error**, so a placeholder can never end up stored as a password.

Credentials can also use a [secret store](../secret-stores) (`secret_store`, `secret_ref`); `vault_path` goes away in 8.

---

## Managed objects

An object of the list sections (`runners`, `secret_stores`, `credentials`, `databases`, `sso`, `repositories`, `syslog`,
`notifications` and `labels`) or of a single-row section that comes from the seed is flagged **managed**:

- It is enforced on **every** start, so the file stays authoritative.
- It is read-only: the API answers **403**, the interface disables Edit and Delete, and its own page says it comes from the config
  seed file and is read only.
- Only the seed can set or clear the flag.

Objects created by hand are **never touched**, unless the seed declares the same name. That record is then **adopted**:
the declared fields are enforced and it becomes read-only. Adoption is logged as a warning and in the audit trail.

Applying the seed is idempotent: records that already match are left alone, so a restart normally reports `0 updated`.

A declared repository whose working tree is missing is **cloned again** on every start, so a failed first clone is
retried. The *Repositories* row of the Status page shows any repository without a working tree.

Since 7.8.0 a [git repository](../repositories/) can hold the same kinds of objects. An object a repository holds stays the
repository's: the seed's item for it is not applied, and the server log says so. A repository the seed declares stays the seed's.

### Removing an object

Removing an object from the file **releases** it: the record stays and becomes editable again. Deleting a whole section
does the same.

Add `prune: true` to a list section to **delete** the managed records the file no longer declares:

```yaml
credentials:
  prune: true
  items:
    - name: production-db
      # anything else the seed used to manage is deleted
```

`prune` never deletes a record created by hand.

### Turning the seed off

Unsetting `CONFIG_SEED_PATH` turns the seed off: the next start releases every record and field the seed managed, as an applied empty
seed would. The records keep their values and become editable again, and the server log and the audit log say what was released.

A `CONFIG_SEED_PATH` whose file is missing does not release anything: the server refuses to start instead, because a mounted file may
only be late.

---

## Settings the seed declares

The sections added in 7.8.0 are owned less strictly than the managed objects, in two ways.

| Sections | How the seed owns them |
|---|---|
| `defaults`, `logo`, `icon`, `name`, `links`, `mcp` | Field by field: each declared field is read only on its page, with a notice, and the API refuses to change it (403) |
| `users`, `groups`, `announcements`, `disclaimer`, `ssh` | Made or changed at each apply, never locked nor deleted |

A field of `defaults`, `logo`, `icon`, `name`, `links` or `mcp` that the seed no longer declares is released, and all of them are
when the seed is turned off. A seeded logo or icon cannot be uploaded nor removed in the app. When a repository holds the same page,
the seed keeps the fields it declares and the repository holds the others.

A user, a group, an announcement, a disclaimer version or the SSH key and known hosts of the seed stay editable in the app, and the
next apply writes the seed's values again where they differ. Removing an item from the file leaves it in the app, and `prune` deletes
none of them.
