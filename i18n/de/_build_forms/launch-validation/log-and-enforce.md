---
layout: default
title: Log und Enforce
parent: Start-Validierung
nav_order: 2
translated_from: 10a187b350155ce68bfc50e379e1b6b8637df57a
---

# Log und Enforce
{: .no_toc }

Was jeder Modus mit einem Start macht, der die Regeln verletzt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Was `log` macht

Jeder Start wird geprüft, aber für den Benutzer ändert sich nichts. Eine Warnung wird ins Protokoll geschrieben, wenn:

- der Start **abgelehnt würde**, mit dem Grund (nur Feldnamen und Regeltypen, nie
  Werte):

  ```
  Launch validation would refuse form 'Create VM' for alice (launch validation 'log') :
  failing rules : hostname (regex) ; failing rows : disks[1].size (maxValue)
  ```

- die Extravars, die der Client gesendet hat, sich von denen **unterscheiden**, die der Server aufbaut, mit den
  Schlüsseln der obersten Ebene, die sich unterscheiden:

  ```
  Launch of form 'Create VM' : the extravars differ from the ones the server builds for
  created_at, vm (launch validation 'log' ; 'enforce' would run the server's)
  ```

Lassen Sie `log` zunächst eine Weile auf einer echten Instanz laufen. So sehen Sie, welche Formulare abgelehnt würden und
welche auf dem Server andere Werte berechnen, bevor jemand betroffen ist.

---

## Was `enforce` macht

Unter `enforce` wird ein ungültiger Start abgelehnt, und ein gültiger läuft mit den Extravars, die der Server
aufbaut.

### Ein Start, der die Regeln verletzt, wird abgelehnt

`POST /api/v2/job` antwortet mit `422` und den fehlerhaften Feldern:

```json
{
  "error": "The form data is not valid",
  "details": {
    "missing": ["owner"],
    "invalid": ["hostname", "disks"],
    "waiting": [],
    "validationErrors": {
      "hostname": [{ "type": "regex", "description": "Must start with prod-" }]
    },
    "rowErrors": {
      "disks": [{ "index": 1, "invalid": ["size"],
                  "validationErrors": { "size": [{ "type": "maxValue", "description": "size must be at most 500" }] } }]
    }
  }
}
```

- `missing`: Pflichtfelder ohne Wert;
- `invalid`: Felder, die eine Regel verletzen, Auswahlen, die keine der Optionen sind, und list-Felder
  mit einer fehlerhaften Zeile;
- `waiting`: Felder, die nicht ausgewertet werden konnten (ein Feld, das sie brauchen, hat nie einen Wert bekommen);
- `validationErrors`: pro Feld jede verletzte Regel mit der Meldung, die der Browser anzeigt;
- `rowErrors`: pro list-Feld die fehlerhaften Zeilen (siehe [Listenzeilen](list-rows-and-subforms.html));
- `uploads`: Dateifelder, deren Upload nicht verifiziert werden konnte.

Ein Start **ohne `rawFormData`** wird ebenfalls abgelehnt: Seine Werte lassen sich nicht prüfen.

### Ein gültiger Start läuft mit den Extravars des Servers

Der Job läuft nicht mit den Extravars, die der Client gesendet hat. Der Server baut sie aus den geprüften
Werten auf, mit demselben Code wie der Browser, und führt diese aus. Ein Aufrufer, der gültige
`rawFormData` zusammen mit abweichenden `extravars` sendet, bekommt die Extravars, die zu den Werten passen, nicht
die, die er gesendet hat.

Aus der Anfrage übernimmt der Server `__verbose__` (nur für Benutzer, die den Verbose-Modus verwenden dürfen). Die
reservierten Schlüssel (`__playbook__`, `__inventory__`, ...) kommen wie immer aus dem Formular, und
`ansibleforms_user` ist der startende Benutzer.

### Was der Benutzer sah, ist nicht immer das, was läuft

Die Extravars aufzubauen heißt, das Formular erneut auszuwerten: Jeder Ausdruck und jede Abfrage läuft
noch einmal auf dem Server, einen Moment nachdem der Browser sie ausgeführt hat, als der startende Benutzer. Ein Wert,
der davon abhängt, **wann** oder **wo** er ausgewertet wird, kann abweichen, und in diesem Fall wird der
Wert des Servers verwendet:

| Was | Warum es abweichen kann | Wie stark |
|---|---|---|
| `fn.fnTime()`, ein Zeitstempel, ein aus der Uhrzeit gebildeter Name | erneut ausgewertet, ein paar Sekunden später | nur relevant an einer Sekunden- oder Datumsgrenze. `fnTime` läuft auch im Browser-Ablauf schon auf dem Server, mit derselben Zeitzone (dem `TZ` des Containers) |
| eine Abfrage, `fnRestAdvanced`, `fnSsh`, `fnDnsResolve`, ein Dateizugriff | die externen Daten haben sich zwischendurch geändert | nur wenn sie sich geändert haben |
| ein `runLocal`-Ausdruck mit `new Date()`, `toLocaleString`, `Intl` | der Browser verwendet Zeitzone und Sprache des Benutzers, der Server seine eigenen | nur solche Ausdrücke |

Dasselbe gilt für die **Validierung**: Eine Regel, die ein solches Feld liest (`notIn` gegen das Ergebnis einer Abfrage,
`validIf` auf einem berechneten Flag), wird gegen den Wert des Servers geprüft. Formulare, deren
Extravars abweichen, erscheinen in den oben beschriebenen `log`-Warnungen; prüfen Sie sie, bevor Sie Enforce einschalten.
