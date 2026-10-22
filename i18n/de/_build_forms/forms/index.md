---
layout: default
title: Formulare
nav_order: 3
has_children: true
has_toc: false
permalink: /forms/
translated_from: 8cf41438dcd6f75b145856a890b8bbbcd674c9fc
---

# Formulare
{: .no_toc }

Die Formulare definieren, die Ihre Benutzer ausfüllen
{: .fs-6 .fw-300 }

---

Für Formularautoren: wie Formulare in YAML geschrieben werden, woher sie geladen werden und welche Eigenschaften jeder Formulartyp hat.

Formulare sind der Kern von AnsibleForms. Jedes Formular ist eine Weboberfläche, die Benutzereingaben sammelt und mit diesen Daten ein
Ansible-Playbook, eine Vorlage von AWX, AAP oder Ascender, eine Semaphore-Vorlage, einen Rundeck- oder Jenkins-Job oder einen
[Workflow](../workflows/) ausführt.

Formulare werden in YAML-Dateien im Formularordner definiert. Jede YAML-Datei enthält entweder ein einzelnes Formular oder eine Liste von Formularen, und Unterordner können zur Organisation verwendet werden.

**VIDEO**: [Ihr erstes Formular erstellen](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

---

## Aufbau eines Formulars

Jedes Formular in AnsibleForms wird mit einer Reihe von Eigenschaften konfiguriert. **[Gemeinsame Eigenschaften](common.html)** listet die Eigenschaften auf, die für alle Formulartypen gelten; die typspezifischen Seiten beschreiben die zusätzlichen.

---

## Wie Formulare geladen werden

AnsibleForms lädt Formulare von folgenden Orten:

1. **AUS REPOSITORIES** : alle Repositories, bei denen der Schalter „Für Formulare verwenden“ aktiviert ist (mehrere Repositories werden unterstützt)
   - Formulare aus allen aktivierten Repositories werden automatisch zusammengeführt.
   - In jedem Repository wird zuerst nach einem Unterordner `forms/` gesucht.
   - Gibt es keinen Unterordner `forms/`, wird das Stammverzeichnis des Repositorys verwendet.
   - Formulare, die im Designer erstellt und noch nicht gepusht wurden, liegen in einem Staging-Ordner
     ([`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH)) und werden mit ihnen geladen.

2. **AUS DEM LOKALEN ORDNER** : der lokale Ordner `forms/`
   ([`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH)), wenn bei keinem Repository „Für Formulare verwenden“ aktiviert ist

{: .warning }
> **Hinweis:** Ist „Für Formulare verwenden“ bei mehreren Repositories aktiviert, werden alle ihre Formulare zusammengeführt. Formularnamen müssen über alle Repositories hinweg eindeutig sein, um Konflikte zu vermeiden.

---

## Wo ein Formular läuft

Der Typ eines Formulars bestimmt die Art von [Runner](../runners.html), auf dem sein Job läuft: ein RTE für `ansible`, ein AWX-Runner für `awx`,
`aap` und `ascender` und ein Runner des eigenen Typs für `semaphore`, `rundeck` und `jenkins`.

- `runner: <name>` am Formular wählt einen Runner dieses Typs nach Namen; ohne diese Angabe läuft der Job auf dem Standard-Runner des Typs.
- Ein unter **Verbindungen > Runner** deaktivierter Runner lässt den Job fehlschlagen, egal ob das Formular ihn nennt oder er der Standard ist. Der Job
  weicht nie auf einen anderen Runner aus.
- Wenn eine der Rollen des Benutzers in `config.yaml` die Liste `runners` enthält, darf der Job nur auf einem Runner laufen, den eine solche Rolle aufführt, sonst wird er
  abgelehnt. Rollen ohne diese Liste begrenzen nichts, und ein Admin wird nie begrenzt.

---

## In diesem Abschnitt

Die folgenden Seiten beschreiben die Formulareigenschaften im Detail:

| Seite | Inhalt |
|---|---|
| [Gemeinsame Eigenschaften](common.html) | Eigenschaften, die für alle Formulartypen gelten (`name`, `description`, `help`, `type`, `fields`) |
| [Ansible-Formulare](ansible.html) | Eigenschaften speziell für `type: ansible` |
| [AWX-Formulare](awx.html) | Eigenschaften speziell für `type: awx` |
| [Semaphore-Formulare](semaphore.html) | Eigenschaften speziell für `type: semaphore`, das eine Semaphore-Vorlage ausführt |
| [Rundeck-Formulare](rundeck.html) | Eigenschaften speziell für `type: rundeck`, das einen Rundeck-Job ausführt |
| [Jenkins-Formulare](jenkins.html) | Eigenschaften speziell für `type: jenkins`, das einen Jenkins-Job baut |
| [Mehrstufige Formulare](multistep.html) | Eigenschaften speziell für `type: multistep`, veraltet zugunsten von `workflow` |
| [Workflow-Formulare](workflow.html) | Eigenschaften speziell für `type: workflow`, das einen [Workflow](../workflows/) ausführt |
| [Wizard](wizard.html) | Die Eingaben eines Formulars auf mehrere Seiten verteilen (funktioniert mit jedem ausführbaren Formulartyp) |
| [Unterformular](subform.html) | Unterformulare verwenden nur die gemeinsamen Eigenschaften |
| [Genehmigungspunkte](approval.html) | Einen Job anhalten, bis er genehmigt wird (`approval`) |
| [Benachrichtigungen](notifications.html) | E-Mails und Kanalnachrichten bei Jobstatus oder Ereignissen senden (`notifications`) |
| [Aktionen bei Jobstatus](job-status-action.html) | Auf dem Formular reagieren, wenn ein Job seinen Status ändert (`onSubmit`, `onSuccess`, ...) |
