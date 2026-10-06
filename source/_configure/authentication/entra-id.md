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

1. The button sends the browser to `/api/v2/auth/azureadoauth2`, which redirects it to Microsoft.
2. The user signs in at Microsoft, which redirects back to the **Redirect URL** with an access token for Microsoft Graph.
3. The server reads the user's groups from Microsoft Graph (`/v1.0/me/transitiveMemberOf`), so nested groups count too.
4. The groups are filtered with the **Group Filter**, prefixed with `azuread/`, and mapped to roles.

The username is the `upn` claim of the token, e.g. `jdoe@example.com`. Groups are identified by their **display name**.

---

## Register the application

AnsibleForms needs an app registration in the Entra admin center, under **App registrations > New registration**:

1. Give it a name, choose the supported account types (usually this organizational directory only), and add a redirect
   URI of type **Web**: `https://af.example.com/api/v2/auth/azureadoauth2/callback`.
2. Under **Certificates & secrets**, create a client secret and copy its value; it is shown only once.
3. Under **API permissions**, add the Microsoft Graph **delegated** permissions `User.Read` and `GroupMember.Read.All`,
   and grant admin consent for them.
4. On the **Overview** page, note the **Application (client) ID** and the **Directory (tenant) ID**.

The redirect URI is the address at which users reach AnsibleForms, followed by `/api/v2/auth/azureadoauth2/callback`.
With [`BASE_URL`](../customization/server.html#env_BASE_URL) `/forms`, it becomes
`https://af.example.com/forms/api/v2/auth/azureadoauth2/callback`. It must match the **Redirect URL** in AnsibleForms
exactly.

AnsibleForms reads the group names from Graph and does not use a groups claim in the token, so no group claim needs
to be configured on the registration.

---

## Add the provider

Add the provider under **Access > OAuth2**, with **Provider** set to **Entra ID**:

| Field | Meaning |
|---|---|
| Enable | Shows the Entra ID button on the login page. Enabling it disables any other Entra ID provider. |
| Name | A unique name for the provider. |
| Description | Optional. |
| Tenant ID | The Directory (tenant) ID. Leave empty to use the `common` endpoint (multi-tenant registrations). |
| Client ID | The Application (client) ID. |
| Redirect URL | Filled in as `<Public Root Url>/api/v2/auth/azureadoauth2/callback`; must match the registration. |
| Client Secret | The client secret value, stored encrypted. |
| Group Filter | Regular expression; only the groups whose display name matches are kept. Empty keeps every group. |

The Redirect URL is pre-filled from the **Public Root Url** of the general settings; check it before saving.
Saving the provider applies it immediately, without a restart.

---

## Mapping to roles

In config.yaml, an Entra ID group is `azuread/<display name>` and a user is `azuread/<upn>`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - azuread/AF-Admins
  - name: operator
    groups:
      - azuread/AF-Operators
    users:
      - azuread/jdoe@example.com
```

Use a **Group Filter** such as `^AF-` when users are in many groups: only the groups that are kept travel with the user
into every token and job. See [Roles](../config/roles.html) for the role options.

---

## Microsoft Graph endpoint

The server calls Microsoft Graph at `https://graph.microsoft.com` by default. To use another Graph endpoint, set
[`AZURE_GRAPH_URI`](../customization/security.html#env_AZURE_GRAPH_URI) to its base URI, without a trailing slash.
The server must be able to reach that endpoint: a login fails when the groups cannot be read.

---

## Limitations

Entra ID users sign in with Microsoft, so a few things work differently from local and LDAP accounts:

- They have no password in AnsibleForms, so they cannot change it there or create API tokens on their profile page.
- Group names are display names, which are not unique in Entra ID: two groups with the same name map to the same role.
