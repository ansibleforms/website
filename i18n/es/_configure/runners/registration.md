---
layout: default
title: Registro de runners
parent: Runners
nav_order: 3
translated_from: 79dc369b64c0e733cc0dc8d4d863289fc64c75ab
---

# Registro de runners
{: .no_toc }

Cómo un RTE pide unirse y se aprueba, los tokens de unión para instalaciones desatendidas, y el modo base de datos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pedir unirse

Desde 7.3.0, un RTE en un modo de socket (`outbound` o `inbound`) que la aplicación aún no conoce pide unirse, y un admin lo aprueba.
Se presenta con su propio `RTE_TOKEN` y su `RTE_NAME`: un RTE saliente cuando llama por primera vez a la aplicación, uno entrante en su única
llamada de registro. Sin token de unión, la aplicación entonces:

1. Guarda el `RTE_TOKEN` del RTE en una nueva credencial de tipo RTE llamada `<name>-rte` (con un número añadido si ese nombre está ocupado), y
   para un RTE entrante su dirección, `RTE_URL`
2. Añade un runner con el nombre de `RTE_NAME`, tipo RTE, en el modo del RTE, que inicia sesión con esa credencial, marcado como **Pendiente de aprobación**
   y desactivado. Su descripción indica el host desde el que lo pidió

Un RTE saliente sigue conectado mientras espera, pero no recibe ningún trabajo. La aplicación no llama a uno entrante hasta que está aprobado. Ambos escriben en el log
que esperan a que un admin los apruebe en **Conexiones > Runners**, con la huella de su token.

