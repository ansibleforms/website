---
layout: default
title: Registrar i aplicar
parent: Validació del llançament
nav_order: 2
translated_from: 10a187b350155ce68bfc50e379e1b6b8637df57a
---

# Registrar i aplicar
{: .no_toc }

Què fa cada mode amb un llançament que incompleix les regles
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Què fa `log`

Es comprova cada llançament, però per a l'usuari no canvia res. S'escriu un avís al registre quan:

- el llançament **es rebutjaria**, amb el motiu (només noms de camp i tipus de regla, mai
  valors):

  ```
  Launch validation would refuse form 'Create VM' for alice (launch validation 'log') :
  failing rules : hostname (regex) ; failing rows : disks[1].size (maxValue)
  ```

- les extravars que ha enviat el client **difereixen** de les que construeix el servidor, amb les
  claus de primer nivell que difereixen:

  ```
  Launch of form 'Create VM' : the extravars differ from the ones the server builds for
  created_at, vm (launch validation 'log' ; 'enforce' would run the server's)
  ```

Primer, fes funcionar `log` durant un temps en una instància real. Mostra quins formularis es rebutjarien i
quins calculen valors diferents al servidor, abans que afecti ningú.

---

## Què fa `enforce`

Amb `enforce`, un llançament no vàlid es rebutja, i un de vàlid s'executa amb les extravars que construeix
el servidor.

### Un llançament que incompleix les regles es rebutja

`POST /api/v2/job` respon `422` amb els camps que fallen:

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

- `missing`: camps obligatoris sense valor;
- `invalid`: camps que incompleixen una regla, opcions que no són cap de les permeses i camps list
  amb alguna fila que falla;
- `waiting`: camps que no s'han pogut avaluar (un camp que necessiten no ha arribat a tenir valor);
- `validationErrors`: per a cada camp, totes les regles que fallen amb el missatge que mostra el navegador;
- `rowErrors`: per a cada camp list, les files que fallen (vegeu [Files de llista](list-rows-and-subforms.html));
- `uploads`: camps de fitxer la pujada dels quals no s'ha pogut verificar.

Un llançament **sense `rawFormData`** també es rebutja: els seus valors no es poden comprovar.

### Un llançament vàlid s'executa amb les extravars del servidor

La tasca no s'executa amb les extravars que ha enviat el client. El servidor les construeix a partir dels valors
comprovats, amb el mateix codi que el navegador, i executa aquestes. Qui fa una crida enviant uns `rawFormData` vàlids
al costat d'unes `extravars` diferents obté les extravars que corresponen als valors, no
les que ha enviat.

De la petició, el servidor conserva `__verbose__` (només per als usuaris que tenen permès el mode detallat). Les
claus reservades (`__playbook__`, `__inventory__`, ...) surten del formulari, com sempre, i
`ansibleforms_user` és l'usuari que llança.

### El que ha vist l'usuari no sempre és el que s'executa

Construir les extravars vol dir tornar a avaluar el formulari: cada expressió i cada consulta s'executa
un altre cop al servidor, un moment després que ho hagi fet el navegador, com l'usuari que llança. Un valor
que depèn de **quan** o **on** s'avalua pot ser diferent, i en aquest cas es fa servir el
valor del servidor:

| Què | Per què pot ser diferent | En quina mesura |
|---|---|---|
| `fn.fnTime()`, una marca de temps, un nom construït a partir de l'hora | s'avalua de nou, uns segons més tard | només importa en el límit d'un segon o d'una data. `fnTime` ja s'executa al servidor també en el flux del navegador, amb la mateixa zona horària (el `TZ` del contenidor) |
| una consulta, `fnRestAdvanced`, `fnSsh`, `fnDnsResolve`, la lectura d'un fitxer | les dades externes han canviat entremig | només quan han canviat |
| una expressió `runLocal` que fa servir `new Date()`, `toLocaleString`, `Intl` | el navegador fa servir la zona horària i l'idioma de l'usuari, el servidor els seus | només aquestes expressions |

El mateix s'aplica a la **validació**: una regla que llegeix un camp d'aquests (`notIn` contra el resultat d'una
consulta, `validIf` sobre un indicador calculat) es comprova amb el valor del servidor. Els formularis les
extravars dels quals difereixen apareixen als avisos de `log` descrits més amunt; revisa'ls abans d'aplicar enforce.
