---
layout: default
title: Docker Compose
parent: Aktualisieren
nav_order: 2
translated_from: e0588e18950ebc7164327833bdc85871783048ba
---

# Docker Compose
{: .no_toc }

Eine mit dem docker-compose-Projekt angelegte Installation aktualisieren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Das docker-compose-Projekt betreibt drei Container: MySQL (`mysqldb`), AnsibleForms (`app`) und die RTE, die die
Playbooks ausführt (`rte`). AnsibleForms und die RTE verwenden das Image-Tag `7`, das immer auf die neueste 7.x-Version zeigt. Eine
Aktualisierung zieht die Images erneut und erstellt die Container neu, deren Image sich geändert hat. Alles, was erhalten bleiben muss, liegt
im Ordner `data` und bleibt bewahrt.

---

## Vor der Aktualisierung

Bereiten Sie die Aktualisierung so vor, dass Sie zurückkehren können, falls etwas schiefgeht:

* **Erstellen Sie ein Backup** unter **Einstellungen → Backups**. Die neue Version aktualisiert das Datenbankschema bei ihrem ersten Start.
* **Lesen Sie das [Changelog](../changelog)** für die Versionen zwischen Ihrer und der neuen.
* **Wechsel auf eine neue Hauptversion?** Folgen Sie zuerst [Auf v7 aktualisieren](../upgrade-7.html).
* **Sie kommen von 6.5?** Das 6.x-Projekt, auf seinem Branch `v6`, hat keinen Container `rte`. Bringen Sie Ihre Kopie des Projekts auf
  den Branch `main`, behalten Sie Ihre `.env`-Einstellungen und Ihren Ordner `data`, damit `docker-compose.yml` den Dienst `rte`
  hat. Diese Compose-Datei setzt `CONFIG_SEED_PATH`, und ein `data`-Ordner aus 6.x hat keine `seed.yaml`: kopieren Sie `data/seed.yaml` aus
  dem Repository und fügen Sie `RTE_TOKEN` (mindestens 16 Zeichen) zu Ihrer `.env` hinzu, wie in der `.env` des Repositorys. Ohne sie verweigert die
  App den Start. Die 7er-Images laufen als uid 1000 statt als root: geben Sie diesem Benutzer einmalig den Ordner `data` und lassen Sie die MySQL-
  Dateien MySQL, mit `sudo find data -path data/mysql -prune -o -exec chown 1000:1000 {} +`.
  Der Ordner `data/ssh` wird jetzt unter `/home/node/.ssh` statt `/root/.ssh` eingehängt.
* **Sie kommen von 7.2?** Aktualisieren Sie `docker-compose.yml` und `data/seed.yaml` gemeinsam: siehe zuerst [Von 7.2 auf 7.3](#from-72-to-73).

---

## Von 7.2 auf 7.3

Bis 7.2.0 erhielt der Dienst `rte` die Einstellungen der Datenbank, und sein in `data/seed.yaml` deklarierter Runner lief im Datenbankmodus,
der in 7.3.0 als veraltet markiert und in 8.0.0 entfernt wird. Seit 7.3.0 verbindet sich die App mit der RTE auf `http://rte:8000` und hält einen WebSocket offen
(`RTE_MODE=inbound`, siehe [Modi](../rte/modes.html)), und die RTE hält keine Datenbankeinstellungen. Nehmen Sie beide Dateien vom Branch
`main` des Repositorys und behalten Sie Ihre `.env`:

| Datei | Was sich ändert |
|---|---|
| `docker-compose.yml` | Der Dienst `rte` liest `.env` nicht mehr: er bekommt `RTE_MODE=inbound`, `RTE_TOKEN` und `RTE_FILES=local` und kein `DB_*` |
| `data/seed.yaml` | RTE-Anmeldedaten `rte` mit `url: http://rte:8000` und `password: ${RTE_TOKEN}` sowie der Runner `rte` mit `rte_mode: inbound` und `credential: rte` |

Ändern Sie beide. Nur mit der neuen Compose-Datei behält der Seed den Runner `rte` im Datenbankmodus: die App ruft die RTE wie eine aus 7.2 auf,
worauf die neue RTE nicht antwortet, und kein Playbook läuft. Ein Seed, den Sie selbst geändert haben, braucht dieselben Anmeldedaten und dasselbe `rte_mode`.

Ein Runner, den der Seed angelegt hat, bleibt verwaltet, schreibgeschützt unter **Verbindungen → Runner**, auch nachdem Sie `CONFIG_SEED_PATH` entfernt haben: nur ein
Seed, der angewendet wird, gibt einen Runner frei, den er nicht mehr deklariert. Behalten Sie also den Seed und setzen Sie `rte_mode` dort, statt
`CONFIG_SEED_PATH` zu entfernen, um den Runner von Hand zu ändern.

Der [Installer](../installation/installer.html#upgrade) erledigt das selbst: seine Aktualisierung ersetzt `docker-compose.yml`, und `data/seed.yaml`,
wenn es ein unveränderter Seed aus dem Repository ist. Ein von Hand geänderter bleibt erhalten, und der neue wird daneben gespeichert.

---

## 1. Die neuen Images ziehen

Laden Sie die neuesten Images der Tags in `docker-compose.yml` herunter:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
cd /srv/apps/ansibleforms-docker
sudo docker compose pull
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
cd /srv/apps/ansibleforms-docker
sudo podman-compose pull
```

</div>
</div>

---

## 2. Die Container neu erstellen

Starten Sie das Projekt erneut; die Container, deren Image sich geändert hat, werden neu erstellt:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose up -d
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose down
sudo podman-compose up -d
```

</div>
</div>

---

## 3. Die Aktualisierung prüfen

Verfolgen Sie das Protokoll von AnsibleForms beim Start. Der erste Start einer neuen Version aktualisiert das Datenbankschema, und die RTE
startet, sobald AnsibleForms gesund ist:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
sudo docker compose logs -f app
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
sudo podman-compose logs -f app
```

</div>
</div>

In AnsibleForms zeigt **Hilfe → Info** die laufende Version, und **Einstellungen → Status** zeigt den Zustand der
Datenbank, des Schemas und der anderen Systeme, von denen AnsibleForms abhängt.

---

## Zurücksetzen

Um zur vorher betriebenen Version zurückzukehren, der Version, die **Hilfe → Info** vor der Aktualisierung zeigte, fixieren Sie ihr exaktes Tag in
`docker-compose.yml`, sowohl beim AnsibleForms- als auch beim RTE-Image, anstelle von `7`, und führen Sie Schritt 2 erneut aus. Startet diese Version
nicht auf der aktualisierten Datenbank, stellen Sie das Backup wieder her, das Sie unter **Einstellungen → Backups** erstellt haben. Setzen Sie die Tags wieder auf
`7`, um wieder Updates zu erhalten.

**VIDEO**: [So aktualisieren Sie AnsibleForms](https://www.youtube.com/watch?v=5ZDJ8CcUx5c)
