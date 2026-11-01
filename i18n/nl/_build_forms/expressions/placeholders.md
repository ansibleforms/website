---
layout: default
title: Placeholders
parent: Expressies
nav_order: 0.5
translated_from: 7b1ef975e0d5d92c446f050ffda02ee4acfa97aa
---

# Placeholders
{: .no_toc }

Verwijs naar een ander veld, een constante of de huidige gebruiker met `$(...)`
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wat een placeholder is

Een placeholder is een verwijzing in de vorm `$(reference)`. Die wordt door een waarde vervangen voordat de tekst waarin hij staat wordt gebruikt.

Placeholders werken in `expression`, `query` en `default` van een veld (geëvalueerd met `evalDefault`), en in `label`,
`help` en `placeholder`. Een veld met een placeholder hangt af van het veld dat de placeholder noemt: het wacht tot dat veld een
waarde heeft, en wordt opnieuw geëvalueerd telkens als die waarde verandert. Zo bouw je trapsgewijze keuzelijsten.

```yaml
- name: city
  type: enum
  values: [Amsterdam, Brussels]
- name: datacenter
  type: enum
  dbConfig: CMDB            # a database of Connections > Databases
  query: select name from cmdb.datacenter where city='$(city)'
```

---

## Waarnaar een placeholder kan verwijzen

Een placeholder noemt een veld van het formulier, of een van deze, die elk formulier heeft:

| Verwijzing | Wat erin zit |
|---|---|
| `$(field)` | de waarde van een ander veld van het formulier |
| `$(name)`, een constante | een [constante](../config/constants.html) uit `config.yaml`, of een waarde uit de `varsFiles` van het formulier |
| `$(__user__)` | de aangemelde gebruiker: `username`, `type`, `groups`, `roles` |
| `$(__parent__.field)` | in een [subformulier](../forms/subform.html) (een rij van een lijst, een stap van een wizard), een waarde van het bovenliggende formulier |

```yaml
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
```

---

## Een deel van een waarde lezen

Met punt- en indexnotatie lees je een deel van een waarde, zolang het pad alleen letters, cijfers, `_`, `-`, `.` en `[n]` bevat:

| Placeholder | Op | Geeft |
|---|---|---|
| `$(field)` | een tekst-, getal- of wachtwoordveld | de waarde |
| `$(field)` | een enum met records | de `placeholderColumn` van het geselecteerde record, anders de eerste kolom |
| `$(field.col)` | een enum met records | die kolom van het geselecteerde record |
| `$(field)` | een enum met `multiple: true` | de gekozen kolom van elk geselecteerd record, als array |
| `$(field)` | een expressie, lijst of constante | de hele waarde (een lijst geeft haar rijen) |
| `$(field.a.b)`, `$(f[0].x)` | een expressie, lijst of constante | dat deel van het object of de array |

Met `placeholderColumn: "*"` op een enum geeft `$(field)` het hele geselecteerde record in plaats van één kolom.

```yaml
- name: city
  type: enum
  dbConfig: CMDB
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

## Hoe de waarde wordt ingevoegd

Hoe een waarde in de tekst wordt ingevoegd, hangt af van waar de placeholder staat.

| Waar | Voorbeeld | Wordt |
|---|---|---|
| een expressie, buiten aanhalingstekens | `$(count) + 1` | een JavaScript-literal: een getal blijft een getal, een tekst wordt een string tussen aanhalingstekens, een object of array een literal |
| een expressie, een volledige string tussen aanhalingstekens | `fn.fnLs('$(dir)')` | dezelfde literal, aanhalingstekens inbegrepen, zodat een waarde met een aanhalingsteken erin niet kan ontsnappen |
| een expressie, binnen een langere string | `'$(dir)/vars'` | de tekst, ge-escaped voor die string |
| een query, een label, een helptekst | `where city='$(city)'` | de tekst |

Een veld waarvan nog niet alle placeholders kunnen worden opgelost, wordt niet geëvalueerd; met `ignoreIncomplete: true` wordt een ontbrekende waarde
in plaats daarvan als `undefined` ingevoegd.

### Backticks en `${` in een waarde

Vanaf 7.3.0 kan een veldwaarde niet als code draaien wanneer de server haar in een expressie invoegt (remote expressies, launch-validatie,
MCP en chat). Een backtick of `${` in de waarde wordt als unicode-escape geschreven (```, `${`), zodat het
tekst blijft, zelfs binnen een template literal. Expressies aan de serverkant weigeren template literals helemaal; gebruik daarvoor `runLocal`.

Een `runLocal`-expressie die in de browser wordt geëvalueerd, voegt de waarde in zoals de tabel hierboven zegt, zonder die escape, dus zet daar
geen placeholder binnen een template literal.

---

## Zie ook

Gerelateerde pagina's en FAQ-items:

- [Lokale expressies](local.html) en [Remote expressies](remote.html): waar de meeste placeholders worden gebruikt
- [FAQ: Trapsgewijze keuzelijsten](../faq.html#cascaded-dropdowns) en [Placeholders in velden](../faq.html#field-placeholders): meer voorbeelden
- [FAQ: Hoe krijg ik toegang tot de gegevens van het bovenliggende formulier in een subformulier?](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)
