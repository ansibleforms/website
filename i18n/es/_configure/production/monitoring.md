---
layout: default
title: Monitorización
parent: En producción
nav_order: 5
translated_from: b2bf7ba817910d15cd4fe5c5eb5881dba1ebacd5
---

# Monitorización
{: .no_toc }

Sondas de salud para un balanceador de carga o Kubernetes, métricas de Prometheus y la página Estado
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Sondas de salud

Dos endpoints indican a un balanceador de carga, al healthcheck de un contenedor o a Kubernetes si un proceso puede recibir tráfico.
Ninguno necesita inicio de sesión, y ninguno devuelve nada sobre la configuración:

| Endpoint | Responde | Úsalo para |
|----------|---------|------------|
| `/api/v2/live` | `200` con `{"status":"live"}` mientras el proceso esté en marcha | Una sonda de liveness: reinicia el proceso cuando deje de responder |
| `/api/v2/ready` | `200` con `{"status":"ready"}`, o `503` con `{"status":"not ready","reason":"..."}` | Una sonda de readiness: envía tráfico solo a los procesos listos |

Un proceso está listo cuando se cumple todo esto:

* no se está apagando (`stopping`)
* la base de datos responde (`database unreachable`)
* el esquema existe (`schema not provisioned`) y está completo, con todas las tablas, columnas e índices de esta versión
  (`schema not upgraded`); esta última comprobación se guarda en caché durante 30 segundos, así que una sonda cada pocos segundos sigue siendo barata

