---
layout: default
title: Lista
parent: Anuncios
nav_order: 2
translated_from: 3bbe4ccb28f9305a450ac85b7d99531ce28a84cd
---

# Lista
{: .no_toc }

Los anuncios que no han terminado, sus columnas y la página de un anuncio
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## La lista

**Configuración > Apariencia > Anuncios** lista todos los anuncios que no han terminado, con estas columnas:

| Columna | Significado |
|---|---|
| **Habilitado** | Si se muestra bajo la cabecera desde su inicio hasta su fin (desde la 7.3.0) |
| **Mensaje** | El texto bajo la cabecera |
| **Tipo** | Información, Advertencia o Peligro |
| **Fecha de inicio** | Cuándo empieza a mostrarse; `–` cuando se muestra de inmediato |
| **Fecha de fin** | Cuándo termina; `–` cuando se muestra hasta que se elimine |
| **Creado por** | Quién lo añadió |

Un clic en una fila, o **Editar** en el menú de su fila, abre la página del anuncio. El menú también tiene **Habilitar** o **Deshabilitar**, y **Eliminar**.

Cuando pasa su fecha de fin, un anuncio se elimina: la lista solo conserva los que están por venir y los que se están mostrando.

---

## La página de un anuncio

Desde la 7.3.0, cada anuncio se abre en su propia página, en `/settings/announcements/<id>`, con una pestaña, **Detalles**.

Contiene el mensaje, el tipo, las fechas de inicio y de fin y el interruptor **Habilitado**, que se guarda al instante; los demás campos se guardan
con **Guardar**, y **Eliminar** borra el anuncio. El título de la página lo nombra por los primeros caracteres de su mensaje.
