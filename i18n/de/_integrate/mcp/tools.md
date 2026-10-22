---
layout: default
title: Tools
parent: MCP-Server
nav_order: 2
translated_from: a8c4d7ff425720a098c720cc1ade3629094bdb40
---

# Tools
{: .no_toc }

Die Tools, mit denen ein Agent Formulare ausfüllt, genehmigt und erneut startet
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Der MCP-Server bietet bis zu 15 Tools an. Sechs werden jedem Benutzer angeboten; die anderen folgen den Rollenoptionen des Benutzers, sodass einem Benutzer
ohne eine Option deren Tools gar nicht erst angeboten werden:

| Tool | Was es tut | Angeboten mit |
|---|---|---|
| `list_forms` | Die Formulare, die der Benutzer verwenden darf: Name, Beschreibung, Kategorien und `enableForChat` (ob der Chat-Assistent es anbietet). | immer |
| `get_form` | Die vollständige Definition eines Formulars. Jedes Feld trägt zusätzlich `dynamic` (aus einem Ausdruck oder einer Abfrage ausgewertet) und `dependsOn` (die Felder, die es liest). | immer |
| `resolve_field` | Wertet das Formular für die bisher ausgefüllten Werte aus. Siehe unten. | immer |
| `launch_job` | Startet das Formular mit den angegebenen Werten, genau wie eine Übermittlung im Browser. Gibt die Job-ID zurück. | immer |
| `relaunch_job` | Startet einen Job erneut, mit einigen geänderten Feldern. Siehe unten. | immer |
| `get_job` | Status und Ausgabe eines Jobs (`tail` begrenzt die Ausgabe auf die letzten Zeilen). | immer |
| `plan_job` | Führt das Formular einmal später aus, als der Benutzer: was **Später ausführen (einmalig)** im Formular tut. | `allowPlannedJobs` |
| `create_schedule` | Legt einen Zeitplan an, wiederkehrend (`cron`) oder einmalig (`run_at`), wie auf der Seite **Zeitpläne**. | `allowScheduledJobs` |
| `list_schedules` | Die Zeitpläne, die der Benutzer sehen darf: alle mit `allowScheduledJobs`, sonst die Läufe, die er geplant hat. | `allowPlannedJobs` oder `allowScheduledJobs` |
| `get_schedule` | Ein Zeitplan, mit seinen Extra-Variablen (geheim aussehende maskiert) und der Ausgabe seines letzten Laufs. | `allowPlannedJobs` oder `allowScheduledJobs` |
| `delete_schedule` | Bricht einen geplanten Lauf ab oder löscht einen Zeitplan, den der Benutzer sehen darf. | `allowPlannedJobs` oder `allowScheduledJobs` |
| `list_stored_jobs` | Die [gespeicherten Jobs](../jobs/stored-jobs.html), die der Benutzer sehen darf, ohne ihre Werte. | `allowStoredJobs` |
| `get_stored_job` | Ein gespeicherter Job mit seinen Werten, über `id` oder über `form` und `name` unter den eigenen des Benutzers. | `allowStoredJobs` |
| `store_job` | Speichert Werte eines Formulars unter einem Namen, wie **Speichern** im Formular. | `allowStoredJobs` |
| `delete_stored_job` | Löscht einen gespeicherten Job, den der Benutzer sehen darf. | `allowStoredJobs` |

