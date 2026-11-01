---
layout: default
title: "La pàgina d'una base de dades"
parent: Bases de dades
nav_order: 2
translated_from: b027ce5ca33397772148bb221bd9eaab4984f276
---

# La pàgina d'una base de dades
{: .no_toc }

Les pestanyes, els formularis que la consulten, provar-la i suprimir-la
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pestanyes

La pàgina d'una base de dades mostra els passos del seu diàleg com a pestanyes, més els formularis que la consulten:

| Pestanya | Què conté |
|---|---|
| Detalls | El **Nom**, el que dona el `dbConfig` d'un camp, i la **Descripció** |
| Credencials | La **Credencial** amb què es connecta, una credencial de Connexions > Credencials de tipus **Base de dades**, que conté el seu tipus de base de dades, host, port, base de dades, TLS i accés |
| Usat per | Els formularis que la consulten, amb el recompte a la pestanya, vegeu [Usat per](#used-by) |

Cada pestanya té la seva pròpia adreça, com ara `/settings/databases/<id>/used-by`, de manera que un enllaç o una adreça d'interès l'obre. La cerca de la
línia del títol filtra totes les pestanyes alhora.

A la pestanya **Credencials**, **Afegeix una credencial** crea una credencial nova de tipus **Base de dades** i la tria. Una contrasenya no es torna a
mostrar mai un cop desada: canvia-la a la credencial.

---

## Usat per

La pestanya **Usat per** llista els formularis amb camps que consulten la base de dades, tal com l'aplicació els llegeix dels formularis.

| Columna | Què mostra |
|---|---|
| Formulari | El formulari; una fila l'obre |
| Descripció | La descripció del formulari |
| Camp | Els camps d'aquest formulari el `dbConfig` dels quals nomena la base de dades |

Un camp compta quan el seu `dbConfig` nomena la base de dades, o nomena la seva credencial, com fa un formulari escrit abans de la 7.5.0. Tots dos
es connecten amb la mateixa credencial, així que tots dos es llisten. Quan no n'hi ha cap, la pestanya diu **Cap formulari no consulta aquesta base de dades.**

---

## Prova la connexió i Suprimeix

Els botons de dalt a la dreta actuen sobre la base de dades tal com està desada.

**Prova la connexió** es connecta amb la seva credencial i executa la consulta mínima del seu tipus de base de dades, i després ho indica en un missatge,
**&lt;name&gt; connection ok**, o per què ha fallat. És la mateixa prova que la **Prova la connexió** de la credencial mateixa.

**Suprimeix** demana confirmació, després suprimeix la base de dades i torna a la llista. La seva credencial es queda a **Connexions > Credencials**.
Al seu costat, **Desa** desa les pestanyes Detalls i Credencials.
