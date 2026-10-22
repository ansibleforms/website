---
layout: default
title: Authentifizierung
nav_order: 3
has_children: true
has_toc: false
permalink: /authentication/
translated_from: 024cff3760cf611daeacea8aea7d72b85c0a6d17
---

# Authentifizierung
{: .no_toc }

Wählen Sie, wie sich Benutzer anmelden und wie ihr Konto und ihre Gruppen zu Rollen führen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Anmeldemethoden

AnsibleForms unterstützt vier Anmeldemethoden, und mehrere können gleichzeitig aktiv sein:

| Methode | Wann verwenden | Seite |
|---|---|---|
| Lokale Konten | Der integrierte Admin, Dienstkonten, kleine Teams oder ein Rückfall, wenn das Verzeichnis nicht erreichbar ist. | [Lokale Konten](local.html) |
| LDAP | Benutzer und Gruppen liegen in Active Directory, OpenLDAP oder einem anderen LDAP-Verzeichnis. | [LDAP](ldap.html) |
| Entra ID | Benutzer melden sich mit ihrem Microsoft 365 / Entra ID-Konto an (Single Sign-on). | [Entra ID](entra-id.html) |
| OIDC | Single Sign-on über einen anderen OpenID Connect-Anbieter, etwa Keycloak. | [OIDC](oidc.html) |

Lokale Konten und LDAP werden unter **Zugriff > Benutzer**, **Gruppen** und **LDAP** konfiguriert; Entra ID und OIDC unter
**Zugriff > SSO**.

---

## Wie eine Anmeldung die Methode wählt

Die Anmeldeseite hat ein Formular für Benutzername und Passwort sowie eine Schaltfläche für jeden aktivierten Single-Sign-on-Anbieter:

- **Benutzername und Passwort** werden zuerst mit den lokalen Benutzern abgeglichen. Nur wenn kein lokaler Benutzer diesen Namen hat und LDAP
  aktiviert ist, wird das Verzeichnis gefragt. Ein lokaler Benutzer mit falschem Passwort wird abgewiesen, ohne LDAP zu fragen.
- **Die Schaltflächen Entra ID und OpenID** erscheinen unter **Anmelden**, wenn ein solcher Anbieter aktiviert ist. Sie schicken den Browser zum
  Anbieter und zurück; kein Passwort erreicht AnsibleForms.

Es ist jeweils nur ein Entra ID-Anbieter und ein OIDC-Anbieter aktiviert: Das Aktivieren eines Anbieters schaltet die anderen seines Typs aus.
Eine fehlgeschlagene Anmeldung mit Benutzername und Passwort zeigt immer dieselbe allgemeine Meldung; der Grund steht im Serverprotokoll und im Audit-Protokoll.

---

## Single Sign-on umschalten

Ab 7.3.0 hat jeder Anbieter unter **Zugriff > SSO** zwei eigene Schalter, die ohne Neustart gelten:

| Schalter | Wirkung |
|---|---|
| **Aktiviert** | Zeigt die Schaltfläche des Anbieters auf der Anmeldeseite und akzeptiert seine Anmeldung. Das Einschalten schaltet die anderen Anbieter seines Typs aus. |
| **Anmeldeseite überspringen** | Benutzer gehen direkt zu diesem Anbieter, ohne Anmeldeseite, solange der Anbieter aktiviert ist. Das Einschalten bei einem Anbieter schaltet es bei den anderen aus; bei einem ausgeschalteten Anbieter ist der Schalter ausgegraut. |

Das Formular für Benutzername und Passwort bleibt unter `/login?local` erreichbar, für den lokalen Admin oder wenn der Anbieter ausfällt,
und es wird nach dem Abmelden angezeigt sowie wenn eine Single-Sign-on-Anmeldung mit einem Fehler zurückkommt.

Die Variablen `ENABLE_SSO` und `SSO_AUTO_LOGIN` wurden in 7.3.0 entfernt. Der erste Start von 7.3.0 liest sie einmal und
protokolliert bei jedem Start eine Warnung, solange sie noch gesetzt sind; entfernen Sie sie daher nach dem Upgrade aus der Umgebung:

| Variable vor 7.3.0 | Was das Upgrade tut |
|---|---|
| `ENABLE_SSO=0` | Schaltet jeden Anbieter aus: Die Anbieter bleiben konfiguriert, ohne Schaltfläche auf der Anmeldeseite |
| `SSO_AUTO_LOGIN=1` | Schaltet **Anmeldeseite überspringen** für den aktivierten Anbieter ein, wenn genau einer aktiviert ist und `ENABLE_SSO` nicht `0` ist |

---

## Vom Benutzer zu den Rollen

Jede Anmeldung erzeugt einen Benutzer mit einem **Typ** (`local`, `ldap`, `azuread` oder `oidc`), einem Benutzernamen und einer Liste von Gruppen.
Jede Gruppe erhält das Präfix ihres Typs, daher wird eine Entra ID-Gruppe als `azuread/...` gespeichert und angezeigt:

| Anmeldemethode | Benutzername | Gruppen |
|---|---|---|
| Lokal | der lokale Benutzername | `local/<group>`, eine für jede lokale Gruppe des Benutzers |
| LDAP, Verzeichnis `main` | der Wert des Benutzername-Attributs | `ldap/<cn>`, der CN jeder Gruppe, die das Verzeichnis zurückgibt |
| LDAP, ein anderes Verzeichnis | `<directory>/<username>` | `ldap/<directory>/<cn>`, siehe [Mehrere Verzeichnisse](ldap.html#several-directories) |
| Entra ID | der Claim `upn` oder `preferred_username`, wenn das Token kein `upn` hat | `azuread/<object id>` und `azuread/<display name>` jeder Gruppe, aus Microsoft Graph gelesen |
| OIDC | der Claim `preferred_username` | `oidc/<name>`, aus dem Claim `groups` des ID-Tokens |

Die [Rollen](../config/roles.html) in config.yaml gleichen dann diese Werte ab: Eine Rolle gilt, wenn eine ihrer `groups` eine
der Gruppen des Benutzers ist oder wenn ihre `users` `<type>/<username>` enthalten. Jeder Benutzer erhält außerdem die Rolle `default`. Ab 7.3.0
benennt eine Rolle ein Entra ID-Mitglied als `entraid/<group>` oder `entraid/<upn>`, was dem gespeicherten Wert `azuread/` entspricht; `azuread/`
in einer Rolle funktioniert weiterhin und wird in 8.0 entfernt. Das Profil und die Extravars des Jobs zeigen weiterhin `azuread/`.

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

Die **Profil**-Seite eines Benutzers listet den Anmeldetyp, die Gruppen und die Rollen auf; so lässt sich eine Zuordnung am schnellsten prüfen.
Die Rollenoption `allowLogin` kann die Anmeldung von Benutzern verweigern, die zu keiner Rolle passen: Setzen Sie sie bei `default` auf `false` und bei
den Rollen, die sich anmelden dürfen, auf `true`.
