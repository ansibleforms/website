---
layout: default
title: RTE
nav_order: 10
has_children: true
has_toc: false
permalink: /rte/
translated_from: 2c3f3f81ad8faaf18eac56f18782ef5f78111b04
---

# Laufzeitumgebungen (RTE)
{: .no_toc }

Was eine RTE ist, wie sie ein Playbook ausführt und worauf sie zugreifen darf
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Administratoren: Verstehen Sie die RTE, bevor Sie eine betreiben, dimensionieren oder in ein anderes Netz verlegen.

| Seite | Inhalt |
|---|---|
| [Images](images.html) | Die drei RTE-Images und der Bau eines eigenen mit den Collections, die Ihre Playbooks verwenden |
| [Modi](modes.html) | Ausgehend, eingehend oder Datenbank: wer die Verbindung öffnet, der Spool, die Dateien des Jobs |
| [Eine RTE betreiben](run.html) | Die Einstellungen jedes Modus und jeweils ein Beispiel mit `docker run` |
| [Mehrere RTEs](several.html) | Kapazität, Replikate hinter einer Adresse und was passiert, wenn eine RTE anhält oder ausfällt |
| [Ein anderes Rechenzentrum](another-datacenter.html) | Ein Runbook: eine RTE in einem zweiten Rechenzentrum hinzufügen, vom leeren Host bis zu ihrem ersten Job |

---

## Was eine RTE ist

