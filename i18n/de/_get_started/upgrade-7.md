---
layout: default
title: Auf v7 aktualisieren
parent: Aktualisieren
nav_order: 0.5
translated_from: 8c6ca072978823febdff10a5f0a3c935f994b50b
---

# Auf v7 aktualisieren
{: .no_toc }

Was Sie noch auf 6.5 ändern sollten und was sich beim Wechsel auf Version 7 ändert
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Version 7 entfernt alles, was 6.x als veraltet markiert hat; beheben Sie es zuerst auf 6.5, wo Alt und Neu beide funktionieren, und aktualisieren Sie dann.

---

## Vor der Aktualisierung (auf 6.5)

### Formulare liegen in eigenen Dateien

Formulare liegen nur noch im Formularordner (`FORMS_FOLDER_PATH`) oder in einem Formular-Repository; `config.yaml` behält Kategorien, Rollen und Konstanten.

- **Eine Datei `forms.yaml`:** benennen Sie sie in `config.yaml` um. Auf 6.5 hat die Einstellungsseite dafür eine Schaltfläche
  **Convert forms.yaml to config.yaml**.
- **Ein Abschnitt `forms:` in der Basiskonfiguration:** Version 7 lehnt ihn ab. Verschieben Sie jedes Formular in eine eigene Datei, zum Beispiel
  indem Sie es im Designer von 6.5 auf eine Datei ziehen.
- **Umgebungsvariablen:**

  | Entfernt | Stattdessen verwenden |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` und `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### Das Feld `table`

