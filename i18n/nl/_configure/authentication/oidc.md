---
layout: default
title: OIDC
parent: Authenticatie
nav_order: 4
translated_from: 5451df911884021544dea5ffbaa7228a7a4435ef
---

# OIDC
{: .no_toc }

Single sign-on met een OpenID Connect-provider zoals Keycloak, met rollen uit een groepsclaim
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Hoe het werkt

Met een ingeschakelde OIDC-provider toont de aanmeldpagina een OpenID-knop onder **Aanmelden**. Een aanmelding verloopt dan als volgt:

1. De knop stuurt de browser naar `/api/v2/auth/oidc`, dat hem doorstuurt naar de provider (authorization code flow
   met PKCE).
2. De gebruiker meldt zich aan bij de provider, die terugstuurt naar de **Omleidings-URI**.
3. De server wisselt de code in voor tokens en leest de claims van het ID-token.
4. De gebruikersnaam is de claim `preferred_username`, en elke waarde van de claim `groups` die door het
   **Groepfilter** komt, wordt een groep `oidc/<value>`.

AnsibleForms vraagt de scopes `openid profile email` aan; de scopes zijn niet configureerbaar. Afmelden bij AnsibleForms
stuurt de browser ook naar het end-session-endpoint van de provider, als de provider er een publiceert.

{: .note }
> OIDC is getest met Keycloak. Andere providers werken als ze aan de onderstaande vereisten voldoen.

---

## Vereisten voor de provider

De provider moet OpenID Connect discovery bieden, en een vertrouwelijke client voor AnsibleForms:

- **Discovery**: AnsibleForms leest `<issuer>/.well-known/openid-configuration`, dus de issuer moet bereikbaar zijn vanaf
  de AnsibleForms-server, via HTTPS.
- **Een vertrouwelijke client** met de authorization code flow, een client ID en een client secret.
- **De omleidings-URI** `https://af.example.com/api/v2/auth/oidc/callback`, dat wil zeggen het adres waarop gebruikers
  AnsibleForms bereiken, gevolgd door `/api/v2/auth/oidc/callback`. Met [`BASE_URL`](../customization/server.html#env_BASE_URL)
  `/forms` wordt dat `https://af.example.com/forms/api/v2/auth/oidc/callback`.
- **Een claim `groups` in het ID-token**, met een lijst groepsnamen. Zonder die claim krijgt de gebruiker geen OIDC-groepen.
- **Een claim `preferred_username`**, die de gebruikersnaam wordt.

---

## Voorbeeld voor Keycloak

Dit voorbeeld gebruikt een realm `example` op `https://keycloak.example.com`; de issuer is dan
`https://keycloak.example.com/realms/example`. In die realm:

1. Maak onder **Clients** een OpenID Connect-client aan met client ID `ansibleforms`. Zet **Client authentication** aan,
   laat **Standard flow** aan, en stel **Valid redirect URIs** in op `https://af.example.com/api/v2/auth/oidc/callback`.
2. Kopieer op het tabblad **Credentials** van de client het **Client secret**.
3. Open op het tabblad **Client scopes** `ansibleforms-dedicated` en voeg een mapper **By configuration > Group Membership** toe,
   met **Token Claim Name** `groups`, **Full group path** uit en **Add to ID token** aan.

Met **Full group path** aan bevat de claim paden zoals `/af-admins`, en moet de rol dan `oidc//af-admins` gebruiken.

---

## De provider toevoegen

Voeg de provider toe onder **Toegang > SSO**: een wizard vraagt de velden in vier stappen, met **Open ID** in de stap **Type**:

| Stap | Veld | Betekenis |
|---|---|---|
| Details | Naam, Beschrijving | Een unieke naam voor de provider, en een optionele beschrijving |
| Type | Provider | **Open ID**; ingesteld bij het aanmaken, blijft zo |
| Referenties | Referentie | Een referentie van het type **Open ID** uit [Verbindingen > Inloggegevens](../credentials.html), zie hieronder |
| Groepen | Groepfilter | Reguliere expressie; alleen de waarden van de claim `groups` die overeenkomen blijven over. Leeg houdt elke groep |

De referentie bevat de client, dus alleen een admin kan haar toevoegen of wijzigen:

| Veld | Betekenis |
|---|---|
| Issuer | Verplicht. De issuer-URL, bijv. `https://keycloak.example.com/realms/example` |
| Client ID | De client ID bij de provider, bijv. `ansibleforms` |
| Client secret | Het client secret, versleuteld opgeslagen of gelezen uit een [secret store](../secret-stores/) |
| Omleidings-URI | Zoals geregistreerd, bijv. `https://af.example.com/api/v2/auth/oidc/callback`. Leeg: de URL van de app en het callbackpad |

Tot en met 7.2.0 waren de issuer, de client ID, het secret en de redirect URL velden van de provider. De upgrade naar 7.3.0 verplaatst ze naar een
referentie met de naam `<provider>-sso`, zie [Adressen in referenties](../credentials/types.html#addresses-in-credentials).
Kies voor elke nieuwe provider een referentie: de server accepteert nog steeds een provider met een eigen client ID en secret van
vóór 7.3.0, die zich daarmee aanmeldt totdat er een referentie is gekozen.

Er is steeds één OIDC-provider ingeschakeld, degene waarmee de OpenID-knop aanmeldt. **Inschakelen** in het rijmenu van een andere,
of zijn schakelaar **Ingeschakeld**, schakelt de andere van hetzelfde type uit; de kolom **Ingeschakeld** van de lijst toont welke in gebruik is.
Een provider kan ook de aanmeldpagina overslaan, zie [Single sign-on omschakelen](./#switching-single-sign-on).

Het opslaan van de provider past hem meteen toe. Als de issuer niet bereikbaar is, logt de server
`Failed to initialize OIDC strategy` en mislukken OIDC-aanmeldingen totdat de provider opnieuw wordt opgeslagen of de server herstart.

---

## Koppelen aan rollen

In config.yaml is een OIDC-groep `oidc/<group>` en een gebruiker `oidc/<preferred_username>`:

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

De waarden worden exact vergeleken, hoofdletters inbegrepen. Zie [Rollen](../config/roles.html) voor de rolinstellingen.

---

## Beperkingen

OIDC-gebruikers melden zich aan bij de provider, dus een paar dingen werken anders dan bij lokale en LDAP-accounts:

- Ze hebben geen wachtwoord in AnsibleForms, dus ze kunnen het daar niet wijzigen; vanaf 7.2.0 wordt een [API-token](../profile/api-token.html)
  gemaakt vanuit hun sessie.
- Houd de claim `groups` kort: stuur alleen de groepen die voor AnsibleForms van belang zijn, bijvoorbeeld met een eigen
  client scope of groepsstructuur bij de provider, of filter ze met het **Groepfilter**. Vanaf 7.1.0 draagt het aanmeldtoken
  van AnsibleForms de groepen niet meer; daarvoor kon een gebruiker in honderd groepen of meer geen formulieren zien, zie
  [Lege formulieren en jobs na een single sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
