---
layout: default
title: Expressions
nav_order: 1
has_children: true
has_toc: false
permalink: /expressions/
translated_from: 52d74e32540fba4dfa5078c8976147b39a2ad2cf
---

# Expressions
{: .no_toc }

Calcula els valors dels camps amb JavaScript, al navegador o al servidor
{: .fs-6 .fw-300 }

---

Per als autors de formularis: omple els camps de manera dinàmica amb JavaScript, calculats al navegador o obtinguts al servidor.

L'atribut `expression` d'un camp de formulari et permet crear formularis dinàmics amb expressions JavaScript.

---

## Introducció

L'atribut `expression` està disponible en diversos tipus de camp:
- camp `enum`: per omplir les opcions del desplegable de manera dinàmica
- camp `expression`: per obtenir o generar qualsevol tipus de dades
- camp `html`: per construir-ne el contingut HTML
- camps `yaml` i `list`: per omplir-ne les dades

Les expressions JavaScript s'avaluen al **costat del servidor** (per defecte) o al **costat del client**, segons el que indiqui la propietat del camp `runLocal`.
Un camp `html`, i els tipus de camp `local`, `local_out` i `credential`, sempre executen la seva expressió al navegador, digui el que digui
`runLocal`.

- **Al costat del servidor** (`runLocal: false`, el valor per defecte): funcions predefinides que obtenen dades d'API, fitxers i bases de dades.
- **Al costat del client** (`runLocal: true`): el codi aprofita tot el motor JavaScript dins de l'entorn aïllat del navegador per fer càlculs, transformacions i manipulacions.

---

## Qüestions de seguretat

Com que les expressions s'avaluen amb la funció `eval` de JavaScript, la injecció de codi és un risc potencial:

- **Les expressions del costat del servidor** passen primer per un sanejador: cada crida ha de ser una funció `fn.` o `fnc.`, i es rebutgen les línies múltiples,
  el `;`, les plantilles literals, `process.env` i les maneres de sortir d'`eval` (`import`, `require`, `constructor`, ...).
- **Les expressions del costat del client** s'avaluen dins de l'entorn aïllat del navegador i es poden considerar segures.

El nivell d'exigència del sanejador depèn de
[`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER):

| Valor | Expressions del costat del servidor |
|---|---|
| `strict` (per defecte) | crides `fn.` i `fnc.`, i mètodes sobre el seu resultat, com ara `fn.fnTime().format('YYYY')` |
| `paranoid` | només crides directes `fn.` i `fnc.`, sense mètodes sobre el seu resultat |
| `off` | es rebutgen totes les expressions del costat del servidor; només funcionen les expressions `runLocal` |
| `legacy` | les regles de la 6.2.1, que permeten a qualsevol usuari autenticat executar codi al servidor; només per a una actualització, i només a l'entorn real (no des de la pàgina de configuració) |

Un valor buit o desconegut equival a `strict`. Un canvi s'aplica a la següent expressió, sense reiniciar.

---

## En aquesta secció

Cada tema té la seva pròpia pàgina:

| Pàgina | Què tracta |
|---|---|
| [Marcadors](placeholders.html) | Fer referència a un altre camp, a una constant o a l'usuari amb `$(...)` |
| [Expressions locals](local.html) | JavaScript que s'executa dins de l'entorn aïllat del navegador |
| [Expressions remotes](remote.html) | Funcions del costat del servidor per a dates, xarxes, fitxers, SSH i noms numerats |
| [API REST](rest-apis.html) | Cridar API REST amb autenticació bàsica, per token o personalitzada |
| [Credencials](credentials.html) | Llegir una credencial desada |
| [Ordenació](sorting.html) | Ordenar matrius amb un objecte d'ordenació |
| [Consultes jq](jq.html) | Transformar dades amb jq |
