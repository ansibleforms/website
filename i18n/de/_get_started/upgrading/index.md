---
layout: default
title: Aktualisieren
nav_order: 3
has_children: true
has_toc: false
permalink: /upgrading/
translated_from: 0312d064ef52498600338c2db720a4c928aed953
---

# Aktualisieren
{: .no_toc }

AnsibleForms auf eine neuere Version bringen
{: .fs-6 .fw-300 }

---

Für Administratoren einer laufenden Instanz: wechseln Sie auf eine neuere Version, mit der Methode, mit der Sie installiert haben.

---

## In diesem Abschnitt

Das Vorgehen beim Aktualisieren hängt davon ab, wie Sie AnsibleForms installiert haben. Jede Methode ist auf einer eigenen Seite beschrieben:

| Seite | Was sie behandelt |
|---|---|
| [Auf v7 aktualisieren](../upgrade-7.html) | Was Sie noch auf 6.5 ändern sollten, bevor Sie auf 7 wechseln |
| [Mit dem Installer](../installation/installer.html#upgrade) | `ansibleforms-installer upgrade`, für eine Installation, die der Installer angelegt hat: Backup, Release Notes und Zurücksetzen |
| [Docker](docker.html) | Das neue Image ziehen und den Container mit denselben Einstellungen neu erstellen |
| [Docker Compose](docker-compose.html) | Das neue Image ziehen und das docker-compose-Projekt neu starten |
| [Aus dem Quellcode](from-source.html) | Den neuen Code holen, neu bauen und die Anwendung neu starten |
| [Kubernetes](kubernetes.html) | Das Chart-Repository aktualisieren und `helm upgrade` mit Ihren Values ausführen |

{: .note }
> **Zuerst ein Backup** Erstellen Sie vor der Aktualisierung ein Backup (**Einstellungen → Backups**). Das Datenbankschema wird beim ersten
> Start der neuen Version aktualisiert, daher ist das Backup Ihr Rückkehrpunkt, falls etwas schiefgeht. Ab 7.3.0 erstellt der Worker auch
> selbst eines, bevor er von einer älteren Version aktualisiert, benannt nach der Version, sofern
> [`UPGRADE_BACKUP`](../customization/retention.html#env_UPGRADE_BACKUP) nicht `0` ist.

Welche Version Sie erhalten, hängt vom Image-Tag ab, das Sie betreiben: `latest` folgt der neuesten Hauptversion, während ein Tag wie `7`
bei dieser Hauptversion bleibt. Alle Tags sind unter [Image-Tags](../installation/#image-tags) aufgeführt.