Version 7 lehnt Felder vom Typ `table` ab, und ihre Eigenschaften (`tableFields`, `insertColumns`, `readonlyColumns`,
`tableTitleAdd`, `tableTitleEdit`) fallen mit ihnen weg: verwenden Sie ein Feld `list` mit einem `subform` und machen Sie aus dem `from` jeder Spalte einen Ausdruck
auf `__parent__` (siehe die [FAQ](faq#how-do-i-migrate-from-table--tablefields-to-list--subform)).

### Umbenannte Eigenschaften

Jede entfernte Eigenschaft hat einen direkten Ersatz:

| Entfernt | Stattdessen verwenden |
|---|---|
| `disableRelaunch: true` (Formular) | `allowRelaunch: false` |
| `noOutput: true` (Feld) | `output: false` |
| `enableLogin` (Rollenoption) | `allowLogin` |

### Datenquellen und Datenschemas

Die Datenquellen-Importe und ihre Admin-Seiten wurden entfernt, ebenso die
Galaxy-Collection von AnsibleForms, deren Module nur ihnen dienten.

- Geplante Importe stoppen, und die Datenquellen-Tabellen werden gelöscht: notieren Sie sich vorher, was Sie brauchen.
- Die Datenschemas, die ein Import gefüllt hat, sind eigene Datenbanken und bleiben bestehen. Ein Formular, das
  sie über Anmeldedaten abfragt, funktioniert weiter.
- Um diese Daten aktuell zu halten, führen Sie den Import als eigenes Playbook aus, zum Beispiel über einen
  Zeitplan.

### API v1

`/api/v1/*` wurde entfernt; verwenden Sie `/api/v2/*` (interaktive Dokumentation unter `/api/v2/docs`). Die Aufrufe,
die Skripte typischerweise verwenden, sind:

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

v2 antwortet mit HTTP-Statuscodes (`400`, `403`, `404`, `422`) und einem einfachen JSON-Body, nicht mit der Hülle
`{ status, message, data }` von v1.

**Auch die Single-Sign-On-Callbacks.** Eine Weiterleitungs-URL mit `/api/v1/` antwortet nicht mehr: die Anmeldung kehrt zur
Anmeldeseite zurück, ohne anzumelden. Ändern Sie sie an zwei Stellen auf `/api/v2/`, beim SSO-Anbieter in
AnsibleForms und beim Identitätsanbieter (die Umleitungs-URIs der Entra-ID-App-Registrierung, die gültigen Umleitungs-URIs des OIDC-
Clients):

- Entra ID: `https://<your host>/api/v2/auth/azureadoauth2/callback`, oder ab 7.3.0 `/api/v2/auth/entraid/callback`
- OIDC: `https://<your host>/api/v2/auth/oidc/callback`

---

## Was sich in 7 ändert

Version 7 ändert, wie Playbooks laufen, und verschärft mehrere Standardwerte. Prüfen Sie jeden der folgenden Punkte, wenn Sie von 6.5 wechseln.

### Playbooks laufen auf einer RTE

Version 7 führt `ansible-playbook` nicht mehr im AnsibleForms-Container aus. Playbooks laufen auf einer Laufzeitumgebung (RTE),
einem eigenen Container, und das App-Image enthält weder ansible noch python. Starten Sie eine RTE neben der App, aus dem
Image `ghcr.io/ansibleforms/ansibleforms-rte-full:7`. Seit 7.3.0 verbindet sich die App mit der RTE und hält einen WebSocket offen (siehe
[Modi](rte/modes.html)): die RTE bekommt keine Datenbankeinstellungen und kein `ENCRYPTION_SECRET`. Ihre Einstellungen:

| Einstellung | Wert |
|---|---|
| `AF_ROLE` | `rte`. Die RTE-Images setzen es bereits. |
| `RTE_MODE` | `inbound`: die App verbindet sich mit der RTE. Ein Runner in einem anderen Netzwerk verwendet `outbound` (siehe [Modi](rte/modes.html)). |
| `RTE_TOKEN` | Ein Token mit mindestens 16 Zeichen. Die App meldet sich damit am Socket der RTE an, und die RTE verweigert ohne Token den Start. |
| `RTE_FILES` | `local`, wenn die RTE denselben persistenten Ordner einhängt wie die App, wie wenn sie neben ihr läuft. |

Verschieben Sie dann die Ansible-Mounts vom App-Container auf die RTE:

- `ansible.cfg` unter `/etc/ansible/ansible.cfg`, Ihre Rollen unter `/etc/ansible/roles` und Ihre Collections unter
  `/etc/ansible/collections`.
- Hängen Sie denselben persistenten Ordner wie bei der App auch in die RTE ein, damit sie die Playbooks und die Repositories findet.

Deklarieren Sie die RTE dann als Runner, im [Konfigurations-Seed](seed/), wie es das Docker-Compose-Projekt tut, oder unter **Verbindungen → Runner**:
RTE-Anmeldedaten mit der Adresse der RTE (zum Beispiel `http://rte:8000`) und demselben Token sowie einen Runner vom Typ RTE, Modus inbound,
der sie nennt:

```yaml
credentials:
  items:
    - name: rte
      credential_type: rte
      url: http://rte:8000
      password: ${RTE_TOKEN}
runners:
  items:
    - name: rte
      type: rte
      rte_mode: inbound
      credential: rte
      is_default: true
```

Der Seed liest `RTE_TOKEN` aus der Umgebung der App. Siehe [Runner](runners.html) und [Laufzeitumgebungen](rte/).

{: .warning }
> **Derselbe Vertrag für App und RTE** Die App löst die Anmeldedaten eines Jobs auf und übergibt sie der RTE, versiegelt für
> genau diese RTE (RTE-Vertrag 2, neu in 7.0.0). Eine RTE mit einem anderen Vertrag lehnt die Jobs der App ab: betreiben Sie das RTE-Image derselben
> Version wie die App und aktualisieren Sie beide gemeinsam. Spätere 7er-Versionen funktionieren weiter mit einer älteren 7er-RTE, solange der Vertrag
> gleich bleibt (siehe [Skalierung](../rte/images.html#build-your-own-rte)).


### Was das RTE-Image enthält

Die RTE gibt es in drei Schichten, jede auf der vorherigen aufgebaut. Wählen Sie die, die zu Ihren Playbooks passt:

| Image | Inhalt |
|---|---|
| `ansibleforms-rte-full` | Der Standard. Ansible 14 mit ansible-core 2.21 sowie die Collections und Python-Bibliotheken, die das 6.5-Image hatte. |
| `ansibleforms-rte-core` | Python 3.14, ansible-core und einige gängige Bibliotheken, ohne Collections. Fügen Sie Ihre eigenen in einem darauf aufgebauten Image hinzu. |
| `ansibleforms-rte-base` | Nur der Server, ohne python und ansible, um eine RTE mit eigenen Versionen zu bauen. |

Der Wechsel von 6.5 (ansible 12 mit ansible-core 2.19) ändert für Ihre Playbooks außerdem Folgendes:

- **ansible-core 2.21:** lesen Sie die [Porting Guides](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html)
  für 2.20 und 2.21.
- **Python 3.14:** die RTE-Schichten laufen auf python 3.14.
- **Kein `boto` mehr:** die alte Bibliothek `boto` 2 ist weg. Die Collection `amazon.aws` verwendet `boto3`, das enthalten ist.

Zwei Umgebungsvariablen gehören jetzt zur RTE und werden von der App nicht mehr gelesen, setzen Sie sie daher im RTE-Container:

| Variable | Änderung |
|---|---|
| `ANSIBLE_PATH` | Der Playbook-Ordner, auf der RTE. |
| `PROCESS_MAX_BUFFER` | Jetzt standardmäßig 50 MB. Darüber hinaus wird die Job-Ausgabe nicht mehr gespeichert (der Job sagt es), aber das Playbook läuft weiter, statt gestoppt zu werden. |


### Die Container laufen als uid 1000

Die App- und RTE-Images laufen als Benutzer `node` (uid 1000) statt als root, und ihr Home-Ordner ist `/home/node`:

- **Geben Sie uid 1000 einmalig die Volumes.** Für die persistenten und ssh-Volumes führen Sie
  `docker run --rm -v <volume>:/v alpine chown -R 1000:1000 /v` aus; für einen Host-Ordner `sudo chown -R 1000:1000 <folder>`.
  Auf Kubernetes setzen Sie `fsGroup: 1000`.
- **Hängen Sie den ssh-Ordner unter `/home/node/.ssh` ein**, nicht unter `/root/.ssh`. Wenn Sie
  [`HOME_PATH`](customization/paths.html#env_HOME_PATH) auf `/root` gesetzt haben, entfernen Sie es oder setzen Sie es auf `/home/node`.
- **Ihr eigenes RTE-Image**, das auf einer RTE-Schicht aufbaut, wechselt für seine Installationen zu `USER root` und am Ende zurück zu `USER node`.


### Die Startvalidierung ist eingeschaltet

[`LAUNCH_VALIDATION`](customization/features.html#env_LAUNCH_VALIDATION) ist jetzt standardmäßig `enforce` (6.5: `off`). Jeder
Start, aus dem Browser oder über `POST /api/v2/job`, wird gegen die Regeln des Formulars geprüft, und der Job läuft mit den Extravars und
Anmeldedaten, die der Server aus den geprüften Werten aufbaut.

- **REST-Aufrufer müssen `rawFormData` senden**, die rohen Feldwerte, wie der Browser sie sendet. Ein Start mit nur
  `extravars` wird abgelehnt, weil seine Werte nicht geprüft werden können.
- **Um zuerst zu sehen, was abgelehnt würde**, setzen Sie `LAUNCH_VALIDATION=log` und lesen Sie die Warnungen im Protokoll. `off` stellt das
  Verhalten von 6.5 wieder her.

Siehe [Startvalidierung](launch-validation/) für die Details.


### Playbooks sehen die Einstellungen der App nicht mehr

Ein Playbook erbt nicht mehr die Umgebungsvariablen, die AnsibleForms selbst liest: `ENCRYPTION_SECRET`, die `DB_*`-Einstellungen,
`ACCESS_TOKEN_SECRET`, `RTE_TOKEN`, die `VAULT_*`-Einstellungen, jede andere dokumentierte Variable und jede `MYSQL_*`-Variable.
Der Rest der Umgebung der RTE, etwa `PATH`, Proxys, `ANSIBLE_*`-Einstellungen und Cloud-Anmeldedaten, wird wie bisher weitergegeben.

Ein Playbook, das eine davon mit `lookup('env', ...)` gelesen hat, muss den Wert anders bekommen: übergeben Sie ihn als Extravar oder als
Anmeldedaten, oder setzen Sie ihn auf der RTE unter einem anderen Namen.

### Nur die Admin-Rolle verwaltet Runner und Admins

Ein Benutzer mit Zugriff auf die Einstellungen hat nicht mehr die volle Kontrolle darüber, wer Admin ist und wohin Anmeldedaten gehen:

- **Runner:** nur die Admin-Rolle fügt einen Runner hinzu, ändert oder löscht ihn, denn ein Runner erhält die Anmeldedaten der Jobs,
  die er ausführt. Benutzer mit Zugriff auf die Einstellungen können Runner weiterhin sehen und testen.
- **Admin-Konten und -Gruppen:** nur die Admin-Rolle vergibt Admin-Rechte. Ohne sie kann ein Benutzer kein Konto in eine Gruppe aufnehmen, die die
  Admin-Rolle nennt, und weder ein Admin-Konto noch eine solche Gruppe ändern, zurücksetzen oder löschen.
- **Rollen:** ein Designer ohne Admin-Rolle kann die Rollen nicht ändern. Ein Speichern oder Wiederherstellen mit abweichenden Rollen wird abgelehnt.

Geben Sie die Admin-Rolle denjenigen, die Runner, Admins und Rollen verwalten.

### Das Standardpasswort muss geändert werden

Ein Benutzer, der sich mit dem öffentlichen Standardpasswort `AnsibleForms!123` anmeldet, muss es zuerst ändern. Bis dahin beantwortet jeder andere API-
Aufruf `403` mit dem Code `password_change_required`, und der Browser zeigt die Seite zum Ändern des Passworts.

Melden Sie sich einmal an und wählen Sie ein neues Passwort, oder setzen Sie [`ADMIN_PASSWORD`](customization/server.html#env_ADMIN_PASSWORD) vor dem
ersten Start. Skripte, die sich mit dem Standardpasswort anmelden, müssen ein anderes verwenden.

### Tokens enden bei Abmeldung und Passwortänderung

Eine Abmeldung beendet jetzt die Tokens dieser Sitzung, und eine Passwortänderung beendet jede Sitzung dieses Benutzers; melden Sie sich daher nach
einer Passwortänderung erneut an.

Ein mit `?expiryDays=` angefordertes API-Token lebt höchstens [`API_TOKEN_MAX_DAYS`](customization/security.html#env_API_TOKEN_MAX_DAYS) Tage
(standardmäßig 90). Skripte, die langlebige API-Tokens verwenden, müssen ein neues anfordern, bevor es abläuft.

### Entra ID braucht Ihren Tenant

Die Anmeldung über Entra ID (Azure AD) verwendet jetzt OpenID Connect nur noch gegen Ihren eigenen Tenant, und ein Benutzer eines anderen Tenants kann sich nicht
anmelden. Ein Anbieter ohne Tenant-ID oder mit `common`, `organizations` oder `consumers` wird abgelehnt.

- **Setzen Sie die Tenant-ID** beim SSO-Anbieter: die Verzeichnis-ID (Mandanten-ID), eine GUID, oder die Domain des Tenants.
- **Erteilen Sie die Graph-Berechtigungen:** die Anmeldung fragt nach `openid profile email User.Read GroupMember.Read.All`. Geben Sie der App-
  Registrierung die delegierten Microsoft-Graph-Berechtigungen `User.Read` und `GroupMember.Read.All`, mit Administratorzustimmung.
- **Bevorzugen Sie Gruppen-IDs in Rollen:** nennen Sie eine Gruppe als `azuread/<object id>` (ab 7.3.0 `entraid/<object id>`) statt mit ihrem Anzeigenamen.

Siehe [Entra ID](authentication/entra-id.html) für die Einrichtung.

### Passwörter haben eine Mindestlänge

Ein lokales Passwort, das über die Anwendung gesetzt wird, braucht mindestens
[`PASSWORD_MIN_LENGTH`](customization/security.html#env_PASSWORD_MIN_LENGTH) Zeichen (standardmäßig 8) und darf weder der Benutzername noch das
Standardpasswort sein. `PASSWORD_MIN_LENGTH=0` schaltet die Längenprüfung ab. Bestehende Passwörter funktionieren weiter.

### Betreiben Sie die Container mit einer Neustart-Richtlinie

Eine nicht abgefangene Ausnahme beendet jetzt den Prozess, protokolliert auf Stufe `crit`, statt ihn in einem unbekannten Zustand weiterlaufen zu lassen. Betreiben Sie
die Container mit einer Neustart-Richtlinie, etwa `--restart unless-stopped` mit Docker (das docker-compose-Projekt setzt sie).
Kubernetes startet die Pods von selbst neu.

### AWX-Verbindungen und der Home-Link

Zwei weitere Dinge sind in 7 weggefallen, ohne dass auf 6.5 etwas zu tun ist:

- **AWX- und AAP-Verbindungen:** die Tabelle `awx`, `/api/v2/awx` und die Seite A.A.P. sind weg. Die Aktualisierung verschiebt jede AWX- oder
  AAP-Verbindung nach **Verbindungen → Runner**, als Runner vom Typ `awx`, und Formulare mit `awx:` funktionieren weiter.
- **`NAV_HOME_LABEL` und `NAV_HOME_ICON`:** werden nicht mehr gelesen. Der erste Link der Kopfzeile ist immer Formulare.

### Veraltet in 7, entfernt in 8

Diese funktionieren in 7 noch, aber jede protokolliert bei Verwendung eine Warnung. Wechseln Sie vor Version 8 zum Ersatz:

| Veraltet | Stattdessen verwenden |
|---|---|
| Umgebungsvariablen `VAULT_*` | Ein Secret Store namens `vault` (**Verbindungen → Secret Stores**). Der erste Start von 7 importiert die Variablen einmalig als diesen Store und ignoriert sie danach. |
| Umgebungsvariablen `LOG_SYSLOG_*` | Ein Syslog-Server (**Verbindungen → Syslog**). Wenn `LOG_SYSLOG_HOST` gesetzt ist, importiert der erste Start von 7 sie einmalig als den Server `syslog`, der wie bisher das Serverprotokoll erhält, und ignoriert sie danach. Um auch die Audit-Einträge zu senden, stellen Sie ihn so ein, dass er beides empfängt. |
| `vault_path` bei Anmeldedaten (API, Konfigurations-Seed) | `secret_store` und `secret_ref`. Siehe [Secret Stores](secret-stores/). |
| Die Rolle `public` in `config.yaml` | Die Rolle `default`. Die Datei wird beim Laden der Konfiguration umbenannt; ein ytt-Template benennen Sie von Hand um. `public` in den `roles:` eines Formulars passt weiterhin. |
| `POST /api/v2/config/vault/check`, `GET /api/v2/config/vault/mounts` | `POST /api/v2/secretstore/{id}/check`, `GET /api/v2/secretstore/{id}/mounts` |
| `hasApproval` bei einem Formular oder einem Schritt | `approval`. `hasApproval` hat keine Wirkung. |
| `awx: <name>` bei einem Formular | `runner: <name>`. Eine AWX-Verbindung ist ein Runner vom Typ `awx`. |
| `type: multistep` bei einem Formular, mit seinen `steps` | `type: workflow`, mit Knoten, die einen `runner` nennen. Siehe [Workflow-Formulare](forms/workflow.html). |
| Der Abschnitt `awx:` des Konfigurations-Seeds | Einträge in `runners:` mit `type: awx` |
| `LOCK_PATH` | Nichts: wird nicht mehr gelesen, die Designer-Sperre wird in der Datenbank gehalten. |
| Eine RTE im Datenbankmodus, seit 7.3.0: `RTE_MODE=database` oder kein `RTE_MODE`, mit den `DB_*` der Datenbank und `ENCRYPTION_SECRET` auf der RTE | `RTE_MODE=outbound` oder `RTE_MODE=inbound`, ohne `DB_*`. Die RTE tritt einmalig mit einem Beitritts-Token bei (`RTE_JOIN_TOKEN`), oder ihr Runner wird unter **Verbindungen → Runner** oder im Konfigurations-Seed (`rte_mode`) auf diesen Modus gesetzt. Siehe [Modi](rte/modes.html). |
| `RTE_REGISTER`, seit 7.3.0 (nur Datenbankmodus) | Ein Beitritts-Token (`RTE_JOIN_TOKEN`): die RTE fügt sich selbst als Runner hinzu, der sich mit RTE-Anmeldedaten anmeldet. |
| Anmeldedaten vom Typ `api` oder `userpass` bei einem Runner des Konfigurations-Seeds, seit 7.3.0 | Anmeldedaten von der Art des Runners (`credential_type: rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck` oder `jenkins`), mit dem Server in `url`. |
| Ein Runner des Konfigurations-Seeds mit eigenem `token` oder `username` und `password`, seit 7.3.0 | Anmeldedaten von der Art des Runners im Abschnitt `credentials`, mit dem Server in `url`, die der Runner mit `credential:` nennt. Der Seed legt so lange welche an, die nach dem Runner benannt sind. |

`ENABLE_SSO` und `SSO_AUTO_LOGIN` werden seit 7.3.0 nicht mehr gelesen. Der erste Start von 7.3 übernimmt sie einmalig: `ENABLE_SSO=0` deaktiviert
jeden SSO-Anbieter, und `SSO_AUTO_LOGIN=1` setzt **Anmeldeseite überspringen** beim einzigen aktivierten Anbieter. Danach werden sie ignoriert: jeder Start
protokolliert eine Warnung, solange sie gesetzt sind, und jeder Anbieter hat **Aktiviert** und **Anmeldeseite überspringen** unter **Zugriff → SSO**.

---

## Image-Tags

`latest` wechselt mit 7.0.0 auf 7. Um bei 6 zu bleiben, verwenden Sie das Tag `6` (oder `6.5`) statt `latest`.
Alle Tags sind unter [Image-Tags](installation/#image-tags) aufgeführt.

---

## Zurücksetzen

Erstellen Sie vor der Aktualisierung ein Backup (**Einstellungen → Backups**). 6.5 läuft auf einer auf 7 aktualisierten Datenbank, aber nur
das Backup stellt die gelöschten Datenquellen-Definitionen wieder her.
