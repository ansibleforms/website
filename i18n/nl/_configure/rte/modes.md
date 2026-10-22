---
layout: default
title: Modi
parent: RTE
nav_order: 2
translated_from: fbf98e6673b13575df08bda488a4b2881bd87ec0
---

# Hoe een RTE met de app praat
{: .no_toc }

Uitgaand, inkomend of database: wie de verbinding opent, en wat erover gaat
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders: sinds 7.3.0 praat een RTE met de app over één WebSocket en bevat ze geen databasereferenties. Kies de modus
die past bij het netwerk ertussen: wie een verbinding mag openen naar wie, en via welke proxy's en firewalls die loopt.

---

## De drie modi

[`RTE_MODE`](../customization/server.html#env_RTE_MODE) op de RTE zegt hoe ze de app bereikt; haar runner heeft dezelfde **Modus**:

| Modus | Wie de verbinding opent | Wat de RTE bevat | Voor |
|---|---|---|---|
| `outbound` | De RTE belt de app op [`APP_URL`](../customization/server.html#env_APP_URL) en houdt één WebSocket open | Haar `RTE_TOKEN`, geen databasereferenties | Een DMZ, NAT, of een zone die geen inkomende verbindingen toestaat: van buitenaf bereikt niets de RTE |
| `inbound` | De app belt de RTE op het adres van haar runner en houdt één WebSocket open | Haar `RTE_TOKEN`, geen databasereferenties | Een netwerk waarin de centrale kant elke verbinding opent, een compose-project, een pod |
| `database` (verouderd) | De app roept de API van de RTE via HTTP aan, en de RTE leest en schrijft zelf de database van de app | De referenties van de database (`DB_*`) en `ENCRYPTION_SECRET` | Het gedrag van 7.0 tot en met 7.2, verwijderd in 8.0.0 |

Een RTE zonder `RTE_MODE` draait in heel 7.x in databasemodus, en logt bij het starten een waarschuwing `[DEPRECATED] This RTE runs in database mode`.
Een runner die vóór 7.3.0 is toegevoegd, heeft de modus **Database (verouderd)**; stel hem in op de modus waarin zijn RTE draait wanneer je haar overzet.

---

## Uitgaand

De RTE opent de verbinding, dus het werkt vanuit een netwerk dat helemaal geen inkomende verbinding accepteert:

* **De socket** : de RTE belt `APP_URL` met `/api/v2/rte/socket` erachter, via `wss://` (`ws://` voor een `http://`-adres), met haar
  `RTE_TOKEN` en de naam van haar runner, [`RTE_NAME`](../customization/server.html#env_RTE_NAME). Ze belt opnieuw als de socket wegvalt
* **De eerste keer** : ze vraagt om lid te worden, en haar runner wacht op de goedkeuring van een admin onder **Verbindingen > Runners**, verbonden
  maar zonder jobs (zie [Vragen om lid te worden](../runners/registration.html#asking-to-join)). Een jointoken,
  [`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), keurt haar meteen goed. Vanaf dan meldt ze zich aan met haar eigen token
* **Het netwerk** : alleen van de zone van de RTE naar de app, op de poort van de app, via een proxy als `HTTPS_PROXY` dat zegt. Een reverse
  proxy voor de app moet de WebSocket op dat pad doorlaten (zie [Runner-WebSockets](../production/reverse-proxy.html#runner-websockets))
* **Het certificaat** : het certificaat van de app wordt gecontroleerd. Noem een private CA met `NODE_EXTRA_CA_CERTS`, of schakel, alleen binnen één vertrouwd
  netwerk, de controle uit met [`APP_TLS_VERIFY=0`](../customization/server.html#env_APP_TLS_VERIFY)
* **De runner** : die heeft geen adres nodig, dus zijn RTE-referentie bevat alleen het token
* **Gereed** : `/ready` antwoordt `503` totdat de socket naar de app open is

Met meerdere app-nodes achter een load balancer houdt de node die de RTE bereikt haar socket vast. Elke node mag een job starten: de node die
de socket vasthoudt, stuurt hem naar de RTE, binnen twee seconden als de job op een andere node is gestart.

---

## Inkomend

De RTE luistert op haar `PORT`, en de app belt haar op het adres van haar runner, met `/rte/v1/socket` erachter en het token van de RTE. Met
meerdere app-nodes houdt er steeds één de socket van elke inkomende runner vast; als die node stopt, neemt een andere het over en belt opnieuw.

De app heeft de runner van de RTE nodig voordat hij haar kan bellen: type RTE, modus **Inkomend**, en een RTE-referentie met het adres van de RTE en haar
`RTE_TOKEN`. Die komt er op een van twee manieren:

| Hoe | Wat in te stellen |
|---|---|
| De RTE vraagt om lid te worden | `APP_URL` en [`RTE_URL`](../customization/server.html#env_RTE_URL) (het adres dat de app belt). De RTE doet één aanroep, `POST /api/v2/rte/register`, en haar runner wacht op de goedkeuring van een admin: de app belt haar zodra ze is goedgekeurd (zie [Vragen om lid te worden](../runners/registration.html#asking-to-join)). Met `RTE_JOIN_TOKEN` is ze meteen goedgekeurd. Een inkomende RTE met `APP_URL` maar zonder `RTE_URL` weigert te starten |
| Je voegt de runner toe | Geen `APP_URL`: voeg de runner toe onder **Verbindingen > Runners**, of in de [configuratie-seed](../seed/), zoals in [Een RTE draaien](run.html#start-it) |

Het Docker Compose-project, de Helm-chart en de controller van het installatieprogramma draaien hun eigen RTE op deze manier, inkomend, gedeclareerd door de seed.

**Via HTTPS.** Met [`HTTPS=1`](../customization/server.html#env_HTTPS) bedient de RTE haar socket via TLS, met de sleutel en het certificaat
van [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) en [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT)
(standaard `key.pem` en `cert.pem` in haar map `certificates`). Een RTE met een `RTE_URL` die met `https://` begint, stuurt dat certificaat mee wanneer ze
vraagt om lid te worden, en de app pint het: hij belt de RTE alleen als ze hetzelfde certificaat presenteert, zodat een zelfondertekend certificaat werkt zonder CA.
De RTE logt bij het starten de vingerafdruk van het certificaat (de eerste 8 hexadecimale cijfers van de SHA-256 van de DER-bytes, als `abcd-ef12`),
en het goedkeuringsdialoogvenster toont de vingerafdruk die de app ontving: controleer dat ze overeenkomen voordat je haar goedkeurt.
Het [installatieprogramma](../installation/installer.html#a-runner) zet zijn inkomende Runners zo op, met een certificaat van hun eigen adres.

---

## Database (verouderd)

De RTE van 7.0 tot en met 7.2: de app roept haar API via HTTP aan, en de RTE claimt de job in de database, schrijft daar de uitvoer en houdt haar
eigen runnerrij bij, met [`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER). [Databasemodus](./#database-mode-deprecated)
zegt hoe haar stappen verschillen. Ze werkt nog in 7.x, met een waarschuwing bij elke start, en wordt in 8.0.0 verwijderd.

Om zo'n RTE naar een socketmodus te verplaatsen, behoud je haar runner en haar token:

1. Een runner van de [configuratie-seed](../seed/): stel daarvoor eerst `rte_mode: outbound` of `rte_mode: inbound` in de seed in (inkomend: met
   het adres dat de app belt in de `url` van zijn referentie). De RTE kan een runner uit de seed niet zelf verplaatsen
2. Stel op de RTE `RTE_MODE=outbound` in met `APP_URL`, of `RTE_MODE=inbound` (met `APP_URL` en `RTE_URL` om haar ene
   registratieaanroep te doen), en stel [`RTE_NAME`](../customization/server.html#env_RTE_NAME) in op de naam die haar runner heeft onder
   **Verbindingen > Runners**. Behoud haar `RTE_TOKEN`
3. Verwijder `DB_*` en `ENCRYPTION_SECRET` uit haar omgeving, en `RTE_REGISTER`, dat alleen de databasemodus leest, en herstart haar daarna

Wanneer de bijgewerkte RTE zich aanmeldt met de naam van de runner en het eigen token van de runner, verplaatst de app die runner meteen naar de modus van de RTE,
zonder goedkeuring, en logt *Runner '&lt;name&gt;' moved from database mode to outbound: its RTE signed in with the runner's own
token*. De runner is dan geen rij meer die zijn RTE heeft geregistreerd, dus de worker verwijdert hem nooit als de oude container niet meer antwoordt. Een
runner van de configuratie-seed die nog in databasemodus staat, wordt in plaats daarvan geweigerd, met *runner '&lt;name&gt;' is managed by the config seed in
database mode: set rte_mode: outbound for it in the seed ..., then restart this RTE*. Gebruik hiervoor geen jointoken: een jointoken
wordt geweigerd voor een runner die al is goedgekeurd. Een inkomende RTE zonder `APP_URL` doet geen aanroep: zet dan de **Modus** van haar runner op
**Inkomend** onder **Verbindingen > Runners**, en de app belt haar. Het [installatieprogramma](../installation/installer.html#a-72-runner)
werkt een Runner van 7.2 op deze manier bij.

---

## Wat er over de socket gaat

In beide socketmodi stuurt de app de RTE elke job met alles wat de RTE vroeger in de database las, en slaat wat terugkomt,
de uitvoer, de events, het joblog en het einde, precies één keer op. De app verstuurt ook de eindmeldingen.

**De spool.** Elke uitvoerbundel, eventbundel, log, start en einde wordt genummerd en naar het spoolbestand van de job geschreven
([`RTE_SPOOL_PATH`](../customization/server.html#env_RTE_SPOOL_PATH)) voordat het wordt verstuurd, en bewaard tot de app zegt dat ze het heeft opgeslagen.
Na een nieuwe verbinding, met dezelfde app-node of een andere, stuurt de RTE opnieuw wat niet was bevestigd, en de app slaat over wat ze al had
opgeslagen: er gaat niets verloren, en niets wordt twee keer opgeslagen. Houd de spool op een volume, zodat een RTE die herstart nog verstuurt wat ze nog niet had
afgeleverd. Een playbook dat draaide toen de RTE herstartte, kan niet doorgaan: zijn job eindigt als verlaten.

**Capaciteit.** De RTE draait tot [`RTE_MAX_JOBS`](../customization/server.html#env_RTE_MAX_JOBS) playbooks tegelijk, of de waarde die
op haar [runnerpagina](../runners/runner-page.html#an-rtes-settings) is ingesteld, en vertelt de app elke 20 seconden hoeveel er draaien. Een job voor een volle
RTE wacht, zoals beschreven in [Meerdere RTE's](several.html#several-jobs-on-one-rte).

**De bestanden van de job.** [`RTE_FILES`](../customization/server.html#env_RTE_FILES), of de instelling **Jobbestanden** van haar runnerpagina, zegt
waar de RTE de playbooks en de inventories vandaan haalt:

| `RTE_FILES` | Waar de bestanden vandaan komen |
|---|---|
| `transfer` (standaard) | De app stuurt de playbookmap en de inventories met de job mee, elk ingepakt en genoemd naar een hash van de inhoud. De RTE bewaart ze ingepakt onder [`RTE_CACHE_PATH`](../customization/server.html#env_RTE_CACHE_PATH), de laatst gebruikte tot [`RTE_CACHE_MB`](../customization/server.html#env_RTE_CACHE_MB) (standaard 1024 MB), en vraagt alleen om een hash die ze niet heeft: een ongewijzigde map wordt nooit twee keer verstuurd. De RTE heeft geen gedeelde schijf en geen toegang tot de repositories nodig |
| `local` | De RTE draait vanuit haar eigen mappen, zoals een RTE in databasemodus: koppel de playbooks ([`ANSIBLE_PATH`](../customization/paths.html#env_ANSIBLE_PATH)) en de repositories ([`REPO_PATH`](../customization/paths.html#env_REPO_PATH)) erop |

Met `transfer` pakt elke job zijn bestanden uit in een eigen privémap, die wordt verwijderd als de job eindigt: geen job ziet wat een andere
schreef, en geen inventory- of extravars-bestand blijft uitgepakt op de schijf van de RTE staan. RTE's mogen één `RTE_CACHE_PATH` delen; elk houdt haar jobs in
een eigen map, en de map van een RTE die is gestopt (midden in een job beëindigd, of opnieuw aangemaakt met een andere hostnaam) wordt door de andere
na 10 minuten verwijderd. Een map die groter is dan [`RTE_FILES_MAX_MB`](../customization/server.html#env_RTE_FILES_MAX_MB) (standaard 512, gelezen door
de app, toegepast zonder herstart) wordt niet verstuurd: de job mislukt en zegt dat je de map in plaats daarvan op de RTE moet koppelen. De ssh-map wordt nooit verstuurd: de RTE houdt haar eigen
privésleutel en `known_hosts` in `/home/node/.ssh`.

**Hosts en taken.** Sinds 7.3.0 legt een RTE in elke modus de gestructureerde events van een playbook vast naast de tekstuitvoer: elke play, taak en
hostresultaat, en de recap, geschreven door haar callback-plugin `af_events`. De jobpagina toont ze onder **Hosts en taken** (zie
[Een job volgen](../jobs/following.html#hosts-and-tasks)).

---

## Netwerk

Wat je per modus moet openzetten tussen de app, de RTE en de beheerde hosts:

| Modus | Van | Naar | Poort |
|---|---|---|---|
| Uitgaand | De RTE | De app, op `APP_URL` | De poort van de app (`443` achter de meeste proxy's) |
| Inkomend | De app-nodes | De RTE, op het adres van haar runner | De `PORT` van de RTE (`8000`) |
| Database (verouderd) | De RTE, en de app-nodes en de worker | De database, en de RTE | `3306`, en de `PORT` van de RTE |
| Elke modus | De RTE | De beheerde hosts | ssh (`22`), WinRM, hun API's |

In een socketmodus maakt de RTE nooit verbinding met de database. Haar API beantwoordt alleen de socket en de probes: `/live`, `/ready`, `/metrics`.
