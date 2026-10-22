---
layout: default
title: Upgraden naar v7
parent: Upgraden
nav_order: 0.5
translated_from: 8c6ca072978823febdff10a5f0a3c935f994b50b
---

# Upgraden naar v7
{: .no_toc }

Wat je nog op 6.5 moet aanpassen, en wat er verandert als je naar versie 7 gaat
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Versie 7 schrapt alles wat 6.x als verouderd markeerde; los het eerst op 6.5 op, waar oud en nieuw allebei werken, en upgrade daarna.

---

## Voordat je upgradet (op 6.5)

### Formulieren staan in eigen bestanden

Formulieren staan alleen nog in de map met formulieren (`FORMS_FOLDER_PATH`) of in een formulierenrepository; `config.yaml` bevat de categorieën, rollen en constanten.

- **Een bestand `forms.yaml`:** hernoem het naar `config.yaml`. Op 6.5 heeft de instellingenpagina daarvoor een knop
  **Convert forms.yaml to config.yaml**.
- **Een sectie `forms:` in de basisconfiguratie:** versie 7 weigert die. Zet elk formulier in een eigen bestand, bijvoorbeeld
  door het in de designer van 6.5 naar een bestand te slepen.
- **Omgevingsvariabelen:**

  | Verwijderd | Gebruik in plaats daarvan |
  |---|---|
  | `FORMS_PATH` | `CONFIG_PATH` en `FORMS_FOLDER_PATH` |
  | `ENABLE_FORMS_YAML_IN_DATABASE` | `ENABLE_CONFIG_IN_DATABASE` |

### Het veld `table`

