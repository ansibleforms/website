---
layout: default
title: Etiquetes
parent: Aparença
nav_order: 6
redirect_from:
  - /appearance/environment.html
translated_from: 2b439f61976fc2cc161250c82c629ec40713ef2c
---

# Etiquetes
{: .no_toc }

Etiquetes al costat del logotip que indiquen quina instància és aquesta
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La llista

Des de la 7.3.0 **Configuració > Aparença > Etiquetes** conté diverses etiquetes al costat del logotip de la capçalera, com ara PRODUCTION i EU:

| Columna | Significat |
|---|---|
| **Activat** | Si l'etiqueta es mostra al costat del logotip i a la pàgina d'inici de sessió |
| **Etiqueta** | El seu text, mostrat com la píndola de color que mostra la capçalera |

Les files segueixen l'ordre de la capçalera. Un clic en una fila, o **Edita** al menú de la fila, obre la pàgina de l'etiqueta; el menú de la fila també té
**Activa** o **Desactiva**, segons correspongui, **Puja** i **Baixa** per canviar l'ordre, i **Suprimeix**.

La capçalera i la pàgina d'inici de sessió mostren les etiquetes activades en el seu ordre. Passades tres, un **+N** gris agrupa les altres al seu tooltip,
i un telèfon mostra la primera etiqueta i el **+N**. Una etiqueta desada es mostra a l'instant a tots els navegadors oberts.

---

## Afegir una etiqueta

**Afegeix etiqueta** obre un diàleg amb els dos camps de l'etiqueta, tots dos obligatoris:

| Camp | Significat |
|---|---|
| **Etiqueta** | El text de l'etiqueta, com ara PRODUCTION |
| **Color** | Blau, verd, ambre, taronja, vermell o gris, com a mostres rodones; vermell al principi |

Una previsualització mostra la capçalera amb totes les etiquetes activades i la nova a mesura que s'escriu. Una etiqueta nova està activada i va després de les
altres. La seva pàgina té una pestanya, **Detalls**, amb els mateixos camps, l'interruptor **Activat**, que es desa a l'instant, i la previsualització.

---

## L'etiqueta d'entorn de la 7.2

Fins a la 7.2, **Configuració > Aparença > Entorn** definia una sola etiqueta al costat del logotip.

Amb una sola etiqueta, PRODUCTION EU i PRODUCTION US es llegeixen totes dues com a PRODUCTION quan hi ha diverses instàncies obertes alhora. Des de la 7.3.0
l'actualització converteix aquesta etiqueta en la primera de la llista, amb el seu text, el seu color i si es mostrava, i l'antiga adreça d'**Entorn**
obre la llista.

---

## Etiquetes a la llavor de configuració

Des de la 7.3.0 la [llavor de configuració](../seed/) declara etiquetes a la seva secció `labels`, cadascuna amb el seu text i, opcionalment, el seu color:

```yaml
labels:
  items:
    - name: PRODUCTION
      color: red
    - name: EU
      color: blue
      enabled: true
      position: 2
```

`color` és un de `blue`, `green`, `amber`, `orange`, `red` o `grey`, i `position` les ordena, la més baixa primer. Una etiqueta declarada
a la llavor és només de lectura a la seva pàgina, com qualsevol [objecte gestionat](../seed/managed-objects.html).
