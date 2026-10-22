---
layout: default
title: Installatieprogramma
parent: Installatie
nav_order: 1
translated_from: 72dbe0a987c93d1b54d1972827c2b26e8cad5fe9
---

# Het installatieprogramma
{: .no_toc }

Installeer, upgrade en onderhoud AnsibleForms op een Linux-server, met één commando
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders: de snelste weg naar een werkende instantie, of naar een Runner voor een AnsibleForms dat elders is geïnstalleerd. Sinds 7.3.0.

---

## Wat het installeert

Het installatieprogramma stelt een paar vragen in een wizard op volledig scherm, toont elk antwoord ter controle, en past pas daarna de server aan.
Het installeert een van twee rollen, op een van vier engines:

| Rol | Wat het is |
|---|---|
| Controller | De complete applicatie: de webinterface, de database en een eigen Runner. Kies dit voor een eerste installatie |
| Runner | Een RTE die de playbooks uitvoert van een AnsibleForms dat elders is geïnstalleerd, bijvoorbeeld in een ander netwerk, een DMZ of een ander datacenter. Hij praat met AnsibleForms over één WebSocket en bevat geen database-inloggegevens |

De engines waarop het ze installeert:

| Engine | Hoe het draait |
|---|---|
| Docker | Het [Docker Compose-project](docker-compose.html), op Docker Engine met de compose-plugin. De containers herstarten samen met Docker |
| Podman | Hetzelfde project op Podman, rootless of als root, met podman-compose. Een systemd-unit start de containers bij het opstarten |
| Kubernetes | De [Helm-chart](kubernetes.html), op het cluster dat `kubectl` bereikt. Een controller wordt achter een ingress geserveerd; een Runner gebruikt de runnermodus van de chart |
| Direct op deze server | Geen containers: Node.js, MariaDB en Ansible op de server, en AnsibleForms als systemd-services. Zie [Native installatie](native.html) |

