---
layout: default
title: OIDC
parent: Authentifizierung
nav_order: 4
translated_from: 5451df911884021544dea5ffbaa7228a7a4435ef
---

# OIDC
{: .no_toc }

Single Sign-on mit einem OpenID Connect-Anbieter wie Keycloak, mit Rollen aus einem Gruppen-Claim
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Funktionsweise

Ist ein OIDC-Anbieter aktiviert, zeigt die Anmeldeseite unter **Anmelden** eine OpenID-Schaltfläche. Eine Anmeldung läuft dann so ab:

1. Die Schaltfläche schickt den Browser zu `/api/v2/auth/oidc`, das ihn zum Anbieter weiterleitet (Authorization Code Flow
   mit PKCE).
2. Der Benutzer meldet sich beim Anbieter an, der zur **Umleitungs-URL** zurückleitet.
3. Der Server tauscht den Code gegen Token und liest die Claims des ID-Tokens.
4. Der Benutzername ist der Claim `preferred_username`, und jeder Wert des Claims `groups`, der den
   **Gruppenfilter** passiert, wird zu einer Gruppe `oidc/<value>`.

AnsibleForms fordert die Scopes `openid profile email` an; die Scopes sind nicht konfigurierbar. Das Abmelden von AnsibleForms
schickt den Browser außerdem zum End-Session-Endpunkt des Anbieters, sofern der Anbieter einen veröffentlicht.

{: .note }
> OIDC wurde mit Keycloak getestet. Andere Anbieter funktionieren, wenn sie die folgenden Anforderungen erfüllen.

---

## Anforderungen an den Anbieter

Der Anbieter muss OpenID Connect Discovery und einen vertraulichen Client für AnsibleForms anbieten:

- **Discovery**: AnsibleForms liest `<issuer>/.well-known/openid-configuration`, daher muss der Issuer vom
  AnsibleForms-Server aus über HTTPS erreichbar sein.
