---
layout: default
title: Aus dem Quellcode
parent: Aktualisieren
nav_order: 3
translated_from: f01384ded41bf8e1913196bb78e7ea1a6532989c
---

# Aus dem Quellcode
{: .no_toc }

Eine aus dem Quellcode gebaute Installation aktualisieren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Eine aus dem Quellcode gebaute Installation wird aktualisiert, indem man die neue Version auscheckt, sie neu baut und die
Anwendung neu startet. Ihre Einstellungen, Formulare, Playbooks, Zertifikate und Protokolle liegen in `server/persistent`, das weder Git noch der
Build verändern.

---

## Vor der Aktualisierung

Bereiten Sie die Aktualisierung so vor, dass Sie zurückkehren können, falls etwas schiefgeht:

* **Erstellen Sie ein Backup** unter **Einstellungen → Backups**. Die neue Version aktualisiert das Datenbankschema bei ihrem ersten Start.
* **Lesen Sie das [Changelog](../changelog)** für die Versionen zwischen Ihrer und der neuen.
* **Wechsel auf eine neue Hauptversion?** Folgen Sie zuerst [Auf v7 aktualisieren](../upgrade-7.html).
* **Prüfen Sie die Node.js-Version**, die die neue Version verlangt, im Changelog.

---

## 1. Die neue Version holen

Holen Sie die Release-Tags und checken Sie die gewünschte Version aus. Release-Tags tragen die Versionsnummer, und `git tag` listet
sie auf; der Branch `main` kann Änderungen enthalten, die noch nicht veröffentlicht sind:

```bash
cd /srv/apps/ansibleforms
git fetch --tags
git checkout <version>
```

---

## 2. Neu bauen

Bauen Sie in denselben drei Schritten neu wie bei der Installation. Bauen Sie zuerst den Client neu:

```bash
cd client
npm ci
npm run build
```

Aktualisieren Sie dann die Abhängigkeiten des Servers:

```bash
cd ../server
npm ci --omit=dev
```

Kopieren Sie zuletzt den neu gebauten Client wieder in den Ordner `views` des Servers:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

Vergleichen Sie `.env.example` im Wurzelverzeichnis des Repositorys mit Ihrer `persistent/.env`, um Einstellungen zu übernehmen, die die Version hinzufügt.

---

## 3. Neu starten

Starten Sie die Anwendung und ihre RTE neu, um den neuen Code zu laden. Das Datenbankschema wird beim ersten Start aktualisiert:

```bash
pm2 restart ansibleforms ansibleforms-rte
```

Wenn Sie von 7.2 kommen, lief die RTE im Datenbankmodus, mit den Datenbankeinstellungen und `RTE_URL`, in 7.3.0 als veraltet markiert und in 8.0.0 entfernt.
Starten Sie sie erneut im eingehenden Modus und deklarieren Sie ihren Runner mit RTE-Anmeldedaten im Seed oder unter **Verbindungen → Runner**, wie die
[Installation](../installation/from-source.html#run) zeigt: `pm2 delete ansibleforms-rte`, dann ihren Befehl `pm2 start`.

Wenn Sie die Anwendung ohne PM2 betreiben, stoppen Sie `npm run start` und starten Sie es erneut.

---

## 4. Die Aktualisierung prüfen

Verfolgen Sie das Anwendungsprotokoll beim Start:

```bash
pm2 logs ansibleforms
```

In AnsibleForms zeigt **Hilfe → Info** die laufende Version, und **Einstellungen → Status** zeigt den Zustand der
Datenbank, des Schemas und der anderen Systeme, von denen AnsibleForms abhängt.

---

## Zurücksetzen

Um zur vorher betriebenen Version zurückzukehren, der Version, die **Hilfe → Info** vor der Aktualisierung zeigte, checken Sie ihr Tag mit
`git checkout <version>` aus und bauen und starten Sie dann wie in den Schritten 2 und 3 neu. Startet diese Version nicht auf der aktualisierten Datenbank, stellen Sie das Backup wieder her, das Sie unter
**Einstellungen → Backups** erstellt haben.
