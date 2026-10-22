---
layout: default
title: Wie es funktioniert
nav_order: 2
translated_from: e802a9168b87771c9d1a2d2d9af9368646b4f39f
---

# Wie es funktioniert
{: .no_toc }

Die Teile einer Installation, was bei einem Start passiert und wo Daten aufbewahrt werden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Architektur

AnsibleForms ist ein Node.js-Server, der die Webanwendung und eine REST-API bereitstellt, gestützt auf eine MySQL-Datenbank. Er liest Formulare
aus YAML-Dateien und führt selbst nichts aus: er übergibt jeden Job an einen [Runner](runners.html). Ein Playbook geht an einen Ihrer RTE-Container
(Laufzeitumgebung), der `ansible-playbook` ausführt, und eine Vorlage oder ein Job geht an AWX, AAP, Ascender, Semaphore, Rundeck oder Jenkins:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afd-title afd-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afd-title">Architektur von AnsibleForms</title>
<desc id="afd-desc">Der Browser und ein optionaler MCP-Client sprechen mit dem AnsibleForms-Server. Der Server speichert seine Daten in MySQL und im persistenten Ordner und verbindet sich mit Datenquellen, Secret Stores, Git-Repositories, Anmeldeanbietern, Benachrichtigungskanälen, Syslog-Servern und einem optionalen Modellanbieter. Seine Runner übergeben jedes Playbook an einen von einem oder mehreren RTE-Containern, jeweils über einen WebSocket, die ansible-playbook ausführen und die Ausgabe an den Server zurücksenden, und jede Vorlage oder jeden Job an AWX, AAP, Ascender, Semaphore, Rundeck oder Jenkins.</desc>
<style>
.afd-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afd-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afd-solid{fill:var(--body-background-color)}
.afd-back{stroke-opacity:.45}
.afd-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afd-run{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-width:1.4}
.afd-opt{stroke-dasharray:5 4}
.afd-t{fill:currentColor;font-size:13px;font-weight:600}
.afd-s{fill:var(--af-muted);font-size:11px}
.afd-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afd-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afd-go{stroke:var(--link-color);stroke-opacity:.85;stroke-width:1.5;fill:none}
</style>
<defs>
<marker id="afd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afd-box" x="20" y="70" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="94" text-anchor="middle">Browser</text>
<text class="afd-s" x="105" y="112" text-anchor="middle">Formulare, Designer,</text>
<text class="afd-s" x="105" y="127" text-anchor="middle">Jobs, Chat</text>
<rect class="afd-box afd-opt" x="20" y="200" width="170" height="70" rx="10"/>
<text class="afd-t" x="105" y="229" text-anchor="middle">MCP-Client</text>
<text class="afd-s" x="105" y="248" text-anchor="middle">optional</text>
<line class="afd-line" x1="190" y1="105" x2="258" y2="105" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="190" y1="235" x2="258" y2="235" marker-end="url(#afd-arrow)"/>
<rect class="afd-main" x="260" y="30" width="240" height="345" rx="12"/>
<text class="afd-h" x="380" y="56" text-anchor="middle">AnsibleForms-Server</text>
<text class="afd-s" x="380" y="74" text-anchor="middle">Node.js / Express</text>
<rect class="afd-inner" x="280" y="88" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="114" text-anchor="middle">Web-App und REST-API</text>
<rect class="afd-inner" x="280" y="142" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="168" text-anchor="middle">Formulare, Ausdrücke</text>
<rect class="afd-inner" x="280" y="196" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="222" text-anchor="middle">Workflows, Zeitpläne</text>
<rect class="afd-inner afd-opt" x="280" y="250" width="200" height="42" rx="8"/>
<text class="afd-t" x="380" y="276" text-anchor="middle">MCP-Server (optional)</text>
<rect class="afd-run" x="280" y="304" width="200" height="50" rx="8"/>
<text class="afd-t" x="380" y="325" text-anchor="middle">Runner</text>
<text class="afd-s" x="380" y="342" text-anchor="middle">geben Jobs an ihren Runner</text>
<rect class="afd-box" x="570" y="30" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="47" text-anchor="middle">Datenquellen</text>
<text class="afd-s" x="655" y="63" text-anchor="middle">Datenbanken, APIs, Dateien</text>
<rect class="afd-box" x="570" y="80" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="97" text-anchor="middle">Secret Stores</text>
<text class="afd-s" x="655" y="113" text-anchor="middle">HashiCorp Vault, CyberArk</text>
<rect class="afd-box" x="570" y="130" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="147" text-anchor="middle">Git-Repositories</text>
<text class="afd-s" x="655" y="163" text-anchor="middle">Formulare, Playbooks, Config</text>
<rect class="afd-box" x="570" y="180" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="197" text-anchor="middle">Anmeldeanbieter</text>
<text class="afd-s" x="655" y="213" text-anchor="middle">LDAP, Entra ID, OIDC</text>
<rect class="afd-box" x="570" y="230" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="247" text-anchor="middle">Benachrichtigungen</text>
<text class="afd-s" x="655" y="263" text-anchor="middle">Mail, Slack, Teams, Webhooks</text>
<rect class="afd-box" x="570" y="280" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="297" text-anchor="middle">Syslog-Server</text>
<text class="afd-s" x="655" y="313" text-anchor="middle">Protokoll, Audit-Trail</text>
<rect class="afd-box afd-opt" x="570" y="330" width="170" height="42" rx="10"/>
<text class="afd-t" x="655" y="347" text-anchor="middle">Modellanbieter</text>
<text class="afd-s" x="655" y="363" text-anchor="middle">optional, Chat-Assistent</text>
<line class="afd-line" x1="500" y1="51" x2="568" y2="51" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="101" x2="568" y2="101" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="151" x2="568" y2="151" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="201" x2="568" y2="201" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="251" x2="568" y2="251" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="500" y1="301" x2="568" y2="301" marker-end="url(#afd-arrow)"/>
<line class="afd-line afd-opt" x1="500" y1="351" x2="568" y2="351" marker-end="url(#afd-arrow)"/>
<rect class="afd-box" x="20" y="420" width="170" height="60" rx="10"/>
<text class="afd-t" x="105" y="445" text-anchor="middle">Persistenter Ordner</text>
<text class="afd-s" x="105" y="463" text-anchor="middle">Config, Formulare, Playbooks</text>
<rect class="afd-box" x="210" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="285" y="441" text-anchor="middle">MySQL / MariaDB</text>
<text class="afd-s" x="285" y="458" text-anchor="middle">Jobs, Benutzer,</text>
<text class="afd-s" x="285" y="472" text-anchor="middle">Anmeldedaten</text>
<polyline class="afd-line" points="260,355 105,355 105,418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<line class="afd-line" x1="285" y1="377" x2="285" y2="418" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<rect class="afd-main afd-solid afd-back" x="412" y="408" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid afd-back" x="406" y="414" width="150" height="60" rx="10"/>
<rect class="afd-main afd-solid" x="400" y="420" width="150" height="60" rx="10"/>
<text class="afd-t" x="475" y="445" text-anchor="middle">RTE-Container</text>
<text class="afd-s" x="475" y="463" text-anchor="middle">starten ansible-playbook</text>
<rect class="afd-box" x="570" y="420" width="182" height="60" rx="10"/>
<text class="afd-t" x="661" y="445" text-anchor="middle">AWX / AAP / Ascender</text>
<text class="afd-s" x="661" y="463" text-anchor="middle">Semaphore, Rundeck, Jenkins</text>
<line class="afd-go" x1="420" y1="354" x2="420" y2="405" marker-start="url(#afd-arrow)" marker-end="url(#afd-arrow)"/>
<polyline class="afd-go" points="470,354 470,394 661,394 661,418" marker-end="url(#afd-arrow)"/>
<text class="afd-s" x="413" y="387" text-anchor="end">Playbooks,</text>
<text class="afd-s" x="413" y="400" text-anchor="end">WebSocket</text>
<text class="afd-s" x="566" y="388" text-anchor="middle">Vorlagen, Jobs</text>
</svg>
</div>

