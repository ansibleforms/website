---
layout: default
title: Versions
parent: Avís legal
nav_order: 2
translated_from: dcab4535a8f7e4aeaff321136564ab14d61dc3fa
---

# Versions
{: .no_toc }

La pàgina d'una versió, i com canviar-ne el text com a correcció o tornar-lo a demanar a tothom
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La pàgina d'una versió

Des de la 7.3.0 cada versió té una pàgina pròpia, a `/settings/disclaimer/<version>`, amb dues pestanyes:

| Pestanya | Què conté |
|---|---|
| **Detalls** | El títol, el text i el text de la casella, i l'interruptor **Activat**, que es desa a l'instant |
| **Acceptacions** | Qui ha acceptat aquesta versió, vegeu [Acceptacions](acceptances.html) |

**Previsualització** mostra el diàleg tal com el veuran els usuaris, i **Suprimeix** elimina la versió juntament amb les seves acceptacions. El quadre de cerca
de sobre les pestanyes cerca a totes dues alhora: els camps que coincideixen a **Detalls** i les files que coincideixen a **Acceptacions**.

---

## Canviar el text

**Desa** sobre un títol, un text o un text de la casella modificats que els usuaris ja havien acceptat pregunta **Tornar-ho a demanar a tothom?**:

| Resposta | Què passa |
|---|---|
| **Demana-ho a tothom de nou** | S'esborren les acceptacions d'aquesta versió, i cada usuari la torna a acceptar a la seva propera petició |
| **Mantén com a correcció** | El text es reescriu, per exemple per corregir una errada, i les acceptacions continuen comptant: no es torna a demanar a ningú |

Una versió que encara no ha acceptat ningú es desa sense preguntar. Per conservar el text acceptat, [afegeix una versió nova](general.html#adding-a-version) i activa-la.
