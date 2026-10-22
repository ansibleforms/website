---
layout: default
title: Jobs
parent: REST-API
nav_order: 2
translated_from: ceba9eb4f9c2acb23646bd60c48cc579fe8ce202
---

# Jobs
{: .no_toc }

Ein Formular starten, den Job verfolgen, abbrechen, erneut starten oder genehmigen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Ein Job ist ein Lauf eines Formulars. Starten Sie ihn mit dem Namen und den Werten des Formulars und verfolgen Sie ihn dann über seine ID.

---

## Ein Formular starten

Senden Sie den Formularnamen und seine Werte an `POST /api/v2/job`:

```bash
curl -X POST https://af.example.com/api/v2/job \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{
        "formName": "Create Virtual Machine",
        "extravars": { "vm_name": "test-vm", "datacenter": "dc1" },
        "rawFormData": { "vm_name": "test-vm", "datacenter": "dc1" }
      }'
```

Die Anfrage nimmt diese Eigenschaften:

| Eigenschaft | Bedeutung |
|---|---|
| `formName` | Der Name des zu startenden Formulars. Pflichtangabe. |
| `extravars` | Die Extra-Variablen für den Job. `payload` wird als anderer Name dafür akzeptiert. |
| `rawFormData` | Die Werte der Formularfelder, wie der Browser sie hält. Die [Startvalidierung](../launch-validation/) prüft diese und baut daraus die Extravars auf. |
| `credentials` | Anmeldedaten, die dem Job übergeben werden, nach Namen. |
| `files` | Die Uploads der Dateifelder des Formulars (siehe [Datei-Uploads](../launch-validation/file-uploads.html)). |

Die Antwort enthält die ID des neuen Jobs:

```json
{ "id": 42 }
```

Um den Job im ausführlichen Modus laufen zu lassen, fügen Sie den Extravars `"__verbose__": true` hinzu. Das braucht die Rollenoption `allowVerboseMode`,
sonst antwortet der Start `403`.

---

## Eine Datei hochladen

Ein Formular mit einem Dateifeld braucht zuerst die hochgeladene Datei. Senden Sie sie als Multipart-Teil `file` an `POST /api/v2/job/upload`:

```bash
curl -X POST https://af.example.com/api/v2/job/upload \
  -H "Authorization: Bearer <token>" -F "file=@firmware.bin"
```

Die Antwort beschreibt den gespeicherten Upload:

```json
{ "fieldname": "file", "originalname": "firmware.bin", "encoding": "7bit", "mimetype": "application/octet-stream",
  "destination": "<UPLOAD_PATH>", "filename": "3f9c...", "path": "<UPLOAD_PATH>/3f9c...", "size": 1048576 }
```

Übergeben Sie sie unverändert in den `files` des Starts, unter dem Namen des Dateifelds: `"files": { "firmware": { ... } }`. Der Server
prüft sie gegen seine eigene Festplatte (siehe [Datei-Uploads](../launch-validation/file-uploads.html)).

---

## Den Job verfolgen

Lesen Sie den Job über seine ID:

```bash
curl https://af.example.com/api/v2/job/42 -H "Authorization: Bearer <token>"
```

Der Job enthält seinen `status`, seine `extravars` (auch als `payload`, dasselbe Objekt), seine `subjobs` und seinen `output`. Die
Ausgabe ist HTML mit den Farben der Job-Seite; fügen Sie `?text=true` für reinen Text hinzu, was zu einem Skript oder einem Protokoll passt:

```bash
curl "https://af.example.com/api/v2/job/42?text=true" -H "Authorization: Bearer <token>"
```

Sein `status` ist `running`, solange er läuft, und `approve`, solange er auf eine Genehmigung wartet. Ein Job endet mit einem dieser Werte:

| Status | Bedeutung |
|---|---|
| `success` | Der Job wurde ohne Fehler beendet |
| `failed` | Der Job ist fehlgeschlagen |
| `warning` | Ein Multistep-Job wurde beendet, aber ein Schritt mit gesetztem `continue` ist unterwegs fehlgeschlagen |
| `aborted` | Der Job wurde abgebrochen |
| `rejected` | Die Genehmigung wurde verweigert, daher lief nicht, was darauf wartete |
| `abandoned` | Der Prozess, der den Job verfolgte, wurde gestoppt (ein Neustart, ein ersetzter Container), und der Job wurde aufgegeben |

Ein Job, der auf einem Runner lief, als er aufgegeben wurde, kann dennoch mit seinem tatsächlichen Ergebnis enden, wenn dieser Runner ihn doch noch zu Ende bringt.

---

## Jobs finden