Die Komponenten im Diagramm haben jeweils eine eigene Rolle:

| Komponente | Rolle |
|---|---|
| **Browser** | Die Vue-Webanwendung: die Formulare, der [Designer](gui/designer-and-git.html), die Job-Historie und die Einstellungen |
| **AnsibleForms-Server** | Wertet die Formulare aus, zeichnet die Jobs auf, führt die Workflows und die Zeitpläne aus, übergibt jeden Job an seinen Runner und verfolgt ihn, und stellt die [REST-API](api/) bereit |
| **Runner** | Wo Jobs laufen, hinzugefügt unter **Verbindungen > Runner**: ein Formular nennt einen mit `runner: <name>` oder verwendet den Standard-Runner seines Typs (siehe [Runner](runners.html)) |
| **RTE-Container** | Ein oder mehrere Container mit Laufzeitumgebung, derselbe Server mit `AF_ROLE=rte` gestartet: jeder führt `ansible-playbook` für [Ansible-Formulare](forms/ansible.html) aus, mit den Python-Bibliotheken und Collections seines Images, und sendet die Ausgabe und den Endstatus über einen WebSocket an den Server zurück, ohne Datenbank-Anmeldedaten (siehe [Wie die RTE läuft](rte/#how-the-rte-runs)) |
| **AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins** | Runner für Vorlagen und Jobs: [AWX-Formulare](forms/awx.html) starten eine Job- oder Workflow-Vorlage, Formulare für [Semaphore](forms/semaphore.html), [Rundeck](forms/rundeck.html) und [Jenkins](forms/jenkins.html) starten einen ihrer Jobs, und der Server verfolgt seine Ausgabe |
| **MySQL / MariaDB** | Enthält die Jobs und ihre Ausgabe, die Benutzer, die Anmeldedaten und die Verbindungen; nur der Server liest und schreibt sie |
| **Persistenter Ordner** | Enthält `config.yaml`, die Formulardateien, die Playbooks, die Protokolle und die Backups |
| **Datenquellen** | Füllen die Felder: [Datenbankabfragen](formfields/enum.html), [REST-APIs](expressions/rest-apis.html), Dateien und [andere Funktionen](expressions/remote.html) |
| **Secret Stores** | Liefern Benutzer und Passwort von Anmeldedaten zum Zeitpunkt der Verwendung, siehe [Secret Stores](secret-stores/) |
| **Git-Repositories** | Halten die Formulare, die Playbooks und `config.yaml` unter Versionskontrolle |
| **Anmeldeanbieter** | Melden die Benutzer an: [LDAP, Entra ID und OIDC](authentication/), neben den lokalen Benutzern |
| **Benachrichtigungskanäle** | Transportieren die [Benachrichtigungen](forms/notifications.html) und die Genehmigungsanfragen: [Mail, Slack, Microsoft Teams, Telegram oder ein Webhook](notification-channels.html) |
| **Syslog-Server** | Empfangen das Protokoll und den Audit-Trail, während sie geschrieben werden, siehe [Syslog](production/logs.html#syslog) |
| **MCP-Client, Chat** | Optional, beide standardmäßig aus: der [MCP-Server](mcp/) und der [Chat-Assistent](chat/), der einen Modellanbieter braucht |

Standardmäßig betreibt ein Container den Server, die Web-App und die Hintergrundarbeit gemeinsam, neben einer RTE. Für mehrere App-Knoten hinter einem
Load Balancer, einen Worker für die Hintergrundarbeit und mehr RTEs siehe [Skalierung](production/scaling.html).

### Gebaut mit

Server und Weboberfläche bauen auf diesen Komponenten auf:

| Teil | Technologie |
|---|---|
| **Server** | Node.js und Express |
| **Datenbank** | MySQL oder MariaDB |
| **Weboberfläche** | Vue 3, mit Bootstrap 5 und Font Awesome |

---

## Was passiert, wenn Sie ein Formular starten

Ein Start durchläuft dieselben Schritte, ob er aus dem Browser oder über die [REST-API](api/jobs.html) kommt:

1. **Laden** : der Server sendet nur die Formulare, die die [Rollen](config/roles.html) des Benutzers erlauben, und wertet Server-Ausdrücke aus
2. **Übermitteln** : der Browser macht aus den Feldwerten Extravars und sendet sie an `POST /api/v2/job`
3. **Prüfen** : der Server lädt das Formular für die Rollen des Benutzers neu und prüft, bei eingeschalteter [Startvalidierung](launch-validation/), die Werte
4. **Aufzeichnen** : der Job wird mit dem Status `running` gespeichert, und seine ID wird den Extravars als `__jobid__` hinzugefügt
5. **Genehmigen** : ein Formular mit einem [`approval`](forms/approval.html)-Punkt wartet, bis ein Genehmiger den Job annimmt
6. **Anmeldedaten** : für ein Playbook liest die App (nie die RTE) die Anmeldedaten des Formulars aus der Datenbank oder einem [Secret Store](secret-stores/)
7. **Ausführen** : der Job geht an seinen Runner, den, den das Formular mit `runner:` nennt, oder den Standard seines Typs. Für ein Playbook sendet die App den Job über den
   WebSocket der RTE an ihre RTE, mit den für sie versiegelten Anmeldedaten, und die RTE führt `ansible-playbook` aus (siehe [Wie die RTE läuft](rte/#how-the-rte-runs)),
   und AWX, AAP, Ascender, Semaphore, Rundeck oder Jenkins führt eine Vorlage oder einen Job aus. Ein [Workflow](workflows/) führt seine Knoten aus, jeden als
   eigenen Job auf seinem eigenen Runner
8. **Verfolgen** : der Server speichert die Ausgabe in der Datenbank, sobald sie ankommt, bei einem Playbook von der RTE über ihren Socket gesendet, oder von den
   anderen Runnern gelesen. Die Formularseite liest den Job alle zwei Sekunden neu, und die Seite Jobs verfolgt ihn live, während der Server
   jede Änderung ankündigt
9. **Beenden** : der Job erhält seinen Endstatus, und seine [`notifications`](forms/notifications.html) gehen per Mail und an seine
   [Benachrichtigungskanäle](notification-channels.html) hinaus, wenn das Formular sie anfordert

---

## Wo was gespeichert wird

AnsibleForms hält seinen Zustand an zwei Orten: in der MySQL-Datenbank und im persistenten Ordner. Sichern Sie beide.

### In der Datenbank
{: .no_toc }

Die Datenbank, `AnsibleForms`, wird beim ersten Start angelegt (sofern `ALLOW_SCHEMA_CREATION` nicht `0` ist) und enthält:

* die Jobs, ihre Extravars und ihre Ausgabe, die Zeitpläne und die gespeicherten Jobs
* die lokalen Benutzer, die Gruppen und die API-Tokens
* die Anmeldedaten, verschlüsselt mit `ENCRYPTION_SECRET`, und die Verbindungen zu Secret Stores
* die Runner, die Benachrichtigungskanäle (Mail eingeschlossen), die Syslog-Server sowie die Einstellungen für LDAP, SSO, Repositories und den Chat-Assistenten
* das Audit-Protokoll

### Im persistenten Ordner
{: .no_toc }

Er ist `/app/dist/persistent` im Image und `server/persistent` aus dem Quellcode; jeder Pfad hat seine eigene [Variable](customization/paths.html):

| Standardpfad | Variable | Inhalt |
|---|---|---|
| `config.yaml` | [`CONFIG_PATH`](customization/paths.html#env_CONFIG_PATH) | Die Kategorien, die Rollen und die Konstanten |
| `forms/` | [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) | Die Formulardateien, `.yaml` oder `.yml`, nach Belieben in Unterordnern |
| `playbooks/` | [`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH) | Die Playbooks der `ansible`-Formulare und ihr Arbeitsverzeichnis |
| `repositories/` | [`REPO_PATH`](customization/paths.html#env_REPO_PATH) | Die Klone der Git-Repositories |
| `forms_backups/` | [`FORMS_BACKUP_PATH`](customization/paths.html#env_FORMS_BACKUP_PATH) | Die Kopien, die der Designer vor dem Speichern anlegt |
| `backups/` | [`BACKUP_PATH`](customization/paths.html#env_BACKUP_PATH) | Die Datenbank-Backups |
| `uploads/` | [`UPLOAD_PATH`](customization/paths.html#env_UPLOAD_PATH) | Die über `file`-Felder hochgeladenen Dateien |
| `logs/` | [`LOG_PATH`](customization/logging.html#env_LOG_PATH) | `ansibleforms.log` und `ansibleforms.errors.log` |
| `certificates/` | [`HTTPS_CERT`](customization/server.html#env_HTTPS_CERT), [`HTTPS_KEY`](customization/server.html#env_HTTPS_KEY) | Das Zertifikat und der Schlüssel, wenn `HTTPS` `1` ist |
| `.env` | | Die von den Einstellungsseiten gespeicherten Umgebungsvariablen (sofern `ALLOW_ENV_EDIT` nicht `0` ist) |

Der erzeugte SSH-Schlüssel liegt in [`HOME_PATH`](customization/paths.html#env_HOME_PATH), standardmäßig außerhalb des persistenten Ordners.
