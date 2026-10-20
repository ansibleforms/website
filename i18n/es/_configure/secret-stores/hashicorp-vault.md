---
layout: default
title: HashiCorp Vault
parent: Almacenes de secretos
nav_order: 1
translated_from: 33cbbea1ca86bf474182d220bd6824af81aa752f
---

# HashiCorp Vault
{: .no_toc }

Leer credenciales de HashiCorp Vault, de KV v1 o v2 o de un motor de secretos dinámicos
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

## Credenciales dinámicas de base de datos

Una referencia de la forma `<mount>/creds/<role>`, p. ej. `database/creds/readonly`, lee de un
motor de secretos dinámicos como el motor de base de datos de Vault. Vault crea entonces una cuenta de base de datos
nueva en cada lectura, válida durante el lease.

- Una cuenta se reutiliza durante el 80% de su lease, no durante el tiempo de caché; con caché `0`, cada consulta lee una nueva.
- Vault solo devuelve un usuario y una contraseña: pon el resto de la conexión en la fila de la credencial.
- El lease nunca se revoca antes de tiempo; la cuenta caduca cuando Vault termina el lease.
