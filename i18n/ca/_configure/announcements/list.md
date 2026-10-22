---
layout: default
title: Llista
parent: Anuncis
nav_order: 2
translated_from: 3bbe4ccb28f9305a450ac85b7d99531ce28a84cd
---

# Llista
{: .no_toc }

Els anuncis que no han acabat, les seves columnes i la pàgina d'un anunci
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La llista

**Configuració > Aparença > Anuncis** llista tots els anuncis que no han acabat, amb aquestes columnes:

| Columna | Significat |
|---|---|
| **Activat** | Si es mostra sota la capçalera des del seu inici fins al seu final (des de la 7.3.0) |
| **Missatge** | El text sota la capçalera |
| **Tipus** | Informació, Advertència o Perill |
| **Data d'inici** | Quan comença a mostrar-se; `–` quan es mostra de seguida |
| **Data de final** | Quan acaba; `–` quan es mostra fins que se suprimeix |
| **Creat per** | Qui l'ha afegit |

Un clic en una fila, o **Edita** al menú de la seva fila, obre la pàgina de l'anunci. El menú també té **Activa** o **Desactiva**, i **Suprimeix**.

Quan passa la seva data de final, l'anunci se suprimeix: la llista només conserva els que han de venir i els que s'estan mostrant.

---

## La pàgina d'un anunci

Des de la 7.3.0, cada anunci s'obre a la seva pròpia pàgina, a `/settings/announcements/<id>`, amb una pestanya, **Detalls**.

Conté el missatge, el tipus, les dates d'inici i de final i l'interruptor **Activat**, que es desa a l'instant; els altres camps es desen
amb **Desa**, i **Suprimeix** elimina l'anunci. El títol de la pàgina l'anomena pels primers caràcters del seu missatge.