`launch_job`, `relaunch_job` und `plan_job` nehmen `verbose: true`, um den Job im ausführlichen Modus laufen zu lassen, was die
Rollenoption `allowVerboseMode` braucht. Mit [`MCP_READ_ONLY`](setup.html#limiting-what-agents-can-do) werden die Tools, die starten, planen oder
ändern (`launch_job`, `relaunch_job`, `plan_job`, `create_schedule`, `delete_schedule`, `store_job` und `delete_stored_job`),
nicht angeboten.

Es gibt kein Tool, um beliebige Ausdrücke, Abfragen, Playbooks oder Extravars auszuführen. Ausdrücke
und Abfragen laufen immer nur so, wie das Formular sie definiert.

Der [Chat-Assistent](../chat) verwendet diese Tools ebenfalls, mit einer Schaltfläche **Starten** anstelle von `launch_job`.

---

## Ein Formular ausfüllen

Rufen Sie `resolve_field` mit dem Formularnamen und den bisherigen Werten auf, und erneut nach jeder Antwort. Es arbeitet sich
in Abhängigkeitsreihenfolge durch die Felder und meldet für jedes:

- `status`: `resolved`, `waiting` (mit `waitingFor`), `hidden` oder `error` (das Feld fällt auf seinen Standard zurück);
- `value`, `default` und, für Auswahlfelder, `options` (höchstens `maxOptions`, Standard 200);
- `needsInput`: ein Pflichtfeld ohne Wert oder eine Auswahl, die noch auf `__auto__` steht;
- `validationErrors`: die Regeln, die der Wert verletzt, als `[{type, description}]`, mit der Meldung des Browsers.

Für das ganze Formular listen `missing` und `invalid` auf, was noch zu beheben ist; `launch_job` lehnt es ab, bis `complete` true ist.

Die Validierung ist der eigene Code des Browsers, geteilt mit der [Startvalidierung](../launch-validation). Versteckte Felder werden nicht
validiert, und ein leeres optionales Feld ist gültig.

---

## Zeitpläne und geplante Läufe

`plan_job` nimmt dieselben `form`, `values` und `expectedPayloadHash` wie `launch_job`, mit einem `name` für den Lauf und `run_at`, einer
ISO-8601-Zeit mit ihrem Offset oder `Z` (`2026-10-15T22:00:00+02:00`); eine Zeit ohne Zone wird abgelehnt. Die Werte werden jetzt aufgelöst
und validiert und beim Auslösen des Laufs erneut geprüft, wie bei einem [geplanten Lauf](../jobs/schedules.html#planned-runs) im
Browser. Die Antwort gibt die Laufzeit in UTC und nach der Uhr der App an.

`create_schedule` nimmt ein `form`, einen `name`, entweder `cron` (fünf Felder, etwa `0 22 * * 1-5`) oder `run_at`, und die
`extraVars`, die der Job bekommt. Ein solcher Zeitplan läuft als `Schedule Service`, ohne die Validierung des Formulars; um ein Formular einmal als
der Benutzer auszuführen, verwenden Sie `plan_job`. Zeitplannamen sind eindeutig.

---

## Gespeicherte Jobs

Ein gespeicherter Job sind die unter einem Namen gespeicherten Werte eines Formulars; die Tools arbeiten auf denselben gespeicherten Jobs wie der Browser.

`list_stored_jobs` listet die eigenen gespeicherten Jobs des Benutzers auf, oder die aller für einen Benutzer mit `showSettings`, mit ihrem Namen, ihrer Beschreibung,
ihrem Formular, ihrer Erstellung und ihrem Ablauf. Einer, der als `usable` markiert ist (ein eigener des Benutzers, zu einem Formular, das er starten darf), lässt sich als `storedJob`
(`{ "id": 7 }` oder `{ "name": "..." }` unter den eigenen des Benutzers für dieses Formular) an `resolve_field`, `launch_job` oder `plan_job` übergeben: seine
Werte sind der Ausgangspunkt, und `values` werden darübergelegt. Passwortfelder werden nicht gespeichert, geben Sie sie daher in `values` an.
`launch_job` und `plan_job` aus einem gespeicherten Job brauchen den `expectedPayloadHash`, den `resolve_field` dafür zurückgegeben hat, und
`resolve_field` lehnt `storedJob` zusammen mit `subform` ab.

`store_job` nimmt das `form`, einen `name`, der unter den gespeicherten Jobs des Benutzers für dieses Formular eindeutig ist, die `values` und optional eine
`description` und `expires_at` (ISO 8601 mit seinem Offset oder `Z`). Seine Antwort sagt, welche Passwortfelder weggelassen wurden.

---

## Werte übergeben

Übergeben Sie `field`, um nur dieses Feld und das, wovon es abhängt, aufzulösen. Für eine Listenzeile oder einen Wizard-Schritt übergeben Sie `subform` (und
optional `parent`, die Werte des übergeordneten Formulars).

Senden Sie Werte so, wie der Browser sie hält. Ein Auswahlfeld akzeptiert auch einen Teildatensatz oder seinen `valueColumn`-Wert
(`"vol1"`), und ein Array, wenn es `multiple` ist. Berechnete Felder ignorieren gesendete Werte, sofern sie nicht `editable` sind.

---

## Genau die Payload genehmigen

Wenn das Formular vollständig ist, gibt `resolve_field` auch zurück, was `launch_job` übermitteln wird:

- `modeledExtravars`: die Extravars, nachdem `model`, `valueColumn` und `output` angewendet wurden,
  mit maskierten Passwortfeldern;
- `credentials`: die AnsibleForms-Anmeldedaten, die der Job verwenden wird (Namen, keine Secrets);
- `payloadHash`: ein SHA-256-Hash aus dem Formularnamen, den echten Extravars und den Anmeldedaten.

Zeigen Sie `modeledExtravars` dem Bediener und übergeben Sie den `payloadHash`, den er genehmigt hat, an
`launch_job` als `expectedPayloadHash`. Der Start löst das Formular erneut auf und wird abgelehnt,
wenn die Payload abweicht, zum Beispiel weil eine Abfrage jetzt anders antwortet.
`ansibleforms_user`, `__jobid__` und `__verbose__` werden beim Start hinzugefügt und gehören nicht zum Hash.

`launch_job` prüft nur die Payload. Eine Bearbeitung des Formulars, die die Payload gleich lässt, lehnt den Start nicht ab.
Jede Antwort von `resolve_field` trägt außerdem einen `formFingerprint`, einen SHA-256-Hash der Formulardefinition: um einen
Start nach jeder Bearbeitung des Formulars abzulehnen, vergleichen Sie ihn selbst, bevor Sie `launch_job` aufrufen, wie es die Schaltfläche
**Starten** des Chat-Assistenten tut.

---

## Erneut starten mit Änderungen

`relaunch_job` nimmt eine Job-`id` und `values`: nur die zu ändernden Felder, als Rohwerte.
`values` wird über die Werte gelegt, mit denen der Job ursprünglich gestartet wurde, und das Ergebnis wird
genau wie bei `launch_job` aufgelöst und validiert, Listenzeilen eingeschlossen, und dann als
neuer Job von Ihnen gestartet (`ansibleforms_user` sind Sie, nicht der ursprüngliche Absender). Datei-Uploads aus
dem ursprünglichen Job werden wiederverwendet.

Ohne `values` ist es ein erneuter Start **so, wie der Job lief**: seine gespeicherten Extravars werden auf dem
Server wieder abgespielt, Passwörter eingeschlossen (die Vorschau maskiert sie). Steht das Formular jedoch unter der Startvalidierung
`enforce`, durchläuft der erneute Start dieselbe Prüfung wie ein erneuter Start mit
Änderungen.

**Passwörter werden nie mit den Feldwerten gespeichert**, daher wird ein erneuter Start, der die
Prüfung durchläuft, abgelehnt, wenn das Formular ein Passwortfeld zeigt, auf oberster Ebene oder in einer Listenzeile
(`unsupported`, mit den `passwordFields`). Ein Passwortfeld, das durch seine Abhängigkeiten verborgen ist,
blockiert den erneuten Start nicht. Siehe [Startvalidierung](../launch-validation).

Rufen Sie es zuerst mit `preview: true` auf: es gibt `modeledExtravars` (Passwörter maskiert),
`credentials` und einen `payloadHash` zurück, ohne zu starten. Bestätigen Sie sie mit dem Benutzer und rufen Sie
es dann erneut mit `expectedPayloadHash` auf. Es gelten dieselben Berechtigungen wie für einen erneuten Start im Browser:
das Formular muss den erneuten Start erlauben, und Ihre Rollen brauchen die Option `allowJobRelaunch`. Ein
Job ohne gespeicherte Formulardaten (gestartet, bevor es den erneuten Start gab) und ein Wizard-Formular lassen sich nicht
mit Änderungen erneut starten.

Die REST-API bietet dasselbe über `POST /api/v2/job/{id}/relaunch` mit dem Body
`{ "values": { ... } }`; ohne Body spielt sie den Job so ab, wie er lief.

---

## Fehler

Ein abgelehnter Aufruf ist ein Tool-Fehler, dessen strukturierter Inhalt einen `code` und die Details trägt:

| Code | Wann |
|---|---|
| `form_incomplete` | `launch_job` oder `relaunch_job` bei einem Formular, das nicht vollständig ist, mit `missing`, `invalid`, `waiting`, `validationErrors` und `rowErrors` |
| `payload_mismatch` | die Payload weicht von `expectedPayloadHash` ab, mit beiden Hashes |
| `access_denied` | die Rollen des Benutzers gewähren das Formular, den Job, den Zeitplan oder den gespeicherten Job nicht, oder den ausführlichen Modus, oder der Server ist schreibgeschützt |
| `not_found` | kein solches Formular, Subform oder Job |
| `unsupported` | ein Wizard-Formular, ein Subform für sich allein, ein Dateifeld oder ein `relaunch_job`, das ein angezeigtes Passwortfeld bräuchte |
| `no_form_data` | `relaunch_job` mit Änderungen für einen Job, der keine Formularwerte gespeichert hat, etwa einen von einem Zeitplan gestarteten; starten Sie ihn stattdessen ohne Änderungen erneut |
| `invalid_request` | eine Anfrage, die der Server als fehlerhaft ablehnt |
| `internal_error` | alles andere |
