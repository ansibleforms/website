---
layout: default
title: Anmeldedaten
nav_order: 6
has_children: true
has_toc: false
permalink: /credentials.html
translated_from: 0c8fddace3f97bb7d5a3a2642e3fccc296680454
---

# Anmeldedaten
{: .no_toc }

Speichern Sie die Anmeldungen, mit denen sich Formulare, Repositories, Secret Stores und Benachrichtigungskanäle verbinden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren: Hinterlegen Sie die Benutzer, Passwörter und Token, mit denen sich AnsibleForms verbindet, verschlüsselt gespeichert oder aus einem Secret Store gelesen.

---

## In diesem Abschnitt

| Seite | Inhalt |
|---|---|
| [Typen von Anmeldedaten](credentials/types.html) | Was jeder Typ enthält und wo er gewählt werden kann |
| [Die Seite Anmeldedaten](credentials/list.html) | Die Liste der Anmeldedaten und der Dialog, der einen Eintrag hinzufügt |
| [Die Seite eines Anmeldedaten-Eintrags](credentials/credential-page.html) | Die Tabs eines Eintrags und was ihn verwendet |

---

## Funktionsweise

Ein **Anmeldedaten-Eintrag** ist eine benannte Anmeldung, angelegt unter **Verbindungen > Anmeldedaten**. Formulare und die anderen Admin-Objekte verweisen
über seinen Namen darauf, sodass das Passwort selbst nie in einem Formular erscheint. Benutzer und Passwort werden entweder in der
AnsibleForms-Datenbank gespeichert, verschlüsselt mit `ENCRYPTION_SECRET`, oder bei jeder Verwendung der Anmeldedaten aus einem [Secret Store](secret-stores/)
gelesen.

Ab 7.5.0 fragen Formulare eine [Datenbank](databases.html) unter **Verbindungen > Datenbanken** ab, die die Anmeldedaten vom Typ **Datenbank** nennt,
mit denen sie sich verbindet; ein Formular, das die Anmeldedaten selbst in `dbConfig` nennt, funktioniert weiterhin wie bisher.

---

## Wer Anmeldedaten ändern darf

Ab 7.3.0 können Anmeldedaten, von denen eine Verbindung oder eine Anmeldung abhängt, nur von einem Admin hinzugefügt, geändert oder gelöscht werden:

| Anmeldedaten | Warum |
|---|---|
| Verbindungstypen: `rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck`, `jenkins`, `vault` und `cyberark` | Ein Runner oder ein Secret Store nimmt daraus seine Adresse und sein Geheimnis |
| Anmeldetypen: `oidc`, `entraid` und `ldap` | Ein SSO-Anbieter oder ein LDAP-Verzeichnis meldet Benutzer damit an |
| Alle Anmeldedaten, die ein Runner nennt | Der Runner meldet sich damit an, und eine Änderung am Runner selbst braucht ebenfalls einen Admin |

Andere Benutzer mit Zugriff auf die Anmeldedaten sehen diese schreibgeschützt. Ein Benutzer, der solche Anmeldedaten auf einen anderen
Server richten könnte, würde jedes darüber gesendete Geheimnis erhalten; deshalb folgt die Regel der für Runner. Drei weitere Regeln
halten diese Benutzer von Geheimnissen fern, die sie sonst nicht lesen könnten:

- **Geschützte Anmeldedaten nennen**: Nur ein Admin kann einen dieser Einträge an anderer Stelle nennen, etwa in einem Repository,
  einem Benachrichtigungskanal oder den Einstellungen des Chat-Assistenten. Anmeldedaten, die ihr Passwort aus einem Secret Store lesen, sind
  unabhängig von ihrem Typ auf dieselbe Weise geschützt.
- **Einen Secret Store wählen**: Nur ein Admin kann Anmeldedaten auf einen [Secret Store](secret-stores/) richten oder den
  Store oder die gelesene Referenz ändern; ein anderer Benutzer darf sie trotzdem unverändert zurücksenden oder alle leeren.
- **Anmeldedaten verschieben**: Ändert ein anderer Benutzer, wo sich Anmeldedaten anmelden (Host, Port, Issuer, Tenant oder
  Serveradresse), ohne das Passwort erneut einzugeben, wird das gespeicherte Passwort gelöscht, ebenso die gelesene
  Secret-Store-Referenz, damit das alte Geheimnis nie an das neue Ziel geht.

---

## Verwendete Anmeldedaten

Anmeldedaten, die noch von Datensätzen genannt werden, ab 7.5.0 auch von einer [Datenbank](databases.html), können weder gelöscht noch
umbenannt werden, da diese sonst ins Leere zeigen würden.
Die Ablehnung nennt, wie viele Datensätze sie verwenden; der Tab **Verwendet von** [ihrer Seite](credentials/credential-page.html) listet sie auf.
Richten Sie diese zuerst auf andere Anmeldedaten und löschen oder benennen Sie sie dann um.
