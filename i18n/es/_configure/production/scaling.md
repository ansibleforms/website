---
layout: default
title: Escalado
parent: En producción
nav_order: 4
translated_from: 5b76f1bfb7520ff2b072919d714d2ab72b1e5d5e
---

# Escalado
{: .no_toc }

AnsibleForms repartido en varios nodos de aplicación y un worker, junto a uno o varios RTE
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Roles

Todos los contenedores de AnsibleForms ejecutan el mismo código de servidor, y [`AF_ROLE`](../customization/server.html#env_AF_ROLE) decide qué hace cada uno:

| `AF_ROLE` | Imagen | Ejecuta | Cuántos |
|---|---|---|---|
| `all` (sin definir) | `ansibleforms` | La aplicación web y el worker en un solo proceso: lo predeterminado | 1 |
| `app` | `ansibleforms` | La interfaz web y la API | Tantos como quieras, detrás de un balanceador de carga |
| `worker` | `ansibleforms` | El trabajo en segundo plano: el esquema de la base de datos y sus actualizaciones, la semilla de configuración, las programaciones, la copia nocturna, las sincronizaciones de repositorios y las limpiezas | Uno trabajando; los demás esperan y toman el relevo |
| `rte` | `ansibleforms-rte-full` (o `-rte-core`, `-rte-base`) | Los playbooks | Tantos como quieras |

La instalación más pequeña es un contenedor sin `AF_ROLE` junto a un RTE: es lo que ejecutan el [proyecto Docker Compose](../installation/docker-compose.html)
y el [chart de Helm](../installation/kubernetes.html). Cualquier otro valor de `AF_ROLE` detiene el proceso al arrancar.

---

## El RTE

El RTE, el entorno de ejecución que ejecuta los playbooks, tiene su propia sección: [Entornos de ejecución](../rte/). Trata cómo un RTE
ejecuta un trabajo, [sus imágenes](../rte/images.html), [cómo ejecutar uno](../rte/run.html), [varios RTE](../rte/several.html) como runners o
réplicas, y [un RTE en otro centro de datos](../rte/another-datacenter.html).

---

## Varios nodos de aplicación

Para atender a más usuarios, o para sobrevivir a la pérdida de un nodo, divide la aplicación en nodos `app` detrás de un balanceador de carga y un `worker`.

### Qué comparten los nodos
{: .no_toc }

Los nodos se coordinan entre sí a través de la base de datos y de un volumen compartido:

* **La base de datos** : los trabajos, el bloqueo del worker, el bloqueo del diseñador, la lista de nodos, los leases de los runners (qué nodo de aplicación tiene
  el socket de cada RTE) y los avisos de cambio que mantienen al día las cachés de cada nodo. Una credencial, un runner o una programación editados
  en un nodo están en vigor en todos en menos de 5 segundos
* **El volumen persistente** (`/app/dist/persistent`) : formularios, la configuración, repositorios, archivos subidos, copias de seguridad y el `.env` gestionado.
  Todos los nodos de aplicación y el worker montan el mismo, en lectura y escritura
* **La carpeta ssh** (`/home/node/.ssh`) : la clave y los hosts conocidos para git sobre ssh; el worker crea la clave en su primer arranque
* **[`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET)** : el mismo en todos los nodos de aplicación, o un token firmado
  por un nodo lo rechaza el siguiente. Un nodo de aplicación se niega a arrancar sin él
* **[`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET)** : el mismo en todos los nodos de aplicación y en el worker, o una
  credencial guardada por uno no la puede leer otro. Un RTE en modo socket nunca lo lee; solo lo necesita un RTE en modo base de datos (obsoleto)
  que se registra a sí mismo

Da también a todos los contenedores el mismo usuario de base de datos: un worker en espera solo puede terminar la sesión de uno caído cuando es la suya.

### El bloqueo del worker
{: .no_toc }

Solo trabaja un worker a la vez. Tiene el bloqueo de base de datos `ansibleforms_worker`; cuando se detiene, la base de datos libera el bloqueo y un
worker en espera lo toma en menos de 10 segundos. Cuando el host del worker cae sin despedirse, la base de datos podría mantener el bloqueo durante horas,
así que un worker en espera termina esa sesión cuando ningún worker ha escrito un latido durante dos minutos, y toma el relevo.

Un worker que pierde el bloqueo frente a otro se detiene, y su contenedor se reinicia como el que espera. Un worker cuyo arranque falla también se detiene,
para no quedarse con el bloqueo sin hacer nada. Galera y la replicación de grupo no comparten el bloqueo entre los nodos de la base de datos: apunta todos
los workers al mismo nodo de base de datos.

### Trabajos y nodos
{: .no_toc }

Cada contenedor se nombra a sí mismo `<role>-<hostname>-<port>`, sin nada que configurar, y la página **Estado** los lista todos con su rol
y su versión, cuál es el worker, y un aviso cuando ejecutan versiones distintas.

Un trabajo que se ejecuta en un RTE pertenece a ese RTE, y continúa aunque desaparezca el nodo de aplicación que lo lanzó. Cualquier otro trabajo (un trabajo de plantilla
en AWX u otro runner, un trabajo de workflow, o los pasos de un formulario de varios pasos obsoleto) pertenece al nodo de aplicación que lo lanzó. Un contenedor que se reinicia termina sus propios trabajos sin acabar, y el
worker termina los trabajos de un contenedor que lleva dos minutos sin responder, como un pod sustituido.

Un `SIGHUP` enviado a cualquier nodo vuelve a aplicar la [semilla de configuración](../seed/): un nodo de aplicación le pide al worker que lo haga.

### Actualizar
{: .no_toc }

Actualiza **primero el worker** y después los nodos de aplicación. El worker parchea el esquema, y un nodo de aplicación de la versión nueva espera hasta que el
esquema esté parcheado y escribe en el log a qué espera. Los nodos de aplicación actualizados primero siguen sin estar listos hasta que el worker los sigue, mientras los antiguos siguen
atendiendo. Los RTE pueden seguirlos en cualquier momento, siempre que hablen el mismo contrato.

### Limitaciones
{: .no_toc }

Algunas cosas se quedan en un solo nodo:

* **El asistente de chat** guarda sus conversaciones en la memoria de un nodo de aplicación: usa sesiones persistentes en el balanceador de carga (nginx
  `ip_hash`), o un único nodo de aplicación
* **Los logs** se quedan en cada contenedor. Pon [`LOG_PATH`](../customization/logging.html#env_LOG_PATH) fuera del volumen compartido, porque varios
  procesos rotando un mismo archivo pierden líneas. El visor de logs muestra el log del nodo que responde, así que centraliza la recogida de logs
* **Los ajustes** cambiados en las páginas de configuración se escriben en el `.env` gestionado del volumen compartido y se aplican en todos los nodos; los que
  requieren un reinicio lo requieren en todos los nodos

---

## Ejemplo de despliegue

El repositorio de la aplicación incluye un punto de partida completo en [examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale):

| Servicio | Imagen | Rol |
|---|---|---|
| `db` | `mariadb:11` | La base de datos, con un usuario que solo tiene permisos sobre el esquema `AnsibleForms` |
| `app1`, `app2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=app`, detrás del balanceador de carga |
| `worker1`, `worker2` | `ghcr.io/ansibleforms/ansibleforms:7` | `AF_ROLE=worker`: el segundo espera y toma el relevo |
| `rte` | `ghcr.io/ansibleforms/ansibleforms-rte-full:7` | Ejecuta los playbooks con `RTE_MODE=inbound` y `RTE_FILES=local`: la aplicación lo llama |
| `lb` | `nginx:stable` | Termina HTTPS en el puerto 8443 y reparte los navegadores entre los nodos de aplicación con `ip_hash` |

El runner `rte` del RTE y la credencial con la que inicia sesión (su dirección `http://rte:8000` y `RTE_TOKEN`) se declaran en la
[semilla de configuración](../seed/) `seed.yaml`, que el worker aplica en cada arranque; el RTE no define `RTE_URL` y no se publica en el host.

Los nodos de aplicación y los workers comparten un `.env`, con el usuario de la base de datos, `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET`, `RTE_TOKEN`,
`CONFIG_SEED_PATH`, `HTTPS=0` detrás del balanceador de carga y un `LOG_PATH` fuera del volumen compartido. El RTE no tiene `env_file`: solo recibe
`RTE_TOKEN` desde `compose.yaml`, así que no guarda ninguna contraseña de la base de datos. Los nodos de aplicación, los workers y el RTE montan los mismos
volúmenes persistente y ssh:

```bash
cp .env.example .env   # and fill in the secrets
docker compose up -d   # then https://localhost:8443
```
