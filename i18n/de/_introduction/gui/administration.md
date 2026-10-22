---
layout: default
title: Administration
parent: Rundgang durch die Oberfläche
nav_order: 3
redirect_from:
  - /gui/settings.html
  - /gui/ldap-configuration.html
  - /gui/credential-manager.html
  - /gui/backups.html
  - /gui/restore.html
  - /gui/server-log.html
  - /gui/swagger-interface.html
translated_from: 65b6b65919b22de7d7973732ebd29647e20f3184
---

# Administration
{: .no_toc }

Das Menü Einstellungen: das System, sein Erscheinungsbild, Zugriff, Verbindungen und Protokolle
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Das Menü Einstellungen

**Einstellungen** in der Kopfzeile öffnet die Administrationsseiten, im linken Menü gruppiert unter **System**, **Erscheinungsbild**,
**Zugriff**, **Verbindungen** und **Protokolle**. Jeder Eintrag erscheint nur für einen Benutzer mit der Rollenoption, die seine Seite braucht:
`allowBackupOps` für **Backups**, `showLogs` für **Serverprotokoll** und `showSettings` für jede andere Seite.
Ab 7.3.0 öffnen drei Optionen einen Teil davon ohne den Rest:

| Rollenoption | Öffnet |
|---|---|
| `showAppearanceSettings` | Die Seiten unter **Erscheinungsbild** |
| `showConnectionsSettings` | Die Seiten unter **Verbindungen**, außer **Syslog**; Repositories, Secret Stores und geschützte Anmeldedaten zu ändern bleibt Sache eines Admins |
| `showAuditLog` | Das **Audit-Protokoll** |

