---
layout: default
title: Proxy inverso
parent: En producción
nav_order: 1
translated_from: 13348b4571edb1aa56a0c0015a9691f81c1d412f
---

# Proxy inverso
{: .no_toc }

Publica AnsibleForms detrás de Nginx, Traefik o Apache, en la raíz o bajo una subruta
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Cuándo usar uno

AnsibleForms sirve la interfaz, la API REST y Swagger en un único puerto; un proxy inverso delante te permite:

* servirlo en el puerto 443 con un certificado gestionado por tus herramientas habituales (ACME, una CA corporativa)
* compartir un nombre de host con otras aplicaciones, publicando AnsibleForms bajo una subruta
* mantener el puerto de la aplicación y la base de datos fuera de la red pública

El proxy es opcional: la aplicación puede servir HTTPS por sí misma, consulta [HTTPS](../security/https.html).

---

## Los ajustes que importan

Solo unos pocos ajustes afectan al comportamiento de AnsibleForms detrás de un proxy:

| Ajuste | Detrás de un proxy |
|---------|----------------|
| [`PORT`](../customization/server.html#env_PORT) | El puerto al que reenvía el proxy, `8000` por defecto. El proyecto docker-compose lo pone a `443`. |
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` cuando el proxy termina TLS y llega a la aplicación por una red privada, `1` para cifrar también ese tramo. |
| [`BASE_URL`](../customization/server.html#env_BASE_URL) | La subruta, por ejemplo `/ansibleforms`. Déjalo en `/` cuando la aplicación tiene un nombre de host propio. |
| [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) | Qué proxies pueden indicar la dirección del cliente en `X-Forwarded-For`, normalmente `1`. Consulta [Direcciones de los clientes](#client-addresses). |
| [`API_BODY_LIMIT_MB`](../customization/server.html#env_API_BODY_LIMIT_MB) | La petición JSON más grande que acepta la aplicación, 50 MB por defecto. El proxy debe permitir al menos eso. |
| [`UPLOAD_MAX_GB`](../customization/server.html#env_UPLOAD_MAX_GB) | El archivo más grande que acepta un campo de subida de un formulario, 10 GB por defecto. El proxy también debe permitirlo, o las subidas fallarán en él. |
| [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) | El conjunto de cabeceras de petición más grande que acepta la aplicación, 16 KB por defecto, desde la 7.1.0. Consulta [Tamaño de las cabeceras de petición](#request-header-size). |
| **URL raíz pública** | En **Sistema > General**, pestaña **Servidor**: la dirección a la que llegan los usuarios, subruta incluida. Construye los enlaces de los correos de notificación, de los mensajes de los canales y de las solicitudes de aprobación. |

Para Entra ID u OIDC, registra la dirección pública como URI de redirección, con la subruta de `BASE_URL` si está definida.

---

## Servir bajo una subruta

`BASE_URL` monta toda la aplicación bajo la subruta; el proxy debe reenviar la ruta **sin cambios**.
Con `BASE_URL=/ansibleforms`:

* la interfaz, `/api/v2/...` y la interfaz de Swagger se sirven todas bajo `/ansibleforms/`
* el `<base href>` de la interfaz se reescribe al arrancar, de modo que los recursos y las llamadas a la API se resuelven bajo la subruta
* una petición a `/` o a `/ansibleforms` (sin barra final) se redirige a `/ansibleforms/`

Conserva el prefijo: sin `StripPrefix` en Traefik, sin URI en `proxy_pass` en Nginx, porque la aplicación lo espera.

La página **Estado** muestra la URL base en vigor.

---

## Tiempos de espera, subidas y salida en directo

La página de trabajos y los contadores de trabajos se enteran de los cambios mediante un único flujo duradero de server-sent events,
[`/api/v2/events`](../api/events.html), abierto por cada navegador. El flujo envía cabeceras que desactivan el buffering del proxy
(`X-Accel-Buffering: no`) y una línea de keep-alive cada 15 segundos, así que el tiempo de lectura habitual de 60 segundos lo mantiene abierto;
cuando un proxy lo cierra de todos modos, el navegador se vuelve a conectar por sí solo. La salida bajo un formulario, justo después de un lanzamiento, se
lee en cambio cada dos segundos. El lanzamiento de un trabajo responde en cuanto se crea el trabajo, así que un playbook largo no mantiene
abierta una petición.

Las peticiones que pueden tardar son:

* **copia de seguridad y restauración** desde la página **Copias de seguridad**, que esperan a que termine el comando de volcado o de restauración, hasta
  [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) (3600 por defecto)
* **subidas grandes** a través de un campo de archivo, que envían el archivo entero en una sola petición
* **mensajes de chat**, cuando el [asistente de chat](../chat/) está activado, que esperan la respuesta del proveedor del modelo

Los proxies suelen agotar el tiempo de espera a los 60 segundos y limitar el cuerpo de las peticiones (Nginx acepta 1 MB por defecto). Sube ambos para
las rutas de AnsibleForms, como en los ejemplos de abajo.

---

## WebSockets de los runners

Desde la 7.3.0 un [Runner saliente](../rte/modes.html#outbound) llama a la aplicación y mantiene un WebSocket abierto en
`<BASE_URL>/api/v2/rte/socket`. El proxy debe dejar pasar el upgrade, o el Runner nunca se conecta y sigue llamando:

| Proxy | Qué necesita el WebSocket |
|-------|--------------------------|
| Nginx | `proxy_http_version 1.1` y las cabeceras `Upgrade` y `Connection`, que Nginx no reenvía por defecto |
| Traefik | Nada: los WebSockets pasan tal cual |
| Apache | `upgrade=websocket` en la línea `ProxyPass` (2.4.47 y posteriores), o `mod_proxy_wstunnel` en versiones anteriores |

Ambos extremos envían un ping cada 20 segundos, así que el tiempo de lectura habitual de 60 segundos mantiene abierto un socket inactivo.

---

## Tamaño de las cabeceras de petición

Cada petición lleva el token de sesión en su cabecera `Authorization`, junto a las cookies y las cabeceras que añade el proxy.
Tanto el proxy como la aplicación limitan el tamaño de las cabeceras de petición, y rechazan una petición que supere el límite antes de que
AnsibleForms la vea, así que no llega nada al log del servidor. Los valores predeterminados:

| Componente | Límite | Predeterminado | Rechazada con |
|-----------|-------|---------|--------------|
| AnsibleForms (Node.js) | [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE), todas las cabeceras juntas | 16384 bytes | 431 |
| Nginx | `large_client_header_buffers`, por campo de cabecera | `4 8k`: 8 KB por campo | 400 |
| Traefik | `http.maxHeaderBytes` del entry point, todas las cabeceras juntas | 1 MB | 431 |
| HAProxy | `tune.bufsize` en la sección `global`, todo el bloque de cabeceras, menos la reserva `tune.maxrewrite` (1024 bytes) | 16384 bytes: 15360 bytes de cabeceras | 400 |
| Apache | `LimitRequestFieldSize`, por campo de cabecera | 8190 bytes | 400 |

Hasta la 7.0.3 el token de sesión llevaba todos los grupos de un usuario de inicio de sesión único, y podía superar estos límites, consulta
[Formularios y trabajos vacíos tras un inicio de sesión único](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
Desde la 7.1.0 el token es pequeño, y los valores predeterminados bastan. Cuando otra cosa agranda las cabeceras, como
las cookies de otras aplicaciones del mismo dominio o una pasarela de inicio de sesión único delante, sube los límites a la vez:

* AnsibleForms: `MAX_HTTP_HEADER_SIZE=65536`, o antes de la 7.1.0 `NODE_OPTIONS=--max-http-header-size=65536`; ambos se
  leen al arrancar, así que reinicia la aplicación tras un cambio
* Nginx: `large_client_header_buffers 4 32k;` en el bloque `http` o `server`
* HAProxy: `tune.bufsize 65536` en la sección `global`; cada flujo recibe un buffer de ese tamaño, así que HAProxy aconseja
  reducir el `maxconn` global en el mismo factor, y HTTP/2 necesita al menos el valor predeterminado de 16384
* Apache: `LimitRequestFieldSize 32768` en la configuración del servidor o en el host virtual

---

## Direcciones de los clientes

Detrás de un proxy, todas las conexiones vienen del proxy. Sin [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY),
el registro de auditoría guarda la dirección del proxy para cada acción, y los
[límites de inicio de sesión](../security/hardening.html#sign-in-limits-and-passwords) por dirección cuentan a todos los clientes como una sola dirección.
`TRUST_PROXY` indica de qué proxies se puede fiar la aplicación cuando informan del cliente en `X-Forwarded-For`:

| Valor | Dirección del cliente |
|-------|----------------|
| `0` (predeterminado) | La dirección de la conexión. `X-Forwarded-For` se ignora; vacío, `false`, `off` y `no` significan lo mismo. |
| Un número, p. ej. `1` | Confía en ese número de proxies delante de la aplicación: `1` para un único proxy inverso, `2` para un balanceador de carga delante de un ingress. |
| Una lista, p. ej. `10.0.0.5,172.16.0.0/12` | Confía en los proxies de esas direcciones y rangos CIDR. También se aceptan los valores predefinidos `loopback`, `linklocal` y `uniquelocal`. |
| `true` | Confía en todos los saltos: se usa la dirección más a la izquierda de `X-Forwarded-For`. |

La aplicación recorre `X-Forwarded-For` desde la derecha, salta los proxies de confianza y toma la primera dirección que
no sea uno de ellos. Usa el número exacto de proxies, o sus direcciones:

* `X-Forwarded-For` es una cabecera de petición normal que cualquier cliente puede enviar. Un número demasiado alto, o `true`, permite que un
  cliente elija la dirección que guarda el registro de auditoría. `true` solo es seguro cuando a la aplicación solo se puede llegar a través
  del proxy, y el servidor escribe un aviso `[SECURITY]` en el log al arrancar cuando está definido.
* El proxy debe añadir la dirección desde la que recibió la conexión, como hacen los ejemplos de abajo
  (`$proxy_add_x_forwarded_for` en Nginx; Traefik y `mod_proxy` de Apache la añaden por defecto).
* Un valor no válido se rechaza en la página de configuración; si se define en el entorno, se registra como error al arrancar y
  no se confía en ningún proxy. Un cambio guardado en la página de configuración se aplica sin reiniciar.

---

## Ejemplos

Cada ejemplo publica AnsibleForms en `https://forms.example.com/ansibleforms/`, con TLS terminado por el proxy y
la aplicación ejecutándose con `HTTPS=0`, `PORT=8000`, `BASE_URL=/ansibleforms` y `TRUST_PROXY=1`:

<div class="af-tabs" data-tab-group="proxy">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="nginx" aria-selected="true">Nginx</button>
<button type="button" role="tab" class="af-tab" data-tab="traefik" aria-selected="false">Traefik</button>
<button type="button" role="tab" class="af-tab" data-tab="apache" aria-selected="false">Apache</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="nginx" markdown="1">

`proxy_pass` no indica ninguna URI, así que Nginx reenvía la ruta tal como llegó, prefijo incluido. El bloque `map` va en el
contexto `http` (un archivo de `conf.d/` se incluye ahí), y deja pasar el upgrade a WebSocket de los Runners:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name forms.example.com;

    ssl_certificate     /etc/nginx/certs/forms.example.com.crt;
    ssl_certificate_key /etc/nginx/certs/forms.example.com.key;

    location /ansibleforms/ {
        proxy_pass         http://10.0.0.20:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;                         # the Runners' WebSocket
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection $connection_upgrade;

        client_max_body_size    10g;    # UPLOAD_MAX_GB
        proxy_request_buffering off;    # stream uploads instead of spooling them first
        proxy_read_timeout      3600s;  # BACKUP_COMMAND_TIMEOUT_SECONDS
        proxy_send_timeout      3600s;
    }
}
```

Sin subruta, usa `location /` y deja `BASE_URL` sin definir.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="traefik" markdown="1" hidden>

Etiquetas en el servicio `app` del proyecto docker-compose, con Traefik en la misma red de Docker. El servicio
no publica ningún puerto propio; Traefik llega a él por la red:

```yaml
  app:
    image: ghcr.io/ansibleforms/ansibleforms:7
    environment:
      - HTTPS=0
      - PORT=8000
      - BASE_URL=/ansibleforms
      - TRUST_PROXY=1                 # Traefik is the one proxy in front
    labels:
      - traefik.enable=true
      - traefik.http.routers.ansibleforms.rule=Host(`forms.example.com`) && PathPrefix(`/ansibleforms`)
      - traefik.http.routers.ansibleforms.entrypoints=websecure
      - traefik.http.routers.ansibleforms.tls=true
      - traefik.http.routers.ansibleforms.tls.certresolver=letsencrypt
      - traefik.http.services.ansibleforms.loadbalancer.server.port=8000
