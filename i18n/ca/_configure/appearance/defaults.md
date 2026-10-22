---
layout: default
title: Valors predeterminats
parent: Aparença
nav_order: 1
translated_from: 2974af3a3fc29115349fad94498cac9ecd8c6123
---

# Valors predeterminats
{: .no_toc }

El tema, l'idioma, la zona horària i el format de data per als usuaris que no n'han triat cap
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Els valors predeterminats

**Valors predeterminats** defineix com es veu l'aplicació per a un usuari que no ha fet cap tria pròpia a les seves
[preferències](../profile/preferences.html); la tria del mateix usuari sempre té prioritat:

| Camp | Opcions | Sense tria |
|---|---|---|
| **Tema predeterminat** | Segueix el navegador, Clar, Fosc o Color, amb un de 12 colors per a Color | Segueix el navegador (Clar fins a la 7.2) |
| **Idioma predeterminat** | Els idiomes de l'aplicació, desat a [`DEFAULT_LANGUAGE`](../customization/server.html#env_DEFAULT_LANGUAGE) | Anglès |
| **Vista de formularis predeterminada** | Mosaics o Llista, per a la pàgina de formularis | Mosaics |
| **Zona horària predeterminada** | UTC, la del navegador de cada usuari o qualsevol zona pel seu nom | UTC |
| **Format de data predeterminat** | `YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY` o `DD.MM.YYYY`, mostrat amb la data d'avui | `YYYY-MM-DD` |

L'idioma és una variable d'entorn i s'aplica sense reiniciar. Amb
[`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT) a `0`, la pàgina el mostra només de lectura.

Des de la 7.3.0 la pàgina és a les dues pestanyes de les preferències del perfil, **Aparença** (tema, idioma i vista de formularis) i **Data i
hora** (zona horària i format de data, amb una previsualització de l'hora actual), i el seu quadre de cerca llista les coincidències sota el nom de cada pestanya.

---

## Seguir el navegador

Des de la 7.3.0 **Segueix el navegador** mostra a cada usuari el tema clar o fosc que demana el seu navegador, i canvia amb ell.

És el valor predeterminat quan no s'ha triat cap tema predeterminat, així que una instal·lació nova segueix el navegador. En passar el punter per un dels colors de
**Color**, l'aplicació es previsualitza en aquell color; el tema que tenies torna quan el punter en surt, i no es desa res fins que no prems **Desa**.