- **Ein vertraulicher Client** mit dem Authorization Code Flow, einer Client-ID und einem Client-Secret.
- **Der Redirect URI** `https://af.example.com/api/v2/auth/oidc/callback`, also die Adresse, unter der Benutzer
  AnsibleForms erreichen, gefolgt von `/api/v2/auth/oidc/callback`. Mit [`BASE_URL`](../customization/server.html#env_BASE_URL)
  `/forms` wird daraus `https://af.example.com/forms/api/v2/auth/oidc/callback`.
- **Ein Claim `groups` im ID-Token**, der eine Liste von Gruppennamen enthält. Ohne ihn erhält der Benutzer keine OIDC-Gruppen.
- **Ein Claim `preferred_username`**, der zum Benutzernamen wird.

---

## Beispiel für Keycloak

Dieses Beispiel verwendet ein Realm `example` auf `https://keycloak.example.com`; der Issuer ist dann
`https://keycloak.example.com/realms/example`. In diesem Realm:

1. Erstellen Sie unter **Clients** einen OpenID Connect-Client mit der Client-ID `ansibleforms`. Schalten Sie **Client authentication** ein,
   behalten Sie **Standard flow** bei und setzen Sie **Valid redirect URIs** auf `https://af.example.com/api/v2/auth/oidc/callback`.
2. Kopieren Sie im Tab **Credentials** des Clients das **Client secret**.
3. Öffnen Sie im Tab **Client scopes** `ansibleforms-dedicated` und fügen Sie einen Mapper **By configuration > Group Membership** hinzu,
   mit **Token Claim Name** `groups`, **Full group path** aus und **Add to ID token** ein.

Mit eingeschaltetem **Full group path** enthält der Claim Pfade wie `/af-admins`, und die Rolle muss dann `oidc//af-admins` verwenden.

---

## Den Anbieter hinzufügen

Fügen Sie den Anbieter unter **Zugriff > SSO** hinzu: Ein Assistent fragt seine Felder in vier Schritten ab, mit **Open ID** im Schritt **Typ**:

| Schritt | Feld | Bedeutung |
|---|---|---|
| Details | Name, Beschreibung | Ein eindeutiger Name für den Anbieter und eine optionale Beschreibung |
| Typ | Anbieter | **Open ID**; beim Anlegen festgelegt, bleibt er so |
| Anmeldedaten | Anmeldedaten-Eintrag | Ein **Open ID**-Eintrag aus [Verbindungen > Anmeldedaten](../credentials.html), siehe unten |
| Gruppen | Gruppenfilter | Regulärer Ausdruck; nur die passenden Werte des Claims `groups` bleiben erhalten. Leer behält jede Gruppe |

Die Anmeldedaten enthalten den Client, daher kann nur ein Admin sie hinzufügen oder ändern:

| Feld | Bedeutung |
|---|---|
| Issuer | Erforderlich. Die Issuer-URL, z. B. `https://keycloak.example.com/realms/example` |
| Client-ID | Die Client-ID beim Anbieter, z. B. `ansibleforms` |
| Client-Secret | Das Client-Secret, verschlüsselt gespeichert oder aus einem [Secret Store](../secret-stores/) gelesen |
| Umleitungs-URI | Wie registriert, z. B. `https://af.example.com/api/v2/auth/oidc/callback`. Leer: die URL der App und der Callback-Pfad |

Bis 7.2.0 waren Issuer, Client-ID, Secret und Umleitungs-URL Felder des Anbieters. Das Upgrade auf 7.3.0 verschiebt sie in
Anmeldedaten namens `<provider>-sso`, siehe [Adressen in Anmeldedaten](../credentials/types.html#addresses-in-credentials).
Wählen Sie für jeden neuen Anbieter Anmeldedaten: Der Server akzeptiert weiterhin einen Anbieter mit eigener Client-ID und eigenem Secret aus der Zeit
vor 7.3.0, der sich damit anmeldet, bis Anmeldedaten gewählt sind.

Es ist jeweils ein OIDC-Anbieter aktiviert, der, mit dem sich die OpenID-Schaltfläche anmeldet. **Aktivieren** im Menü der Zeile eines anderen
oder sein Schalter **Aktiviert** schaltet die anderen seines Typs aus; die Spalte **Aktiviert** der Liste zeigt, welcher verwendet wird.
Ein Anbieter kann auch die Anmeldeseite überspringen, siehe [Single Sign-on umschalten](./#switching-single-sign-on).

Das Speichern des Anbieters wendet ihn sofort an. Ist der Issuer nicht erreichbar, protokolliert der Server
`Failed to initialize OIDC strategy`, und OIDC-Anmeldungen schlagen fehl, bis der Anbieter erneut gespeichert oder der Server neu gestartet wird.

---

## Zuordnung zu Rollen

In config.yaml ist eine OIDC-Gruppe `oidc/<group>` und ein Benutzer `oidc/<preferred_username>`:

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

Die Werte werden exakt abgeglichen, einschließlich der Groß- und Kleinschreibung. Siehe [Rollen](../config/roles.html) für die Rollenoptionen.

---

## Einschränkungen

OIDC-Benutzer melden sich beim Anbieter an, daher funktionieren einige Dinge anders als bei lokalen und LDAP-Konten:

- Sie haben kein Passwort in AnsibleForms und können es dort daher nicht ändern; ab 7.2.0 wird ein [API-Token](../profile/api-token.html)
  aus ihrer Sitzung erstellt.
- Halten Sie den Claim `groups` kurz: Senden Sie nur die Gruppen, die für AnsibleForms wichtig sind, etwa mit einem eigenen
  Client-Scope oder einer Gruppenstruktur beim Anbieter, oder filtern Sie sie mit dem **Gruppenfilter**. Ab 7.1.0 enthält das Anmeldetoken
  von AnsibleForms die Gruppen nicht mehr; vorher konnte ein Benutzer in hundert oder mehr Gruppen keine Formulare sehen, siehe
  [Leere Formulare und Jobs nach einem Single Sign-on](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