```

No hay middleware `StripPrefix` a propósito. Traefik define él mismo las cabeceras `X-Forwarded-*` y no limita
el tamaño del cuerpo, pero revisa los `respondingTimeouts` del entry point cuando las copias de seguridad o las subidas duren más que su
tiempo de lectura. Sin subruta, conserva solo la parte `Host(...)` de la regla.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="apache" markdown="1" hidden>

Necesita `mod_proxy`, `mod_proxy_http`, `mod_headers`, `mod_ssl`, y Apache 2.4.47 o posterior para el `upgrade=websocket` de los Runners.
Ambos lados de `ProxyPass` llevan el prefijo:

```apache
<VirtualHost *:443>
    ServerName forms.example.com

    SSLEngine on
    SSLCertificateFile    /etc/pki/tls/certs/forms.example.com.crt
    SSLCertificateKeyFile /etc/pki/tls/private/forms.example.com.key

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"

    ProxyPass        /ansibleforms/ http://10.0.0.20:8000/ansibleforms/ timeout=3600 upgrade=websocket
    ProxyPassReverse /ansibleforms/ http://10.0.0.20:8000/ansibleforms/

    # no body cap here : UPLOAD_MAX_GB and API_BODY_LIMIT_MB apply in the application
    LimitRequestBody 0
</VirtualHost>
```

Sin subruta, envía `/` a `http://10.0.0.20:8000/` y deja `BASE_URL` sin definir.

</div>
</div>

Para mantener cifrado el tramo entre el proxy y la aplicación, ejecuta la aplicación con `HTTPS=1`, apunta el proxy a
`https://` y dale a la aplicación un certificado en el que confíe el proxy, consulta [HTTPS](../security/https.html).
