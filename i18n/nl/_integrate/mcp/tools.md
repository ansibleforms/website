---
layout: default
title: Tools
parent: MCP-server
nav_order: 2
translated_from: a8c4d7ff425720a098c720cc1ade3629094bdb40
---

# Tools
{: .no_toc }

De tools die een agent gebruikt om formulieren in te vullen, goed te keuren en opnieuw te starten
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

De MCP-server biedt tot 15 tools. Zes worden aan elke gebruiker aangeboden; de andere volgen de rol-opties van de gebruiker, dus een gebruiker
zonder een optie krijgt de bijbehorende tools helemaal niet aangeboden:

| Tool | Wat hij doet | Aangeboden met |
|---|---|---|
| `list_forms` | De formulieren die de gebruiker mag gebruiken: naam, beschrijving, categorieën, en `enableForChat` (of de chat-assistent het aanbiedt). | altijd |
| `get_form` | De volledige definitie van één formulier. Elk veld bevat ook `dynamic` (geëvalueerd uit een expressie of query) en `dependsOn` (de velden die het leest). | altijd |
| `resolve_field` | Evalueert het formulier voor de waarden die tot nu toe zijn ingevuld. Zie hieronder. | altijd |
| `launch_job` | Start het formulier met de opgegeven waarden, precies zoals een verzending vanuit de browser dat zou doen. Geeft het job-id terug. | altijd |
| `relaunch_job` | Start een job opnieuw met enkele gewijzigde velden. Zie hieronder. | altijd |
| `get_job` | Status en uitvoer van een job (`tail` beperkt de uitvoer tot de laatste regels). | altijd |
| `plan_job` | Voert het formulier één keer uit, later, als de gebruiker: wat **Later uitvoeren (eenmalig)** op het formulier doet. | `allowPlannedJobs` |
| `create_schedule` | Maakt een planning, terugkerend (`cron`) of eenmalig (`run_at`), zoals op de pagina **Planner**. | `allowScheduledJobs` |
| `list_schedules` | De planningen die de gebruiker mag zien: allemaal met `allowScheduledJobs`, anders de runs die hij zelf heeft gepland. | `allowPlannedJobs` of `allowScheduledJobs` |
| `get_schedule` | Eén planning, met de extra vars (die op secrets lijken gemaskeerd) en de uitvoer van de laatste run. | `allowPlannedJobs` of `allowScheduledJobs` |
| `delete_schedule` | Annuleert een geplande run of verwijdert een planning die de gebruiker mag zien. | `allowPlannedJobs` of `allowScheduledJobs` |
| `list_stored_jobs` | De [opgeslagen jobs](../jobs/stored-jobs.html) die de gebruiker mag zien, zonder hun waarden. | `allowStoredJobs` |
| `get_stored_job` | Eén opgeslagen job met zijn waarden, op `id`, of op `form` en `name` onder de eigen jobs van de gebruiker. | `allowStoredJobs` |
| `store_job` | Slaat waarden van een formulier op onder een naam, zoals **Store** op het formulier doet. | `allowStoredJobs` |
| `delete_stored_job` | Verwijdert een opgeslagen job die de gebruiker mag zien. | `allowStoredJobs` |