Siehe [Rollen](../config/roles.html#role-options) für die Rollenoptionen.

---

## Listen und Datensatzseiten

Ab 7.3.0 teilen sich die Einstellungslisten und Datensatzseiten ein Layout, mit ihren Bedienelementen in einer eigenen Zeile unter dem Titel:

| Teil | Wie es funktioniert |
|---|---|
| Suchfeld | Auf jeder Einstellungs- und Datensatzseite das Erste in dieser Zeile. Ein Wort grenzt alle Reiter auf einmal ein: die passenden Felder, Zeilen oder Einträge erscheinen unter dem Namen ihres Reiters |
| Seitengröße | Eine Tabelle zeigt so viele Zeilen, wie auf den Bildschirm passen, bis eine Seitengröße gewählt wird: 10, 20, 50 oder 100 |
| Spalten | Jede benannte Spalte sortiert, und eine leere Zelle zeigt `–` |
| Kontrollkästchen | Zeilen haben sie nur dort, wo sich mit den angehakten Zeilen etwas tun lässt, und das Zeilenmenü (⋮) bietet dieselbe Aktion an |
| Zeilenmenü | Kurze Beschriftungen, etwa **Bearbeiten** und **Löschen**. Eine Liste mit einer Spalte **Aktiviert** hat sie an erster Stelle und bietet in jedem Zeilenmenü **Aktivieren** oder **Deaktivieren** an, je nachdem, was zutrifft |

Die Listen mit einer Spalte **Aktiviert** sind die SSO-Anbieter, die LDAP-Verzeichnisse, die Runner, die Zeitpläne, die Benachrichtigungskanäle,
die Syslog-Server, die Ankündigungen, die Labels und die Versionen des Haftungsausschlusses.

---

## System

Die Instanz selbst: ihre Einstellungen, ihr Zustand und ihre Backups.

| Seite | Wofür sie da ist |
|---|---|
| **Allgemein** | Die Umgebungsvariablen, in Reitern von Konfiguration bis Protokollierung. Siehe [Umgebungsvariablen](../customization/). |
| **Status** | Der Zustand der Instanz und der Systeme, von denen sie abhängt, in den Reitern Prüfungen und Informationen. Siehe [Monitoring](../production/monitoring.html). |
| **Backups** | Backups der Datenbank, der config.yaml und der Formulare erstellen, wiederherstellen und löschen. Siehe [Backups](../production/backups.html). |

![Einstellungen > Allgemein, der Reiter Konfiguration](../assets/screenshots/settings.jpg)

### Backups

Die Liste der Backups, nächtliche und manuelle: **Backup hinzufügen** erstellt sofort eines, und das Menü einer Zeile hat **Backup anzeigen**, **Wiederherstellen** und **Löschen**.

![Einstellungen > Backups](../assets/screenshots/backups.jpg)

### Wiederherstellen

**Wiederherstellen** zeigt, was das Backup enthält, und stellt es dann wieder her; **Vor dem Wiederherstellen ein neues Backup erstellen (empfohlen)** ist standardmäßig angehakt.

![Ein Backup wiederherstellen](../assets/screenshots/restore.jpg)

---

## Erscheinungsbild

Wie die Instanz für alle aussieht, und die Meldungen, die sie zeigt.

| Seite | Wofür sie da ist |
|---|---|
| **Standardwerte** | Theme, Sprache, Formularansicht, Zeitzone und Datumsformat für Benutzer, die keine gewählt haben. Siehe [Standardwerte](../appearance/defaults.html). |
| **Name** | Der Name im Browser-Tab und auf der Anmeldeseite. Siehe [Name](../appearance/name.html). |
| **Logo** | Ihr eigenes Logo in der Kopfzeile. Siehe [Logo](../appearance/logo.html). |
| **Symbol** | Ihr eigenes Symbol im Browser-Tab. Siehe [Symbol](../appearance/icon.html). |
| **Links** | Der Designer-Link und Ihre eigenen Links und Menüs in der Kopfzeile. Siehe [Links](../appearance/links.html). |
| **Labels** | Labels neben dem Logo, etwa PRODUCTION und EU. Siehe [Labels](../appearance/labels.html). |
| **Ankündigungen** | Meldungen unter der Kopfzeile, jede von ihrem Beginn bis zu ihrem Ende. Siehe [Ankündigungen](../announcements.html). |

---

## Zugriff

Wer sich anmelden darf und was er danach tun darf.

| Seite | Wofür sie da ist |
|---|---|
| **Haftungsausschluss** | Bedingungen, die jeder Benutzer einmal akzeptiert, und wer welche Version akzeptiert hat. Siehe [Haftungsausschluss](../disclaimer.html). |
| **Benutzer** | Die lokalen Benutzer sowie die aus LDAP und Single Sign-On. Siehe [Benutzer und Gruppen](../users-and-groups.html). |
| **Gruppen** | Die lokalen Gruppen sowie die aus LDAP und Single Sign-On. Siehe [Benutzer und Gruppen](../users-and-groups/local-group.html). |
| **Rollen** | Die Rollen der config.yaml: wer sie hat und was sie erlauben. Siehe [Rollen](../config/roles.html). |
| **LDAP** | Anmeldung mit einem LDAP-Verzeichnis oder Active Directory. Siehe [LDAP](../authentication/ldap.html). |
| **SSO** | Single Sign-On mit Entra ID oder OpenID-Connect-Anbietern. Siehe [Authentifizierung](../authentication/). |

![Zugriff > LDAP, das Hauptverzeichnis](../assets/screenshots/ldap.jpg)

---

## Verbindungen

Die Systeme, die AnsibleForms erreicht, und womit es sich bei ihnen anmeldet.

| Seite | Wofür sie da ist |
|---|---|
| **Repositories** | Die Git-Repositories, aus denen die Formulare und Playbooks kommen. Siehe [Git-Repositories](../repositories/). |
| **Anmeldedaten** | Die Konten und Secrets, die Formulare, Playbooks und Verbindungen verwenden. Siehe [Anmeldedaten](../credentials.html). |
| **Secret Stores** | HashiCorp Vault und CyberArk, aus denen sich Anmeldedaten lesen lassen. Siehe [Secret Stores](../secret-stores/). |
| **Runner** | Wo Jobs laufen: RTE-Container für Playbooks und AWX und Ähnliches für Vorlagen. Siehe [Runner](../runners.html). |
| **SSH** | Das Schlüsselpaar, mit dem sich die App mit Git verbindet, und die bekannten Hosts. Siehe [SSH](../repositories/authentication.html#ssh-with-the-generated-key). |
| **Benachrichtigungen** | SMTP-Server, Slack, Microsoft Teams, Telegram und Webhooks. Siehe [Benachrichtigungskanäle](../notification-channels.html). |
| **Chat-Assistent** | Der KI-Anbieter des Chat-Assistenten. Siehe [Chat-Assistent](../chat/). |
| **MCP** | Der MCP-Server für KI-Agenten. Siehe [MCP](../mcp/). |
| **Syslog** | Syslog-Server, die das Serverprotokoll, das Audit-Protokoll oder beides empfangen. Siehe [Syslog](../production/logs.html#syslog). |

![Verbindungen > Anmeldedaten, der Reiter Verbindung von Anmeldedaten](../assets/screenshots/credentials.jpg)

---

## Protokolle

Was auf der Instanz passiert ist.

| Seite | Wofür sie da ist |
|---|---|
| **Audit-Protokoll** | Wer was geändert hat und ob es erlaubt war, gefiltert nach Benutzer, Aktion und Ergebnis. Siehe [Audit-Trail](../production/logs.html#audit-trail). |
| **Serverprotokoll** | Das eigene Protokoll des Servers, zur Fehlersuche. Siehe [Protokolle](../production/logs.html). |

### Serverprotokoll

Die letzten Zeilen des Protokolls, die neueste unten, laufend verfolgt, während sie geschrieben werden. Das Suchfeld filtert sie (ein regulärer
Ausdruck), **Leeren** leert die Ansicht, nicht das Protokoll, und **Herunterladen** speichert das ganze Protokoll.

![Protokolle > Serverprotokoll](../assets/screenshots/logs.jpg)

---

## API-Dokumentation

**API-Dokumentation** im Hilfemenü (das Fragezeichen in der Kopfzeile) verlinkt auf die Swagger UI der REST-API unter `/api/v2/docs`.
Siehe [API](../api/).

![Swagger-Oberfläche](../assets/screenshots/swagger.jpg)
