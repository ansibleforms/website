---
layout: default
title: Entra ID
parent: Authentication
nav_order: 3
---

# Entra ID
{: .no_toc }

Single sign-on with Microsoft Entra ID (Azure AD), with roles from the user's Entra ID groups
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## How it works

With an Entra ID provider enabled, the login page shows an Entra ID button below **Sign in**. A login then goes as follows:

1. The button sends the browser to `/api/v2/auth/entraid`, which redirects it to Microsoft.
2. The user signs in at Microsoft, which redirects back to the **Redirect URL** with an authorization code. The server
   exchanges that code with Microsoft for the ID token and an access token for Microsoft Graph.
3. The server reads the user's groups from Microsoft Graph (`/v1.0/me/transitiveMemberOf`), so nested groups count too.
4. The groups are filtered with the **Group filter** on their display name, and each group that is kept is stored twice,
   as `azuread/<object id>` and as `azuread/<display name>`.

The username is the `upn` claim of the token, e.g. `jdoe@example.com`, or the `preferred_username` claim when the token
has no `upn`; for a work account both hold the same value.

---

## Register the application

AnsibleForms needs an app registration in the Entra admin center, under **App registrations > New registration**:

1. Give it a name, choose **Accounts in this organizational directory only** as supported account types, and add a
   redirect URI of type **Web**: `https://af.example.com/api/v2/auth/entraid/callback`.
2. Under **Certificates & secrets**, create a client secret and copy its value; it is shown only once.
3. Under **API permissions**, add the Microsoft Graph **delegated** permissions `User.Read` and `GroupMember.Read.All`,
   and grant admin consent for them.
4. On the **Overview** page, note the **Application (client) ID** and the **Directory (tenant) ID**.

The redirect URI is the address at which users reach AnsibleForms, followed by `/api/v2/auth/entraid/callback`.
With [`BASE_URL`](../customization/server.html#env_BASE_URL) `/forms`, it becomes
`https://af.example.com/forms/api/v2/auth/entraid/callback`. It must match the **Redirect URI** of the provider's
credential exactly.

Up to 7.2.0 the path was `/api/v2/auth/azureadoauth2/callback`. It still works from 7.3.0, so an existing registration
needs no change; a credential with an empty **Redirect URI** uses the new path, so add it to the registration then.

AnsibleForms reads the groups from Graph and does not use a groups claim in the token, so no group claim needs
to be configured on the registration.

---

## Add the provider

Add the provider under **Access > SSO**: a wizard asks its fields in four steps, with **Microsoft Entra ID** on the **Type** step:

| Step | Field | Meaning |
|---|---|---|
| Details | Name, Description | A unique name for the provider, and an optional description |
| Type | Provider | **Microsoft Entra ID**; set when it is made, it stays |
| Credentials | Credential | A **Microsoft Entra ID** credential of [Connections > Credentials](../credentials.html), see below |
| Groups | Group filter | Regular expression; only the groups whose display name matches are kept. Empty keeps every group |

The credential holds the app registration, so only an admin can add or change it:

| Field | Meaning |
|---|---|
| Tenant ID | Required. The Directory (tenant) ID, a GUID, or one of the tenant's domains. Only users of that tenant can sign in |
| Client ID | The Application (client) ID |
| Client secret | The client secret value, stored encrypted or read from a [secret store](../secret-stores/) |
| Redirect URI | As registered, e.g. `https://af.example.com/api/v2/auth/entraid/callback`. Empty: the app's URL and the callback path |

A credential with an empty tenant ID is refused when it is saved. The multi-tenant endpoints `common`, `organizations`
and `consumers` are refused when the provider that names the credential is saved, because they would let users of any
Microsoft tenant sign in. At sign-in, the server also checks that the token comes from the configured tenant. A provider
saved earlier without a tenant ID signs nobody in: until the tenant ID is filled in, the server logs
`Could not enable Microsoft Entra ID: set the tenant id to your tenant ('' would let any Microsoft tenant log in)`.

Up to 7.2.0 the tenant, client ID, secret and redirect URL were fields of the provider. The upgrade to 7.3.0 moves them into a
credential named `<provider>-sso`, see [Addresses in credentials](../credentials/types.html#addresses-in-credentials).
Choose a credential for every new provider: the server still accepts a provider with its own client ID and secret from
before 7.3.0, which signs in with them until a credential is chosen.

One Entra ID provider is enabled at a time, the one the Entra ID button signs in with. **Enable** in the row menu of another one,
or its **Enabled** switch, turns the others of its type off; the **Enabled** column of the list shows which one is in use. A provider
can also skip the login page, see [Switching single sign-on](./#switching-single-sign-on). Saving applies it at once, without a restart.

---

## Mapping to roles

In config.yaml, an Entra ID group is `entraid/<object id>` or `entraid/<display name>`, and a user is `entraid/<upn>`.
The object id is unique in the tenant, so it is the safer choice; a display name is easier to read:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - entraid/0b6c8e1a-2f4d-4c7e-9a3b-5d1e7f2a4c6b
  - name: operator
    groups:
      - entraid/AF-Operators
    users:
      - entraid/jdoe@example.com
```

Up to 7.2.0 the prefix was `azuread/`. In a role it still matches the same members from 7.3.0 and is removed in 8.0; the
role editor writes `entraid/`. Only the roles accept `entraid/`: the user's groups are stored as `azuread/<object id>` and
`azuread/<display name>`, and the profile page and the `ansibleforms_user` extravar show them so. A **Group filter** such as `^AF-` keeps only the groups your roles use; see [Roles](../config/roles.html). From 7.1.0
the sign-in token no longer carries the groups, so its size no longer grows with them. The filter still matters for
users in many groups: fewer groups are matched against the roles at every sign-in, and the user's
[directory record](../users-and-groups/directory.html) lists only the groups that count. Before 7.1.0,
a user in a hundred groups or more needs it to see any forms, see
[Empty forms and jobs after a single sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).

---

## Microsoft Graph endpoint

The server signs users in at `https://login.microsoftonline.com` and calls Microsoft Graph at `https://graph.microsoft.com` by default:

| Variable | What it changes |
|---|---|
| [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) | The sign-in authority, for a national cloud such as `https://login.microsoftonline.us` |
| [`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) | The Graph endpoint the groups are read from, such as `https://graph.microsoft.us` |

Both take a base URI without a trailing slash, and are new in 7.3.0. `AZURE_AUTHORITY_URI` and `AZURE_GRAPH_URI` are still read
when they are not set, with a warning in the log, and are removed in 8.0. The server must reach Graph: a login fails when the groups cannot be read.

---

## Limitations

Entra ID users sign in with Microsoft, so a few things work differently from local and LDAP accounts:

- They have no password in AnsibleForms, so they cannot change it there; an [API token](../profile/api-token.html) is made from their session.
- Display names are not unique in Entra ID: two groups with the same name map to the same role. Name the group by its
  object id in the role, `entraid/<object id>`, to match only that group.