`launch_job`, `relaunch_job` en `plan_job` nemen `verbose: true` om de job in verbose-modus te draaien, wat de
rol-optie `allowVerboseMode` vereist. Met [`MCP_READ_ONLY`](setup.html#limiting-what-agents-can-do) worden de tools die starten, plannen of
wijzigen (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job` en `delete_stored_job`)
niet aangeboden.

Er is geen tool om een willekeurige expressie, query, playbook of extravars uit te voeren. Expressies
en queries draaien altijd alleen zoals het formulier ze definieert.

De [Chat-assistent](../chat) gebruikt deze tools ook, met een knop **Starten** in plaats van `launch_job`.

---

## Een formulier invullen

Roep `resolve_field` aan met de naam van het formulier en de waarden die je tot nu toe hebt, en opnieuw na elk antwoord. Het werkt
de velden af in volgorde van afhankelijkheid en meldt voor elk veld:

- `status`: `resolved`, `waiting` (met `waitingFor`), `hidden`, of `error` (het veld valt terug op zijn standaardwaarde);
- `value`, `default` en, voor keuzevelden, `options` (hooguit `maxOptions`, standaard 200);
- `needsInput`: een verplicht veld zonder waarde, of een keuze die nog op `__auto__` staat;
- `validationErrors`: de regels die de waarde schendt, als `[{type, description}]`, met het bericht van de browser.

Voor het hele formulier tonen `missing` en `invalid` wat er nog moet worden opgelost; `launch_job` weigert het tot `complete` true is.

De validatie is de eigen code van de browser, gedeeld met [startvalidatie](../launch-validation). Verborgen velden worden niet
gevalideerd, en een leeg optioneel veld is geldig.

---

## Planningen en geplande runs

`plan_job` neemt dezelfde `form`, `values` en `expectedPayloadHash` als `launch_job`, met een `name` voor de run en `run_at`, een
ISO 8601-tijd met de offset of `Z` (`2026-10-15T22:00:00+02:00`); een tijd zonder zone wordt geweigerd. De waarden worden nu opgelost
en gevalideerd, en opnieuw gecontroleerd als de run afgaat, zoals bij een [geplande run](../jobs/schedules.html#planned-runs) in de
browser. Het antwoord geeft de runtijd in UTC en volgens de klok van de app.

`create_schedule` neemt een `form`, een `name`, ofwel `cron` (vijf velden, zoals `0 22 * * 1-5`) of `run_at`, en de
`extraVars` die de job krijgt. Zo'n planning draait als de `Schedule Service`, zonder de validatie van het formulier; om een formulier één keer als
de gebruiker uit te voeren, gebruik je `plan_job`. Namen van planningen zijn uniek.

---

## Opgeslagen jobs

Een opgeslagen job is een set waarden van een formulier, opgeslagen onder een naam; de tools werken op dezelfde opgeslagen jobs als de browser.

`list_stored_jobs` toont de eigen opgeslagen jobs van de gebruiker, of die van iedereen voor een gebruiker met `showSettings`, met hun naam, beschrijving,
formulier, aanmaakdatum en vervaldatum. Een job gemarkeerd als `usable` (van de gebruiker zelf, van een formulier dat hij mag starten) kan worden meegegeven als `storedJob`
(`{ "id": 7 }`, of `{ "name": "..." }` onder de eigen jobs van de gebruiker voor dat formulier) aan `resolve_field`, `launch_job` of `plan_job`: de
waarden ervan zijn het startpunt en `values` worden eroverheen gelegd. Wachtwoordvelden worden niet opgeslagen, dus geef ze mee in `values`.
`launch_job` en `plan_job` vanuit een opgeslagen job hebben de `expectedPayloadHash` nodig die `resolve_field` ervoor teruggaf, en
`resolve_field` weigert `storedJob` samen met `subform`.

`store_job` neemt het `form`, een `name` die uniek is onder de opgeslagen jobs van de gebruiker voor dat formulier, de `values`, en eventueel een
`description` en `expires_at` (ISO 8601 met de offset of `Z`). Het antwoord zegt welke wachtwoordvelden zijn weggelaten.

---

## Waarden meegeven

Geef `field` mee om alleen dat veld op te lossen en waar het van afhangt. Voor een lijstrij of een wizardstap geef je `subform` mee (en
eventueel `parent`, de waarden van het bovenliggende formulier).

Stuur waarden zoals de browser ze bijhoudt. Een keuzeveld accepteert ook een gedeeltelijk record of de waarde van zijn `valueColumn`
(`"vol1"`), en een array als het `multiple` is. Berekende velden negeren verstuurde waarden tenzij ze `editable` zijn.

---

## De exacte payload goedkeuren

Als het formulier compleet is, geeft `resolve_field` ook terug wat `launch_job` gaat versturen:

- `modeledExtravars`: de extravars nadat `model`, `valueColumn` en `output` zijn toegepast,
  met wachtwoordvelden gemaskeerd;
- `credentials`: de AnsibleForms-referenties die de job gaat gebruiken (namen, geen secrets);
- `payloadHash`: een SHA-256-hash van de naam van het formulier, de echte extravars en de referenties.

Toon `modeledExtravars` aan de operator, en geef de `payloadHash` die hij heeft goedgekeurd mee aan
`launch_job` als `expectedPayloadHash`. De start lost het formulier opnieuw op en wordt geweigerd
als de payload afwijkt, bijvoorbeeld omdat een query nu anders antwoordt.
`ansibleforms_user`, `__jobid__` en `__verbose__` worden bij de start toegevoegd en maken geen deel uit van de hash.

`launch_job` controleert alleen de payload. Een wijziging van het formulier waarbij de payload gelijk blijft, laat de start niet weigeren.
Elk antwoord van `resolve_field` bevat ook een `formFingerprint`, een SHA-256-hash van de formulierdefinitie: om een
start na elke wijziging van het formulier te weigeren, vergelijk je die zelf voordat je `launch_job` aanroept, zoals de knop
**Starten** van de chat-assistent doet.

---

## Opnieuw starten met wijzigingen

`relaunch_job` neemt een job-`id` en `values`: alleen de velden die moeten veranderen, als ruwe waarden.
`values` wordt over de waarden gelegd waarmee de job oorspronkelijk is gestart, en het resultaat wordt
opgelost en gevalideerd precies zoals door `launch_job`, lijstrijen inbegrepen, en daarna door jou gestart als een
nieuwe job (`ansibleforms_user` ben jij, niet de oorspronkelijke indiener). Bestandsuploads van
de oorspronkelijke job worden hergebruikt.

Zonder `values` is het een herstart **zoals de job draaide**: de opgeslagen extravars ervan worden op
de server opnieuw afgespeeld, wachtwoorden inbegrepen (het voorbeeld maskeert ze). Als het formulier echter onder startvalidatie
`enforce` valt, doorloopt de herstart dezelfde controle als een herstart met
wijzigingen.

**Wachtwoorden worden nooit met de veldwaarden opgeslagen**, dus een herstart die door de
controle gaat, wordt geweigerd als het formulier een wachtwoordveld toont, op het hoogste niveau of in een lijstrij
(`unsupported`, met de `passwordFields`). Een wachtwoordveld dat door zijn afhankelijkheden verborgen is,
blokkeert de herstart niet. Zie [Startvalidatie](../launch-validation).

Roep het eerst aan met `preview: true`: het geeft `modeledExtravars` (wachtwoorden gemaskeerd),
`credentials` en een `payloadHash` terug zonder te starten. Bevestig ze met de gebruiker, en roep
het daarna opnieuw aan met `expectedPayloadHash`. Dezelfde rechten als bij opnieuw starten in de browser
gelden: het formulier moet opnieuw starten toestaan en je rollen hebben de optie `allowJobRelaunch` nodig. Een
job zonder opgeslagen formuliergegevens (gestart voordat opnieuw starten bestond) en een wizardformulier kunnen niet
met wijzigingen opnieuw worden gestart.

De REST API biedt hetzelfde via `POST /api/v2/job/{id}/relaunch` met de body
`{ "values": { ... } }`; zonder body speelt het de job af zoals hij draaide.

---

## Fouten

Een geweigerde aanroep is een tool-fout waarvan de gestructureerde inhoud een `code` en de details bevat:

| Code | Wanneer |
|---|---|
| `form_incomplete` | `launch_job` of `relaunch_job` op een formulier dat niet compleet is, met `missing`, `invalid`, `waiting`, `validationErrors` en `rowErrors` |
| `payload_mismatch` | de payload wijkt af van `expectedPayloadHash`, met beide hashes |
| `access_denied` | de rollen van de gebruiker geven geen toegang tot het formulier, de job, de planning of de opgeslagen job, of tot verbose-modus, of de server is alleen-lezen |
| `not_found` | zo'n formulier, subform of job bestaat niet |
| `unsupported` | een wizardformulier, een subform op zichzelf, een bestandsveld, of een `relaunch_job` die een getoond wachtwoordveld nodig zou hebben |
| `no_form_data` | `relaunch_job` met wijzigingen voor een job die geen formulierwaarden heeft opgeslagen, zoals een job die een planning startte; start hem in plaats daarvan zonder wijzigingen opnieuw |
| `invalid_request` | een verzoek dat de server als onjuist opgebouwd weigert |
| `internal_error` | al het andere |
