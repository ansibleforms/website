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
4. The username is the `preferred_username` claim, and every value of the `groups` claim becomes a group `oidc/<value>`.

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

Add the provider under **Access > OAuth2**, with **Provider** set to **Open ID**:

| Field | Meaning |
|---|---|
| Enable | Shows the OpenID button on the login page. Enabling it disables any other OIDC provider. |
| Name | A unique name for the provider. |
| Description | Optional. |
| Client ID | The client ID at the provider, e.g. `ansibleforms`. |
| Issuer | The issuer URL, e.g. `https://keycloak.example.com/realms/example`. |
| Redirect URL | Filled in as `<Public Root Url>/api/v2/auth/oidc/callback`; must match the provider's redirect URI. |
| Client Secret | The client secret, stored encrypted. |

The Redirect URL is pre-filled from the **Public Root Url** of the general settings; check it before saving.
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

- They have no password in AnsibleForms, so they cannot change it there or create API tokens on their profile page.
- Keep the `groups` claim short: send only the groups that matter to AnsibleForms, for example with a dedicated
  client scope or group structure at the provider.
