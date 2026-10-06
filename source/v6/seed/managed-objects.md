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

`ldap` and `settings` are a **single row** each, so the seed must declare all their fields; the other sections are lists.

A seed that omits a field refuses to start and names it:

```
Config seed failed, refusing to start : Seed file validation failed :
/settings must have required property 'mail_server'
```

Declare an empty value explicitly with `""` or `false`. The only optional field is `ldap.groupfilter`: when omitted,
it is left unchanged.

`settings` covers only the mail fields and the URL; all other settings stay editable.

## The file holds no secrets

Each `${VARIABLE}` is replaced with that environment variable (on Kubernetes, from a `Secret`), so the file can live in Git.

A variable that is not set is a **fatal error**, so a placeholder can never end up stored as a password.

Credentials can also take their password from HashiCorp Vault instead, with `vault_path`.

## Managed objects

An object that comes from the seed is flagged **managed**:

- It is enforced on **every** start, so the file stays authoritative.
- It is read-only: the API answers **403**, and the interface marks it *Config seed* and disables Edit and Delete.
- Only the seed can set or clear the flag.

Objects created by hand are **never touched**, unless the seed declares the same name. That record is then **adopted**:
the declared fields are enforced and it becomes read-only. Adoption is logged as a warning and in the audit trail.

Applying the seed is idempotent: records that already match are left alone, so a restart normally reports `0 updated`.

A declared repository whose working tree is missing is **cloned again** on every start, so a failed first clone is
retried. The *Repositories* row of the Status page shows any repository without a working tree.

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
