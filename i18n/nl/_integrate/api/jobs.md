---
layout: default
title: Jobs
parent: REST API
nav_order: 2
translated_from: ceba9eb4f9c2acb23646bd60c48cc579fe8ce202
---

# Jobs
{: .no_toc }

Start een formulier, volg de job, breek hem af, start hem opnieuw of keur hem goed
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Een job is één run van een formulier. Start hem met de naam en de waarden van het formulier, en volg hem daarna via zijn ID.

---

## Een formulier starten

Stuur de naam van het formulier en de waarden ervan naar `POST /api/v2/job`:

```bash
curl -X POST https://af.example.com/api/v2/job \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
        "formName": "Create Virtual Machine",
        "extravars": { "vm_name": "test-vm", "datacenter": "dc1" },
        "rawFormData": { "vm_name": "test-vm", "datacenter": "dc1" }
      }'
```

Het verzoek neemt deze eigenschappen:

| Eigenschap | Betekenis |
|---|---|
| `formName` | De naam van het formulier om te starten. Verplicht. |
| `extravars` | De extra variabelen voor de job. `payload` wordt geaccepteerd als andere naam ervoor. |
| `rawFormData` | De waarden van de velden van het formulier, zoals de browser ze bijhoudt. [Startvalidatie](../launch-validation/) controleert deze, en bouwt er de extravars uit op. |
| `credentials` | Referenties om aan de job door te geven, op naam. |
| `files` | De uploads van de bestandsvelden van het formulier (zie [Bestandsuploads](../launch-validation/file-uploads.html)). |

Het antwoord bevat het ID van de nieuwe job:

```json
{ "id": 42 }
```

Om de job in verbose-modus te draaien, voeg je `"__verbose__": true` toe aan de extravars. Daarvoor is de rol-optie `allowVerboseMode` nodig,
anders antwoordt de start `403`.

---

## Een bestand uploaden

Een formulier met een bestandsveld heeft eerst het geüploade bestand nodig. Stuur het als multipart-deel `file` naar `POST /api/v2/job/upload`:

```bash
curl -X POST https://af.example.com/api/v2/job/upload \
  -H "Authorization: Bearer <token>" -F "file=@firmware.bin"
```

Het antwoord beschrijft de opgeslagen upload:

```json
{ "fieldname": "file", "originalname": "firmware.bin", "encoding": "7bit", "mimetype": "application/octet-stream",
  "destination": "<UPLOAD_PATH>", "filename": "3f9c...", "path": "<UPLOAD_PATH>/3f9c...", "size": 1048576 }
```

Geef het ongewijzigd mee in de `files` van de start, onder de naam van het bestandsveld: `"files": { "firmware": { ... } }`. De server
controleert het tegen zijn eigen schijf (zie [Bestandsuploads](../launch-validation/file-uploads.html)).

---

## De job volgen

Lees de job via zijn ID:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

De job bevat zijn `status`, zijn `extravars` (ook als `payload`, hetzelfde object), zijn `subjobs` en zijn `output`. De
uitvoer is HTML met de kleuren van de jobpagina; voeg `?text=true` toe voor platte tekst, wat beter past bij een script of een log:

```bash
curl "https://af.example.com/api/v2/job/42?text=true" -H "Authorization: Bearer <token>"
```

De `status` is `running` terwijl hij draait, en `approve` terwijl hij op goedkeuring wacht. Een job eindigt met een van deze:

| Status | Betekenis |
|---|---|
| `success` | De job is zonder fouten voltooid |
| `failed` | De job is mislukt |
| `warning` | Een multistep-job is voltooid, maar onderweg is een stap met `continue` mislukt |
| `aborted` | De job is afgebroken |
| `rejected` | De goedkeuring is geweigerd, dus wat erop wachtte is niet uitgevoerd |
| `abandoned` | Het proces dat de job volgde is gestopt (een herstart, een vervangen container) en de job is opgegeven |

Een job die op een runner draaide toen hij werd opgegeven, kan alsnog eindigen met zijn echte uitkomst, als die runner hem toch afmaakt.

