---
layout: default
title: Filas de una lista
parent: Validación del lanzamiento
nav_order: 3
translated_from: 2f28c42b47c253f87a9be9d5b1bd8638f7dca685
---

# Filas de una lista
{: .no_toc }

Cómo se validan las filas de los campos de lista
{: .fs-6 .fw-300 }

---

Un campo `list` contiene filas; cada fila es una instancia de su subformulario, rellenada mediante el editor
de filas. Un campo `yaml` con un `subform` es una de esas filas. El servidor las trata igual
que el editor de filas del navegador: cada fila se resuelve a través de su subformulario, con los valores del formulario
como `__parent__`, se comprueban sus reglas y se evalúan sus campos calculados. Las listas anidadas funcionan
igual: en la lista propia de una fila, `$(__parent__.__parent__.x)` llega al formulario.

Las filas se comprueban así:

- **Una fila que el usuario añadió o editó** en el editor se resuelve y se valida.
- **Una fila que nadie tocó**, producida por el propio default, expresión o consulta de la lista
  (como las entradas existentes de una lista de ACL), pasa **exactamente como llegó**, igual que en el
  navegador: no se vuelve a validar y no se le añade nada. Una entrada existente que incumple una regla
  escrita después no detiene el lanzamiento.
- **Una fila marcada como eliminada** (el `deleteMarker` de la lista) se mantiene tal cual y no se valida.

Para distinguir estas filas sin fiarse de la petición, el servidor vuelve a ejecutar la propia
fuente de la lista (su default o, si no, su expresión o consulta) bajo la validación del lanzamiento. Una fila
que no pasó por el editor pasa sin cambios **solo cuando es una de las filas que produce esa
fuente**. Cualquier otra fila, como una inventada por quien llama por REST, se resuelve y se
valida como una fila editada. Así, una fila sin más no puede saltarse las comprobaciones, mientras que las
filas no tocadas del navegador siguen pasando sin cambios.

Un usuario del navegador solo lo nota en un caso: los datos de la fuente cambiaron entre que abrió el
formulario y lo lanzó (una entrada se modificó o eliminó entretanto), **y** esa fila
incumple una regla de su subformulario. La fila deja entonces de contar como una de las filas de la fuente, así que
se valida, y el lanzamiento se rechaza nombrando la fila, por ejemplo
`acls[2].user_or_group (regex)`.

Las filas que fallan aparecen en `rowErrors` con su `index` (un campo `yaml` no tiene) y en el log como
`disks[1].size (maxValue)`.

Un lanzamiento puede contener como máximo **500 filas** entre todos los niveles de anidamiento, ya que cada fila ejecuta las consultas de su subformulario.

---

## Marcadores de fila

Los marcadores que una lista pone en sus filas (`insertMarker`, `updateMarker` y `deleteMarker`; sin
`insertMarker`, las filas nuevas reciben `__inserted__` cuando la lista define `allowDelete: false`, un `deleteMarker` o un `updateMarker`)
llegan al playbook en cada fila que lleva uno. Una fila eliminada se envía con su marcador
de eliminación, para que el playbook pueda eliminarla. Antes de la 6.4.1, una fila de lista solo llevaba un marcador cuando su
subformulario lo declaraba como campo (oculto).
