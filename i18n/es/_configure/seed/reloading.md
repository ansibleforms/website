---
layout: default
title: Recarga y arranque
parent: Semilla de configuración
nav_order: 3
translated_from: 6cb646436cb2361c1ad2402e0d57b5b56c934630
---

# Recarga y arranque
{: .no_toc }

Cambia el archivo sin reiniciar, y qué pasa al arrancar
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cambiar el archivo sin reiniciar

La semilla la vuelve a leer la tarea del sistema **Recarga del config seed**, cada minuto por defecto, y
se vuelve a aplicar cuando su contenido ha cambiado. Así, un cambio confirmado en git llega
automáticamente a una instancia en marcha: en Kubernetes, un `ConfigMap` se vuelve a montar en el pod en
cerca de un minuto, y la siguiente comprobación lo recoge. No hay despliegue ni reinicio, y ningún
hook tiene que llamar a nada.

Desde la 7.8.0 su horario es un cron de 5 campos en `CONFIG_SEED_RELOAD_CRON` (`* * * * *` por defecto), definido en la página propia de la
tarea en **Trabajos > Sistema** (consulta [Trabajos](../jobs/)) o en el entorno. Sin `CONFIG_SEED_PATH` la tarea está desactivada.

`CONFIG_SEED_RELOAD_SECONDS`, su ajuste anterior, está obsoleto desde la 7.8.0 y se elimina en la 8. Se sigue leyendo mientras
`CONFIG_SEED_RELOAD_CRON` no esté definido, con un aviso en el log al arrancar: `60` se lee como `* * * * *`, un múltiplo de 60 hasta 3600
como cada tantos minutos, y `0` sigue desactivando la recarga. Define `CONFIG_SEED_RELOAD_CRON` en su lugar.

Con un archivo sin cambios, la consulta calcula un hash y se detiene, así que nunca reescribe una fila que ya
ha aplicado.

Para aplicar el archivo de inmediato en lugar de esperar a la siguiente comprobación, usa cualquiera de estos:

```
POST /api/v2/config-seed/apply     # settings admin ; answers with what it did
kill -HUP 1                        # inside the container, no credentials needed
```

Ambos **fuerzan** una aplicación aunque el archivo no haya cambiado. Una aplicación forzada vuelve a imponer un
registro gestionado que se editó directamente en la base de datos, y vuelve a clonar un repositorio declarado
al que le falta el árbol de trabajo.

{: .note }
> Una recarga **nunca es fatal**, a diferencia de la aplicación al arrancar. Una instancia que ya está
> dando servicio conserva su configuración actual, el motivo se registra, y la fila *Seed de configuración*
> de la página Estado se pone en rojo y lo indica. Un error tipográfico subido a git no debe poder tumbar
> una instancia en marcha sin que intervenga ningún operador.
>
> El mismo contenido roto tampoco se reintenta en cada comprobación; si no, una sola edición errónea
> escribiría el mismo error en el log indefinidamente. Corrige el archivo, o llama al endpoint para reintentar
> de inmediato.

---

## Una semilla rota se niega a arrancar

Un archivo ilegible, YAML no válido, un campo desconocido, un nombre duplicado o una
`${VARIABLE}` sin resolver hacen que el servidor **termine** en lugar de arrancar. Esto solo ocurre en el
**arranque**: consulta la nota de arriba para ver qué hace el mismo archivo con una instancia que ya está en marcha.

Es deliberado. Seguir con la configuración anterior dejaría una instancia cuyo
comportamiento ya no coincide con el manifiesto que se supone que la describe, sin que nada
informe de la discrepancia. El motivo se escribe en la salida de error estándar además de en el archivo de log, así que
`kubectl logs` y `docker logs` lo muestran.

La validación es estricta: los campos desconocidos se rechazan en lugar de ignorarse, y el error indica
la clave culpable:

```
Config seed failed, refusing to start: Seed file validation failed: /awx/items/0 must NOT have additional properties 'tokenn'
```

---

## Una base de datos vacía se aprovisiona sola

Con `ALLOW_SCHEMA_CREATION` activado (el valor predeterminado), una base de datos que no tiene **ninguna tabla de
AnsibleForms** recibe su esquema al arrancar. Así, un despliegue nuevo arranca
sin que nadie tenga que llamar a mano al endpoint `/schema`.

La condición previa es estricta a propósito: crear el esquema **elimina primero todas las tablas**, así que
solo se ejecuta contra una base de datos completamente vacía. Una base de datos a la que le falta
una columna, o que tiene tablas pero ninguna cuenta de usuario, *no* está vacía y no se toca;
los parches del esquema se encargan de esos casos.