Un RTE entrante con un `RTE_URL` `https://` envía además su certificado cuando pide unirse, y la aplicación lo fija: a partir de ahí la
aplicación solo llama a ese RTE cuando presenta el mismo certificado, así que uno autofirmado funciona sin CA (consulta [Entrante](../rte/modes.html#inbound)).

Como mucho 20 RTE pueden esperar aprobación a la vez: los siguientes se rechazan hasta que se aprueben o rechacen algunos. Una solicitud que nadie atiende en
24 horas la elimina el worker, junto con su credencial.

Un RTE con el nombre de un runner que la aplicación ya conoce, pero con otro token, se rechaza y no pide unirse. Dale el token de ese
runner, o elimina el runner para que pida unirse. Un [token de unión](#join-tokens) solo sirve mientras ese runner sigue pendiente de aprobación.

---

## Aprobar un RTE

Los runners pendientes de aprobación salen de la lista de **Conexiones > Runners** y pasan a un aviso naranja encima de ella, como
**2 Runners esperan aprobación**, con una línea por runner: su nombre, host, dirección IP, modo, dirección y huella.
La campana de la cabecera los cuenta, para los usuarios que pueden ver los runners (consulta [la campana](../jobs/#the-jobs-page)).

Un clic en el aviso abre el diálogo **Revisar aprobación** para cada runner por turnos; un clic en un nombre abre solo ese.
Su página muestra los mismos datos en un recuadro amarillo, **Este RTE ha pedido unirse**. Comprueba que es uno que arrancaste tú antes de aprobarlo:

| Campo | Qué muestra |
|---|---|
| Huella | Los primeros 8 dígitos hexadecimales del SHA-256 de su `RTE_TOKEN`, como `abcd-ef12`. El RTE la escribe en el log al arrancar, y el [instalador](../installation/installer.html#a-runner) la muestra al final. Debe ser la misma |
| Huella del certificado | En el diálogo, para un RTE entrante sobre HTTPS: los primeros 8 dígitos hexadecimales del SHA-256 del certificado que fija la aplicación (sus bytes DER), como `abcd-ef12`. El RTE la escribe en el log al arrancar y el [instalador](../installation/installer.html#a-runner) la muestra al final. Debe ser la misma |
| Host | El host en el que se ejecuta |
| Dirección IP | La dirección desde la que llamó a la aplicación |
| Modo | Saliente o Entrante |
| Uri | La dirección de un RTE entrante, donde la aplicación le llama |
| Versión | Su versión |
| Solicitado el | Cuándo pidió unirse |

**Aprobar** y **Rechazar**, en el diálogo o en el recuadro de su página, deciden:

| Acción | Qué ocurre |
|---|---|
| Aprobar | El runner se activa y recibe trabajos a partir de ahora. Se convierte en el predeterminado de su tipo si no hay ninguno |
| Rechazar | El runner se elimina con su credencial, y su socket se cierra. El RTE puede volver a pedir unirse; entonces vuelve a esperar aprobación |

Solo un admin aprueba o rechaza un RTE.

---

## Tokens de unión

Un token de unión aprueba un RTE al momento, para instalaciones desatendidas: un RTE arrancado con
[`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), o un Runner instalado con la opción `--join` del instalador, lo presenta una vez
y su runner se añade activado, sin esperar. Los tokens de unión no tienen página en la interfaz: un admin los crea a través de la
[API REST](../api/), en `/api/v2/runner`:

| Llamada | Qué hace |
|---|---|
| `POST /api/v2/runner/jointoken` | Crea un token de unión. El cuerpo lleva su `name`, y opcionalmente `expiresInHours` (sin él: no caduca nunca) y `maxUses` (sin él: cualquier número de RTE) |
| `GET /api/v2/runner/jointoken` | Lista los tokens de unión, del más nuevo al más antiguo, con sus usos y si aún se pueden usar; nunca los tokens en sí |
| `POST /api/v2/runner/jointoken/<id>/revoke` | Lo revoca: ya no añade ningún runner, y sigue en la lista |
| `DELETE /api/v2/runner/jointoken/<id>` | Lo elimina |

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "dmz-runners", "expiresInHours": 24, "maxUses": 5 }'
```

La respuesta contiene el token, que empieza por `afj_`, solo esta vez: únicamente se guarda su SHA-256. Un RTE que lo presenta recibe la misma
credencial y el mismo runner que uno que [pide unirse](#asking-to-join), activado, y su descripción nombra el token de unión. A partir de ahí el
RTE inicia sesión con su propio token, así que el token de unión puede caducar o revocarse sin afectarle. Revocar o eliminar un token de unión
no toca los runners que añadió.

Un token de unión nunca da un token nuevo a un runner aprobado. Cuando ya existe un runner RTE con ese nombre:

| El runner | Qué ocurre |
|---|---|
| Espera aprobación | Recibe el token nuevo en su credencial, y sigue esperando la aprobación de un admin |
| Está aprobado | Se rechaza con `409`: *runner '&lt;name&gt;' exists and is approved: a join token cannot give it a new token. Use its current RTE_TOKEN, or have an admin change the token in its credential (or remove the runner) under Connections*. El token de unión no se consume |
| Viene de la [semilla de configuración](../seed/) | Se rechaza: *runner '&lt;name&gt;' is managed by the config seed: its token is set there* |

Por eso un RTE instalado de nuevo con un token nuevo inicia sesión con el token de la credencial de su runner, o un admin cambia ese token
en **Conexiones > Credenciales**, o elimina el runner para que el RTE se una como nuevo.

---

## Registro en modo base de datos

Un RTE en modo base de datos, obsoleto desde 7.3.0, se registra a sí mismo por defecto, en su `RTE_URL` o si no en su propia dirección y puerto. El
worker elimina ese runner cuando su RTE lleva 10 minutos sin escribir ningún heartbeat. Un runner añadido a mano, por la semilla de configuración o por un
RTE en modo de socket nunca se elimina de esa forma.

[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER), que activa o desactiva este registro, está obsoleta en 7.3.0 junto con el
modo base de datos: un RTE en modo de socket pide unirse, o se une con un token de unión. Para gestionar tú esos runners mientras tanto, arranca el
RTE con `RTE_REGISTER=0` y añádelo aquí con tipo RTE, modo **Base de datos (obsoleto)**, y una credencial RTE con su dirección y el
mismo token. Para pasarlo a un modo de socket, consulta [Modos](../rte/modes.html#database-deprecated).
