---
layout: default
title: Log en enforce
parent: Launch-validatie
nav_order: 2
translated_from: 10a187b350155ce68bfc50e379e1b6b8637df57a
---

# Log en enforce
{: .no_toc }

Wat elke modus doet met een start die de regels overtreedt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wat `log` doet

Elke start wordt gecontroleerd, maar voor de gebruiker verandert er niets. Er wordt een waarschuwing in het log geschreven wanneer:

- de start **geweigerd zou worden**, met de reden (alleen veldnamen en soorten regels, nooit
  waarden):

  ```
  Launch validation would refuse form 'Create VM' for alice (launch validation 'log') :
  failing rules : hostname (regex) ; failing rows : disks[1].size (maxValue)
  ```

- de extravars die de client stuurde **verschillen** van de extravars die de server opbouwt, met de
  sleutels op het hoogste niveau die verschillen:

  ```
  Launch of form 'Create VM' : the extravars differ from the ones the server builds for
  created_at, vm (launch validation 'log' ; 'enforce' would run the server's)
  ```

Draai eerst een tijdje `log` op een echte instantie. Dat laat zien welke formulieren geweigerd zouden worden en
welke op de server andere waarden berekenen, voordat iemand er last van heeft.

---

## Wat `enforce` doet

Onder `enforce` wordt een ongeldige start geweigerd, en draait een geldige start met de extravars die de server
opbouwt.

### Een start die de regels overtreedt, wordt geweigerd

`POST /api/v2/job` antwoordt `422` met de velden die niet slagen:

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

- `missing` - verplichte velden zonder waarde;
- `invalid` - velden die een regel overtreden, keuzes die geen van de opties zijn, en lijst-
  velden met een rij die niet slaagt;
- `waiting` - velden die niet geëvalueerd konden worden (een veld dat ze nodig hebben, kreeg nooit een waarde);
- `validationErrors` - per veld elke regel die niet slaagt, met de melding die de browser toont;
- `rowErrors` - per lijstveld de rijen die niet slagen (zie [Lijstrijen](list-rows-and-subforms.html));
- `uploads` - bestandsvelden waarvan de upload niet geverifieerd kon worden.

Een start **zonder `rawFormData`** wordt ook geweigerd: de waarden ervan kunnen niet worden gecontroleerd.

### Een geldige start draait met de extravars van de server

De job draait niet met de extravars die de client stuurde. De server bouwt ze op uit de gecontroleerde
waarden, met dezelfde code als de browser, en draait met die. Een aanroeper die geldige
`rawFormData` stuurt naast andere `extravars`, krijgt de extravars die bij de waarden horen, niet
die hij stuurde.

Uit het verzoek behoudt de server `__verbose__` (alleen voor gebruikers die de verbose-modus mogen gebruiken). De
gereserveerde sleutels (`__playbook__`, `__inventory__`, ...) komen zoals altijd uit het formulier, en
`ansibleforms_user` is de gebruiker die de start uitvoert.

### Wat de gebruiker zag, is niet altijd wat er draait

De extravars opbouwen betekent het formulier opnieuw evalueren: elke expressie en query draait
nog een keer op de server, een moment nadat de browser ze uitvoerde, als de gebruiker die de start uitvoert. Een waarde
die afhangt van **wanneer** of **waar** ze wordt geëvalueerd, kan verschillen, en in dat geval wordt de
waarde van de server gebruikt:

| Wat | Waarom het kan verschillen | Hoeveel |
|---|---|---|
| `fn.fnTime()`, een tijdstempel, een naam die uit de tijd is opgebouwd | opnieuw geëvalueerd, een paar seconden later | doet er alleen toe op de grens van een seconde of een datum. `fnTime` draait ook in de browserflow al op de server, met dezelfde tijdzone (de `TZ` van de container) |
| een query, `fnRestAdvanced`, `fnSsh`, `fnDnsResolve`, het lezen van een bestand | de externe gegevens zijn in de tussentijd veranderd | alleen als ze veranderd zijn |
| een `runLocal`-expressie die `new Date()`, `toLocaleString` of `Intl` gebruikt | de browser gebruikt de tijdzone en de locale van de gebruiker, de server die van zichzelf | alleen zulke expressies |

Hetzelfde geldt voor **validatie**: een regel die zo'n veld leest (`notIn` tegen het resultaat van een query,
`validIf` op een berekende vlag), wordt gecontroleerd tegen de waarde van de server. Formulieren waarvan de
extravars verschillen, verschijnen in de hierboven beschreven `log`-waarschuwingen; bekijk ze voordat je enforce inschakelt.
