---
layout: default
title: Recarga y arranque
parent: Semilla de configuración
nav_order: 3
translated_from: d6cc2dfaf45589a284b52223737ed04ac4330e67
---

# Recarga y arranque
{: .no_toc }

Cambia el archivo sin reiniciar, y qué pasa al arrancar
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cambiar el archivo sin reiniciar

La semilla se vuelve a leer cada `CONFIG_SEED_RELOAD_SECONDS` (60 por defecto, `0` lo desactiva)
y se vuelve a aplicar cuando su contenido ha cambiado. Así, un cambio confirmado en git llega
automáticamente a una instancia en marcha: en Kubernetes, un `ConfigMap` se vuelve a montar en el pod en
cerca de un minuto, y la siguiente comprobación lo recoge. No hay despliegue ni reinicio, y ningún
hook tiene que llamar a nada.

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
