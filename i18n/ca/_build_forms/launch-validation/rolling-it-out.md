---
layout: default
title: Desplegar-la
parent: Validació del llançament
nav_order: 7
translated_from: 399d39dbea694518926bcc20099d19438cbbac29
---

# Desplegar-la
{: .no_toc }

Passar una instància a enforce, i les limitacions conegudes
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Desplegament

`enforce` és el valor per defecte. En una instància amb scripts o altres sistemes que llancen formularis per
REST, arriba-hi per passos, vigilant el registre abans de rebutjar res:

1. Defineix `LAUNCH_VALIDATION=log` per a tota la instància (abans d'actualitzar, si es tracta d'una actualització).
2. Funciona en aquest mode durant un temps i revisa el registre: els avisos `would refuse` indiquen llançaments
   que incompleixen les regles; els avisos `extravars differ` indiquen formularis que calculen alguna cosa
   de manera diferent al servidor (una marca de temps, dades externes). Decideix per a cada formulari si això
   importa.
3. Passa aquests formularis a `launchValidation: enforce`. Qui feia crides amb valors no vàlids o
   amb extravars inventades ara rep un `422` amb el motiu.
4. Quan tots els formularis es comportin com s'espera, treu `LAUNCH_VALIDATION` (o posa-hi `enforce`) per a tota la instància.

---

## Limitacions

La validació del llançament encara no ho cobreix tot:

- Els **formularis amb assistent** no es poden rellançar amb canvis, i una tasca d'assistent llançada abans de la 7.0
  no es pot rellançar amb `enforce` (no desava els valors dels passos). El servidor MCP
  no pot llançar formularis amb assistent.
- La **resolució de marcadors** al navegador encara fa servir la seva pròpia còpia del codi del servidor; en
  casos límit poc freqüents (`__undefined__`, cometes dins d'expressions) tots dos podrien resoldre un
  marcador de manera diferent. `log` posa de manifest aquestes diferències.
- Les expressions **`runLocal`** s'executen al motor JavaScript del navegador quan és al navegador, i en un
  entorn aïllat al servidor; el mateix codi produeix el mateix resultat, excepte quan depèn de
  la zona horària o de l'idioma del navegador.

---

## Formularis amb assistent

Un [assistent](../forms/wizard.html) es comprova pas a pas: el navegador envia els valors de
cada pas, i el servidor comprova cada pas que l'usuari enviaria amb el seu propi subformulari.

- Un pas es deixa fora quan és `optional` i l'usuari se l'ha saltat, o quan el seu `when` és fals.
- Un pas llegeix els passos anteriors a través de `$(__parent__.<step>.<field>)`, amb els seus valors comprovats.
- Els errors indiquen el pas i el camp, com a `<step>.<field>`.
- Amb `enforce`, les extravars es construeixen al servidor, cada pas sota el seu `defaultModel`.
- Els camps de fitxer no s'admeten en un assistent.
