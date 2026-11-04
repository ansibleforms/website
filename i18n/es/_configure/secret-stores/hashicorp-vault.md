---
layout: default
title: HashiCorp Vault
parent: Almacenes de secretos
nav_order: 1
translated_from: 1134189481b234cb2b18edbabd74427e37d2f43c
---

# HashiCorp Vault
{: .no_toc }

Leer y escribir credenciales en HashiCorp Vault KV, leer secretos dinámicos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Campos del almacén

Además de los [campos que tiene todo almacén](./#adding-a-store), un almacén HashiCorp Vault tiene estos campos:

| Campo | Significado |
|---|---|
| Credencial | Una credencial **HashiCorp Vault** de [Conexiones > Credenciales](../credentials.html): la dirección del Vault, sus ajustes TLS, y el token como contraseña, con acceso de lectura a las rutas que usan tus credenciales. **Añadir credencial** crea una de ese tipo. AnsibleForms no renueva el token. |
| Namespace | El namespace de Vault Enterprise, enviado como `X-Vault-Namespace`. Se muestra al activar **Vault Enterprise**, en el paso **Tipo**. |
| Versión KV | `2` (predeterminado) o `1`. |
| Montaje predeterminado | Se usa para una referencia sin barra, p. ej. `myapp` se convierte en `secret/data/myapp`. |

La referencia del secreto es la ruta, p. ej. `secret/myapp/prod`. Para KV v2 el segmento `/data/`
se inserta si lo omites.

---

## Escribir credenciales

Desde 7.6.0, el usuario y la contraseña de una credencial se pueden escribir en el Vault al **Guardar** (ver [Escribir credenciales](./#writing-credentials)).

Activa **Permitir la escritura** en las **Opciones** del almacén, e indica dónde puede escribir:

| Campo | Significado |
|---|---|
| Permitir la escritura | Permite que una credencial escriba su usuario y contraseña en este almacén al **Guardar**. Desactivado por defecto. |
| Prefijo de escritura | La ruta en la que, o bajo la que, se escriben las credenciales, p. ej. `secret/ansibleforms`. Un montaje solo, p. ej. `secret`, permite todo el montaje. Obligatorio con la escritura activada. |

El secreto se escribe como `username` y `password`, en KV v2 o v1 según la **Versión KV** del almacén. El token necesita las capacidades
read, create y update bajo el prefijo; read comprueba si ya hay un secreto. Para KV v2 y el prefijo `secret/ansibleforms`:

```hcl
path "secret/data/ansibleforms/*" {
  capabilities = ["read", "create", "update"]
}
```

La ruta de un motor de secretos dinámicos, p. ej. `database/creds/readonly`, nunca se escribe: Vault crea esas credenciales él mismo.

---

## Credenciales dinámicas de base de datos

Una referencia de la forma `<mount>/creds/<role>`, p. ej. `database/creds/readonly`, lee de un
motor de secretos dinámicos como el motor de base de datos de Vault. Vault crea entonces una cuenta de base de datos
nueva en cada lectura, válida durante el lease.

- Una cuenta se reutiliza durante el 80% de su lease, no durante el tiempo de caché; con caché `0`, cada consulta lee una nueva.
- Vault solo devuelve un usuario y una contraseña: pon el resto de la conexión en la fila de la credencial.
- El lease nunca se revoca antes de tiempo; la cuenta caduca cuando Vault termina el lease.
