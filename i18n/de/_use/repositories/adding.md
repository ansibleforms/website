---
layout: default
title: Ein Repository hinzufügen
parent: Git-Repositories
nav_order: 1
translated_from: 910365ea3ea4dec644e621ff8570917205671a76
---

# Ein Repository hinzufügen
{: .no_toc }

Die Seite Repositories, jedes Feld eines Repositorys, und eines im Config-Seed deklarieren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die Seite Repositories

Repositories werden unter **Einstellungen > Verbindungen > Repositories** verwaltet, was die [Rollenoption](../config/roles.html#role-options) `showSettings` oder, ab 7.3.0,
`showConnectionsSettings` braucht. Manche Änderungen sind einem Admin vorbehalten, siehe [unten](#who-may-change-a-repository).

![Repositories](../assets/screenshots/git.jpg)

Die Liste zeigt **Name**, **Beschreibung**, **Branch**, **Head** (der kurze Hash des ausgecheckten Commits), **Pull** und
**Push**. Der Tab **Details** eines Repositorys zeigt dieselben Pull- und Push-Badges über seinem Head:

| Spalte | Was sie sagt |
|---|---|
| **Pull** | Der letzte Clone, Pull oder Reset: **Läuft**, während git arbeitet, dann **Erfolgreich** oder **Fehlgeschlagen**; ein Strich vor dem ersten |
| **Push** | **Fehlgeschlagen**, wenn der letzte Push fehlgeschlagen ist; **Ausstehende Änderungen**, wenn hier vom Designer gespeicherte Änderungen noch nicht zum Remote gepusht sind; **Erfolgreich**, wenn nichts wartet; ein Strich vor dem ersten Push |

**Erfolgreich** in der Spalte Push bedeutet nur, dass nichts auf einen Push wartet: Das Remote kann trotzdem neuere Commits enthalten, die ein
Pull holt. Das Menü jeder Zeile enthält folgende Aktionen:

| Aktion | Was sie macht |
|---|---|
| **Bearbeiten** | Die Felder unten ändern |
| **Pull** | Das Repository klonen oder pullen, wenn die Arbeitskopie schon existiert |
| **Push** | Die Arbeitskopie committen und pushen; nur bei Repositories, die für Formulare, Konfiguration, Playbooks, Workflows oder Inventare verwendet werden, und nur aktiv, solange es noch nicht gepushte Änderungen gibt |
| **Zurücksetzen** | Die Arbeitskopie löschen und neu klonen, wodurch lokale Änderungen verworfen werden |
| **Anmeldeinformationen ändern** | Den Tab **Anmeldedaten** des Repositorys öffnen, um die Anmeldedaten zu wählen, die git verwendet |
| **Ausgabe des letzten Pulls anzeigen** | Die Ausgabe von git beim letzten Clone, Pull oder Reset anzeigen, mit maskiertem Passwort |
| **Ausgabe des letzten Pushs anzeigen** | Die Ausgabe von git beim letzten Push anzeigen, mit maskiertem Passwort |
| **Löschen** | Den Eintrag und seine Arbeitskopie unter `REPO_PATH` entfernen; nur für Admins |

**Alle pullen** über der Liste pullt alle Repositories auf einmal.

Auf einem Repository läuft immer nur eine git-Operation gleichzeitig. Eine zweite wird mit
`Repository '<name>' not found or already running, try again later` abgelehnt.

---

## Ein Repository hinzufügen

Klicken Sie auf **Repository hinzufügen**: Ein Wizard fragt die Felder in vier Schritten ab (**Repository**, **Anmeldedaten**, **Verwendung**, **Pull-Zeitplan**),
und AnsibleForms startet den Clone im Hintergrund, sobald Sie speichern.

![Repository bearbeiten](../assets/screenshots/git-edit.jpg)

| Feld | Erforderlich | Bedeutung |
|---|---|---|
| **Name** | ja | Der Ordnername unter `REPO_PATH`; Buchstaben, Ziffern, Bindestrich, Unterstrich und Punkt |
| **Branch** | ja | Der Branch, der geklont, gepullt und gepusht wird, zum Beispiel `main`; ab 7.3.0 erforderlich. Nur ein Repository aus dem Config-Seed darf ihn weglassen, um den Standard-Branch des Remotes zu klonen |
| **Anmeldedaten** | nein | Anmeldedaten aus [Verbindungen > Anmeldedaten](../credentials.html) mit dem Benutzer und dem Passwort oder Token, die git verwendet; **Anmeldedaten hinzufügen** erstellt welche |
| **URI** | ja | Das Remote, `https://...` oder SSH (`git@git.example.com:team/forms.git`, `ssh://...`) |
| **Geplanten Pull aktivieren** | nein | Das Repository nach Zeitplan pullen |
| **Pull-Zeitplan** | nein | Wann gepullt wird, als Cron-Ausdruck; erscheint, sobald der geplante Pull aktiviert ist |
| **Beschreibung** | ja | Eine frei wählbare Beschreibung |
| **Für Konfiguration verwenden?** ... **Für Inventare verwenden?** | nein | Was das Repository enthält, siehe [oben](./#what-a-repository-is-for) |
| **Beim Start der App pullen** | nein | Das Repository bei jedem Start von AnsibleForms klonen oder pullen |

Das Umbenennen eines Repositorys verschiebt seine Arbeitskopie in den neuen Ordner und seinen Pull-Zeitplan mit. Ein Repository aus der Zeit
vor 7, das noch einen eigenen Benutzer hat, sagt das auf seinem Tab **Anmeldedaten**: Wählen Sie Anmeldedaten, um ihn zu ersetzen.

---

## Wer ein Repository ändern darf

Der Inhalt eines Repositorys wird zu dem, was AnsibleForms lädt und ausführt, daher kann ab 7.3.0 ein Benutzer ohne die Rolle `admin` nicht mehr:

- ein Repository hinzufügen oder löschen;
- seine **URI** oder seinen **Branch** ändern;
- eines seiner **Verwenden**-Flags ein- oder ausschalten.

Er kann weiterhin Beschreibung, Pull-Zeitplan und Anmeldedaten ändern sowie es pullen, pushen oder zurücksetzen. Anmeldedaten, die ein Runner,
eine Verbindung oder eine Anmeldemethode verwendet, kann er nicht auswählen; die Ablehnung nennt sie und sagt nichts darüber, was sie enthalten.

---

## Repositories im Config-Seed deklarieren

Repositories lassen sich auch im [Config-Seed](../seed/) deklarieren, sodass eine neue Instanz sie bei ihrem ersten Start klont.

```yaml
repositories:
  items:
    - name: forms
      description: Forms and configuration
      uri: https://git.example.com/team/forms.git
      branch: main
      credential: git-bot
      use_for_forms: true
      use_for_config: true
      rebase_on_start: true
      cron: "*/15 * * * *"
```

Die Felder sind die der Seite, einschließlich `credential` (Anmeldedaten aus dem Seed oder der App), `rebase_on_start` (**Beim Start der App
pullen**) und `cron` (der Pull-Zeitplan); `user` und `password` werden statt Anmeldedaten weiterhin akzeptiert. Ein
per Seed angelegtes Repository ist in der Oberfläche schreibgeschützt und wird beim Start neu geklont, wenn seine Arbeitskopie fehlt; siehe
[Verwaltete Objekte](../seed/managed-objects.html).
