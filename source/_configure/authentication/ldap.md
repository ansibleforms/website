---
layout: default
title: LDAP
parent: Authentication
nav_order: 2
---

# LDAP
{: .no_toc }

Let directory users sign in with their own password, and give them roles through their directory groups
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## How it works

AnsibleForms connects to the directory with a bind account, searches the user, and then binds as that user to check
the password:

1. The user signs in with username and password. When no **local** user has that name, LDAP is tried.
2. AnsibleForms binds with the bind account of the directory's credential, and searches **Search Base** for an entry whose
   **Username Attribute** equals the username.
3. It binds as the entry that was found, with the password that was typed.
4. The groups are read from the entry (or from a group search), filtered, and prefixed with `ldap/`.

A username in UPN form (`jdoe@example.com`) that finds no user is retried once with the part before the `@`, so users
can sign in with either form even when the Username Attribute holds the short name. A wrong password is never retried.

One set of settings serves Active Directory, OpenLDAP and others; from 7.3.0 there can be [several directories](#several-directories).

---

## Settings

From 7.3.0 the settings are per directory. **Access > LDAP** lists the directories, in the order a bare username is looked up:

![Access > LDAP](../assets/screenshots/ldap.jpg)

| Row menu | What it does |
|---|---|
| Edit | Opens the directory's page |
| Test connection | Tries a login with a test username and password, see [Testing the connection](#testing-the-connection) |
| Enable, Disable | Turns the directory on or off; `main` is turned off rather than deleted |
| Move up, Move down | Changes its place in the lookup order |
| Delete | Removes the directory; shown but disabled on `main` |

Adding a directory asks its fields in four steps, the tabs of its page. **Details** holds **Enabled**, the **Name** and a **Description**:

| Tab | Setting | Meaning |
|---|---|---|
| Credentials | Credential | Required. An `ldap` credential of [Connections > Credentials](../credentials.html), which holds the connection, see below |
| Users | Search Base | DN where the user search starts, e.g. `OU=Users,DC=example,DC=com`. Subtrees are searched too |
| Users | Username Attribute | Attribute matched against the login name: `sAMAccountName` in AD (the default), `uid` in OpenLDAP |
| Users | Mail Attribute | Attribute holding the email address, usually `mail` |
| Users | Sign-in domains | Domains whose `user@domain` sign-ins go straight to this directory, see [Several directories](#several-directories) |
| Groups | Groups Attribute | Attribute of the user entry that holds the groups (`memberOf`, the default), or `groups` with a group search |
| Groups | Groups Search Base | DN where the group search starts |
| Groups | Group Class | objectClass of the groups, e.g. `group`, `groupOfNames` or `posixGroup` |
| Groups | Group Member Attribute | Attribute of a group that lists its members, e.g. `member`, `uniqueMember` or `memberUid`; default `member` |
| Groups | Group Member User Attribute | Attribute of the user that those member values hold, e.g. `dn` or `uid`; default `dn` |
| Groups | Group Filter | Regular expression; only the groups whose name matches are kept. Empty keeps every group |

The defaults of the last three group fields apply only when the group search is used, see the next section.

The `ldap` credential holds how the directory is reached and as whom it searches:

| Field | Meaning |
|---|---|
| Servers | One per field, as `host`, `host:port` or `ldaps://host:port`, tried in this order: when one cannot be reached, the next one is |
| Port | `389` for plain LDAP, `636` for LDAPS |
| Enable TLS | Connect with LDAPS (`ldaps://`). StartTLS on port 389 is not supported |
| Ignore certs | Skip the validation of the server certificate. Shown only with **Enable TLS** |
| Certificate | The client certificate AnsibleForms presents to the servers, in PEM, when the certificates are checked |
| CA bundle | The CA certificate(s) that signed the server certificate, in PEM, when the certificates are checked |
| Bind user DN | The DN of the service account that searches the directory |
| Bind user password | Its password, stored encrypted or read from a [secret store](../secret-stores/) |

Only an admin can add or change an `ldap` credential, see [Who may change a credential](../credentials.html#who-may-change-a-credential).
Up to 7.2.0 the servers, TLS and bind account were fields of the LDAP settings. The upgrade to 7.3.0 moves them into a credential,
see [Addresses in credentials](../credentials/types.html#addresses-in-credentials):

| The directory before the upgrade | Where its servers go |
|---|---|
| Its own bind DN and password, no credential | A new `ldap` credential named `<directory>-ldap`, such as `main-ldap` |
| A credential without servers | Into that credential |
| A credential that already holds other servers | A copy of the credential named `<credential>-<directory>`, which the directory then names |

A name that is taken gets `-2`, `-3` and so on. A directory from the config seed is left as it is: the seed owns it.

---

## Groups

The groups come from one of two places, and the **Groups Attribute** decides which one is used:

- **An attribute of the user entry**, usually `memberOf`. This is the common setup for Active Directory, and for
  OpenLDAP with the `memberof` overlay.
- **A group search**, for directories without `memberOf`. It runs only when **Groups Search Base** and **Group Class**
  are both set: AnsibleForms then searches for groups of that class whose **Group Member Attribute** holds the user's
  **Group Member User Attribute**, and stores the result in the attribute `groups`. Set **Groups Attribute** to `groups`
  to use it.

{: .note }
> With **Groups Attribute** `memberOf`, a configured group search runs but its result is not used for the roles.

Each group is a DN, and AnsibleForms keeps its first CN: `CN=AF-Admins,OU=Groups,DC=example,DC=com` becomes `AF-Admins`.
The **Group Filter** is then applied to that name, and the remaining groups get the `ldap/` prefix: `ldap/AF-Admins`.

In large directories the filter keeps tokens and jobs small; an invalid regular expression keeps all groups and is logged.

---

## Mapping to roles

In config.yaml, an LDAP group is `ldap/<group CN>` and an LDAP user is `ldap/<username>`, both case sensitive:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
  - name: operator
    groups:
      - ldap/AF-Operators
    users:
      - ldap/jdoe
```

The username is the value of the **Username Attribute** as the directory returns it, not as the user typed it.
See [Roles](../config/roles.html) for the role options.

---

## Several directories

From 7.3.0 there can be several directories, each with its own servers, users and groups. Their names tell their members apart:

| Directory | Username | Groups | In a role |
|---|---|---|---|
| `main` | `jdoe` | `ldap/AF-Admins` | `ldap/jdoe`, `ldap/AF-Admins` |
| Any other, such as `corp` | `corp/jdoe` | `ldap/corp/AF-Admins` | `ldap/corp/jdoe`, `ldap/corp/AF-Admins` |

A user names the directory at sign-in as `corp\jdoe` or `corp/jdoe`, or signs in with an address of a domain the directory
owns. A bare username is tried in every enabled directory, in their order, and so is a name such as `other\jdoe` when no
directory is named `other`: it is then looked up as typed.

The first directory that knows the user decides: a wrong password there is the answer, and the next directory is not
tried, since it might hold someone else of that name. A directory that cannot be reached is skipped.

The directory named `default` up to 7.2.0 is named `main` from 7.3.0: the upgrade renames it, and a new installation starts
with `main`. Its members keep their short names, so the roles that name them need no change. The `main` directory cannot be
renamed, and a directory name holds only letters, digits, `-` and `_`.

---

## Testing the connection

**Test connection** asks for a test username and password, and tries a login with the settings on the screen, saved or not.
On success it shows the user's directory entry, which tells you the exact attribute names and group DNs to use.

A test user that does not exist still reports success: the connection and the bind account work, only the user is not
found. Typical errors:

| Message | Cause |
|---|---|
| `Bad server or port (connection failed)` | The host name does not resolve or the port is not reachable. |
| `Wrong binding credentials` | The bind DN or password of the directory's credential is wrong. |
| `Unable to verify the certificate` | The server certificate is not signed by the credential's CA bundle. |
| `Certificate is not valid` | The credential's Certificate or CA bundle does not hold a valid PEM certificate. |

---

## Active Directory example

This example connects to two domain controllers over LDAPS and keeps only the groups whose name starts with `AF-`:

| Setting | Value |
|---|---|
| Credential > Servers | `dc01.example.com`, then `dc02.example.com` |
| Credential > Port | `636` |
| Credential > Enable TLS | on |
| Credential > Ignore certs | off, with a client certificate and the CA chain of the enterprise CA |
| Credential > Bind user DN | `CN=svc-ansibleforms,OU=Service Accounts,DC=example,DC=com` |
| Search Base | `OU=Users,DC=example,DC=com` |
| Mail Attribute | `mail` |
| Username Attribute | `sAMAccountName` |
| Groups Attribute | `memberOf` |
| Group Filter | `^AF-` |

Members of `CN=AF-Operators,…` match roles with `ldap/AF-Operators`, and sign in as `jdoe` or `jdoe@example.com`.

---

## OpenLDAP example

This example uses a group search on `groupOfNames` entries, so it works without the `memberof` overlay:

| Setting | Value |
|---|---|
| Credential > Servers | `ldap.example.com` |
| Credential > Port | `636` |
| Credential > Enable TLS | on |
| Credential > Bind user DN | `cn=readonly,dc=example,dc=com` |
| Search Base | `ou=people,dc=example,dc=com` |
| Mail Attribute | `mail` |
| Username Attribute | `uid` |
| Groups Attribute | `groups` |
| Groups Search Base | `ou=groups,dc=example,dc=com` |
| Group Class | `groupOfNames` |
| Group Member Attribute | `member` |
| Group Member User Attribute | `dn` |

A user listed in `cn=af-admins,ou=groups,dc=example,dc=com` gets the group `ldap/af-admins`. For `posixGroup` groups,
use **Group Member Attribute** `memberUid` and **Group Member User Attribute** `uid`.

With the `memberof` overlay, leave the group search fields empty and set **Groups Attribute** to `memberOf`.

---

## Common pitfalls

Most LDAP problems come down to one of these:

- **A local user with the same name.** Local users are checked first, so the directory is never asked for that name.
- **No groups, or the wrong ones.** The Groups Attribute must exist (`groups` with a group search); `memberOf` skips nesting.
- **Group names that do not match.** Use `ldap/<CN>` in the same case, and check the Group Filter keeps the group.
- **Group DNs that do not start with a CN.** Only the first `CN=` value is used as the group name, so every group DN
  must start with `CN=` (or `cn=`).
- **Certificates.** TLS needs both certificate fields of the credential and a matching server name; Ignore certs is for testing only.
- **Settings that cannot be saved.** When a directory comes from the [config seed](../seed/managed-objects.html), its page
  is read-only: change the seed file instead.

A failed login shows a generic message. The reason is logged by the server and kept in the audit log, and for Active
Directory it is translated from the directory's code, e.g. `Wrong password`, `Account locked` or `Password expired`.
