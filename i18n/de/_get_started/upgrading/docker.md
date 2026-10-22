---
layout: default
title: Docker
parent: Aktualisieren
nav_order: 1
translated_from: 4b3babaa4c1dd9c7848cf92c8bd75af68e6fac97
---

# Docker
{: .no_toc }

Einen eigenständigen Container ohne docker-compose aktualisieren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Eine eigenständige Installation wird aktualisiert, indem man ihre Container ersetzt: die neuen Images ziehen, die alten Container entfernen und
neue mit denselben `run`-Befehlen starten. Seit Version 7 sind es zwei: AnsibleForms und die RTE, die die
Playbooks ausführt, immer auf derselben Version. Ihre Dateien liegen im eingehängten Ordner `/app/dist/persistent` und Ihre Daten in
MySQL, daher bleibt beides erhalten.

---

## Vor der Aktualisierung

Bereiten Sie die Aktualisierung so vor, dass Sie zurückkehren können, falls etwas schiefgeht:

* **Erstellen Sie ein Backup** unter **Einstellungen → Backups**. Die neue Version aktualisiert das Datenbankschema bei ihrem ersten Start.
* **Lesen Sie das [Changelog](../changelog)** für die Versionen zwischen Ihrer und der neuen.
* **Wechsel auf eine neue Hauptversion?** Folgen Sie zuerst [Auf v7 aktualisieren](../upgrade-7.html).
* **Sie kommen von 6.5?** Die 7er-Images laufen als uid 1000 statt als root: geben Sie diesem Benutzer einmalig die eingehängten Ordner, zum
  Beispiel `sudo chown -R 1000:1000 /srv/apps/ansibleforms/persistent /srv/apps/ansibleforms/ssh`.
* **Sie kommen von 7.2?** Die RTE bekommt eine eigene Datei, und die App verbindet sich mit ihr: siehe zuerst [Von 7.2 auf 7.3](#from-72-to-73).

---

## Von 7.2 auf 7.3

Bis 7.2.0 las die RTE die Umgebungsdatei der App, mit den Einstellungen der Datenbank, und fügte sich selbst aus `RTE_URL` als Runner hinzu. Das
ist der Datenbankmodus, in 7.3.0 als veraltet markiert und in 8.0.0 entfernt. Seit 7.3.0 verbindet sich die App mit der RTE und hält einen WebSocket offen
(`RTE_MODE=inbound`, siehe [Modi](../rte/modes.html)), und die RTE hält keine Datenbankeinstellungen. Einmalig, vor Schritt 2:

1. Legen Sie `/srv/apps/ansibleforms/rte.env` an, wie es die [Installation](../installation/docker.html#prepare-the-folders) tut, mit
   `RTE_MODE=inbound`, demselben `RTE_TOKEN`, `RTE_FILES=local`, `PORT=8000` und `HTTPS=0`. Kein `DB_*`, kein `ENCRYPTION_SECRET`, kein `RTE_URL`
2. Deklarieren Sie den Runner in diesem Modus. Fügen Sie entweder den [Konfigurations-Seed](../seed/) der Installation hinzu, `persistent/seed.yaml` mit den RTE-Anmeldedaten
   (`url: http://rte:8000`, `password: ${RTE_TOKEN}`) und dem Runner `rte` (`rte_mode: inbound`), und fügen Sie
   `CONFIG_SEED_PATH=/app/dist/persistent/seed.yaml` zur Umgebungsdatei der App hinzu. Oder öffnen Sie, ohne Seed, den Runner unter
   **Verbindungen → Runner**, setzen Sie seinen **Modus** auf **Eingehend** und wählen Sie RTE-Anmeldedaten, die `http://rte:8000` und das Token enthalten

Mit dem Seed enthält auch die Umgebungsdatei der App `RTE_TOKEN`, dasselbe Token, da der Seed es von dort liest.

---

## 1. Die neuen Images ziehen

Laden Sie die neuesten AnsibleForms- und RTE-Images des Tags herunter, das Sie betreiben:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker pull ghcr.io/ansibleforms/ansibleforms:7
docker pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman pull ghcr.io/ansibleforms/ansibleforms:7
podman pull ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

---

## 2. Die Container ersetzen

Entfernen Sie die alten Container und starten Sie neue mit den `run`-Befehlen der [Installation](../installation/docker.html). Die App
liest die Datenbankverbindung aus ihrer Umgebungsdatei, mit dem Datenbankbenutzer von AnsibleForms (nicht root). Die RTE liest ihre eigene
`rte.env`, ohne die Einstellungen der Datenbank, und die App verbindet sich mit ihr über ein Netzwerk, das beide Container teilen:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker stop ansibleforms rte
docker rm ansibleforms rte

docker run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

docker run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman stop ansibleforms rte
podman rm ansibleforms rte

podman run -d --name ansibleforms --network ansibleforms -p 8000:8000 --restart unless-stopped \
  --env-file /srv/apps/ansibleforms/ansibleforms.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms:7

podman run -d --name rte --network ansibleforms --restart unless-stopped --stop-timeout 30 \
  --env-file /srv/apps/ansibleforms/rte.env \
  -v /srv/apps/ansibleforms/persistent:/app/dist/persistent \
  -v /srv/apps/ansibleforms/ssh:/home/node/.ssh \
  ghcr.io/ansibleforms/ansibleforms-rte-full:7
```

</div>
</div>

Wenn Sie von 6.5 kommen, gibt es noch keinen RTE-Container: die Befehle `stop` und `rm` finden nur die App. Legen Sie das gemeinsame Netzwerk
einmalig mit `docker network create ansibleforms` (oder `podman network create ansibleforms`) an. Wie bei der
[Installation](../installation/docker.html#prepare-the-folders) legen Sie die Datenbankverbindung, `ENCRYPTION_SECRET`, ein `RTE_TOKEN`
mit mindestens 16 Zeichen und `CONFIG_SEED_PATH` in die Umgebungsdatei der App und legen `rte.env` und den Konfigurations-Seed an. Verwenden Sie Ihre eigenen
Ordner, wo Ihre 6.5-Installation andere eingehängt hat. Der Seed fügt die RTE unter **Verbindungen → Runner** als Standard-Runner `rte` hinzu;
siehe [Auf v7 aktualisieren](../upgrade-7.html#playbooks-run-on-an-rte).

---

## 3. Die Aktualisierung prüfen

Verfolgen Sie das Protokoll von AnsibleForms beim Start. Der erste Start einer neuen Version aktualisiert das Datenbankschema:

<div class="af-tabs" data-tab-group="engine">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="podman" aria-selected="false">Podman</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

```bash
docker logs -f ansibleforms
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="podman" markdown="1" hidden>

```bash
podman logs -f ansibleforms
```

</div>
</div>

Die RTE schreibt ein eigenes Protokoll, das `docker logs rte` zeigt. In AnsibleForms zeigt **Hilfe → Info** die laufende Version, und **Einstellungen → Status** zeigt den Zustand der
Datenbank, des Schemas und der anderen Systeme, von denen AnsibleForms abhängt.

---

## Zurücksetzen

Um zur vorher betriebenen Version zurückzukehren, der Version, die **Hilfe → Info** vor der Aktualisierung zeigte, führen Sie Schritt 2 erneut mit
ihrem exakten Tag anstelle von `7` aus, sowohl beim AnsibleForms- als auch beim RTE-Image. Startet diese Version nicht auf der aktualisierten
Datenbank, stellen Sie das Backup wieder her, das Sie unter **Einstellungen → Backups** erstellt haben.
