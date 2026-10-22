---
layout: default
title: Authenticatie
nav_order: 3
has_children: true
has_toc: false
permalink: /authentication/
translated_from: 024cff3760cf611daeacea8aea7d72b85c0a6d17
---

# Authenticatie
{: .no_toc }

Kies hoe gebruikers zich aanmelden, en hoe hun account en groepen tot rollen leiden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Aanmeldmethoden

AnsibleForms ondersteunt vier aanmeldmethoden, en er kunnen er meerdere tegelijk actief zijn:

| Methode | Wanneer te gebruiken | Pagina |
|---|---|---|
| Lokale accounts | De ingebouwde admin, serviceaccounts, kleine teams, of als terugvaloptie wanneer de directory onbereikbaar is. | [Lokale accounts](local.html) |
| LDAP | Gebruikers en groepen staan in Active Directory, OpenLDAP of een andere LDAP-directory. | [LDAP](ldap.html) |
| Entra ID | Gebruikers melden zich aan met hun Microsoft 365 / Entra ID-account (single sign-on). | [Entra ID](entra-id.html) |
| OIDC | Single sign-on via een andere OpenID Connect-provider, zoals Keycloak. | [OIDC](oidc.html) |

Lokale accounts en LDAP worden ingesteld onder **Toegang > Gebruikers**, **Groepen** en **LDAP**; Entra ID en OIDC onder
**Toegang > SSO**.

---

## Hoe een aanmelding de methode kiest

De aanmeldpagina heeft een formulier voor gebruikersnaam en wachtwoord, plus één knop per ingeschakelde single sign-on-provider:

- **Gebruikersnaam en wachtwoord** worden eerst gecontroleerd tegen de lokale gebruikers. Alleen als geen enkele lokale gebruiker die naam heeft, en LDAP
  is ingeschakeld, wordt de directory geprobeerd. Een lokale gebruiker met een verkeerd wachtwoord wordt geweigerd zonder LDAP te raadplegen.
- **De knoppen voor Entra ID en OpenID** verschijnen onder **Aanmelden** wanneer zo'n provider is ingeschakeld. Ze sturen de browser naar
  de provider en weer terug; er bereikt geen wachtwoord AnsibleForms.

Er is steeds maar één Entra ID-provider en één OIDC-provider tegelijk ingeschakeld: als je er een inschakelt, worden de andere van hetzelfde type uitgeschakeld.
Een mislukte aanmelding met gebruikersnaam en wachtwoord toont altijd hetzelfde algemene bericht; de reden staat in het serverlog en het auditlogboek.

---

## Single sign-on omschakelen

Vanaf 7.3.0 heeft elke provider onder **Toegang > SSO** twee eigen schakelaars, die zonder herstart gelden:

| Schakelaar | Effect |
|---|---|
| **Ingeschakeld** | Toont de knop van de provider op de aanmeldpagina en accepteert zijn aanmelding. Inschakelen schakelt de andere providers van hetzelfde type uit. |
| **Aanmeldpagina overslaan** | Gebruikers gaan rechtstreeks naar deze provider, zonder de aanmeldpagina, zolang de provider is ingeschakeld. Inschakelen voor één provider schakelt het uit voor de andere; bij een uitgeschakelde provider is hij grijs. |

Het formulier voor gebruikersnaam en wachtwoord blijft bereikbaar op `/login?local`, voor de lokale admin of wanneer de provider faalt,
en het wordt getoond na het afmelden en wanneer een single sign-on-aanmelding met een fout terugkomt.

De variabelen `ENABLE_SSO` en `SSO_AUTO_LOGIN` zijn in 7.3.0 verwijderd. De eerste start van 7.3.0 leest ze eenmaal, en
logt bij elke start een waarschuwing zolang ze nog zijn ingesteld, dus verwijder ze na de upgrade uit de omgeving:

| Variabele vóór 7.3.0 | Wat de upgrade doet |
|---|---|
| `ENABLE_SSO=0` | Schakelt elke provider uit: de providers blijven geconfigureerd, zonder knop op de aanmeldpagina |
| `SSO_AUTO_LOGIN=1` | Schakelt **Aanmeldpagina overslaan** in voor de ingeschakelde provider, als er precies één is ingeschakeld en `ENABLE_SSO` niet `0` is |

---

## Van gebruiker naar rollen

Elke aanmelding levert een gebruiker op met een **type** (`local`, `ldap`, `azuread` of `oidc`), een gebruikersnaam en een lijst groepen.
Elke groep krijgt het voorvoegsel van zijn type, dus een Entra ID-groep wordt opgeslagen en getoond als `azuread/...`:

| Aanmeldmethode | Gebruikersnaam | Groepen |
|---|---|---|
| Lokaal | de lokale gebruikersnaam | `local/<group>`, één voor elke lokale groep van de gebruiker |
| LDAP, directory `main` | de waarde van het Username Attribute | `ldap/<cn>`, de CN van elke groep die de directory teruggeeft |
| LDAP, een andere directory | `<directory>/<username>` | `ldap/<directory>/<cn>`, zie [Meerdere directory's](ldap.html#several-directories) |
| Entra ID | de claim `upn`, of `preferred_username` als het token geen `upn` heeft | `azuread/<object id>` en `azuread/<display name>` van elke groep, gelezen uit Microsoft Graph |
| OIDC | de claim `preferred_username` | `oidc/<name>`, uit de claim `groups` van het ID-token |

De [rollen](../config/roles.html) in config.yaml matchen vervolgens met deze waarden: een rol is van toepassing wanneer een van zijn `groups` een
van de groepen van de gebruiker is, of wanneer zijn `users` `<type>/<username>` bevat. Elke gebruiker krijgt ook de rol `default`. Vanaf 7.3.0
noemt een rol een Entra ID-lid `entraid/<group>` of `entraid/<upn>`, wat overeenkomt met de opgeslagen waarde `azuread/`; `azuread/`
in een rol werkt nog steeds en wordt in 8.0 verwijderd. Het profiel en de extravars van de job blijven `azuread/` tonen.

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - ldap/AF-Admins
      - entraid/AF-Admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - ldap/jdoe
```

De **profiel**pagina van een gebruiker toont het aanmeldtype, de groepen en de rollen; dat is de snelste manier om een koppeling te controleren.
De rolinstelling `allowLogin` kan de aanmelding weigeren van gebruikers die met geen enkele rol overeenkomen: zet haar op `false` bij `default` en op
`true` bij de rollen die zich mogen aanmelden.