---

## Jobs zoeken

`GET /api/v2/job` toont de nieuwste jobs eerst, als `{ "count": ..., "records": [ ... ] }`. Deze queryparameters beperken de lijst:

| Parameter | Betekenis |
|---|---|
| `records` | Hoeveel jobs, hooguit. De standaard is [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) (1000), en 5000 het maximum tenzij `JOBS_LIST_SIZE` hoger is. |
| `user`, `user_type` | Alleen de jobs van deze gebruiker. `user_type` is `local` als je het weglaat (`ldap`, `azuread`, `oidc` voor de andere). |
| `runner` | Alleen de jobs die op deze runner draaiden |

```bash
curl "https://af.example.com/api/v2/job?records=20&user=automation" -H "Authorization: Bearer <token>"
```

Een gebruiker ziet zijn eigen jobs en de jobs die wachten op een goedkeuring die een van zijn rollen mag geven. Een beheerder, of een rol met de
optie `showAllJobLogs` of `manageAllJobs`, ziet elke job. Een record bevat de samenvatting van de job (`id`, `form`, `status`, `start`, `end`, `user`, `runner`, ...); lees
de job zelf voor de extravars en de uitvoer.

`GET /api/v2/job/approvals` antwoordt met een getal: hoeveel jobs wachten op een goedkeuring die de gebruiker mag geven.

---

## Meer over een job

Deze endpoints lezen meer van één job:

| Aanroep | Wat hij teruggeeft |
|---|---|
| `GET /api/v2/job/{id}/rawformdata` | De veldwaarden waarmee de job is gestart, zoals het formulier ze bijhield. Dezelfde rechten als bij opnieuw starten gelden: je eigen job (of elke job voor een beheerder of een rol met `manageAllJobs`), een formulier dat opnieuw starten toestaat, en de rol-optie `allowJobRelaunch`. |
| `GET /api/v2/job/{id}/events` | De gestructureerde events van een playbookjob (vanaf 7.3.0, voor een playbook op een RTE van 7.3.0 of later): elke play, taak, hostresultaat en de recap, met hun `order`, `type`, `play`, `task`, `host`, `duration` en `time` |
| `GET /api/v2/job/{id}/events/{order}` | Een van die events met zijn volledige `result`, zoals het venster **Resultaat van de taak** het toont; `400` als `order` geen geheel getal is, `404` als de job zo'n event niet heeft |
| `GET /api/v2/job/{id}/node/{nodeId}` | Eén node van een workflowjob: `{ "node", "job", "extravars", "artifacts" }`, waarbij `job` het ID is van de eigen job van de node, of `null` als de node niet is uitgevoerd. |

---

## Andere acties

Deze endpoints werken op een bestaande job:

| Aanroep | Actie |
|---|---|
| `POST /api/v2/job/{id}/abort` | Een lopende job afbreken |
| `POST /api/v2/job/{id}/relaunch` | Een job opnieuw starten, zoals hij draaide of met wijzigingen (zie [Opnieuw starten](../launch-validation/relaunching.html)) |
| `POST /api/v2/job/{id}/approve` | Een job goedkeuren die op goedkeuring wacht; je eigen job antwoordt `403`, tenzij de goedkeuring ervan `allowSelf: true` zet of je beheerder bent |
| `POST /api/v2/job/{id}/reject` | Een job afwijzen die op goedkeuring wacht |
| `GET /api/v2/job/{id}/download` | De uitvoer van de job downloaden |
| `DELETE /api/v2/job/{id}` | Een job verwijderen |

Afbreken, goedkeuren, afwijzen en verwijderen antwoorden met een bericht, en opnieuw starten ook met het ID van de nieuwe job:

```json
{ "message": "Job has been relaunched with job id 43", "id": 43 }
```

Voeg `?verbose=true` toe aan het opnieuw starten om de nieuwe job in verbose-modus te draaien, met de rol-optie `allowVerboseMode`. Een job die
in de verkeerde toestand is voor de actie, bijvoorbeeld bij het afbreken van een job die al is geëindigd, antwoordt `409`.
