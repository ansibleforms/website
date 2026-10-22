---
layout: default
title: Nativ
parent: Installation
nav_order: 2
translated_from: eab01cbd3bc313b6a4cfd2b87dbcb2ac99408b78
---

# Native Installation
{: .no_toc }

AnsibleForms direkt auf dem Server, ohne Container, als systemd-Dienste, die der Installer einrichtet
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren von Servern, auf denen Container nicht erlaubt sind: der [Installer](installer.html) installiert alles, was AnsibleForms braucht, auf
dem Server selbst und aktualisiert und entfernt es danach. Er installiert AnsibleForms 7.3.0 oder neuer.

---

## Was sie braucht

Wählen Sie im Schritt **Engine** des Installers **Direkt auf diesem Server, ohne Container**, oder übergeben Sie `--mode native`. Sie braucht:

* **Root** : starten Sie den Installer mit `sudo` (`curl -fsSL https://ansibleforms.com/install | sudo sh`)
* **systemd** : die Dienste laufen als systemd-Units
* **Ein unterstütztes Linux** : Ubuntu, Debian, RHEL und seine Nachbauten wie Rocky Linux und AlmaLinux, SUSE Linux Enterprise oder openSUSE
* **amd64 oder arm64**
* **Internetzugang** : zu den Repositories der Distribution, GitHub, nodejs.org und den Paketindizes von Python und Ansible (siehe
  [Air-gapped](#air-gapped) für das, was ein Release-Bundle ersetzt)

Auf einem Server, der diese Bedingungen nicht erfüllt, erscheint die Engine als *Direkt auf diesem Server (erfordert root: Installer mit sudo starten)* oder
*Direkt auf diesem Server (auf diesem Linux nicht unterstützt)*. Beide Rollen lassen sich so installieren: ein Controller und ein [Runner](installer.html#a-runner).

---

## Was sie installiert

Der Installer installiert für beide Rollen Folgendes aus den Paketen der Distribution:

| Paket | Wofür |
|---|---|
| `git` | Die Repositories |
| Der ssh-Client | Die Verbindungen der Playbooks |
| Der MariaDB-Client | Die Backups der App: `app.env` setzt [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) und [`MYSQL_COMMAND`](../customization/retention.html#env_MYSQL_COMMAND) auf den gefundenen Client, `mariadb-dump` und `mariadb` oder die älteren `mysqldump` und `mysql` |
| `ca-certificates`, `curl`, `tar`, `gzip` | Die Downloads |
| `libatomic` | Node.js linkt dagegen, und minimalen Servern fehlt es |
| `sshpass` | Playbooks, die sich mit einem ssh-Passwort anmelden. Auf RHEL und seinen Nachbauten kommt es aus EPEL, das der Installer mit `epel-release` zu aktivieren versucht; lässt es sich nicht installieren, geht die Installation weiter und sagt es |
| Der MariaDB-Server | Nur ein Controller: seine Datenbank |

Danach, in den Installationsordner, wobei jeder Download gegen seine veröffentlichte Prüfsumme geprüft wird:

* **AnsibleForms** : das Release-Bundle `ansibleforms-<version>-linux-<arch>.tar.gz` aus dem GitHub-Release der App, die für
  Node.js gebaute App. Eine Version ohne Bundle meldet *Ohne Container ist AnsibleForms 7.3.0 oder neuer erforderlich.*
* **Node.js** : die neueste Version der Hauptversion, die das Bundle nennt, von nodejs.org
* **Python und Ansible** : uv, dann damit das Python der RTE-Images und eine virtuelle Umgebung mit Ansible und den Bibliotheken
  des vollen RTE-Images, dann seine Ansible-Collections (siehe [Die RTE-Images](../rte/images.html)). Das dauert einige Minuten
* **Die Startdateien** : die Formulare, Playbooks und Einstellungen aus dem Ordner `data` des [docker-compose-Projekts](https://github.com/ansibleforms/docker),
  so wie eine neue Docker-Compose-Installation sie erhält. Ein Runner behält nur seine Ansible-Konfiguration sowie die ssh- und git-Einstellungen

Für einen Controller legt er dann das Schema `AnsibleForms` in MariaDB an sowie einen nach der Instanz benannten Datenbankbenutzer mit allen Rechten auf diesem
Schema und keinen anderswo, der sich nur von diesem Server aus anmeldet.

---

## Der Ordner

Alles liegt im Installationsordner, standardmäßig `/opt/ansibleforms` (oder `/opt/ansibleforms-runner` für einen Runner):

| Pfad | Was er enthält |
|---|---|
| `releases/<version>/` | Ein Release: das Bundle, seinen Link zu Node.js, seine virtuelle Python-Umgebung und seine Collections |
| `current` | Der Link zum laufenden Release; eine Aktualisierung verschiebt ihn, ein Zurücksetzen ebenso |
| `runtime/` | Node.js, uv und Python, von den Releases gemeinsam genutzt |
| `data/` | Was die Container als `/app/dist/persistent` einhängen: Formulare, Playbooks, `config.yaml`, der Konfigurations-Seed, Zertifikate und Protokolle |
| `home/` | Das Home des Systembenutzers: `.ssh` und `.gitconfig`, verlinkt auf `data/ssh` und `data/git` |
| `app.env`, `rte.env` | Die Einstellungen und Secrets der Dienste, nur für root und den Systembenutzer lesbar. Die der RTE enthält keine Datenbankeinstellungen |
| `installer-backups/` | Die Datenbank-Backups, die der Installer vor einer Aktualisierung oder mit `backup` erstellt |

Die Releases und die Laufzeiten gehören root, sodass die Dienste ihren eigenen Code nicht ändern können; `data/` und `home/` gehören dem Systembenutzer.
Die Datenbankdateien selbst verwaltet MariaDB, außerhalb des Ordners.

---

## Die Dienste

Ein Controller betreibt zwei systemd-Dienste, ein Runner einen. Jeder läuft als Systembenutzer, der nach der Instanz benannt ist (standardmäßig `ansibleforms`),
aus `current/server`, mit seiner Einstellungsdatei:

| Dienst | Was er ausführt | Einstellungen |
|---|---|---|
| `<name>` | Die App: die Weboberfläche, die API und den Worker. Nur ein Controller | `app.env` |
| `<name>-rte` | Die RTE, die die Playbooks ausführt | `rte.env` |

Die RTE eines Controllers ist `inbound` auf einem eigenen Port auf `127.0.0.1` (`8001` oder dem nächsten freien, mit
[`LISTEN_HOST`](../customization/server.html#env_LISTEN_HOST)`=127.0.0.1`), führt die Playbooks aus den Ordnern der App aus (`RTE_FILES=local`)
und wird vom Konfigurations-Seed `data/seed.yaml` als Standard-Runner deklariert.

Die RTE eines Runners bekommt den Modus, `APP_URL`, `RTE_NAME` und, mit `--join`, das Beitritts-Token, und erhält die Playbooks mit jedem Job (siehe
[Modi](../rte/modes.html)). Eine ausgehende nimmt keinen Aufruf der App an und lauscht daher nur auf `127.0.0.1` (`LISTEN_HOST=127.0.0.1`).
Eine eingehende stellt HTTPS mit einem selbstsignierten Zertifikat ihrer eigenen Adresse in `data/certificates` bereit, das AnsibleForms pinnt.
Ohne Beitritts-Token bittet sie um Beitritt, und ein Admin gibt sie unter **Verbindungen > Runner** frei.

Sie starten beim Booten und nach einem Fehler neu. Verwalten Sie sie und lesen Sie ihre Protokolle mit den eigenen Werkzeugen von systemd:

```bash
sudo systemctl status ansibleforms ansibleforms-rte
sudo systemctl restart ansibleforms
sudo journalctl -u ansibleforms -f
sudo journalctl -u ansibleforms-rte -f
```

Die App darf ohne root auf einem Port unter 1024 lauschen, etwa `443`. Die RTE behält das Recht, `sudo` zu verwenden, das Playbooks mit
`become` auf diesem Server brauchen, sodass ein Playbook den Server verwalten kann, auf dem die RTE läuft.

---

## Aktualisieren und zurücksetzen

`sudo /usr/local/bin/ansibleforms-installer upgrade` aktualisiert eine native Installation wie die anderen (siehe [Aktualisieren](installer.html#upgrade)), in
dieser Reihenfolge:

1. Legt das neue Release neben das laufende: sein Bundle, Node.js, Python, Ansible und die Collections. Die laufenden
   Dienste werden noch nicht angefasst
2. Fügt die neuen Startdateien hinzu, die das Release mitbringt, und behält jede vorhandene Datei
3. Sichert die Datenbank (ein Controller) nach `installer-backups/`, mit einer Kopie von `app.env` und `rte.env`
4. Stoppt die Dienste, lässt `current` auf das neue Release zeigen und startet sie wieder
5. Wartet, bis die App mit der neuen Version antwortet (ein Runner: bis seine RTE wieder lauscht)

Antwortet die neue Version nicht, bietet der Installer ein Zurücksetzen an: `current` zeigt wieder auf das vorherige Release, die
Datenbank wird aus dem Backup wiederhergestellt, und die Dienste starten. Nur das laufende Release und das davor werden aufbewahrt.

Native Dienste im Layout des Installers ohne `installer.json` daneben, zum Beispiel nachdem sie gelöscht wurde, werden von `install`
und `upgrade` gefunden, die anbieten, sie zu übernehmen (siehe [Eine bestehende Installation](installer.html#an-existing-installation)).

---

## Deinstallieren

`sudo /usr/local/bin/ansibleforms-installer uninstall` stoppt und entfernt die Dienste. Er behält den Ordner und die Datenbank, sofern Sie nicht wählen,
die Daten zu löschen (oder `--purge` übergeben), und zur Bestätigung den Namen der Instanz eingeben. Dann löscht er auch die Datenbank und ihren Benutzer (ein Controller),
löscht den Ordner und entfernt den Systembenutzer.

Die Pakete bleiben installiert, MariaDB eingeschlossen: andere Software kann sie verwenden.

---

## Air-gapped

`--bundle` installiert aus einem Release-Bundle, das Sie auf den Server kopiert haben, statt es von GitHub herunterzuladen. Nehmen Sie die Datei für seine
Architektur, `ansibleforms-<version>-linux-amd64.tar.gz` oder `-arm64`, aus den [Releases](https://github.com/ansibleforms/ansibleforms/releases) der App:

```bash
sudo /usr/local/bin/ansibleforms-installer install --mode native --bundle /tmp/ansibleforms-7.3.0-linux-amd64.tar.gz
```

`--source` tut dasselbe für die Startdateien, aus einer lokalen Kopie des Repositorys [ansibleforms/docker](https://github.com/ansibleforms/docker).
Node.js, Python mit seinen Paketen und die Ansible-Collections werden während der Installation weiterhin heruntergeladen.
