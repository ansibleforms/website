---
layout: default
title: Kubernetes
parent: Aktualisieren
nav_order: 4
translated_from: 656ff7668e57ae8b6183a2654c4943f046caba6a
---

# Kubernetes
{: .no_toc }

Eine mit dem Helm-Chart angelegte Installation aktualisieren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Jede Chart-Version deployt eine AnsibleForms-Version. Eine Aktualisierung installiert eine neuere Chart-Version mit Ihren bestehenden Values;
die Daten auf den persistenten Volumes bleiben erhalten. Eine Aktualisierung, die nichts ändert, lässt die Pods unberührt.

---

## Vor der Aktualisierung

Bereiten Sie die Aktualisierung so vor, dass Sie zurückkehren können, falls etwas schiefgeht:

* **Erstellen Sie ein Backup** unter **Einstellungen → Backups**. Die neue Version aktualisiert das Datenbankschema bei ihrem ersten Start.
* **Lesen Sie das [Changelog](../changelog)** für die Versionen zwischen Ihrer und der neuen.
* **Wechsel auf eine neue Hauptversion?** Folgen Sie zuerst [Auf v7 aktualisieren](../upgrade-7.html).
* **Lesen Sie das [Changelog](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md) des Charts** auf Änderungen an den Values.
* **Mit erzeugten Anmeldedaten** (`secrets.generate`) sichern Sie das Secret `<release>-secrets`: `ENCRYPTION_SECRET` lässt sich nicht wiederherstellen.
* **Sie kommen von 7.2?** Die RTE im Server-Pod wechselt den Modus: siehe [Von 7.2 auf 7.3](#from-72-to-73).

---

## Von 7.2 auf 7.3

Chart 7.3.0 holt die RTE neben der App aus dem Datenbankmodus, der in 7.3.0 als veraltet markiert und in 8.0.0 entfernt wird. Die App verbindet sich mit ihr auf
`127.0.0.1` und hält einen WebSocket offen (`RTE_MODE=inbound`, siehe [Modi](../rte/modes.html)):

* Der RTE-Container bekommt kein `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET` oder `RTE_URL` mehr und nimmt die Dateien des Jobs vom
  gemeinsamen Volume (`RTE_FILES=local`)
* Der Konfigurations-Seed des Charts deklariert RTE-Anmeldedaten mit dem Token und der Adresse sowie den Runner, `rte_mode: inbound`, der sich
  damit anmeldet. Mit dem Seed des Charts ist nichts zu tun
* Mit `containers.rte.seedRunner: false` oder einem eigenen Konfigurations-Seed (`CONFIG_SEED_PATH`) fügt sich die RTE nicht mehr selbst als Runner hinzu.
  Deklarieren Sie sie selbst, in Ihrem Seed oder unter **Verbindungen → Runner**: RTE-Anmeldedaten mit `http://127.0.0.1:<port>` und dem Token
  sowie einen Runner vom Typ RTE mit `rte_mode: inbound`, der sie nennt. Die Hinweise, die Helm nach der Aktualisierung ausgibt, zeigen wie

Das Chart installiert seit 7.3.0 mit `runner.enabled` auch einen einzelnen Runner (siehe
[Ein Runner auf Kubernetes](../installation/kubernetes.html#a-runner-on-kubernetes)).

---

## 1. Die neue Chart-Version finden

Aktualisieren Sie das Chart-Repository und listen Sie die verfügbaren Chart-Versionen auf:

```bash
helm repo update
helm search repo ansibleforms/ansibleforms --versions
```

---

## 2. Das Release aktualisieren

Führen Sie denselben Befehl `helm upgrade` wie bei der Installation aus, mit Ihrer Values-Datei und der neuen Chart-Version:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml \
  --version 7.0.0
```

Mit der OCI-Registry verwenden Sie `oci://ghcr.io/ansibleforms/charts/ansibleforms` als Chart.

---

## 3. Die Aktualisierung prüfen

Warten Sie auf die neuen Pods und führen Sie dann den Test des Charts aus, der sowohl den Webserver als auch die Datenbankverbindung prüft:

```bash
kubectl -n ansibleforms get pods -w
helm test ansibleforms --namespace ansibleforms --logs
```

In AnsibleForms zeigt **Hilfe → Info** die laufende Version, und **Einstellungen → Status** zeigt den Zustand der
Datenbank, des Schemas und der anderen Systeme, von denen AnsibleForms abhängt.

---

## Zurücksetzen

Helm bewahrt die Historie des Release auf. Um zur vorherigen Revision zurückzukehren:

```bash
helm history ansibleforms --namespace ansibleforms
helm rollback ansibleforms --namespace ansibleforms
```

Startet sie nicht auf der aktualisierten Datenbank, stellen Sie Ihr Backup wieder her (siehe das [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) des Charts).
