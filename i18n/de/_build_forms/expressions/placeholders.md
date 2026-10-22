---
layout: default
title: Platzhalter
parent: Ausdrücke
nav_order: 0.5
translated_from: bd63e437a4f77c707a1bf8d8ee99b1516063b62a
---

# Platzhalter
{: .no_toc }

Mit `$(...)` auf ein anderes Feld, eine Konstante oder den aktuellen Benutzer verweisen
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Was ein Platzhalter ist

Ein Platzhalter ist ein Verweis in der Form `$(reference)`. Er wird durch einen Wert ersetzt, bevor der Text, der ihn enthält, verwendet wird.

Platzhalter funktionieren in `expression`, `query` und `default` eines Felds (ausgewertet mit `evalDefault`) sowie in seinem `label`,
`help` und `placeholder`. Ein Feld mit einem Platzhalter hängt von dem Feld ab, das dieser nennt: Es wartet, bis dieses Feld einen
Wert hat, und wird jedes Mal neu ausgewertet, wenn sich dieser Wert ändert. So entstehen kaskadierende Dropdown-Listen.

```yaml
- name: city
  type: enum
  values: [Amsterdam, Brussels]
- name: datacenter
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select name from cmdb.datacenter where city='$(city)'
```

---

## Worauf ein Platzhalter verweisen kann

Ein Platzhalter nennt ein Feld des Formulars oder eines der folgenden, die jedes Formular hat:

| Verweis | Was er enthält |
|---|---|
| `$(field)` | den Wert eines anderen Felds des Formulars |
| `$(name)`, eine Konstante | eine [Konstante](../config/constants.html) aus `config.yaml` oder einen Wert aus den `varsFiles` des Formulars |
| `$(__user__)` | den angemeldeten Benutzer: `username`, `type`, `groups`, `roles` |
| `$(__parent__.field)` | in einem [Unterformular](../forms/subform.html) (eine Listenzeile, ein Wizard-Schritt) einen Wert des übergeordneten Formulars |

```yaml
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
```

---

## Auf Teile eines Werts zugreifen

Punkt- und Indexnotation lesen einen Teil eines Werts, solange der Pfad nur Buchstaben, Ziffern, `_`, `-`, `.` und `[n]` enthält:

| Platzhalter | Auf | Ergibt |
|---|---|---|
| `$(field)` | einem Text-, Zahlen- oder Passwortfeld | den Wert |
| `$(field)` | einem Enum aus Datensätzen | die `placeholderColumn` des ausgewählten Datensatzes, sonst seine erste Spalte |
| `$(field.col)` | einem Enum aus Datensätzen | diese Spalte des ausgewählten Datensatzes |
| `$(field)` | einem Enum mit `multiple: true` | die gewählte Spalte jedes ausgewählten Datensatzes, als Array |
| `$(field)` | einem Ausdruck, einer Liste oder einer Konstante | den ganzen Wert (eine Liste liefert ihre Zeilen) |
| `$(field.a.b)`, `$(f[0].x)` | einem Ausdruck, einer Liste oder einer Konstante | diesen Teil des Objekts oder Arrays |

Mit `placeholderColumn: "*"` auf einem Enum liefert `$(field)` den ganzen ausgewählten Datensatz statt einer Spalte.

```yaml
- name: city
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select id, name from cmdb.city
  valueColumn: name
  placeholderColumn: id        # $(city) gives the id; $(city.name) still gives the name
- name: servers
  type: expression
  expression: "[{name: 'web1'}, {name: 'web2'}]"
  runLocal: true
- name: first_server
  type: expression
  expression: $(servers[0].name)   # 'web1'
  runLocal: true
```

---

## Wie der Wert eingesetzt wird

Wie ein Wert in den Text eingesetzt wird, hängt davon ab, wo der Platzhalter steht.

| Wo | Beispiel | Wird zu |
|---|---|---|
| in einem Ausdruck, außerhalb von Anführungszeichen | `$(count) + 1` | einem JavaScript-Literal: Eine Zahl bleibt eine Zahl, ein Text wird zu einer Zeichenkette in Anführungszeichen, ein Objekt oder Array zu einem Literal |
| in einem Ausdruck, als ganze Zeichenkette in Anführungszeichen | `fn.fnLs('$(dir)')` | demselben Literal, einschließlich der Anführungszeichen, sodass ein Wert mit einem Anführungszeichen nicht ausbrechen kann |
| in einem Ausdruck, innerhalb einer längeren Zeichenkette | `'$(dir)/vars'` | dem Text, für diese Zeichenkette maskiert |
| in einer Abfrage, einem Label, einem Hilfetext | `where city='$(city)'` | dem Text |

Ein Feld, dessen Platzhalter noch nicht alle aufgelöst werden können, wird nicht ausgewertet; mit `ignoreIncomplete: true` wird ein fehlender Wert
stattdessen als `undefined` eingesetzt.

### Backticks und `${` in einem Wert

Ab 7.3.0 kann ein Feldwert nicht als Code laufen, wenn der Server ihn in einen Ausdruck einsetzt (Remote-Ausdrücke, Start-Validierung,
MCP und Chat). Ein Backtick oder `${` im Wert wird als Unicode-Escape geschrieben (```, `${`), sodass er auch innerhalb
eines Template-Literals Text bleibt. Serverseitige Ausdrücke lehnen Template-Literale ganz ab; verwenden Sie dafür `runLocal`.

Ein `runLocal`-Ausdruck, der im Browser ausgewertet wird, setzt den Wert so ein, wie die Tabelle oben es beschreibt, ohne dieses Escape; setzen Sie dort
also keinen Platzhalter in ein Template-Literal.

---

## Siehe auch

Verwandte Seiten und FAQ-Einträge:

- [Lokale Ausdrücke](local.html) und [Remote-Ausdrücke](remote.html): wo die meisten Platzhalter verwendet werden
- [FAQ: Kaskadierende Dropdowns](../faq.html#cascaded-dropdowns) und [Feldplatzhalter](../faq.html#field-placeholders): weitere Beispiele
- [FAQ: Wie greife ich in einem Unterformular auf Daten des übergeordneten Formulars zu?](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)
