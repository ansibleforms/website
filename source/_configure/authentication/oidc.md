---
layout: default
title: OIDC
parent: Authentication
nav_order: 4
---

# OIDC
{: .no_toc }

Single sign-on with an OpenID Connect provider such as Keycloak, with roles from a groups claim
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## How it works

With an OIDC provider enabled, the login page shows an OpenID button below **Sign in**. A login then goes as follows:

1. The button sends the browser to `/api/v2/auth/oidc`, which redirects it to the provider (authorization code flow
   with PKCE).
2. The user signs in at the provider, which redirects back to the **Redirect URL**.
3. The server exchanges the code for tokens and reads the claims of the ID token.
4. The username is the `preferred_username` claim, and every value of the `groups` claim that passes the
   **Group Filter** becomes a group `oidc/<value>`.

AnsibleForms requests the scopes `openid profile email`; the scopes are not configurable. Signing out of AnsibleForms
also sends the browser to the provider's end-session endpoint, when the provider publishes one.

{: .note }
> OIDC has been tested with Keycloak. Other providers work when they meet the requirements below.

---

## Provider requirements

The provider must offer OpenID Connect discovery, and a confidential client for AnsibleForms:

- **Discovery**: AnsibleForms reads `<issuer>/.well-known/openid-configuration`, so the issuer must be reachable from
  the AnsibleForms server, over HTTPS.
- **A confidential client** with the authorization code flow, a client ID and a client secret.
- **The redirect URI** `https://af.example.com/api/v2/auth/oidc/callback`, i.e. the address at which users reach
  AnsibleForms followed by `/api/v2/auth/oidc/callback`. With [`BASE_URL`](../customization/server.html#env_BASE_URL)
  `/forms`, it becomes `https://af.example.com/forms/api/v2/auth/oidc/callback`.
- **A `groups` claim in the ID token**, holding a list of group names. Without it, the user gets no OIDC groups.
- **A `preferred_username` claim**, which becomes the username.

---

## Keycloak example

This example uses a realm `example` on `https://keycloak.example.com`; the issuer is then
`https://keycloak.example.com/realms/example`. In that realm:

1. Under **Clients**, create an OpenID Connect client with client ID `ansibleforms`. Turn on **Client authentication**,
   keep **Standard flow**, and set **Valid redirect URIs** to `https://af.example.com/api/v2/auth/oidc/callback`.
2. On the **Credentials** tab of the client, copy the **Client secret**.
3. On the **Client scopes** tab, open `ansibleforms-dedicated` and add a mapper **By configuration > Group Membership**,
   with **Token Claim Name** `groups`, **Full group path** off and **Add to ID token** on.

With **Full group path** on, the claim holds paths such as `/af-admins`, and the role must then use `oidc//af-admins`.

---

## Add the provider

Add the provider under **Access > SSO**: a wizard asks its fields in four steps, with **Open ID** on the **Type** step:

| Step | Field | Meaning |
|---|---|---|
| Details | Name, Description | A unique name for the provider, and an optional description |
| Type | Provider | **Open ID**; set when it is made, it stays |
| Credentials | Credential | An **Open ID** credential of [Connections > Credentials](../credentials.html), see below |
| Groups | Group filter | Regular expression; only the values of the `groups` claim that match are kept. Empty keeps every group |

The credential holds the client, so only an admin can add or change it:

| Field | Meaning |
|---|---|
| Issuer | Required. The issuer URL, e.g. `https://keycloak.example.com/realms/example` |
| Client ID | The client ID at the provider, e.g. `ansibleforms` |
| Client secret | The client secret, stored encrypted or read from a [secret store](../secret-stores/) |
| Redirect URI | As registered, e.g. `https://af.example.com/api/v2/auth/oidc/callback`. Empty: the app's URL and the callback path |

Up to 7.2.0 the issuer, client ID, secret and redirect URL were fields of the provider. The upgrade to 7.3.0 moves them into a
credential named `<provider>-sso`, see [Addresses in credentials](../credentials/types.html#addresses-in-credentials).
Choose a credential for every new provider: the server still accepts a provider with its own client ID and secret from
before 7.3.0, which signs in with them until a credential is chosen.

One OIDC provider is enabled at a time, the one the OpenID button signs in with. **Enable** in the row menu of another one,
or its **Enabled** switch, turns the others of its type off; the **Enabled** column of the list shows which one is in use.
A provider can also skip the login page, see [Switching single sign-on](./#switching-single-sign-on).

Saving the provider applies it immediately. When the issuer cannot be reached, the server logs
`Failed to initialize OIDC strategy` and OIDC logins fail until the provider is saved again or the server restarts.

---

## Mapping to roles

In config.yaml, an OIDC group is `oidc/<group>` and a user is `oidc/<preferred_username>`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - oidc/af-admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - oidc/jdoe
```

The values are matched exactly, case included. See [Roles](../config/roles.html) for the role options.

---

## Limitations

OIDC users sign in at the provider, so a few things work differently from local and LDAP accounts:

- They have no password in AnsibleForms, so they cannot change it there; from 7.2.0 an [API token](../profile/api-token.html)
  is made from their session.
- Keep the `groups` claim short: send only the groups that matter to AnsibleForms, for example with a dedicated
  client scope or group structure at the provider, or filter them with the **Group Filter**. From 7.1.0 the sign-in
  token of AnsibleForms no longer carries the groups; before, a user in a hundred groups or more could see no forms, see
  [Empty forms and jobs after a single sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