AnsibleForms 7 führt kein Playbook im App-Container aus. Der Job eines `ansible`-Formulars wird an einen [Runner](../runners.html) vom Typ
`rte` übergeben, eine Laufzeitumgebung: der AnsibleForms-Server, gestartet mit `AF_ROLE=rte`, neben Python und Ansible, ohne
Weboberfläche. Sie spricht mit der App über einen WebSocket und hält keine Datenbank-Anmeldedaten
([`RTE_MODE`](../customization/server.html#env_RTE_MODE) `outbound` oder `inbound`, siehe [Modi](modes.html)): Die App sendet ihr den Job,
die RTE führt `ansible-playbook` aus, und die App speichert die Ausgabe und den Endstatus, die sie zurückschickt, wo der Browser sie liest.

Die App löst die Anmeldedaten des Jobs auf und übergibt sie der RTE versiegelt, nur für diese RTE und diesen Job. Die RTE liest weder die
Tabelle der Anmeldedaten noch einen Secret Store, und ein Playbook erbt nicht die Umgebungsvariablen von AnsibleForms selbst
(`ENCRYPTION_SECRET`, `DB_*`, `RTE_TOKEN` und die anderen): Übergeben Sie einen solchen Wert als Extravar oder Anmeldedaten. Die RTE von 7.0 bis 7.2,
die selbst in der Datenbank las und schrieb, läuft in 7.x weiterhin als veralteter Datenbankmodus (siehe [Datenbankmodus](#database-mode-deprecated)).

---

## Wie die RTE läuft

Die RTE ist ein Container, den Sie selbst betreiben, neben der App oder in einem anderen Netz: AnsibleForms erzeugt nie einen. Dieser Abschnitt geht durch,
wo sie läuft, was sie mit der App teilt und was in ihr geschieht, vom Start eines Formulars an bis der Prozess des Playbooks
beendet ist:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">Wie die RTE ein Playbook ausführt</title>
<desc id="afr-desc">Auf einem Container-Host oder in einem Kubernetes-Cluster, beide vom Betreiber betrieben, halten der App-Container und ein oder mehrere RTE-Container jeweils einen WebSocket zwischen sich, geöffnet von der App (eingehend) oder von der RTE (ausgehend). Nur die App spricht mit der Datenbank. 1: Der Browser startet ein Formular in der App. 2: Die App speichert den Job in der Datenbank, wählt den Runner und versiegelt die Geheimnisse des Jobs für ihn. 3: Die App sendet den Job über den Socket. 4: Die RTE übernimmt ihn und holt die Dateien des Jobs aus ihrem Cache oder von der App. 5: Die RTE startet ansible-playbook als Kindprozess, einen pro Job, bis zu RTE_MAX_JOBS. 6: Das Playbook erreicht die verwalteten Hosts. 7: Die RTE schreibt die Ausgabe, die Ereignisse und das Ende in ihren Spool und sendet sie über den Socket; die App speichert sie in der Datenbank und bestätigt sie. 8: Der Browser verfolgt den Job über die App. Das Volume der App wird nur mit RTE_FILES=local in die RTE eingehängt.</desc>
<style>
.afr-box{fill:var(--af-accent-soft);stroke:currentColor;stroke-opacity:.45;stroke-width:1.2}
.afr-main{fill:none;stroke:var(--link-color);stroke-width:1.8}
.afr-solid{fill:var(--body-background-color)}
.afr-back{stroke-opacity:.45}
.afr-zone{fill:none;stroke:currentColor;stroke-opacity:.5;stroke-width:1.3;stroke-dasharray:7 5}
.afr-inner{fill:var(--body-background-color);stroke:currentColor;stroke-opacity:.35;stroke-width:1}
.afr-proc{fill:var(--af-accent-soft);stroke:var(--link-color);stroke-opacity:.6;stroke-width:1}
.afr-opt{stroke-dasharray:5 4}
.afr-t{fill:currentColor;font-size:13px;font-weight:600}
.afr-p{fill:currentColor;font-size:12px;font-weight:600}
.afr-s{fill:var(--af-muted);font-size:11px}
.afr-h{fill:var(--link-color);font-size:14px;font-weight:700}
.afr-line{stroke:currentColor;stroke-opacity:.6;stroke-width:1.3;fill:none}
.afr-ws{stroke:var(--link-color);stroke-width:2;fill:none}
.afr-n{fill:var(--link-color)}
.afr-nt{fill:var(--body-background-color);font-size:11px;font-weight:700}
</style>
<defs>
<marker id="afr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".7"/></marker>
</defs>
<rect class="afr-zone" x="165" y="20" width="425" height="380" rx="14"/>
<text class="afr-h" x="181" y="44">Container-Host oder Kubernetes-Cluster</text>
<text class="afr-s" x="181" y="61">von Ihnen betrieben; eine ausgehende RTE kann in einem anderen Netz liegen</text>
<rect class="afr-box" x="12" y="106" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="133" text-anchor="middle">Browser</text>
<text class="afr-s" x="71" y="151" text-anchor="middle">Formulare, Jobseite</text>
<rect class="afr-main" x="190" y="90" width="140" height="262" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">App-Container</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">Web-App, API, Worker</text>
<rect class="afr-inner" x="202" y="142" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="161" text-anchor="middle">Runners</text>
<text class="afr-s" x="260" y="177" text-anchor="middle">versiegeln Geheimnisse</text>
<rect class="afr-inner" x="202" y="296" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="315" text-anchor="middle">RTE-Hub</text>
<text class="afr-s" x="260" y="331" text-anchor="middle">speichert, bestätigt</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="278" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">RTE-Container</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="469" y="160" text-anchor="middle">Job-Dateien</text>
<text class="afr-s" x="469" y="174" text-anchor="middle">nach Hash im Cache</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">bis zu RTE_MAX_JOBS</text>
<rect class="afr-inner" x="407" y="318" width="141" height="40" rx="8"/>
<text class="afr-t" x="477" y="336" text-anchor="middle">Spool</text>
<text class="afr-s" x="477" y="351" text-anchor="middle">bis zur Bestätigung</text>
<text class="afr-p" x="362" y="245" text-anchor="middle">ein</text>
<text class="afr-p" x="362" y="260" text-anchor="middle">Web-</text>
<text class="afr-p" x="362" y="275" text-anchor="middle">Socket</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">Verwaltete Hosts</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, APIs</text>
<rect class="afr-box afr-opt" x="616" y="276" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="300" text-anchor="middle">Volume der App</text>
<text class="afr-s" x="684" y="318" text-anchor="middle">Playbooks, Inventare</text>
<text class="afr-s" x="684" y="334" text-anchor="middle">nur RTE_FILES=local</text>
<rect class="afr-box" x="190" y="430" width="140" height="60" rx="10"/>
<text class="afr-t" x="260" y="455" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="260" y="473" text-anchor="middle">nur die der App</text>
<line class="afr-line" x1="130" y1="124" x2="188" y2="124" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="188" y1="152" x2="132" y2="152" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="330" y1="161" x2="393" y2="161" marker-end="url(#afr-arrow)"/>
<line class="afr-ws" x1="393" y1="338" x2="332" y2="338" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="440" y1="180" x2="440" y2="204" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="576" y1="220" x2="614" y2="220" marker-end="url(#afr-arrow)"/>
<line class="afr-line afr-opt" x1="576" y1="313" x2="614" y2="313" marker-start="url(#afr-arrow)" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="225" y1="352" x2="225" y2="428" marker-end="url(#afr-arrow)"/>
<line class="afr-line" x1="295" y1="352" x2="295" y2="428" marker-end="url(#afr-arrow)"/>
<circle class="afr-n" cx="148" cy="124" r="9"/><text class="afr-nt" x="148" y="128" text-anchor="middle">1</text>
<circle class="afr-n" cx="225" cy="405" r="9"/><text class="afr-nt" x="225" y="409" text-anchor="middle">2</text>
<circle class="afr-n" cx="361" cy="161" r="9"/><text class="afr-nt" x="361" y="165" text-anchor="middle">3</text>
<circle class="afr-n" cx="532" cy="161" r="9"/><text class="afr-nt" x="532" y="165" text-anchor="middle">4</text>
<circle class="afr-n" cx="461" cy="192" r="9"/><text class="afr-nt" x="461" y="196" text-anchor="middle">5</text>
<circle class="afr-n" cx="595" cy="220" r="9"/><text class="afr-nt" x="595" y="224" text-anchor="middle">6</text>
<circle class="afr-n" cx="361" cy="338" r="9"/><text class="afr-nt" x="361" y="342" text-anchor="middle">7</text>
<circle class="afr-n" cx="295" cy="405" r="9"/><text class="afr-nt" x="295" y="409" text-anchor="middle">7</text>
<circle class="afr-n" cx="148" cy="152" r="9"/><text class="afr-nt" x="148" y="156" text-anchor="middle">8</text>
</svg>
</div>

Das Diagramm zeigt einen Socket pro RTE, egal welche Seite ihn geöffnet hat: Die App wählt sich bei einer eingehenden RTE ein, eine ausgehende RTE wählt sich bei der App ein (siehe
[Modi](modes.html)). Sobald er offen ist, gehen dieselben Nachrichten in beide Richtungen, und nur die App liest und schreibt die Datenbank.

**Wer sie startet.** Eine RTE ist ein langlebiger Container, gestartet von dem, was auch Ihre anderen Container betreibt. Sie wartet auf Jobs und läuft
zwischen ihnen weiter:

| Wie Sie AnsibleForms betreiben | Wer die RTE startet |
|---|---|
| `docker run` oder `podman run` | Sie, mit einem Befehl wie dem in [Eine RTE betreiben](run.html), auf einem beliebigen Host, der die App erreicht oder den die App erreicht |
| [Docker Compose](../installation/docker-compose.html) | Der Dienst `rte` von `docker-compose.yml`, neben `app` und `mysqldb`. Sein Config-Seed deklariert ihn als Standard-Runner `rte`, eingehend, unter `http://rte:8000` |
| [Helm-Chart](../installation/kubernetes.html) | Kubernetes, als zweiter Container namens `rte` im Pod der App (`containers.rte`). Die App wählt sich unter `127.0.0.1` ein, eingehend, und der Seed des Charts deklariert ihn als Standard-Runner |
| [Das Installationsprogramm](../installation/installer.html) | Docker Compose oder das Helm-Chart wie oben, oder ein systemd-Dienst [ohne Container](../installation/native.html); ein eigener Runner, der um Beitritt bittet und auf die Freigabe eines Admins wartet |

Die Container-Engine gehört Ihnen: Docker oder Podman auf dem Host oder die Container-Runtime Ihres Kubernetes-Clusters, von Ihnen installiert und aktuell
gehalten. AnsibleForms spricht nie mit ihr. Weder die App noch die RTE ruft Docker oder Podman auf, hängt deren Socket ein oder startet einen
Container: Die App spricht mit der RTE nur über deren Socket.

**Was drin ist.** Ein Container, mit dem, was zum Ausführen eines Playbooks nötig ist, und nichts weiter:

* **Der Server** : derselbe Node.js-Server wie die App, gestartet mit `AF_ROLE=rte` (im Image gesetzt) unter `tini`
* **Weggelassen** : die Weboberfläche, die Anmeldung, der Zeitplaner, der Worker und jedes Datenbankmodul, die diese Rolle nicht lädt
* **Worauf sie lauscht** : ihren `PORT` (`8000`): `/live` und `/ready` für Probes und `/metrics` für Prometheus, und eingehend den Socket,
  bei dem sich die App einwählt, `/rte/v1/socket`. Eine ausgehende RTE nimmt keine Verbindung von der App an
* **Python und Ansible** : mitgebracht von der gewählten Image-Schicht (siehe [Die RTE-Images](images.html))
* **Der Benutzer** : Der Server und jedes Playbook laufen als `node` (uid 1000), nie als root

**Was sie mit der App teilt.** Ihr Token und mit `RTE_FILES=local` die Dateien der App. Mit `RTE_FILES=transfer`, dem Standard, kommen die
Playbooks und Inventare mit jedem Job, und die RTE braucht keine gemeinsame Festplatte:

| Mit der App geteilt | Was die RTE damit tut |
|---|---|
| `RTE_TOKEN` | Legt es vor, wenn sie sich bei der App einwählt (ausgehend), oder prüft es, wenn die App sich bei ihr einwählt (eingehend). Die App hält denselben Wert in den RTE-Anmeldedaten des Runners, und die Geheimnisse des Jobs werden damit versiegelt |
| Das persistente Volume, `/app/dist/persistent`, nur mit `RTE_FILES=local` | Der Playbook-Ordner ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)) oder das Playbook-Repository, das der Worker unter [`REPO_PATH`](../customization/paths.html#env_REPO_PATH) geklont hat, die Inventare ([`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) und die Inventar-Repositories) und die Uploads. Die RTE schreibt die Extravars-Dateien des Jobs in den Playbook-Ordner, hängen Sie ihn also mit Schreibzugriff ein |
| Der ssh-Ordner, `/home/node/.ssh` | Der private Schlüssel und die `known_hosts`, die die SSH-Verbindungen des Playbooks verwenden: Hängen Sie den der App ein, der auf ihren Einstellungsseiten verwaltet wird, oder geben Sie der RTE einen eigenen |

Die RTE klont nichts: Ein Repository erreicht sie in den Dateien eines Jobs oder auf dem Volume, das sie mit der App teilt. Collections, Rollen und
`ansible.cfg` kommen aus dem Image, aus den Ordnern `/etc/ansible/collections`, `/etc/ansible/roles` und `/etc/ansible/ansible.cfg`, wenn
Sie sie dort einhängen (das Docker Compose-Projekt tut das), oder aus einer `ansible.cfg` neben den Playbooks.

**Das Leben eines Jobs.** Die Nummern unten sind die Nummern im Diagramm, für ein Playbook-Formular, das aus dem Browser oder über die API gestartet wird:

1. **Start** : Die App prüft das Formular und seine Werte, baut die Extravars und speichert den Job mit dem Status `running`. Ein Formular mit einer
   [Genehmigung](../forms/approval.html) hält hier an, bis ein Genehmiger es akzeptiert, und erreicht vorher keine RTE
2. **Den Runner wählen** : Die App nimmt die RTE, die das Formular mit `runner: <name>` nennt, sonst den Standard-Runner vom Typ RTE, und speichert seinen
   Namen am Job. Sie löst die Anmeldedaten des Jobs aus der Datenbank oder einem [Secret Store](../secret-stores/) auf, seine Ansible-Anmeldung und sein
   Vault-Passwort, und versiegelt sie mit AES-256-GCM unter einem Schlüssel, der aus dem Token dieses Runners und der Job-ID abgeleitet ist
3. **Übergabe** : Der App-Knoten, der den Socket der RTE hält, sendet ihr den Job: die Extravars, die Optionen des Formulars, die versiegelten Geheimnisse und
   die Hashes der Dateien des Jobs. Jeder App-Knoten kann den Job starten; der Knoten mit dem Socket sendet ihn innerhalb von zwei Sekunden. Eine volle RTE
   oder eine nicht verbundene lässt den Job warten, bis zu [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES)
4. **Übernahme** : Die RTE antwortet `claimed` oder `refused`, wenn sie voll ist, anhält, die Geheimnisse nicht öffnen kann oder der Job mit einem anderen
   [Vertrag](images.html#the-contract) als ihrem eigenen kommt. Mit `RTE_FILES=transfer` nimmt sie die Playbooks und Inventare anhand ihres Hashs aus ihrem
   Cache, fragt die App nach einem Hash, den sie nicht hat, und entpackt sie in einen eigenen Ordner des Jobs
5. **Start des Prozesses** : Im Playbook-Ordner (plus dem `playbookSubPath` des Formulars, der existieren muss) schreibt sie zwei Dateien: `extravars_<id>.json`
   mit den Werten des Formulars und den Anmeldedaten sowie eine versteckte mit der Ansible-Anmeldung. Dann startet sie `ansible-playbook` als eigenen Kindprozess,
   ohne Shell, in einer eigenen Prozessgruppe, mit `-e @` auf diese Dateien, einem `-i` pro Inventar sowie Tags, Limit, Check,
   Diff und Ausführlichkeit des Formulars. Das Vault-Passwort geht über stdin hinein, nie in eine Datei oder auf die Befehlszeile, und der Prozess läuft als
   `node` mit gefilterter Umgebung (siehe unten)
6. **Ausführung** : Das Playbook verbindet sich vom RTE-Container aus mit den verwalteten Hosts, über SSH mit dem Schlüssel und den `known_hosts` aus
   `/home/node/.ssh`, mit `sshpass` für eine Passwortanmeldung, oder über die APIs, die seine Module aufrufen. Die RTE, nicht die App, muss sie erreichen
7. **Ausgabe und Ende** : Die RTE bündelt stdout und stderr jede halbe Sekunde oder alle 64 KB, mit maskierten Anmeldedaten, und nummeriert jedes
   Bündel. Sie schreibt jedes Element in den Spool des Jobs auf ihrer Festplatte, bevor sie es sendet: die Ausgabe, die Ereignisse, das Job-Protokoll aus
   `.joblogs/job_log_<id>.log` (alle 2 Sekunden), den Start und das Ende mit dem Endstatus (`success`, `failed` oder `aborted`). Die App
   speichert jedes Element einmal und bestätigt es, und die RTE verwirft den Spool, sobald das Ende gespeichert ist. Jenseits von
   [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) Bytes auf einem Stream (standardmäßig 50 MB) sendet sie nichts mehr, und
   das Playbook läuft weiter. Die App sendet dann die [Benachrichtigungen](../forms/notifications.html) des Formulars
8. **Verfolgen** : Der Browser spricht nie mit der RTE: Die Formularseite liest den Job alle 2 Sekunden über die App neu, und die Seite Jobs
   verfolgt ihn live, während die App jedes Element speichert

**Ein abgerissener Socket.** Das Playbook läuft weiter. Die RTE wählt sich erneut ein (ausgehend), oder ein App-Knoten wählt sich erneut bei ihr ein (eingehend), und sie sendet erneut, was
die App noch nicht bestätigt hatte: Die App überspringt, was sie bereits gespeichert hat, sodass keine Zeile verloren geht oder doppelt gespeichert wird. Das gilt, solange der Socket
innerhalb von zwei Minuten zurück ist: Die App schreibt den Heartbeat der RTE nur, solange ihr Socket offen ist, und sobald dieser Heartbeat zwei Minuten
alt ist, beendet der Worker die laufenden Jobs der RTE als verwaist, auch wenn ihre Playbooks noch laufen. Halten Sie den Spool
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) auf einem Volume, damit eine neu gestartete RTE noch sendet, was sie aufbewahrt hatte. Ein
Playbook, das lief, als seine RTE neu startete, kann nicht weiterlaufen: Die App beendet seinen Job als verwaist, wenn die RTE ohne ihn zurückkommt.

**Abbruch.** Ein Abbruch setzt das Abbruch-Flag des Jobs, und der App-Knoten, der den Socket der RTE hält, sendet innerhalb von zwei Sekunden `cancel`. Die RTE
sendet `SIGTERM` an die Prozessgruppe des Playbooks, sodass `ansible-playbook` und jeder von ihm gestartete Fork gemeinsam anhalten, und der Job endet
`aborted`. Ein Abbruch, der vor seinem Job eintrifft, wird eine Minute aufbewahrt, und der Job startet dann abgebrochen.

**Aufräumen.** Sobald der Prozess endet, unabhängig vom Ergebnis, entfernt die RTE beide Extravars-Dateien (ein Formular mit `keepExtravars`
behält die sichtbare, nie die versteckte), die Artefaktdatei in `/tmp`, die Job-Protokolldatei und den eigenen Dateiordner des Jobs. Das
Ende wird einmal gespeichert: Ein zweiter Schreiber, etwa die App, die einen Job fehlschlagen lässt, den die RTE bereits beendet hat, ändert nichts.

**Ein Prozess pro Job, nicht ein Container pro Job.** AWX und AAP starten für jeden Job einen neuen Pod oder Container aus einem Execution-Environment-Image.
AnsibleForms startet nichts: Der RTE-Container läuft bereits, und jeder Job ist ein Kindprozess darin. Ein Job startet,
ohne ein Image zu ziehen oder einen Pod einzuplanen, und AnsibleForms braucht keine Rechte auf Ihrer Container-Engine oder Ihrem Cluster. Im Gegenzug
teilen sich die Playbooks, die auf einer RTE laufen, deren CPU, Speicher, `/tmp`, Home-Ordner und Python: Geben Sie dem Container genug Ressourcen für
`RTE_MAX_JOBS` Playbooks mit ihren Forks. Um zu ändern, was ein Playbook verwenden kann, ändern Sie das Image, nicht den Job.

---

## Die Sicherheitsgrenze

Die RTE führt Code aus, den Formularautoren geschrieben haben, daher ist sie so gebaut, dass sie so wenig wie möglich enthält:

* **Nur ihr Token** : Die RTE hält keine Datenbank-Anmeldedaten und kein `ENCRYPTION_SECRET`. Sie nimmt keinen Aufruf an außer dem Socket der App, mit
  ihrem Token, und hat keine Benutzer, keine Anmeldung und keine Webseiten. Über den Socket kann sie nur die Jobs ausführen, die die App ihr sendet, über sie berichten und
  nach ihren Dateien fragen: Sie kann keinen Job anlegen, keinen anderen Job lesen und keine Anmeldedaten herausgeben
* **Versiegelte Geheimnisse** : Um einen Job auszuführen, liest die RTE nie die Tabelle der Anmeldedaten oder einen Secret Store. Sie erhält die Geheimnisse der Jobs, die sie
  ausführt, versiegelt nur für ihr Token und diese Job-ID, sodass sich ein Bündel für eine andere RTE oder einen anderen Job nicht öffnen lässt, und ein geändertes Byte
  wird abgewiesen
* **Eine geprüfte Verbindung** : Ausgehend prüft die RTE das Zertifikat der App. Eingehend über HTTPS pinnt die App beim Beitritt das eigene Zertifikat der RTE
  und wählt sich nur ein, wenn sie dieses vorlegt (siehe [Modi](modes.html#inbound)). Eine eingehende RTE über einfaches HTTP gehört
  in ein privates Netz, wie das des Docker Compose-Projekts
* **Keine geerbte Umgebung** : `ansible-playbook` erhält die Umgebung der RTE ohne jede Variable, die AnsibleForms selbst liest
  (`ENCRYPTION_SECRET`, `DB_PASSWORD`, `RTE_TOKEN`, `VAULT_TOKEN`, `ACCESS_TOKEN_SECRET`, die `MYSQL_*`-Variablen und die anderen), sodass
  `lookup('env', ...)` sie nicht erreicht. Was Sie für Playbooks setzen (`PATH`, Proxys, `ANSIBLE_*`), wird unverändert durchgereicht
* **Keine Templates von Benutzern** : {% raw %}Ein Formularwert, der `{{`, `{%` oder `{#` enthält, erreicht das Playbook als unsicherer String,{% endraw %}
  den Ansible nie als Template auswertet, es sei denn, das Formular setzt `allowJinjaInExtravars`, und keine Shell führt je die Befehlszeile aus
* **Nicht root** : Die RTE und ihre Playbooks laufen als `node` (uid 1000), sodass ein Playbook tun kann, was dieser Benutzer im Container kann, etwa
  seine Dateien und den SSH-Schlüssel lesen, und nicht mehr

Behandeln Sie ihren Container, ihr Image und ihre Umgebung mit derselben Sorgfalt wie die der App.

---

## Datenbankmodus (veraltet)

Die RTE von 7.0 bis 7.2, ohne `RTE_MODE`, läuft die ganze Reihe 7.x hindurch und wird in 8.0.0 entfernt. Sie unterscheidet sich in vier Punkten von den obigen Schritten:

* **Sie hält die Datenbank** : ihre `DB_*`-Einstellungen und `ENCRYPTION_SECRET`, wenn sie sich selbst registriert
  ([`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER))
* **Die Übergabe ist ein HTTP-Aufruf** : Die App ruft `POST <address>/rte/v1/jobs` mit dem Token und den versiegelten Geheimnissen auf, und die RTE übernimmt
  den Job, indem sie ihren Namen in der Datenbank daran schreibt (Schritte 3 und 4)
* **Sie schreibt die Ausgabe selbst** : in die Datenbank, gebündelt, ohne Spool (Schritt 7). Ein Abbruch erreicht sie über das Abbruch-Flag des Jobs,
  das sie alle 2 Sekunden liest, und einen Aufruf `/cancel`
* **Sie liest die Dateien vom Volume der App** : Sie braucht dieselbe Festplatte wie die App, wie bei `RTE_FILES=local`

Ihre Runner-Seite hat keine der [RTE-Einstellungen](../runners/runner-page.html#an-rtes-settings): Sie liest ihre eigenen Variablen. Um sie in einen
Socket-Modus zu überführen, siehe [Modi](modes.html#database-deprecated).
