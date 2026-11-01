---
layout: default
title: RTE
nav_order: 11
has_children: true
has_toc: false
permalink: /rte/
translated_from: 75a4facc8ad51d9d74b8fccfd2bbfd7ba48b17f9
---

# Runtime-omgevingen (RTE)
{: .no_toc }

Wat een RTE is, hoe ze een playbook draait, en waar ze aan mag komen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders: begrijp de RTE voordat je er een draait, haar dimensioneert of naar een ander netwerk verplaatst.

| Pagina | Wat er aan bod komt |
|---|---|
| [Images](images.html) | De drie RTE-images, en je eigen image bouwen met de collecties die je playbooks gebruiken |
| [Modi](modes.html) | Uitgaand, inkomend of database: wie de verbinding opent, de spool, de bestanden van de job |
| [Een RTE draaien](run.html) | De instellingen van elke modus, en van elke een voorbeeld met `docker run` |
| [Meerdere RTE's](several.html) | Capaciteit, replica's achter één adres, en wat er gebeurt als een RTE stopt of uitvalt |
| [Een ander datacenter](another-datacenter.html) | Een runbook: een RTE toevoegen in een tweede datacenter, van een kale host tot de eerste job |

---

## Wat een RTE is

AnsibleForms 7 draait geen playbook in de app-container. De job van een `ansible`-formulier wordt overgedragen aan een [runner](../runners.html) van het type
`rte`, een runtime-omgeving: de AnsibleForms-server gestart met `AF_ROLE=rte`, naast python en ansible, zonder
webinterface. Ze praat met de app over één WebSocket en bevat geen databasereferenties
([`RTE_MODE`](../customization/server.html#env_RTE_MODE) `outbound` of `inbound`, zie [Modi](modes.html)): de app stuurt haar de job,
de RTE draait `ansible-playbook`, en de app slaat de uitvoer en de eindstatus op die ze terugstuurt, waar de browser ze leest.

De app lost de referenties van de job op en geeft ze aan de RTE, verzegeld voor alleen die RTE en die job. De RTE leest nooit de
tabel met referenties of een secret store, en een playbook erft de eigen omgevingsvariabelen van AnsibleForms niet
(`ENCRYPTION_SECRET`, `DB_*`, `RTE_TOKEN` en de andere): geef zo'n waarde door als extravar of als referentie. De RTE van 7.0 tot en met 7.2,
die zelf de database las en schreef, draait in 7.x nog als de verouderde databasemodus (zie [Databasemodus](#database-mode-deprecated)).

---

## Hoe de RTE draait

De RTE is een container die je zelf draait, naast de app of in een ander netwerk: AnsibleForms maakt er nooit een aan. Hieronder zie je
waar ze draait, wat ze met de app deelt, en wat er binnenin gebeurt vanaf het moment dat een formulier wordt gestart tot het proces van het playbook
verdwenen is:

<div class="af-diagram" markdown="0">
<svg viewBox="0 0 760 500" role="img" aria-labelledby="afr-title afr-desc" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;height:auto;color:var(--body-text-color);font-family:inherit">
<title id="afr-title">Hoe de RTE een playbook draait</title>
<desc id="afr-desc">Op een containerhost of in een Kubernetes-cluster, beide beheerd door de operator, houden de app-container en een of meer RTE-containers elk één WebSocket tussen hen open, geopend door de app (inkomend) of door de RTE (uitgaand). Alleen de app praat met de database. 1: de browser start een formulier op de app. 2: de app slaat de job op in de database, kiest de runner en verzegelt de geheimen van de job ervoor. 3: de app stuurt de job over de socket. 4: de RTE claimt hem en haalt de bestanden van de job op, uit zijn cache of bij de app. 5: de RTE start ansible-playbook als kindproces, één per job, tot RTE_MAX_JOBS. 6: het playbook bereikt de beheerde hosts. 7: de RTE schrijft de uitvoer, de events en het einde naar zijn spool en stuurt ze over de socket; de app slaat ze op in de database en bevestigt ze. 8: de browser volgt de job via de app. Het volume van de app wordt alleen met RTE_FILES=local in de RTE gekoppeld.</desc>
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
<text class="afr-h" x="181" y="44">Containerhost of Kubernetes-cluster</text>
<text class="afr-s" x="181" y="61">door jou beheerd; een uitgaande RTE kan in een ander netwerk staan</text>
<rect class="afr-box" x="12" y="106" width="118" height="64" rx="10"/>
<text class="afr-t" x="71" y="133" text-anchor="middle">Browser</text>
<text class="afr-s" x="71" y="151" text-anchor="middle">formulieren, jobpagina</text>
<rect class="afr-main" x="190" y="90" width="140" height="262" rx="12"/>
<text class="afr-h" x="260" y="114" text-anchor="middle">App-container</text>
<text class="afr-s" x="260" y="131" text-anchor="middle">webapp, API, worker</text>
<rect class="afr-inner" x="202" y="142" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="161" text-anchor="middle">Runners</text>
<text class="afr-s" x="260" y="177" text-anchor="middle">verzegelen de geheimen</text>
<rect class="afr-inner" x="202" y="296" width="116" height="44" rx="8"/>
<text class="afr-t" x="260" y="315" text-anchor="middle">RTE-hub</text>
<text class="afr-s" x="260" y="331" text-anchor="middle">slaat op, bevestigt dan</text>
<rect class="afr-main afr-solid afr-back" x="411" y="74" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid afr-back" x="403" y="82" width="165" height="278" rx="12"/>
<rect class="afr-main afr-solid" x="395" y="90" width="165" height="278" rx="12"/>
<text class="afr-h" x="477" y="114" text-anchor="middle">RTE-container</text>
<text class="afr-s" x="477" y="131" text-anchor="middle">AF_ROLE=rte, uid 1000</text>
<rect class="afr-inner" x="407" y="142" width="141" height="38" rx="8"/>
<text class="afr-t" x="469" y="160" text-anchor="middle">Jobbestanden</text>
<text class="afr-s" x="469" y="174" text-anchor="middle">gecachet op hash</text>
<rect class="afr-proc" x="407" y="206" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="224" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc" x="407" y="242" width="141" height="28" rx="6"/>
<text class="afr-p" x="477" y="260" text-anchor="middle">ansible-playbook</text>
<rect class="afr-proc afr-opt" x="407" y="278" width="141" height="28" rx="6"/>
<text class="afr-s" x="477" y="296" text-anchor="middle">tot RTE_MAX_JOBS</text>
<rect class="afr-inner" x="407" y="318" width="141" height="40" rx="8"/>
<text class="afr-t" x="477" y="336" text-anchor="middle">Spool</text>
<text class="afr-s" x="477" y="351" text-anchor="middle">bewaard tot bevestiging</text>
<text class="afr-p" x="362" y="245" text-anchor="middle">één</text>
<text class="afr-p" x="362" y="260" text-anchor="middle">Web-</text>
<text class="afr-p" x="362" y="275" text-anchor="middle">Socket</text>
<rect class="afr-box" x="616" y="190" width="136" height="60" rx="10"/>
<text class="afr-t" x="684" y="215" text-anchor="middle">Beheerde hosts</text>
<text class="afr-s" x="684" y="233" text-anchor="middle">ssh, WinRM, APIs</text>
<rect class="afr-box afr-opt" x="616" y="276" width="136" height="74" rx="10"/>
<text class="afr-t" x="684" y="300" text-anchor="middle">Volume van de app</text>
<text class="afr-s" x="684" y="318" text-anchor="middle">playbooks, inventories</text>
<text class="afr-s" x="684" y="334" text-anchor="middle">alleen RTE_FILES=local</text>
<rect class="afr-box" x="190" y="430" width="140" height="60" rx="10"/>
<text class="afr-t" x="260" y="455" text-anchor="middle">MySQL / MariaDB</text>
<text class="afr-s" x="260" y="473" text-anchor="middle">alleen van de app</text>
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

Het diagram toont één socket per RTE, welke kant hem ook opende: de app belt een inkomende RTE, een uitgaande RTE belt de app (zie
[Modi](modes.html)). Zodra hij open is, gaan dezelfde berichten beide kanten op, en alleen de app leest en schrijft de database.

**Wie haar start.** Een RTE is een langdraaiende container, gestart door wat je andere containers ook draait. Ze wacht op jobs en blijft
tussendoor draaien:

| Hoe je AnsibleForms draait | Wie de RTE start |
|---|---|
| `docker run` of `podman run` | Jij, met een opdracht zoals die in [Een RTE draaien](run.html), op elke host die de app bereikt, of die de app bereikt |
| [Docker Compose](../installation/docker-compose.html) | De service `rte` van `docker-compose.yml`, naast `app` en `mysqldb`. De configuratie-seed declareert haar als de standaardrunner `rte`, inkomend, op `http://rte:8000` |
| [Helm-chart](../installation/kubernetes.html) | Kubernetes, als tweede container met de naam `rte` in de pod van de app (`containers.rte`). De app belt haar op `127.0.0.1`, inkomend, en de seed van de chart declareert haar als de standaardrunner |
| [Het installatieprogramma](../installation/installer.html) | Docker Compose of de Helm-chart zoals hierboven, of een systemd-service [zonder containers](../installation/native.html); een eigen Runner, die vraagt om lid te worden en wacht op de goedkeuring van een admin |

De container-engine is van jou: Docker of Podman op de host, of de container-runtime van je Kubernetes-cluster, door jou geïnstalleerd en
bijgehouden. AnsibleForms praat er nooit mee. Noch de app noch de RTE roept Docker of Podman aan, koppelt hun socket, of start een
container: de app praat alleen met de RTE over haar socket.

**Wat erin zit.** Eén container, met wat nodig is om een playbook te draaien en niets meer:

* **De server** : dezelfde Node.js-server als de app, gestart met `AF_ROLE=rte` (ingesteld in de image) onder `tini`
* **Weggelaten** : de webinterface, de aanmelding, de planner, de worker en elke databasemodule, die deze rol niet laadt
* **Waarop ze luistert** : haar `PORT` (`8000`): `/live` en `/ready` voor probes en `/metrics` voor Prometheus, en bij inkomend de socket
  die de app belt, `/rte/v1/socket`. Een uitgaande RTE neemt geen verbinding van de app aan
* **Python en ansible** : meegebracht door de imagelaag die je kiest (zie [De RTE-images](images.html))
* **De gebruiker** : de server en elk playbook draaien als `node` (uid 1000), nooit als root

**Wat ze met de app deelt.** Haar token, en met `RTE_FILES=local` de bestanden van de app. Met `RTE_FILES=transfer`, de standaard, komen de
playbooks en inventories met elke job mee, en heeft de RTE geen gedeelde schijf nodig:

| Gedeeld met de app | Wat de RTE ermee doet |
|---|---|
| `RTE_TOKEN` | Presenteert het als ze de app belt (uitgaand), of controleert het als de app haar belt (inkomend). De app bewaart dezelfde waarde in de RTE-referentie van de runner, en de geheimen van de job worden ermee verzegeld |
| Het persistente volume, `/app/dist/persistent`, alleen met `RTE_FILES=local` | De playbookmap ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)), of de playbookrepository die de worker onder [`REPO_PATH`](../customization/paths.html#env_REPO_PATH) heeft gekloond, de inventories ([`INVENTORY_PATH`](../customization/paths.html#env_INVENTORY_PATH) en de inventoryrepositories) en de uploads. De RTE schrijft de extravars-bestanden van de job in de playbookmap, dus koppel die met lees- en schrijfrechten |
| De ssh-map, `/home/node/.ssh` | De privésleutel en de `known_hosts` die de ssh-verbindingen van het playbook gebruiken: koppel die van de app, beheerd op de instellingenpagina's, of geef de RTE een eigen |

De RTE kloont niets: een repository bereikt haar in de bestanden van een job, of op het volume dat ze met de app deelt. Collecties, rollen en
`ansible.cfg` komen uit de image, uit de mappen `/etc/ansible/collections`, `/etc/ansible/roles` en `/etc/ansible/ansible.cfg` als
je ze daar koppelt (het Docker Compose-project doet dat), of uit een `ansible.cfg` naast de playbooks.

**Het leven van een job.** De nummers hieronder zijn de nummers in het diagram, voor een playbookformulier dat vanuit de browser of de API wordt gestart:

1. **Starten** : de app controleert het formulier en zijn waarden, bouwt de extravars en slaat de job op met status `running`. Een formulier met een
   [goedkeuring](../forms/approval.html) stopt hier totdat een goedkeurder het accepteert, en bereikt daarvoor geen RTE
2. **De runner kiezen** : de app neemt de RTE die het formulier noemt met `runner: <name>`, anders de standaardrunner van het type RTE, en slaat de
   naam ervan op de job op. Ze lost de referenties van de job op uit de database of een [secret store](../secret-stores/), de ansible-aanmelding en het
   vault-wachtwoord, en verzegelt ze met AES-256-GCM onder een sleutel die is afgeleid van het token van die runner en het job-id
3. **Overdracht** : de app-node die de socket van de RTE vasthoudt, stuurt haar de job: de extravars, de opties van het formulier, de verzegelde geheimen en
   de hashes van de bestanden van de job. Elke app-node mag de job starten; degene die de socket vasthoudt, stuurt hem binnen twee seconden. Een volle RTE,
   of een die niet verbonden is, laat de job wachten, tot [`RTE_QUEUE_MINUTES`](../customization/server.html#env_RTE_QUEUE_MINUTES)
4. **Claimen** : de RTE antwoordt `claimed`, of `refused` als ze vol is, stopt, de geheimen niet kan openen, of de job met een ander
   [contract](images.html#the-contract) komt dan het hare. Met `RTE_FILES=transfer` haalt ze de playbooks en de inventories op hun hash uit haar
   cache, vraagt de app om een hash die ze niet heeft, en pakt ze uit in een eigen map van de job
5. **Starten van het proces** : in de playbookmap (plus de `playbookSubPath` van het formulier, die moet bestaan) schrijft ze twee bestanden: `extravars_<id>.json`
   met de waarden van het formulier en de referenties, en een verborgen bestand met de ansible-aanmelding. Daarna start ze `ansible-playbook` als haar eigen
   kindproces, zonder shell, in een eigen procesgroep, met `-e @` die bestanden, één `-i` per inventory, en de tags, limit, check,
   diff en verbosity van het formulier. Het vault-wachtwoord gaat via stdin naar binnen, nooit in een bestand of op de opdrachtregel, en het proces draait als
   `node` met een gefilterde omgeving (zie hieronder)
6. **Draaien** : het playbook maakt vanuit de RTE-container verbinding met de beheerde hosts, via ssh met de sleutel en de `known_hosts` van
   `/home/node/.ssh`, met `sshpass` voor een aanmelding met wachtwoord, of via de API's die de modules aanroepen. De RTE, niet de app, moet ze kunnen bereiken
7. **Uitvoer en einde** : de RTE bundelt stdout en stderr elke halve seconde of per 64 KB, met de referenties gemaskeerd, en nummert elke
   bundel. Ze schrijft elk item naar de spool van de job op haar schijf voordat ze het verstuurt: de uitvoer, de events, het joblog van
   `.joblogs/job_log_<id>.log` (elke 2 seconden), de start en het einde met de eindstatus (`success`, `failed` of `aborted`). De app
   slaat elk item één keer op en bevestigt het, en de RTE gooit de spool weg zodra het einde is opgeslagen. Boven
   [`PROCESS_MAX_BUFFER`](../customization/server.html#env_PROCESS_MAX_BUFFER) bytes op een stream (standaard 50 MB) stuurt ze niets meer, en
   gaat het playbook door. De app verstuurt dan de [meldingen](../forms/notifications.html) van het formulier
8. **Volgen** : de browser praat nooit met de RTE: de formulierpagina leest de job elke 2 seconden opnieuw via de app, en de pagina Jobs
   volgt hem live terwijl de app elk item opslaat

**Een verbroken socket.** Het playbook gaat door. De RTE belt opnieuw (uitgaand), of een app-node belt haar opnieuw (inkomend), en stuurt opnieuw wat
de app nog niet had bevestigd: de app slaat over wat ze al had opgeslagen, zodat geen regel verloren gaat of twee keer wordt opgeslagen. Dat geldt zolang de socket
binnen twee minuten terug is: de app schrijft de heartbeat van de RTE alleen zolang haar socket open is, en zodra die heartbeat twee minuten
oud is, beëindigt de worker de lopende jobs van de RTE als verlaten, ook als hun playbooks nog draaien. Houd de spool
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) op een volume, zodat een herstarte RTE nog verstuurt wat ze had bewaard. Een
playbook dat draaide toen zijn RTE herstartte, kan niet doorgaan: de app beëindigt zijn job als verlaten wanneer de RTE zonder hem terugkomt.

**Afbreken.** Een afbreking zet de afbreekvlag van de job, en de app-node die de socket van de RTE vasthoudt, stuurt binnen twee seconden `cancel`. De RTE
stuurt `SIGTERM` naar de procesgroep van het playbook, zodat `ansible-playbook` en elke fork die het startte samen stoppen, en de job eindigt
als `aborted`. Een cancel die vóór zijn job aankomt, wordt een minuut bewaard, en de job start dan afgebroken.

**Opruimen.** Zodra het proces eindigt, wat de uitkomst ook is, verwijdert de RTE beide extravars-bestanden (een formulier met `keepExtravars`
houdt het zichtbare, nooit het verborgen), het artifactsbestand in `/tmp`, het joblogbestand en de eigen map met bestanden van de job. Het
einde wordt één keer opgeslagen: een tweede schrijver, zoals de app die een job laat mislukken die de RTE al had beëindigd, verandert niets.

**Eén proces per job, niet één container per job.** AWX en AAP starten voor elke job een nieuwe pod of container vanuit een execution environment-image.
AnsibleForms start niets: de RTE-container draait al, en elke job is een kindproces daarin. Een job start
zonder een image te pullen of een pod te schedulen, en AnsibleForms heeft geen rechten op je container-engine of cluster nodig. Daar staat tegenover dat de
playbooks die op één RTE draaien haar CPU, geheugen, `/tmp`, thuismap en python delen: geef de container genoeg resources voor
`RTE_MAX_JOBS` playbooks met hun forks. Wijzig de image om te veranderen wat een playbook kan gebruiken, niet de job.

---

## De beveiligingsgrens

De RTE draait code die formulierauteurs hebben geschreven, dus ze is gebouwd om zo weinig mogelijk te bevatten:

* **Alleen haar token** : de RTE bevat geen databasereferenties en geen `ENCRYPTION_SECRET`. Ze neemt geen aanroep aan behalve de socket van de app, met
  haar token, en heeft geen gebruikers, geen aanmelding en geen webpagina's. Over de socket kan ze alleen de jobs draaien die de app haar stuurt, erover rapporteren en
  om hun bestanden vragen: ze kan geen job aanmaken, geen andere job lezen en geen referenties uitdelen
* **Verzegelde geheimen** : om een job te draaien leest de RTE nooit de tabel met referenties of een secret store. Ze krijgt de geheimen van de jobs die ze
  draait, verzegeld voor alleen haar token en dat job-id, zodat een bundel die voor een andere RTE of een andere job bedoeld is niet opengaat, en een gewijzigde byte
  wordt geweigerd
* **Een gecontroleerde verbinding** : bij uitgaand controleert de RTE het certificaat van de app. Bij inkomend via HTTPS pint de app het eigen certificaat van de RTE
  wanneer die lid wordt, en belt haar alleen als ze dat certificaat presenteert (zie [Modi](modes.html#inbound)). Een inkomende RTE via gewone HTTP hoort
  op een privénetwerk, zoals dat van het Docker Compose-project
* **Geen overgeërfde omgeving** : `ansible-playbook` krijgt de omgeving van de RTE zonder elke variabele die AnsibleForms zelf leest
  (`ENCRYPTION_SECRET`, `DB_PASSWORD`, `RTE_TOKEN`, `VAULT_TOKEN`, `ACCESS_TOKEN_SECRET`, de `MYSQL_*`-variabelen en de andere), zodat
  `lookup('env', ...)` ze niet kan bereiken. Wat je voor playbooks instelt (`PATH`, proxy's, `ANSIBLE_*`) gaat ongewijzigd door
* **Geen templates van gebruikers** : {% raw %}een formulierwaarde die `{{`, `{%` of `{#` bevat, bereikt het playbook als een unsafe string{% endraw %}
  die ansible nooit templatet, tenzij het formulier `allowJinjaInExtravars` instelt, en geen enkele shell draait ooit de opdrachtregel
* **Niet root** : de RTE en haar playbooks draaien als `node` (uid 1000), dus een playbook kan doen wat die gebruiker in de container kan, zoals
  haar bestanden en de ssh-sleutel lezen, en niets meer

Behandel haar container, haar image en haar omgeving met dezelfde zorg als die van de app.

---

## Databasemodus (verouderd)

De RTE van 7.0 tot en met 7.2, zonder `RTE_MODE`, draait door heel 7.x en wordt in 8.0.0 verwijderd. Ze verschilt op vier punten van de stappen hierboven:

* **Ze heeft de database** : haar `DB_*`-instellingen, en `ENCRYPTION_SECRET` als ze zichzelf registreert
  ([`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER))
* **De overdracht is een HTTP-aanroep** : de app roept `POST <address>/rte/v1/jobs` aan met het token en de verzegelde geheimen, en de RTE claimt
  de job door haar naam erop te schrijven in de database (stappen 3 en 4)
* **Ze schrijft de uitvoer zelf** : in de database, in bundels, zonder spool (stap 7). Een afbreking bereikt haar via de afbreekvlag van de job,
  die ze elke 2 seconden leest, en een aanroep `/cancel`
* **Ze leest de bestanden van het volume van de app** : ze heeft dezelfde schijf nodig als de app, zoals bij `RTE_FILES=local`

Haar runnerpagina heeft geen van de [RTE-instellingen](../runners/runner-page.html#an-rtes-settings): ze leest haar eigen variabelen. Zie
[Modi](modes.html#database-deprecated) om haar naar een socketmodus te verplaatsen.
