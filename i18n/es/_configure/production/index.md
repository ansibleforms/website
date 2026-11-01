---
layout: default
title: En producción
nav_order: 13
has_children: true
has_toc: false
permalink: /production/
translated_from: 9f501893a2c4476707ac2f11f25e67998200e9e7
---

# En producción
{: .no_toc }

Publica, haz copias de seguridad y monitoriza una instancia de la que dependen otras personas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Antes de pasar a producción

Los valores predeterminados ponen una instancia en marcha rápidamente, pero varios de ellos solo sirven para un primer vistazo. AnsibleForms
escribe un aviso `[SECURITY]` en el log al arrancar cuando `ENCRYPTION_SECRET` o `ACCESS_TOKEN_SECRET` no están definidos, y la
página **Estado** informa de las copias de seguridad, de los ajustes de retención y del saneador de expresiones.

---

## Lista de comprobación para producción

Repasa estos puntos una vez antes de que los usuarios dependan de la instancia, y de nuevo tras una actualización mayor:

| Punto | Qué hacer | Detalles |
|------|------------|---------|
| Contraseña del admin | Cambia la contraseña de la cuenta local de administrador | [Bastionado](../security/hardening.html#the-admin-account) |
| Secreto de cifrado | Define [`ENCRYPTION_SECRET`](../customization/security.html#env_ENCRYPTION_SECRET) antes de guardar ninguna credencial | [Secretos y cifrado](../security/secrets.html#the-two-master-secrets) |
| Secreto de los tokens | Define [`ACCESS_TOKEN_SECRET`](../customization/security.html#env_ACCESS_TOKEN_SECRET), para que las sesiones sobrevivan a un reinicio | [Secretos y cifrado](../security/secrets.html#the-two-master-secrets) |
| HTTPS | Termina TLS con tu propio certificado, no con el de ejemplo | [HTTPS](../security/https.html) |
| Proxy inverso | Publica la instancia detrás de un proxy, opcionalmente bajo [`BASE_URL`](../customization/server.html#env_BASE_URL) | [Proxy inverso](reverse-proxy.html) |
| Endpoint del esquema | Pon [`ALLOW_SCHEMA_CREATION`](../customization/server.html#env_ALLOW_SCHEMA_CREATION) a `0` una vez creado el esquema | [Bastionado](../security/hardening.html#the-database) |
| Llamadas salientes | Restringe las expresiones REST con [`REST_DENIED_HOSTS`](../customization/security.html#env_REST_DENIED_HOSTS) | [Bastionado](../security/hardening.html#expressions-and-outbound-calls) |
| Funciones opcionales | Deja MCP y el asistente de chat desactivados salvo que los uses | [Bastionado](../security/hardening.html#optional-features) |
| Copias de seguridad | Comprueba que la copia nocturna funciona, y cópiala fuera del host | [Copias de seguridad](backups.html) |
| Retención | Decide cuánto tiempo se conservan los trabajos y las entradas de auditoría | [Logs](logs.html#retention) |

---

## En esta sección

Cada tema tiene su propia página; la protección de la instancia se trata en [Seguridad](../security/):

| Página | Qué trata |
|---|---|
| [Proxy inverso](reverse-proxy.html) | Publicar AnsibleForms detrás de Nginx, Traefik o Apache, en la raíz o bajo una subruta |
| [Copias de seguridad](backups.html) | Copias nocturnas, qué contienen, cómo restaurarlas y qué más conviene guardar |
| [Logs](logs.html) | Archivos de log, syslog, el registro de auditoría y la retención de trabajos y entradas de auditoría |
| [Escalado](scaling.html) | Varios nodos de aplicación con un worker; el RTE tiene su propia sección, [Entornos de ejecución](../rte/) |
| [Monitorización](monitoring.html) | Sondas de salud, métricas de Prometheus y la página Estado |
