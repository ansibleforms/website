---
layout: default
title: HTTPS
parent: Seguridad
nav_order: 2
redirect_from:
  - /production/https.html
translated_from: 2d8601a66c8f664c1cf762e7829e2c1251248a19
---

# HTTPS
{: .no_toc }

Sirve HTTPS desde la propia aplicación y sustituye el certificado de ejemplo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dónde termina TLS

TLS puede terminar en uno de tres sitios, y solo el primero tiene que ver con los ajustes de esta página:

* **en AnsibleForms**, con `HTTPS=1` : HTTPS en [`PORT`](../customization/server.html#env_PORT) con los archivos de abajo, como hace docker-compose en el 443.
* **en un proxy inverso**, con `HTTPS=0` detrás de él : consulta [Proxy inverso](../production/reverse-proxy.html).
* **en un ingress de Kubernetes** : consulta la pestaña Ingress de [Kubernetes](../installation/kubernetes.html#7-open-ansibleforms) y el README del chart.

Puedes combinar la primera opción con cualquiera de las otras dos para cifrar también el tramo entre el proxy y la aplicación.

---

## Los ajustes

Tres variables controlan HTTPS en la aplicación:

| Variable | Valor predeterminado | Significado |
|----------|---------|---------|
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` | `1` sirve HTTPS, `0` HTTP sin cifrar |
| [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) | `%PERSISTENT_FOLDER%/certificates/key.pem` | La clave privada, en PEM |
| [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) | `%PERSISTENT_FOLDER%/certificates/cert.pem` | El certificado del servidor, en PEM |

En la imagen del contenedor la carpeta persistente es `/app/dist/persistent`, así que los archivos predeterminados son
`/app/dist/persistent/certificates/key.pem` y `cert.pem`. Con el proyecto de docker-compose corresponde a `data/certificates/`
en el host.

---

## El certificado de ejemplo

Cuando `HTTPS=1` y falta cualquiera de los dos archivos al arrancar, AnsibleForms registra `httpsKey or httpsCert not found, copying from
templates` y copia una clave y un certificado de ejemplo de la imagen a las rutas configuradas. Si esa copia falla, la
aplicación se detiene.

Ese certificado está autofirmado para `CN=ansibleforms` y es **el mismo en todas las instalaciones**: su clave privada
viene dentro de la imagen pública. Sirve para un primer vistazo, pero los navegadores avisan sobre él y cualquiera puede descifrar el tráfico
que protege. Sustitúyelo antes de que la instancia guarde credenciales reales.

---

## Sustituir el certificado

Usa un certificado emitido para el nombre de host que escriben los usuarios, por tu CA o por un cliente ACME, en formato PEM.
El archivo del certificado puede contener la cadena completa: primero el certificado del servidor y después los intermedios.

1. Copia los archivos en la carpeta persistente, o en cualquier sitio donde la aplicación pueda leerlos:

   ```bash
   sudo cp forms.example.com.key data/certificates/key.pem
   sudo cp forms.example.com.fullchain.crt data/certificates/cert.pem
   sudo chmod 600 data/certificates/key.pem
   ```

2. Si están en otro sitio, define `HTTPS_KEY` y `HTTPS_CERT` con sus rutas **dentro del contenedor**.

3. Reinicia la aplicación, que lee ambos archivos al arrancar.

Para un certificado autofirmado rápido propio (una instancia de pruebas, o el tramo detrás de un proxy), `openssl` lo crea:

```bash
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout data/certificates/key.pem -out data/certificates/cert.pem \
  -subj "/CN=forms.example.com" -addext "subjectAltName=DNS:forms.example.com"
```

---

## Renovar sin reiniciar

Cambiar `HTTPS_KEY` o `HTTPS_CERT` en las páginas de ajustes recarga la clave y el certificado en el servidor en marcha.
Las conexiones nuevas reciben el certificado nuevo y las abiertas conservan el antiguo. Si los archivos nuevos no se pueden leer o no forman un
par válido, el certificado actual se mantiene y se registra un aviso.

Esto solo funciona cuando las páginas de ajustes pueden escribir el entorno ([`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)
vale `1`) y la variable no está definida en el entorno real. Cuando una renovación sustituye los archivos en las mismas
rutas, reinicia la aplicación.