Bajo un [`BASE_URL`](../customization/server.html#env_BASE_URL) las rutas empiezan por él, por ejemplo
`/ansibleforms/api/v2/ready`. Un entorno de ejecución (RTE) responde a las mismas sondas en `/live` y `/ready`, sin la
comprobación de que el esquema esté completo; no está listo mientras vacía sus trabajos al apagarse, así que no se le envía ningún trabajo nuevo. Un RTE saliente
tampoco está listo (`not connected to the app`) hasta que su socket hacia la aplicación está abierto.
Un proceso arrancado con `AF_ROLE=worker` no tiene interfaz web: solo responde a `/api/v2/version` y a `/health` para el
healthcheck de su contenedor. Consulta [Escalado](scaling.html) para los roles.

---

## Métricas de Prometheus

Define [`METRICS_TOKEN`](../customization/features.html#env_METRICS_TOKEN) como una cadena aleatoria larga para servir métricas de Prometheus.
Un proceso que sirve la aplicación web responde en `/api/v2/metrics`, y un RTE en `/metrics`:

```yaml
scrape_configs:
  - job_name: ansibleforms
    metrics_path: /api/v2/metrics
    authorization:
      type: Bearer
      credentials: <METRICS_TOKEN>
    static_configs:
      - targets: ['forms01.example.com:8000']
```

Sin `METRICS_TOKEN` los endpoints responden `404`, como si no existieran, y una petición sin la cabecera
`Authorization: Bearer <token>` correcta recibe `401`. Cada proceso informa de sus propias cifras, así que recoge las de todos:

| Métrica | Qué mide |
|--------|------------------|
| `af_process_*`, `af_nodejs_*` | El proceso: CPU, memoria, retardo del bucle de eventos, recolección de basura |
| `af_http_requests_total{route,method,status}` | Las peticiones atendidas |
| `af_http_request_duration_seconds{route}` | Cuánto tardaron |
| `af_jobs{status}` | Los trabajos en ejecución (`running`) o pendientes de aprobación (`approve`) en este momento |
| `af_jobs_ended_24h{status}` | Los trabajos que terminaron en las últimas 24 horas, por estado |
| `af_nodes{role,alive}` | Los procesos registrados en la base de datos, por rol, vivos o no |
| `af_login_failures_total`, `af_login_lockouts_total` | Los inicios de sesión fallidos y los bloqueos de cuenta |
| `af_rte_running_jobs`, `af_rte_max_jobs` | En un RTE: los playbooks que ejecuta ahora, y cuántos puede ejecutar a la vez |
| `af_rte_socket_connected` | En un RTE en modo socket: `1` mientras su socket hacia la aplicación está abierto, `0` cuando no |

Las cifras de trabajos y de nodos se leen de la base de datos en cada recogida. Cuando la base de datos no responde se
omiten, y la recogida se completa igualmente con las demás métricas.

---

## La página Estado

La página **Estado**, en **Configuración > Sistema**, muestra a los usuarios con la opción de rol `showSettings` cómo va la instancia.
Solo lee, así que actualizarla nunca envía correo ni lanza un trabajo. Tiene dos pestañas, y el número de problemas aparece en la etiqueta de la pestaña **Comprobaciones**.

### Comprobaciones

Cada comprobación está en verde (correcta), ámbar (requiere atención) o rojo (un problema), con sus detalles al desplegar la fila:

| Comprobación | Qué examina |
|-------|------------------|
| Conexión a la base de datos | La base de datos responde |
| Usuario de la base de datos | Ámbar cuando el usuario tiene permisos sobre todas las bases de datos, como `root`, en lugar de solo sobre `AnsibleForms.*` |
| Esquema de base de datos | Existen todas las tablas, columnas e índices de esta versión, y, si no, qué parche falló |
| Planificador | Un worker ejecuta las tareas del sistema, y ninguna ha dejado de programarse |
| Nodos | Los procesos registrados en la base de datos, en ámbar cuando ejecutan versiones distintas |
| Trabajos | Los trabajos en ejecución y los pendientes de aprobación, en ámbar cuando un trabajo lleva más de 24 horas en ejecución |
| Herramientas de copia de seguridad | El comando de volcado de [`MYSQLDUMP_COMMAND`](../customization/retention.html#env_MYSQLDUMP_COMMAND) existe, y su versión |
| Última copia de seguridad | Ámbar cuando no hay ninguna o la más reciente tiene más de dos días, rojo cuando no tiene un volcado utilizable |
| Bloqueo del diseñador | Quién tiene el bloqueo del diseñador, en ámbar cuando lo tiene desde hace más de 8 horas |
| Repositorios | Rojo cuando un repositorio falló o no tiene copia de trabajo en disco |
| Seed de configuración | El archivo de la [semilla de configuración](../seed/) se puede leer y analizar, y su última recarga funcionó |
| Almacenes de secretos | Todos los almacenes de secretos responden, en ámbar cuando el token de un HashiCorp Vault caduca pronto |
| Runners | Todos los runners responden, en ámbar cuando no hay ninguno o no hay un RTE predeterminado |
| Expresiones del servidor | Ámbar cuando [`EXPRESSION_SANITIZER`](../customization/security.html#env_EXPRESSION_SANITIZER) vale `legacy` |
| Secretos | Ámbar cuando `ENCRYPTION_SECRET` es el valor público predeterminado o `ACCESS_TOKEN_SECRET` no está definido |
| LDAP | El servidor LDAP es accesible y su certificado TLS es válido, sin iniciar sesión en él |
| Almacenamiento de trabajos | El tamaño de las tablas de trabajos, en ámbar por encima de 1 GB cuando no hay retención de trabajos definida |
| Carpetas con permiso de escritura | Se puede escribir en todas las carpetas configuradas |
| Espacio en disco | El disco que contiene las copias de seguridad, en ámbar desde el 85% de uso y en rojo desde el 95% |

### Información

Datos de la instancia que no llevan veredicto, lo primero que se pide en una conversación de soporte: la versión de
AnsibleForms, la URL base, la versión y el host de la base de datos, el origen de la configuración, la semilla de configuración, los ajustes
de retención, los métodos de autenticación, el servidor del [canal de correo](../notification-channels.html) activo, el nivel
y la ruta del log, el tiempo en marcha, la zona horaria, la versión de Node.js y la plataforma.

La página lee `/api/v2/health`, que requiere un usuario con sesión iniciada y `showSettings`. Para un sistema de monitorización, usa
las sondas y las métricas descritas arriba.