Versie 7 weigert velden van het type `table`, en hun eigenschappen (`tableFields`, `insertColumns`, `readonlyColumns`,
`tableTitleAdd`, `tableTitleEdit`) verdwijnen mee: gebruik een veld `list` met een `subform`, en maak van de `from` van elke kolom een expressie
op `__parent__` (zie de [FAQ](faq#how-do-i-migrate-from-table--tablefields-to-list--subform)).

### Hernoemde eigenschappen

Elke verwijderde eigenschap heeft een directe vervanger:

| Verwijderd | Gebruik in plaats daarvan |
|---|---|
| `disableRelaunch: true` (formulier) | `allowRelaunch: false` |
| `noOutput: true` (veld) | `output: false` |
| `enableLogin` (rol-optie) | `allowLogin` |

### Datasources en dataschema's

De datasource-imports en hun beheerpagina's zijn verwijderd, net als de
AnsibleForms Galaxy-collection, waarvan de modules alleen daarvoor dienden.

- Geplande imports stoppen en de datasourcetabellen worden verwijderd: noteer eerst wat je nodig hebt.
- De dataschema's die een import vulde zijn eigen databases en blijven bestaan. Een formulier dat
  ze via een referentie bevraagt, blijft werken.
- Om die gegevens actueel te houden, voer je de import uit als een eigen playbook, bijvoorbeeld vanuit een
  planning.

### API v1

`/api/v1/*` is verwijderd; gebruik `/api/v2/*` (interactieve documentatie op `/api/v2/docs`). De aanroepen die
scripts meestal gebruiken zijn:

| v1 | v2 |
|---|---|
| `POST /api/v1/auth/login` | `POST /api/v2/auth/login` |
| `POST /api/v1/token` | `POST /api/v2/token` |
| `POST /api/v1/job` | `POST /api/v2/job` |

v2 antwoordt met HTTP-statuscodes (`400`, `403`, `404`, `422`) en een gewone JSON-body, niet met de envelop
`{ status, message, data }` van v1.

**Ook de callbacks van single sign-on.** Een redirect-URL met `/api/v1/` antwoordt niet meer: de aanmelding keert terug naar
de aanmeldpagina zonder je aan te melden. Wijzig hem naar `/api/v2/` op twee plaatsen, bij de SSO-provider in
AnsibleForms en bij de identity provider (de redirect-URI's van de app-registratie in Entra ID, de geldige redirect-URI's van de OIDC-
client):

- Entra ID: `https://<your host>/api/v2/auth/azureadoauth2/callback`, of `/api/v2/auth/entraid/callback` vanaf 7.3.0
- OIDC: `https://<your host>/api/v2/auth/oidc/callback`

---

## Wat er verandert in 7

Versie 7 verandert hoe playbooks draaien en maakt verschillende standaardwaarden strenger. Controleer elk punt hieronder als je van 6.5 overstapt.

### Playbooks draaien op een RTE

Versie 7 draait `ansible-playbook` niet meer in de AnsibleForms-container. Playbooks draaien op een runtime-omgeving (RTE),
een eigen container, en de app-image bevat geen ansible of python meer. Start een RTE naast de app, vanuit de
image `ghcr.io/ansibleforms/ansibleforms-rte-full:7`. Sinds 7.3.0 belt de app de RTE aan en houdt één WebSocket open (zie
[Modi](rte/modes.html)): de RTE krijgt geen database-instellingen en geen `ENCRYPTION_SECRET`. De instellingen ervan:

| Instelling | Waarde |
|---|---|
| `AF_ROLE` | `rte`. De RTE-images zetten dit al. |
| `RTE_MODE` | `inbound`: de app belt de RTE aan. Een Runner in een ander netwerk gebruikt `outbound` (zie [Modi](rte/modes.html)). |
| `RTE_TOKEN` | Een token van minstens 16 tekens. De app meldt zich daarmee aan bij de socket van de RTE, en de RTE weigert te starten zonder token. |
| `RTE_FILES` | `local` als de RTE dezelfde persistente map koppelt als de app, zoals wanneer hij ernaast draait. |

Verplaats daarna de ansible-koppelingen van de app-container naar de RTE:

- `ansible.cfg` op `/etc/ansible/ansible.cfg`, je rollen op `/etc/ansible/roles` en je collections op
  `/etc/ansible/collections`.
- Koppel dezelfde persistente map als de app ook op de RTE, zodat die de playbooks en de repositories vindt.

Declareer de RTE daarna als runner, in de [config seed](seed/) zoals het Docker Compose-project doet, of onder **Verbindingen → Runners**:
een RTE-referentie met het adres van de RTE (bijvoorbeeld `http://rte:8000`) en hetzelfde token, en een runner van het type RTE, modus inbound,
die haar noemt:

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

De seed leest `RTE_TOKEN` uit de omgeving van de app. Zie [Runners](runners.html) en [Runtime-omgevingen](rte/).

{: .warning }
> **Hetzelfde contract voor de app en de RTE** De app lost de referenties van een job op en geeft ze aan de RTE, verzegeld voor
> die RTE (RTE-contract 2, nieuw in 7.0.0). Een RTE met een ander contract weigert de jobs van de app: draai de RTE-image van dezelfde
> release als de app, en upgrade beide samen. Latere 7-releases blijven werken met een oudere 7-RTE zolang het contract
> hetzelfde blijft (zie [Schalen](../rte/images.html#build-your-own-rte)).


### Wat de RTE-image bevat

De RTE komt in drie lagen, elk gebouwd op de vorige. Kies de laag die bij je playbooks past:

| Image | Inhoud |
|---|---|
| `ansibleforms-rte-full` | De standaard. Ansible 14 met ansible-core 2.21, en de collections en python-bibliotheken die de 6.5-image had. |
| `ansibleforms-rte-core` | Python 3.14, ansible-core en een paar gangbare bibliotheken, zonder collections. Voeg je eigen toe in een image die erop is gebouwd. |
| `ansibleforms-rte-base` | Alleen de server, zonder python of ansible, om een RTE met je eigen versies te bouwen. |

De overstap van 6.5 (ansible 12 met ansible-core 2.19) verandert voor je playbooks ook het volgende:

- **ansible-core 2.21:** lees de [porting guides](https://docs.ansible.com/ansible/latest/porting_guides/porting_guides.html)
  voor 2.20 en 2.21.
- **Python 3.14:** de RTE-lagen draaien op python 3.14.
- **Geen `boto` meer:** de oude bibliotheek `boto` 2 is weg. De collection `amazon.aws` gebruikt `boto3`, dat erin zit.

Twee omgevingsvariabelen horen nu bij de RTE en worden niet meer door de app gelezen, dus stel ze in de RTE-container in:

| Variabele | Wijziging |
|---|---|
| `ANSIBLE_PATH` | De map met playbooks, op de RTE. |
| `PROCESS_MAX_BUFFER` | Nu standaard 50 MB. Daarboven wordt de uitvoer van de job niet meer opgeslagen (de job meldt dat), maar gaat het playbook door in plaats van te worden gestopt. |


### De containers draaien als uid 1000

De images van de app en de RTE draaien als de gebruiker `node` (uid 1000) in plaats van root, en hun homemap is `/home/node`:

- **Maak uid 1000 eenmalig eigenaar van de volumes.** Voor de persistente en ssh-volumes voer je
  `docker run --rm -v <volume>:/v alpine chown -R 1000:1000 /v` uit; voor een map op de host `sudo chown -R 1000:1000 <folder>`.
  Op Kubernetes zet je `fsGroup: 1000`.
- **Koppel de ssh-map op `/home/node/.ssh`**, niet op `/root/.ssh`. Als je
  [`HOME_PATH`](customization/paths.html#env_HOME_PATH) op `/root` hebt gezet, verwijder het dan of zet het op `/home/node`.
- **Je eigen RTE-image**, gebouwd op een RTE-laag, schakelt voor de installaties over naar `USER root` en aan het eind terug naar `USER node`.


### Startvalidatie staat aan

[`LAUNCH_VALIDATION`](customization/features.html#env_LAUNCH_VALIDATION) staat nu standaard op `enforce` (6.5: `off`). Elke
start, vanuit de browser of via `POST /api/v2/job`, wordt gecontroleerd tegen de regels van het formulier, en de job draait met de extravars en
referenties die de server uit de gecontroleerde waarden opbouwt.

- **REST-aanroepers moeten `rawFormData` meesturen**, de ruwe veldwaarden zoals de browser ze stuurt. Een start met alleen
  `extravars` wordt geweigerd, omdat de waarden ervan niet te controleren zijn.
- **Om eerst te zien wat geweigerd zou worden**, zet je `LAUNCH_VALIDATION=log` en lees je de waarschuwingen in het log. `off` herstelt het
  gedrag van 6.5.

Zie [Startvalidatie](launch-validation/) voor de details.


### Playbooks zien de instellingen van de app niet meer

Een playbook erft niet meer de omgevingsvariabelen die AnsibleForms zelf leest: `ENCRYPTION_SECRET`, de `DB_*`-instellingen,
`ACCESS_TOKEN_SECRET`, `RTE_TOKEN`, de `VAULT_*`-instellingen, elke andere gedocumenteerde variabele en elke `MYSQL_*`-variabele.
De rest van de omgeving van de RTE, zoals `PATH`, proxy's, `ANSIBLE_*`-instellingen en cloudreferenties, wordt doorgegeven zoals voorheen.

Een playbook dat een van deze met `lookup('env', ...)` las, moet de waarde op een andere manier krijgen: geef hem door als extravar of als
referentie, of stel hem op de RTE in onder een andere naam.

### Alleen de rol admin beheert runners en beheerders

Een gebruiker met toegang tot de instellingen heeft niet langer volledige controle over wie beheerder is en waar referenties naartoe gaan:

- **Runners:** alleen de rol admin voegt een runner toe, wijzigt of verwijdert hem, omdat een runner de referenties ontvangt van de jobs
  die hij uitvoert. Gebruikers met toegang tot de instellingen kunnen runners nog steeds zien en testen.
- **Beheerdersaccounts en -groepen:** alleen de rol admin kent beheerdersrechten toe. Zonder die rol kan een gebruiker geen account in een groep zetten die de
  rol admin noemt, en geen beheerdersaccount of zo'n groep wijzigen, resetten of verwijderen.
- **Rollen:** een designer zonder de rol admin kan de rollen niet wijzigen. Een opslag of herstel waarvan de rollen afwijken, wordt geweigerd.

Geef de rol admin aan wie runners, beheerders en rollen beheert.

### Het standaardwachtwoord moet worden gewijzigd

Een gebruiker die zich aanmeldt met het openbare standaardwachtwoord `AnsibleForms!123` moet het eerst wijzigen. Tot die tijd antwoordt elke andere API-
aanroep met `403` en de code `password_change_required`, en toont de browser de pagina om het wachtwoord te wijzigen.

Meld je één keer aan en kies een nieuw wachtwoord, of stel [`ADMIN_PASSWORD`](customization/server.html#env_ADMIN_PASSWORD) in vóór de
eerste start. Scripts die zich met het standaardwachtwoord aanmelden, moeten een ander gebruiken.

### Tokens vervallen bij afmelden en wachtwoordwijziging

Afmelden beëindigt nu de tokens van die sessie, en een wachtwoordwijziging beëindigt elke sessie van die gebruiker, dus meld je opnieuw aan na
het wijzigen van een wachtwoord.

Een API-token dat met `?expiryDays=` is aangevraagd, leeft hooguit [`API_TOKEN_MAX_DAYS`](customization/security.html#env_API_TOKEN_MAX_DAYS) dagen
(standaard 90). Scripts die langlevende API-tokens gebruiken, moeten een nieuw token aanvragen voordat het oude verloopt.

### Entra ID heeft je tenant nodig

Aanmelden met Entra ID (Azure AD) gebruikt nu OpenID Connect, alleen tegen je eigen tenant, en een gebruiker van een andere tenant kan zich niet
aanmelden. Een provider zonder tenant-id, of met `common`, `organizations` of `consumers`, wordt geweigerd.

- **Stel de tenant-id in** bij de SSO-provider: de Directory (tenant) ID, een GUID, of het domein van de tenant.
- **Ken de Graph-machtigingen toe:** de aanmelding vraagt om `openid profile email User.Read GroupMember.Read.All`. Geef de app-
  registratie de gedelegeerde Microsoft Graph-machtigingen `User.Read` en `GroupMember.Read.All`, met admin consent.
- **Gebruik bij voorkeur groeps-id's in rollen:** noem een groep als `azuread/<object id>` (`entraid/<object id>` vanaf 7.3.0) in plaats van met de weergavenaam.

Zie [Entra ID](authentication/entra-id.html) voor de instelling.

### Wachtwoorden hebben een minimale lengte

Een lokaal wachtwoord dat via de applicatie wordt ingesteld, heeft minstens
[`PASSWORD_MIN_LENGTH`](customization/security.html#env_PASSWORD_MIN_LENGTH) tekens nodig (standaard 8), en mag niet de gebruikersnaam of het
standaardwachtwoord zijn. `PASSWORD_MIN_LENGTH=0` schakelt de lengtecontrole uit. Bestaande wachtwoorden blijven werken.

### Draai de containers met een restart policy

Een niet-afgevangen exceptie beëindigt nu het proces, gelogd op niveau `crit`, in plaats van het in een onbekende toestand te laten doordraaien. Draai
de containers met een restart policy, zoals `--restart unless-stopped` met Docker (het docker-compose-project stelt die in).
Kubernetes herstart de pods zelf.

### AWX-verbindingen en de homelink

Nog twee dingen zijn weg in 7, zonder dat je op 6.5 iets hoeft te doen:

- **AWX- en AAP-verbindingen:** de tabel `awx`, `/api/v2/awx` en de pagina A.A.P. zijn weg. De upgrade zet elke AWX- of
  AAP-verbinding over naar **Verbindingen → Runners**, als runner van het type `awx`, en formulieren met `awx:` blijven werken.
- **`NAV_HOME_LABEL` en `NAV_HOME_ICON`:** worden niet meer gelezen. De eerste link in de kopbalk is altijd Formulieren.

### Verouderd in 7, verwijderd in 8

Deze werken nog in 7, maar elk logt een waarschuwing als het wordt gebruikt. Stap vóór versie 8 over op de vervanger:

| Verouderd | Gebruik in plaats daarvan |
|---|---|
| Omgevingsvariabelen `VAULT_*` | Een secret store met de naam `vault` (**Verbindingen → Secret stores**). De eerste start van 7 importeert de variabelen één keer als die store, en negeert ze daarna. |
| Omgevingsvariabelen `LOG_SYSLOG_*` | Een syslogserver (**Verbindingen → Syslog**). Als `LOG_SYSLOG_HOST` is ingesteld, importeert de eerste start van 7 ze één keer als de server `syslog`, die net als voorheen het serverlog ontvangt, en negeert ze daarna. Om ook de auditregels te versturen, stel je hem in om beide te ontvangen. |
| `vault_path` op een referentie (API, config seed) | `secret_store` en `secret_ref`. Zie [Secret stores](secret-stores/). |
| De rol `public` in `config.yaml` | De rol `default`. Het bestand wordt hernoemd als de configuratie laadt; hernoem een ytt-template met de hand. `public` in de `roles:` van een formulier blijft overeenkomen. |
| `POST /api/v2/config/vault/check`, `GET /api/v2/config/vault/mounts` | `POST /api/v2/secretstore/{id}/check`, `GET /api/v2/secretstore/{id}/mounts` |
| `hasApproval` op een formulier of een stap | `approval`. `hasApproval` heeft geen effect. |
| `awx: <name>` op een formulier | `runner: <name>`. Een AWX-verbinding is een runner van het type `awx`. |
| `type: multistep` op een formulier, met de bijbehorende `steps` | `type: workflow`, met nodes die een `runner` noemen. Zie [Workflowformulieren](forms/workflow.html). |
| De sectie `awx:` van de config seed | Items onder `runners:` met `type: awx` |
| `LOCK_PATH` | Niets: wordt niet meer gelezen, de vergrendeling van de designer wordt in de database bijgehouden. |
| Een RTE in databasemodus, sinds 7.3.0: `RTE_MODE=database` of geen `RTE_MODE`, met de `DB_*` en `ENCRYPTION_SECRET` van de database op de RTE | `RTE_MODE=outbound` of `RTE_MODE=inbound`, zonder `DB_*`. De RTE sluit één keer aan met een jointoken (`RTE_JOIN_TOKEN`), of zijn runner wordt op die modus gezet onder **Verbindingen → Runners** of in de config seed (`rte_mode`). Zie [Modi](rte/modes.html). |
| `RTE_REGISTER`, sinds 7.3.0 (alleen databasemodus) | Een jointoken (`RTE_JOIN_TOKEN`): de RTE voegt zichzelf toe als runner die zich aanmeldt met een RTE-referentie. |
| Een referentie `api` of `userpass` op een runner van de config seed, sinds 7.3.0 | Een referentie van het soort van de runner (`credential_type: rte`, `awx`, `aap`, `ascender`, `semaphore`, `rundeck` of `jenkins`), met de server in `url`. |
| Een runner van de config seed met een eigen `token`, of `username` en `password`, sinds 7.3.0 | Een referentie van het soort van de runner in de sectie `credentials`, met de server in `url`, die de runner noemt met `credential:`. De seed maakt intussen een referentie met de naam van de runner. |

`ENABLE_SSO` en `SSO_AUTO_LOGIN` worden sinds 7.3.0 niet meer gelezen. De eerste start van 7.3 neemt ze één keer over: `ENABLE_SSO=0` schakelt
elke SSO-provider uit, en `SSO_AUTO_LOGIN=1` vinkt **Aanmeldpagina overslaan** aan bij de enige ingeschakelde provider. Daarna worden ze genegeerd: elke start
logt een waarschuwing zolang ze zijn ingesteld, en elke provider heeft **Ingeschakeld** en **Aanmeldpagina overslaan** onder **Toegang → SSO**.

---

## Image-tags

`latest` gaat met 7.0.0 naar 7. Om op 6 te blijven, gebruik je de tag `6` (of `6.5`) in plaats van `latest`.
Alle tags staan onder [Image-tags](installation/#image-tags).

---

## Terugdraaien

Maak een back-up voordat je upgradet (**Instellingen → Back-ups**). 6.5 draait op een database die naar 7 is geüpgraded, maar alleen
de back-up herstelt de verwijderde datasourcedefinities.
