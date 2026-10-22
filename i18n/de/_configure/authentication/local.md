---
layout: default
title: Lokale Konten
parent: Authentifizierung
nav_order: 1
translated_from: 002a371f2b4dbe5cc9c99ee569b8cf17a2a4ac88
---

# Lokale Konten
{: .no_toc }

Der integrierte Admin sowie die Benutzer und Gruppen in der AnsibleForms-Datenbank
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Der integrierte Admin

Jeder Start legt die lokale Gruppe `admins` und den Admin-Benutzer an, falls sie fehlen; drei Variablen steuern den Admin:

| Variable | Standard | Bedeutung |
|---|---|---|
| [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME) | `admin` | Benutzername des Admins, in der Gruppe `admins` angelegt, wenn kein Benutzer diesen Namen hat. |
| [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) | `AnsibleForms!123` | Passwort, das der Admin beim Anlegen (oder Zurücksetzen) erhält. |
| [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN) | `0` | `1` setzt das Passwort des Admins auf `ADMIN_PASSWORD` zurück und nimmt ihn wieder in `admins` auf. |

`ADMIN_PASSWORD` wird nur beim Anlegen oder Zurücksetzen des Benutzers verwendet: Eine spätere Änderung bewirkt für sich allein nichts.

Ein lokaler Benutzer, der sich mit dem öffentlich bekannten Standardpasswort `AnsibleForms!123` anmeldet, kann nur dieses ändern. Der Browser öffnet eine
Seite zum Ändern des Passworts, die sich nicht schließen lässt, und der Server beantwortet jede andere Anfrage mit `403` (Code
`password_change_required`), bis das Passwort geändert ist. Das neue Passwort muss sich vom Standard unterscheiden; nach der
Änderung meldet sich der Benutzer damit erneut an. Setzen Sie `ADMIN_PASSWORD` vor dem ersten Start auf einen eigenen Wert, um diesen Schritt zu überspringen.

Eine Änderung von `ADMIN_USERNAME` nach dem ersten Start legt einen zweiten Admin-Benutzer mit diesem Namen an; der alte bleibt erhalten.

{: .warning }
> `REINIT_ADMIN=1` setzt das Passwort bei **jedem** Start zurück, solange es gesetzt ist. Verwenden Sie es, um ein verlorenes Admin-Passwort wiederherzustellen,
> entfernen Sie es dann und starten Sie neu.

---

## Benutzer und Gruppen

Lokale Benutzer und Gruppen werden unter **Zugriff > Benutzer** und **Zugriff > Gruppen** verwaltet. Ein Benutzer hat diese Felder:

| Feld | Bedeutung |
|---|---|
| Benutzername | Der Anmeldename. Muss eindeutig sein. |
| Beschreibung | Optional. |
| Passwort | Als Hash gespeichert. Später mit der Aktion **Passwort ändern** änderbar. |
| E-Mail | Optional. |
| Gruppe | Die erste lokale Gruppe des Benutzers. Weitere fügen Sie im Tab **Gruppen** der Benutzerseite hinzu. |

Lokale Benutzer ändern ihr eigenes Passwort in ihrem Profil; andere Benutzer tun das in ihrem Verzeichnis oder Identitätsanbieter.

Ein Benutzer kann mehreren Gruppen angehören und erhält die Rollen aller dieser Gruppen. Der Tab **Gruppen** der Benutzerseite fügt
Gruppen hinzu und entfernt sie, ebenso der Tab **Benutzer** der Gruppenseite. Ein Benutzer behält mindestens eine Gruppe: Die letzte lässt sich nicht
entfernen.

Eine Gruppe, die noch Benutzer hat, kann nicht gelöscht werden: Entfernen Sie zuerst ihre Benutzer. Die Gruppe `admins` kann nie gelöscht oder
umbenannt werden, und der Benutzer `admin` kann nie gelöscht werden.

---

## Anmeldung erlauben

Der Tab **Details** der Benutzerseite hat einen Schalter **Anmeldung erlauben**, der auch als **Anmeldung sperren** und **Anmeldung
erlauben** im Menü der Zeile in der Benutzerliste angeboten wird. Er existiert gleichermaßen für lokale Benutzer und für LDAP- und SSO-Benutzer:

- **Ein**: Der Benutzer meldet sich wie gewohnt an.
- **Aus**: Die Sitzungen des Benutzers enden sofort und jede Anmeldung wird abgewiesen, bis ein Admin den Schalter wieder einschaltet. Die Seite
  fragt vorher nach einer Bestätigung.

Der Schalter lässt sich für den Benutzer `admin`, den Weg zurück ins System, nicht ausschalten, und ein Admin kann ihn auch nicht für sein eigenes Konto ausschalten. Die Seite
eines LDAP- oder SSO-Benutzers hat außerdem **Sitzungen beenden**, das den Benutzer überall abmeldet, ohne ihn zu sperren.

---

## Zuordnung zu Rollen

Rollen benennen lokale Gruppen als `local/<group>` und Benutzer als `local/<user>`; standardmäßig erhält `admins` die Rolle `admin`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
  - name: operator
    groups:
      - local/operators
    users:
      - local/svc-backup
```

Behalten Sie `local/admins` in der Rolle `admin`, damit sich der integrierte Admin immer anmelden kann, auch wenn das Verzeichnis oder der
Identitätsanbieter nicht verfügbar ist. Lässt sich config.yaml überhaupt nicht laden, erhalten Mitglieder von `local/admins` dennoch die
Rolle `admin`, sodass Sie sich anmelden und den Fehler beheben können. Siehe [Rollen](../config/roles.html) für die Rollenoptionen.

---

## Lokale Konten und LDAP

Eine Anmeldung mit Benutzername und Passwort prüft die lokalen Benutzer vor LDAP. Hat ein lokaler Benutzer denselben Namen wie ein Verzeichnis-Benutzer,
gewinnt immer das lokale Konto, und das Verzeichnispasswort funktioniert für diesen Namen nicht. Geben Sie lokalen Konten Namen,
die nicht mit Verzeichniskonten kollidieren können, zum Beispiel mit dem Präfix `svc-`.
