---
layout: default
title: Edición y auditoría
parent: Semilla de configuración
nav_order: 5
translated_from: 84af9202344ae1fc62b7b882fdc12f1799dd1bd3
---

# Edición y auditoría
{: .no_toc }

Bloquea las páginas de ajustes, y qué registra el log de auditoría
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Desactivar la edición del entorno

`ALLOW_ENV_EDIT=0` deja las páginas de ajustes en solo lectura. Cada variable se sigue mostrando con
el valor vigente y el motivo por el que no se puede cambiar, y el endpoint de guardado responde con
403.

Úsalo siempre que el entorno se declare en otro sitio. Si no, la página de ajustes escribe
`persistent/.env`, que en un volumen efímero se pierde sin aviso en el siguiente reinicio y, en
uno duradero, se va alejando del manifiesto que debería ser la referencia.

{: .note }
> Las copias de seguridad incluyen `persistent/.env` como `managed.env`, así que una reconstrucción recupera los ajustes de base de datos y
> de rutas. **`ENCRYPTION_SECRET` y `ACCESS_TOKEN_SECRET` se eliminan**:
> el volcado que lo acompaña contiene todas las credenciales guardadas como texto cifrado AES, y escribir la clave que
> lo descifra en la misma carpeta haría que bastara con copiar una copia de seguridad para leerlas todas. Define
> esas dos en el host de destino; un comentario en el archivo lo indica.
>
> Lo que queda aún puede contener credenciales (`DB_PASSWORD`, `METRICS_TOKEN`, un `VAULT_TOKEN` antiguo), así que el archivo se
> escribe con `0600`. Restaurarlo es un paso aparte y voluntario, no parte de una restauración normal,
> porque el host de base de datos y las rutas que contiene describen la máquina de la que procede la copia. El
> diálogo de restauración muestra el archivo y ofrece su propio botón *Restaurar entorno*
> (`POST /api/v2/backup/:folder/restore-env`), que conserva el archivo anterior como `.env.bak`.

---

## Qué se registra

Cada aplicación que cambia algo escribe una entrada `seed.apply` en el log de auditoría, con
los objetos creados, actualizados, liberados y eliminados. Los valores nunca se registran, porque la mayoría
son secretos. Una aplicación sin cambios no escribe nada, lo que mantiene el rastro significativo. Una
consulta periódica que encuentra el archivo sin cambios no cambia nada, así que el rastro no gana una fila cada minuto.

Una aplicación solicitada a través del endpoint se registra dos veces a propósito, y las dos filas
registran cosas distintas: `config-seed.apply.create` es **quién** la pidió, `seed.apply` es
**qué** cambió.

La página Estado informa dos veces sobre la semilla: una **comprobación** de que el archivo sigue siendo legible y se puede analizar,
y de que la última recarga tuvo éxito, y una fila de **información** que indica cuántos registros
posee actualmente. La comprobación es el único sitio que avisa cuando el archivo en disco y la configuración
vigente divergen, porque una recarga fallida deja la instancia funcionando.
