---
layout: default
title: Konzepte
nav_order: 4
translated_from: d62ee1e491a725a384186e3909ae1f9cee654bde
---

# Konzepte
{: .no_toc }

Die in dieser Dokumentation verwendeten Begriffe, jeweils mit ihrer Seite verlinkt
{: .fs-6 .fw-300 }

---

## Glossar

Die in dieser Dokumentation verwendeten Begriffe:

| Begriff | Bedeutung |
|---|---|
| **[Formular](forms/)** | Eine YAML-Definition, die Eingaben sammelt und ein Playbook, eine Vorlage oder einen Workflow ausführt |
| **[Formularfeld](formfields/)** | Eine Eingabe eines Formulars, etwa `text`, `enum` oder `checkbox`; ihr Wert wird zu einer Extravar |
| **[Kategorie](config/categories.html)** | Eine Gruppe im Baum der Formulare auf der Seite Formulare, definiert in `config.yaml` |
| **[Rolle](config/roles.html)** | Eine Menge von Benutzern und Gruppen; ein Formular listet die Rollen auf, die es sehen und ausführen dürfen, `default` für alle |
| **[Ausdruck](expressions/)** | JavaScript, das einen Feldwert berechnet, im Browser (`runLocal: true`) oder auf dem Server |
| **[Extravars](formfields/)** | Die Variablen, die an das Playbook oder die Vorlage gesendet werden, aufgebaut aus den Feldwerten |
| **[Anmeldedaten](expressions/credentials.html)** | Ein gespeicherter Login, verschlüsselt mit `ENCRYPTION_SECRET`: ein Benutzer und ein Passwort (und Host, Port, Datenbank), oder seit 7.3.0 die Adresse und Secrets eines LDAP-Verzeichnisses, eines SSO-Anbieters, eines Runners oder eines HashiCorp Vault |
| **[Secret Store](secret-stores/)** | Eine Verbindung zu HashiCorp Vault oder CyberArk, die Benutzer und Passwort von Anmeldedaten liefert |
| **[Job](gui/forms-and-jobs.html)** | Ein Lauf eines Formulars, mit seinem Status, seinen Extravars und seiner Ausgabe, in der Job-Historie aufbewahrt |
| **[Runner](runners.html)** | Wo ein Job läuft, hinzugefügt unter **Verbindungen > Runner**: `rte` für Playbooks, `awx` (AWX oder die Variante `aap` oder `ascender`), `semaphore`, `rundeck` oder `jenkins` für Vorlagen und Jobs. Ein Formular wählt einen mit `runner:` oder läuft auf dem Standard-Runner `rte` (Playbooks) oder `awx` (Vorlagen) |
| **[RTE](rte/)** | Eine Laufzeitumgebung: der AnsibleForms-Server, mit `AF_ROLE=rte` in einem eigenen Container gestartet, neben python und ansible, der die Playbooks eines Runners vom Typ `rte` ausführt |
| **[Genehmigungspunkt](forms/approval.html)** | Eine Pause in einem Job, bis ein Benutzer mit einer Genehmigungsrolle ihn genehmigt oder ablehnt |
| **[Workflow](workflows/)** | Ein Graph aus Playbooks, Genehmigungen und anderen Workflows, verknüpft bei Erfolg, bei Fehler oder immer, in der Syntax von AWX |
| **[Multistep-Formular](forms/multistep.html)** | Seit 7 veraltet: ein Formular, das mehrere Playbooks oder Vorlagen nacheinander ausführt; ein Workflow ersetzt es |
| **[Benachrichtigungskanal](notification-channels.html)** | Ein Mailserver, ein Slack- oder Teams-Webhook, ein Telegram-Chat oder ein Webhook, an den Benachrichtigungen und Genehmigungsanfragen gehen |
| **[Designer](designer/)** | Der Browser-Editor für Formulare, Playbooks, Inventare und Workflows, den jeweils eine Person gleichzeitig verwendet |
| **[Subform](forms/subform.html)** | Eine wiederverwendbare Gruppe von Feldern, die die Zeilen eines Felds `list` oder das Objekt eines Felds `yaml` beschreibt |
| **[config.yaml](config/)** | Die Datei mit den Kategorien, den Rollen und den Konstanten; die Formulare liegen in eigenen Dateien |
| **[Konfigurations-Seed](seed/)** | Eine YAML-Datei (`CONFIG_SEED_PATH`), die die Admin-Objekte deklariert, etwa Runner und Anmeldedaten |
| **[Persistenter Ordner](customization/paths.html)** | Der Ordner mit den Dateien, die AnsibleForms über Neustarts und Aktualisierungen hinweg behalten muss |
