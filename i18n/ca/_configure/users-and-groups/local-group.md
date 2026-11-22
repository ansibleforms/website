---
layout: default
title: Un grup local
parent: Usuaris i grups
nav_order: 3
translated_from: 41f71dbf24df7e6a6f6a619a7d5147f28e80d466
---

# Un grup local
{: .no_toc }

La pàgina d'un grup local i les seves pestanyes
{: .fs-6 .fw-300 }

Des de la 7.8.0, **Afegeix un grup** obre l'assistent **Nou grup** en tres passos: **Detalls** (el nom i la descripció), **Usuaris** (els
usuaris locals que es posen al grup) i **Rols** (els rols que se li donen, perquè els seus usuaris els tinguin). Només el nom és obligatori. **Desa**, a
l'últim pas, crea el grup, després hi afegeix els usuaris i li dona els rols: el que falla s'anomena en un missatge, i el grup es queda.

La pàgina d'un grup, `/settings/groups/<id>`, té aquestes pestanyes:

| Pestanya | Què mostra |
|---|---|
| **Detalls** | El nom i la descripció |
| **Usuaris** | Els usuaris del grup; **Afegeix un usuari** n'afegeix un, el menú d'una fila o les caselles en treuen un |
| **Rols** | Els rols que nomenen el grup |
| **Formularis** | Els formularis que obren aquests rols |

Un grup amb usuaris no es pot suprimir: primer treu-ne els usuaris. El grup `admins` no es pot suprimir ni reanomenar mai.