Na de installatie upgradet hetzelfde programma de installatie, maakt er back-ups van, toont de status en verwijdert haar. Het neemt ook een
AnsibleForms over dat het niet zelf heeft geïnstalleerd, zoals een installatie die met de hand vanuit het Docker Compose-project is opgezet (zie [Een bestaande installatie](#an-existing-installation)).

---

## Starten

Het installatiescript downloadt het installatieprogramma voor deze server en start het:

```bash
curl -fsSL https://ansibleforms.com/install | sh
```

De gebruikelijke varianten: als root, om Docker of Podman te installeren, om direct op de server of onder `/opt` te installeren; met een commando of
flags (zie [Flags](#flags)); en een installatieprogramma van een bepaalde release in plaats van de nieuwste:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh
curl -fsSL https://ansibleforms.com/install | sh -s -- --lang es
curl -fsSL https://ansibleforms.com/install | AF_INSTALLER_VERSION=7.3.0 sh
```

Het script:

1. Controleert dat de server Linux draait op amd64 of arm64, en zoekt `curl` of `wget` en `sha256sum`
2. Downloadt `ansibleforms-installer_linux_<arch>` uit de nieuwste release van
   [ansibleforms/installer](https://github.com/ansibleforms/installer/releases), of uit de release die `AF_INSTALLER_VERSION` noemt
3. Controleert het tegen de `checksums.txt` van de release, en gebruikt geen download waarvan de checksum afwijkt
4. Bewaart het als `ansibleforms-installer`, in `/usr/local/bin` voor root en anders in `~/.local/bin`, voor de latere upgrades en back-ups.
   Via sudo start je het met het volledige pad: de `secure_path` van sudo laat, zoals op Red Hat-systemen, vaak `/usr/local/bin` weg
5. Start het met de opgegeven flags, en leest het toetsenbord vanaf de terminal, ook al kwam het script via een pipe binnen

Zonder terminal, zoals in een CI-job, draait het installatieprogramma zonder toezicht (zie [Zonder toezicht](#unattended)).

---

## De wizard

De wizard stelt één vraag tegelijk, met de stappen links op een rij. **Esc** gaat terug naar de vorige stap, met het antwoord bewaard:

| Stap | Wat hij vraagt |
|---|---|
| Taal | De taal van het installatieprogramma, standaard volgens de locale van deze server: Catalaans, Duits, Engels, Spaans, Frans, Italiaans, Japans, Nederlands, Pools, Portugees of Chinees. Wordt als eerste gevraagd, voordat het installatieprogramma iets zegt over een installatie die het heeft gevonden |
| Release notes | Wat er nieuw is in de versie die het installeert, met eerst de breaking changes, verwijderingen en afschaffingen |
| Rol | Controller of Runner |
| Engine | Docker, Podman, Kubernetes, of direct op deze server |
| Map | De installatiemap, en de naam van de instantie |
| Join, App, Modus | Alleen bij een Runner: zie [Een Runner](#a-runner). De modus niet op Kubernetes |
| Netwerk | De poort van de webinterface, of van de Runner. Niet op Kubernetes |
| HTTPS | Hoe browsers verbinding maken met een controller |
| Beheerder | Het wachtwoord van de eerste beheerder, twee keer ingetypt |
| Cluster, Ingress, Opslag | Alleen Kubernetes: de namespace en release, de ingress (bij een controller), de storage-klasse |
| Controle | Elk antwoord: **Installeren**, of **Antwoorden wijzigen** |

**Engine.** De lijst toont wat deze server heeft. Een engine die ontbreekt wordt aangeboden als *Docker (niet geïnstalleerd: het installatieprogramma installeert het)*
of hetzelfde voor Podman: zodra je bevestigt, installeert het installatieprogramma Docker met het eigen script van Docker (`get.docker.com`, compose-plugin
inbegrepen) of Podman met podman-compose uit de pakketten van de distributie. Daarvoor is root nodig. Kubernetes wordt aangeboden als `kubectl` en
`helm` geïnstalleerd zijn en een cluster bereiken. *Direct op deze server* vereist root en een ondersteunde Linux, en zegt waarom als de optie grijs is.

**Map.** De standaardwaarden:

| | Controller | Runner |
|---|---|---|
| Map, als root | `/opt/ansibleforms` | `/opt/ansibleforms-runner` |
| Map, als andere gebruiker | `~/ansibleforms` | `~/ansibleforms-runner` |
| Naam van de instantie, Docker of Podman | `af` | `runner` |
| Naam van de instantie, native | `ansibleforms` | `ansibleforms-runner` |

Met Docker of Podman bevat de map het compose-bestand en de `.env` ervan met de secrets, en alle gegevens: database, formulieren, playbooks
en logs. Hij moet leeg zijn. De naam van de instantie, kleine letters, cijfers en `-`, is het voorvoegsel van de containers (`af_app`, `af_db`, `af_rte`), zodat meerdere
instanties een server kunnen delen. De naam van de instantie van een Runner is ook de naam van zijn runner onder **Verbindingen > Runners** (`RTE_NAME`).

**Netwerk.** De webinterface van een controller luistert op `443`, of op de eerstvolgende vrije poort. **HTTPS** biedt daarna:

| Keuze | Wat het doet |
|---|---|
| HTTPS met een zelfondertekend certificaat voor deze server | Een certificaat voor de namen van deze server, tien jaar geldig. Browsers vragen je het één keer te accepteren |
| HTTPS met mijn eigen certificaat en sleutel | Je eigen certificaat en sleutel, in PEM-formaat, van je CA of van Let's Encrypt |
| HTTP, met HTTPS via een reverse proxy ervoor | Gewoon HTTP op de poort, voor nginx, Traefik of een load balancer die HTTPS afhandelt |

**Beheerder.** Het wachtwoord van de gebruiker `admin`, twee keer ingetypt zodat een tikfout je niet buitensluit. Laat je het leeg, dan genereert het installatieprogramma
een sterk wachtwoord.

**Het einde.** Het installatieprogramma genereert het databasewachtwoord en de secrets, start AnsibleForms en wacht tot het antwoordt. Daarna
toont het het adres om te openen, de gebruiker en het wachtwoord, en de map. Runners die ervoor geïnstalleerd worden vragen om aan te sluiten, en een beheerder keurt ze
goed onder **Verbindingen > Runners** (zie [Een Runner](#a-runner)).

---

## Een Runner

Een Runner is een RTE voor een AnsibleForms dat elders draait, op versie 7.3.0 of later. Hij bevat geen database-inloggegevens: hij meldt zich aan
met een eigen token, dat AnsibleForms in een RTE-referentie bewaart (zie [Modi](../rte/modes.html)). Na de map vraagt de wizard
nog drie dingen:

| Stap | Wat hij vraagt |
|---|---|
| App | Het adres van het AnsibleForms waarvoor deze Runner werkt, het adres dat mensen in een browser openen |
| Modus | **Uitgaand: de Runner maakt verbinding met AnsibleForms** (de standaard), of **Inkomend: AnsibleForms maakt verbinding met de Runner** |
| Netwerk | De poort van de Runner, standaard `8000`. Bij uitgaand luisteren daar alleen de health checks, en alleen bereikbaar vanaf deze server. Bij inkomend ook het adres van deze server zoals AnsibleForms het bereikt |

`--role runner` slaat de vraag naar de rol over, dus dit commando, uitgevoerd op de server van de Runner, begint met de vragen voor een Runner:

```bash
curl -fsSL https://ansibleforms.com/install | sh -s -- install --role runner
```

Het installatieprogramma maakt daarna verbinding met AnsibleForms. Bij een zelfondertekend certificaat, of een van een private CA, vraagt het **Dit certificaat vertrouwen?**:
ja zet [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY) op de Runner. Het leest de versie die AnsibleForms draait,
weigert een versie ouder dan 7.3.0, en installeert de Runner met precies die versie, ongeacht welke versie het installatieprogramma zelf zou installeren.

Kies uitgaand voor een DMZ, NAT of een zone die geen inkomende verbindingen toestaat: alleen verkeer van deze server naar AnsibleForms, op de
poort daarvan. Kies inkomend voor netwerken waar de centrale kant elke verbinding opent.

De controle toont **Registratie: vraagt goedkeuring**, of **zelf, met een jointoken** als `--join` er een gaf. Aan het eind toont het installatieprogramma
de naam van de Runner, de modus, de app en, bij inkomend, het adres, en zegt dan dat de Runner gevraagd heeft om bij AnsibleForms aan te sluiten: keur hem goed onder
**Verbindingen > Runners**, nadat je hebt gecontroleerd dat de vingerafdruk die daar staat dezelfde is als die het installatieprogramma toont:

```
Fingerprint: abcd-ef12
```

De vingerafdruk bestaat uit de eerste 8 hexadecimale cijfers van de SHA-256 van het token van de Runner, `RTE_TOKEN`, dat in het `.env`-bestand
van de map wordt bewaard (`rte.env` bij een [native installatie](native.html)). Zie [Een RTE goedkeuren](../runners/registration.html#approving-an-rte). Met `--join` is de Runner meteen goedgekeurd:
hij heeft zichzelf geregistreerd, en staat als verbonden onder **Verbindingen > Runners**.

Een inkomende Runner serveert zijn socket over HTTPS. Het installatieprogramma maakt een zelfondertekend certificaat voor het adres waarop AnsibleForms
hem bereikt, tien jaar geldig, in `data/certificates` van de map, en zet `RTE_URL` op `https://<address>:<port>`.
De Runner stuurt het certificaat mee als hij vraagt om aan te sluiten, en AnsibleForms pint het: het belt die Runner alleen aan als die
precies dat certificaat toont, dus er is geen CA nodig. Het installatieprogramma toont de vingerafdruk van het certificaat onder die van het token:

```
Fingerprint: abcd-ef12
Certificate fingerprint: 3f9c-07a1
```

Het zijn de eerste 8 hexadecimale cijfers van de SHA-256 van de DER-bytes van het certificaat, als `xxxx-xxxx`. Controleer voordat je de Runner goedkeurt
dat het goedkeuringsvenster dezelfde certificaatvingerafdruk toont. Een Runner die met `--join` is geregistreerd toont hem ook.

Op Kubernetes is een Runner de runnermodus van de Helm-chart, en altijd uitgaand: de wizard vraagt geen modus en geen netwerk, omdat niets
hem van buitenaf bereikt (zie [Kubernetes](#kubernetes)).

---

## Kubernetes

Voor een controller op Kubernetes installeert het installatieprogramma de [Helm-chart](kubernetes.html) op het cluster dat `kubectl` bereikt:

| Vraag | Standaard |
|---|---|
| Namespace | `ansibleforms` |
| Naam van de Helm-release | `ansibleforms` |
| Hostnaam van de ingress | Geen: verplicht, bijvoorbeeld `ansibleforms.example.com` |
| Ingress-klasse | Een van die van het cluster, standaard `nginx` |
| Aanbieden via HTTPS (met het certificaat van de ingress)? | Ja |
| Storage-klasse voor de volumes | De standaard van het cluster |

Het beheerderswachtwoord staat in de Secret `<release>-secrets` van die namespace, onder de sleutel `ADMIN_PASSWORD`. Het installatieprogramma bewaart de
chartwaarden in een bestand naast zijn statusbestand, `<release>-values.yaml`, en past het bij upgrades opnieuw toe; met `--values` voeg je een eigen bestand toe. De chart van een release wordt kort na de release gepubliceerd.

Voor een Runner installeert het installatieprogramma dezelfde chart in de [runnermodus](kubernetes.html#a-runner-on-kubernetes) (`runner.enabled`): een RTE
alleen, zonder app, zonder database en zonder ingress, die AnsibleForms aanbelt (uitgaand). Na het adres van de app vraagt de wizard:

| Vraag | Standaard |
|---|---|
| Namespace | `ansibleforms` |
| Naam van de Helm-release | `ansibleforms-runner`, wat ook de naam van zijn runner is onder **Verbindingen > Runners** |
| Storage-klasse voor de volumes | De standaard van het cluster |

Het installatieprogramma maakt het token van de Runner en stelt het adres van de app in, de naam van de runner en, als je het certificaat van de app vertrouwt,
`runner.appTlsVerify: false`. Met `--join` keurt het jointoken de Runner meteen goed; zonder vraagt de Runner om aan te sluiten, en het
installatieprogramma toont de vingerafdruk die je controleert voordat je hem goedkeurt onder **Verbindingen > Runners**.

---

## Commando's

Het installatieprogramma neemt een commando, voor of na de flags. Zonder commando installeert het:

| Commando | Wat het doet |
|---|---|
| `install` | Installeert AnsibleForms, als controller of als Runner (de standaard). Op een server die al een installatie heeft, een eigen of een die het vindt, biedt het aan die te upgraden |
| `upgrade` | Upgradet naar een nieuwere versie, en toont eerst de release notes (zie [Upgraden](#upgrade)) |
| `status` | Toont de installatie (rol, engine en versie) en de containers, pods of services ervan, en of die antwoordt. Daarna somt het elk ander AnsibleForms op dat het op de server vindt |
| `backup` | Maakt nu een back-up van de database, in `installer-backups` in de installatiemap (op Kubernetes in `backups` naast het statusbestand van het installatieprogramma). Een Runner bevat geen gegevens om te back-uppen |
| `release-notes` | Toont de release notes van een versie, `--version` of die van dit installatieprogramma, met de breaking changes eerst |
| `uninstall` | Verwijdert de installatie, en met `--purge` ook de gegevens |
| `version` | Toont de versie van het installatieprogramma |

Het installatieprogramma onthoudt de installatie in `/etc/ansibleforms/installer.json` voor root, of `~/.config/ansibleforms/installer.json`
voor een andere gebruiker, dus de commando's na `install` hebben geen flags nodig en vinden de installatie zelf. Die map bevat geen binary,
en bestaat pas zodra het installatieprogramma een AnsibleForms heeft geïnstalleerd of overgenomen:

```bash
sudo /usr/local/bin/ansibleforms-installer status
sudo /usr/local/bin/ansibleforms-installer backup
sudo /usr/local/bin/ansibleforms-installer upgrade
```

`uninstall` vraagt **Ook de gegevens verwijderen (database, formulieren, playbooks, logs)?**. Om ze te verwijderen typ je de naam van de instantie (de Helm-release
op Kubernetes); anders verwijdert het de containers, pods of services en houdt het de gegevens.

---

## Flags

Elke flag beantwoordt een vraag, die de wizard dan overslaat. `ansibleforms-installer --help` toont ze:

| Flag | Wat hij beantwoordt |
|---|---|
| `--lang <code>` | De taal: `ca`, `de`, `en`, `es`, `fr`, `it`, `ja`, `nl`, `pl`, `pt` of `zh` |
| `--version <version>` | De versie van AnsibleForms om te installeren of naar te upgraden; standaard die van dit installatieprogramma |
| `--role <role>` | `controller` of `runner` |
| `--mode <mode>` | `compose`, `kubernetes` of `native` |
| `--runtime <runtime>` | `docker` of `podman` (compose) |
| `--install-runtime` | Installeert Docker of Podman als het ontbreekt, zonder te vragen |
| `--dir <folder>` | De installatiemap (compose) |
| `--name <name>` | De naam van de instantie, het voorvoegsel van de containers (compose, standaard `af`) |
| `--port <port>` | De poort op de host: de webinterface bij een controller, de RTE bij een Runner |
| `--tls <choice>` | `self`, `own` of `off` (een compose-controller) |
| `--cert <file>`, `--key <file>` | De certificaat- en sleutelbestanden, met `--tls own` |
| `--admin-password <password>` | Het wachtwoord van de eerste beheerder; standaard gegenereerd |
| `--join <token>` | Een jointoken (`afj_...`), gemaakt via de API, dat de Runner meteen goedkeurt (een Runner, zonder toezicht; zie [Jointokens](../runners/registration.html#join-tokens)) |
| `--app-url <address>` | Het adres van de app, bijvoorbeeld `https://forms.example.com` (een Runner) |
| `--runner-mode <mode>` | `outbound` (de RTE belt de app aan) of `inbound` (de app belt de RTE aan) (een Runner) |
| `--host <address>` | Het adres van deze server, dat de app aanbelt (een inkomende Runner) |
| `--namespace <namespace>` | De Kubernetes-namespace, standaard `ansibleforms` |
| `--release <release>` | De Helm-release, standaard `ansibleforms` |
| `--hostname <name>` | De hostnaam van de ingress (kubernetes) |
| `--ingress-class <class>` | De ingress-klasse (kubernetes) |
| `--storage-class <class>` | De storage-klasse (kubernetes) |
| `--values <file>` | Een extra Helm-valuesbestand (kubernetes) |
| `--purge` | Met `uninstall`: verwijdert ook de gegevens |
| `--source <folder>` | Een lokale kopie van de repository [ansibleforms/docker](https://github.com/ansibleforms/docker) om vanuit te installeren (air-gapped) |
| `--bundle <file>` | Een releasebundel, `ansibleforms-<version>-linux-<arch>.tar.gz`, om native vanuit te installeren (zie [Native installatie](native.html#air-gapped)) |
| `--yes` | Beantwoordt elke vraag met de standaardwaarde (zonder toezicht) |
| `--verbose` | Toont elk commando dat het uitvoert |

---

## Zonder toezicht

Met `--yes`, of zonder terminal, vraagt het installatieprogramma niets: de flags beantwoorden hun vragen en de standaardwaarden de rest. Het
slaat de taal, de release notes, het beheerderswachtwoord (gegenereerd, tenzij `--admin-password` er een geeft) en de controle over, en toont
in plaats daarvan de link naar de release notes. Het installeert een ontbrekend Docker of Podman alleen met `--install-runtime` of `--yes`, en een Runner
heeft `--app-url` nodig. Zonder `--join` vraagt de Runner om aan te sluiten en wacht hij op goedkeuring door een beheerder; met `--join` is hij meteen goedgekeurd.

Een controller op Docker, die Docker installeert als het ontbreekt:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role controller --runtime docker --install-runtime --tls self --admin-password '<password>'
```

Een inkomende Runner op Podman, die de app aanbelt op `rte-dmz.example.com:8000`:

```bash
curl -fsSL https://ansibleforms.com/install | sudo sh -s -- install --yes \
  --role runner --runtime podman --install-runtime --app-url https://forms.example.com --join afj_<...> \
  --runner-mode inbound --host rte-dmz.example.com --port 8000
```

---

## Een bestaande installatie

Het installatieprogramma onthoudt wat het heeft geïnstalleerd in `installer.json`. Zonder dat bestand zoeken `install`, `upgrade` en `status` eerst naar een
AnsibleForms dat al op de server staat, ongeacht wat het heeft geïnstalleerd:

| Gevonden | Hoe het wordt gevonden | Overgenomen als |
|---|---|---|
| Docker of Podman | Containers van de app- of RTE-image, gegroepeerd per compose-project | De map het compose-bestand en de `.env` van de repository [ansibleforms/docker](https://github.com/ansibleforms/docker) bevat: de services `mysqldb`, `app` en `rte`, in de containers `<name>_db`, `<name>_app` en `<name>_rte` |
| Een 7.2-Runner | Een RTE alleen in zijn compose-project, met de `DB_*` van de app en zonder `RTE_MODE` (databasemodus) | Het compose-bestand leesbaar is. De upgrade zet hem over naar een socketmodus (zie [Een 7.2-Runner](#a-72-runner)) |
| Kubernetes | Helm-releases van de chart `ansibleforms`, en Deployments en StatefulSets van de images ervan | Het een release van de chart is: de huidige waarden worden het valuesbestand |
| Native | systemd-services die AnsibleForms met Node.js draaien | Ze de indeling van het installatieprogramma volgen: `releases/`, `current`, `app.env` en `rte.env` (zie [Native installatie](native.html#the-folder)) |
| Geen engine | De app of een RTE die antwoordt op een gebruikelijke poort: 443, 3000, 3001, 8000, 8001, 8010 of 8443 | Nooit: het draait vanuit de broncode of met de hand. Het installatieprogramma meldt het alleen |

Alleen de images van de app en de RTE tellen: een MySQL-container met een naam die naar AnsibleForms verwijst is geen installatie. Het installatieprogramma somt op wat
het vond, één regel per installatie, met de reden en wat je met de hand moet doen voor een installatie die het niet kan overnemen: het compose-bestand is niet dat van de repository,
de database staat buiten het compose-project, het draait op Kubernetes zonder de Helm-chart, het wordt beheerd door Argo CD (upgrade het daar,
door de chartversie van de Application te wijzigen), of de versie kan niet worden gelezen.

Voor een installatie die het kan overnemen, biedt `install` drie keuzes:

| Keuze | Wat het doet |
|---|---|
| Overnemen en upgraden | Toont wat het gaat onthouden, schrijft `installer.json` zodra je bevestigt, en gaat verder met de [upgrade](#upgrade) |
| Toch een nieuw AnsibleForms ernaast installeren | Een tweede installatie, met een eigen map, poorten en database, na een eigen bevestiging |
| Stoppen | Er wordt niets gewijzigd |

Voor een installatie die al de versie draait die het installatieprogramma zou installeren, is de eerste keuze in plaats daarvan **Overnemen**: het installatieprogramma
onthoudt waar ze staat en hoe ze draait, voor de back-ups, de status en de volgende upgrades, en er wordt nu niets gewijzigd.

`upgrade` biedt hetzelfde zonder de tweede keuze, en stopt als er niets over te nemen valt. Zonder toezicht stopt `install` met een melding,
en neemt `upgrade --yes` een installatie alleen over als het er precies één vindt die het kan overnemen. De huidige waarden van een Kubernetes-release worden
naast `installer.json` opgeslagen, en de upgrades passen ze opnieuw toe met de chart van de nieuwe versie.

---

## Upgraden

`ansibleforms-installer upgrade` brengt de installatie naar een nieuwere versie van dezelfde hoofdversie. Het toont de nieuwere versies,
de nieuwste eerst (zonder toezicht neemt het de nieuwste), en toont de release notes van elke versie die het passeert, met de breaking changes
en verwijderingen eerst. Als die breaking changes bevatten, vraagt het je te bevestigen dat je ze gelezen hebt; zonder toezicht gaat het alleen door met `--yes`.

Het installatieprogramma maakt een back-up van de database voordat er iets verandert. Als de nieuwe versie niet reageert, biedt het aan terug te draaien: de vorige
versie komt terug, en de database wordt uit die back-up hersteld. Het downgradet niet, en het gaat niet over een hoofdversie heen: volg
daarvoor de [upgradegids](../upgrade-7.html), bijvoorbeeld van 6.x naar 7.x, met wat je op 6.5 moet doen voordat je upgradet.

Op Docker of Podman brengt de upgrade van een controller ook de bestanden bij met de nieuwe versie van de docker-repository:

| Bestand | Wat de upgrade doet |
|---|---|
| `docker-compose.yml` | Vervangen door dat van de nieuwe versie, nadat er een kopie is opgeslagen in `installer-backups` |
| `.env` | Elke bestaande regel blijft staan, en de sleutels die de nieuwe versie nodig heeft worden toegevoegd, met secrets gemaakt zoals een verse installatie ze maakt. Eerst wordt een kopie opgeslagen |
| `data/seed.yaml` | Vervangen als het een seed is die de docker-repository meeleverde, ongewijzigd. Een met de hand gewijzigde seed blijft staan, en de nieuwe wordt ernaast opgeslagen |
| `data/` | De nieuwe bestanden die de versie meebrengt, zoals een nieuw playbook, worden toegevoegd. Elk bestaand bestand blijft staan |

Een ontbrekende database-instelling (`MYSQLDB_USER` of een wachtwoord) kan niet worden verzonnen voor een database die al bestaat, dus dan stopt de upgrade vóór
enige wijziging. Een rollback zet het compose-bestand, de `.env` en de seed terug zoals ze waren.

Een Runner draait dezelfde versie als zijn AnsibleForms: upgrade eerst AnsibleForms, en daarna de Runners. De upgrade van een Runner herschrijft het
compose-bestand voor de nieuwe RTE-image en laat de `.env` en de gegevens zoals ze zijn.

---

## Een 7.2-Runner

Een Runner van 7.2 draait in databasemodus, verouderd sinds 7.3.0: zijn RTE bevat de database-instellingen van AnsibleForms. Het installatieprogramma vindt
hem (zie [Een bestaande installatie](#an-existing-installation)), en de upgrade zet hem over naar een socketmodus onder dezelfde runner:

1. Het leest de naam (`RTE_NAME`) en het token (`RTE_TOKEN`) van de runner uit de oude RTE-container. Als de RTE zichzelf niet registreerde
   (`RTE_REGISTER=0`), typ je de naam die zijn runner heeft onder **Verbindingen > Runners**
2. Het vraagt het adres van de app en de modus, standaard **uitgaand** of inkomend, en bij inkomend de poort en het adres van deze server
3. Het toont het plan, en maakt daarna een back-up van het oude compose-bestand en de `.env` in `installer-backups`
4. Het schrijft de Runner-indeling van het installatieprogramma zonder de `DB_*`-instellingen. Het behoudt `RTE_MAX_JOBS`, `RTE_DRAIN_SECONDS`,
   `PROCESS_MAX_BUFFER` en `METRICS_TOKEN`, die een RTE in socketmodus nog steeds leest
5. Het start de nieuwe RTE naast de oude. De nieuwe RTE meldt zich aan met het eigen token van de runner, en AnsibleForms zet de runner zelf over naar de
   nieuwe modus, **zonder goedkeuring**: de jobs ervan en de formulieren die hem noemen blijven ongewijzigd
6. Zodra de nieuwe RTE verbonden is, wordt de oude container gestopt en verwijderd

Een inkomende Runner serveert HTTPS met een gepind certificaat, net als een nieuwe (zie [Een Runner](#a-runner)), en het installatieprogramma toont de
vingerafdruk van het certificaat. Als de oude RTE de poort bezet die de nieuwe nodig heeft, wordt hij eerst gestopt, dus is de Runner offline tot de
nieuwe verbinding maakt. De nieuwe RTE van een uitgaande Runner neemt een vrije poort op `127.0.0.1` en draait zonder onderbreking naast de oude.

Als het installatieprogramma geen token uit de oude RTE kan lezen, kies je hoe de nieuwe RTE zich aanmeldt:

| Keuze | Wat er volgt |
|---|---|
| Het token van de runner typen | Het wachtwoord van de RTE-referentie van de runner onder **Verbindingen > Inloggegevens**. De runner behoudt zijn naam en jobs |
| Als nieuwe runner aansluiten met een jointoken | Een [jointoken](../runners/registration.html#join-tokens) voegt een nieuwe runner toe onder een andere naam. Zet de oude runner met de hand buiten gebruik |

Als de nieuwe RTE geen verbinding maakt, biedt het installatieprogramma aan de oude bestanden terug te zetten en de oude container opnieuw te starten; als AnsibleForms
de runner al had overgezet, zet je de modus terug op database onder **Verbindingen > Runners**. Zodra de nieuwe RTE verbonden is, is er
geen weg terug: de oude bestanden blijven in `installer-backups`.

Als AnsibleForms geen runner met die naam kent, vraagt de nieuwe RTE in plaats daarvan om aan te sluiten en wacht hij op goedkeuring. Wijs dat verzoek af onder
**Verbindingen > Runners**, en voer de upgrade opnieuw uit met de naam die de runner daar heeft.

---

## Versies

De versie van het installatieprogramma volgt die van de app: elke release van AnsibleForms komt met een installatieprogramma van dezelfde versie, dat er samen mee wordt uitgebracht, en
dat installatieprogramma installeert standaard die versie. Met `--version` installeer je een andere. Elke release op de
[Releases-pagina van het installatieprogramma](https://github.com/ansibleforms/installer/releases) heeft binaries voor Linux op amd64 en arm64, met hun
checksums.