`GET /api/v2/job` listet die neuesten Jobs zuerst auf, als `{ "count": ..., "records": [ ... ] }`. Diese Query-Parameter grenzen die Liste ein:

| Parameter | Bedeutung |
|---|---|
| `records` | Wie viele Jobs höchstens. Der Standard ist [`JOBS_LIST_SIZE`](../customization/features.html#env_JOBS_LIST_SIZE) (1000), und 5000 das Maximum, sofern `JOBS_LIST_SIZE` nicht höher ist. |
| `user`, `user_type` | Nur die Jobs dieses Benutzers. `user_type` ist `local`, wenn es weggelassen wird (`ldap`, `azuread`, `oidc` für die anderen). |
| `runner` | Nur die Jobs, die auf diesem Runner liefen |

```bash
curl "https://af.example.com/api/v2/job?records=20&user=automation" -H "Authorization: Bearer <token>"
```

Ein Benutzer sieht seine eigenen Jobs und die Jobs, die auf eine Genehmigung warten, die eine seiner Rollen erteilen darf. Ein Admin oder eine Rolle mit der
Option `showAllJobLogs` oder `manageAllJobs` sieht jeden Job. Ein Datensatz enthält die Zusammenfassung des Jobs (`id`, `form`, `status`, `start`, `end`, `user`, `runner`, ...); lesen Sie
den Job selbst für seine Extravars und seine Ausgabe.

`GET /api/v2/job/approvals` antwortet mit einer Zahl: wie viele Jobs auf eine Genehmigung warten, die der Benutzer erteilen darf.

---

## Mehr über einen Job

Diese Endpunkte lesen mehr von einem Job:

| Aufruf | Was er zurückgibt |
|---|---|
| `GET /api/v2/job/{id}/rawformdata` | Die Feldwerte, mit denen der Job gestartet wurde, wie das Formular sie hielt. Es gelten dieselben Berechtigungen wie für einen erneuten Start: Ihr eigener Job (oder jeder Job für einen Admin oder eine Rolle mit `manageAllJobs`), ein Formular, das den erneuten Start erlaubt, und die Rollenoption `allowJobRelaunch`. |
| `GET /api/v2/job/{id}/events` | Die strukturierten Ereignisse eines Playbook-Jobs (ab 7.3.0, für ein Playbook auf einer RTE ab 7.3.0): jedes Play, jeder Task, jedes Host-Ergebnis und die Zusammenfassung, mit ihren `order`, `type`, `play`, `task`, `host`, `duration` und `time` |
| `GET /api/v2/job/{id}/events/{order}` | Eines dieser Ereignisse mit seinem ganzen `result`, wie der Dialog **Ergebnis der Aufgabe** es zeigt; `400`, wenn `order` keine ganze Zahl ist, `404`, wenn der Job kein solches Ereignis hat |
| `GET /api/v2/job/{id}/node/{nodeId}` | Ein Knoten eines Workflow-Jobs: `{ "node", "job", "extravars", "artifacts" }`, wobei `job` die ID des eigenen Jobs des Knotens ist, oder `null`, wenn der Knoten nicht lief. |

---

## Weitere Aktionen

Diese Endpunkte wirken auf einen bestehenden Job:

| Aufruf | Aktion |
|---|---|
| `POST /api/v2/job/{id}/abort` | Einen laufenden Job abbrechen |
| `POST /api/v2/job/{id}/relaunch` | Einen Job erneut starten, wie er lief oder mit Änderungen (siehe [Erneut starten](../launch-validation/relaunching.html)) |
| `POST /api/v2/job/{id}/approve` | Einen Job genehmigen, der auf Genehmigung wartet; Ihr eigener Job antwortet `403`, sofern seine Genehmigung nicht `allowSelf: true` setzt oder Sie Admin sind |
| `POST /api/v2/job/{id}/reject` | Einen Job ablehnen, der auf Genehmigung wartet |
| `GET /api/v2/job/{id}/download` | Die Ausgabe des Jobs herunterladen |
| `DELETE /api/v2/job/{id}` | Einen Job löschen |

Abbrechen, Genehmigen, Ablehnen und Löschen antworten mit einer Meldung, ein erneuter Start zusätzlich mit der ID des neuen Jobs:

```json
{ "message": "Job has been relaunched with job id 43", "id": 43 }
```

Fügen Sie einem erneuten Start `?verbose=true` hinzu, um den neuen Job im ausführlichen Modus laufen zu lassen, mit der Rollenoption `allowVerboseMode`. Ein Job, der
sich im falschen Zustand für die Aktion befindet, zum Beispiel beim Abbrechen eines bereits beendeten Jobs, antwortet `409`.
