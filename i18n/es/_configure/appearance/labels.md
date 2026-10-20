---
layout: default
title: Etiquetas
parent: Apariencia
nav_order: 6
redirect_from:
  - /appearance/environment.html
translated_from: 2b439f61976fc2cc161250c82c629ec40713ef2c
---

# Etiquetas
{: .no_toc }

Etiquetas junto al logotipo que indican qué instancia es esta
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La lista

Desde la 7.3.0 **Configuración > Apariencia > Etiquetas** contiene varias etiquetas junto al logotipo de la cabecera, como PRODUCTION y EU:

| Columna | Significado |
|---|---|
| **Habilitado** | Si la etiqueta se muestra junto al logotipo y en la página de inicio de sesión |
| **Etiqueta** | Su texto, mostrado como la píldora de color que muestra la cabecera |

Las filas siguen el orden de la cabecera. Un clic en una fila, o **Editar** en su menú de fila, abre la página de la etiqueta; el menú de fila también tiene
**Habilitar** o **Deshabilitar**, según corresponda, **Subir** y **Bajar** para cambiar el orden, y **Eliminar**.

La cabecera y la página de inicio de sesión muestran las etiquetas habilitadas en su orden. A partir de tres, un **+N** gris agrupa las demás en su tooltip,
y un teléfono muestra la primera etiqueta y el **+N**. Una etiqueta guardada aparece al instante en todos los navegadores abiertos.

---

## Añadir una etiqueta

**Añadir etiqueta** abre un diálogo con los dos campos de la etiqueta, ambos obligatorios:

| Campo | Significado |
|---|---|
| **Etiqueta** | El texto de la etiqueta, como PRODUCTION |
| **Color** | Azul, verde, ámbar, naranja, rojo o gris, como muestras redondas; rojo al principio |

Una vista previa muestra la cabecera con todas las etiquetas habilitadas y la nueva tal como se escribe. Una etiqueta nueva está habilitada y va después de las
demás. Su página tiene una pestaña, **Detalles**, con los mismos campos, el interruptor **Habilitado**, que se guarda al instante, y la vista previa.

---

## La etiqueta de entorno de la 7.2

Hasta la 7.2, **Configuración > Apariencia > Entorno** definía una sola etiqueta junto al logotipo.

Con una sola etiqueta, PRODUCTION EU y PRODUCTION US se leen ambas como PRODUCTION cuando hay varias instancias abiertas a la vez. Desde la 7.3.0
la actualización convierte esa etiqueta en la primera de la lista, con su texto, su color y si se mostraba, y la antigua dirección de **Entorno**
abre la lista.

---

## Etiquetas en la semilla de configuración

Desde la 7.3.0 la [semilla de configuración](../seed/) declara etiquetas en su sección `labels`, cada una con su texto y, opcionalmente, su color:

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

`color` es uno de `blue`, `green`, `amber`, `orange`, `red` o `grey`, y `position` las ordena, la más baja primero. Una etiqueta declarada
en la semilla es de solo lectura en su página, como todo [objeto gestionado](../seed/managed-objects.html).
