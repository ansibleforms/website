---
layout: default
title: Almacenes de secretos
nav_order: 14
has_children: true
has_toc: false
permalink: /secret-stores/
translated_from: 46ee77acbbf03c7b7536aa87ab0f44f0d486de6f
---

# Almacenes de secretos
{: .no_toc }

Leer y escribir credenciales en un gestor de secretos en lugar de en AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores: conectar un gestor de secretos, para que las credenciales lean de él su usuario y contraseña o los escriban en él.

---

## Cómo funciona

Un **almacén de secretos** es una conexión a un gestor de secretos, añadida en
**Conexiones > Almacenes de secretos**. Una **credencial** puede entonces nombrar un almacén y un lugar dentro de él
(la *referencia del secreto*). Cuando un formulario, un playbook o una expresión usa esa credencial:

- el **usuario** y la **contraseña** se leen del almacén, cada vez (dentro del tiempo de caché del almacén);
- el **host**, el **puerto** y la **base de datos** siguen siendo los de la fila de la credencial. Cuando la fila deja
  alguno de ellos vacío y el secreto lo incluye, se usa el valor del secreto.

Los formularios siguen refiriéndose a la credencial por su nombre, así que mover una contraseña a un almacén no cambia
nada en tus formularios.

| Tipo de almacén | Estado |
|---|---|
| HashiCorp Vault (KV v1 y v2, autenticación por token) | disponible |
| Credenciales dinámicas de HashiCorp Vault (`<mount>/creds/<role>`) | experimental |
| CyberArk Central Credential Provider (CCP) | experimental |
| Escritura de credenciales en HashiCorp Vault KV | disponible |
| Escritura de credenciales en CyberArk, a través de su PVWA | experimental |

---

## Añadir un almacén

Desde 7.3.0 solo un admin puede añadir, cambiar o eliminar un almacén, ya que su token o su clave se envía a su dirección. Todo almacén tiene estos campos:

| Campo | Significado |
|---|---|
| Nombre | Cómo se refieren las credenciales al almacén. |
| Tipo | El gestor de secretos. |
| Credencial | Cómo y dónde inicia sesión el almacén: una credencial de [Conexiones > Credenciales](../credentials.html), en el paso **Credenciales**, de tipo **HashiCorp Vault** (su token y su dirección) o **CyberArk**. Contiene la URL base, p. ej. `https://vault.example.com:8200`, y los ajustes TLS: omitir la verificación del certificado, o un bundle de CA en PEM para una CA privada. No puede leer ella misma de un almacén de secretos. |
| Caché (segundos) | Cuánto tiempo se reutiliza un secreto leído. `0` lo lee en cada uso. 60 por defecto. |
| Opciones adicionales (JSON) | Opciones propias del tipo, como objeto JSON. |

Hasta 7.2.0 la dirección, el token y los ajustes TLS eran campos del almacén. La actualización a 7.3.0 los mueve a su
credencial, llamada `<store>-token` (o `<store>-appid` para CyberArk), consulta [Direcciones en las credenciales](../credentials/types.html#addresses-in-credentials).

**Probar conexión** comprueba el acceso sin leer ningún secreto. La página **Estado** comprueba todos los almacenes, y avisa 7 días
antes de que caduque un token de Vault.

Cada gestor de secretos tiene su propia página:

| Página | Qué trata |
|---|---|
| [HashiCorp Vault](hashicorp-vault.html) | KV v1 y v2 con autenticación por token, y credenciales dinámicas de base de datos |
| [CyberArk](cyberark.html) | El Central Credential Provider (CCP) del Application Access Manager de CyberArk |

---

## Usar un almacén

### En una credencial

En **Conexiones > Credenciales**, en el paso **Almacén** de la credencial, elige **Almacén de secretos** y **Apuntar a una clave**, luego
elige el **Almacén de secretos** y rellena la **Referencia**. El usuario y la contraseña se leen entonces del almacén, no se escriben.

### En línea, sin fila de credencial

En cualquier lugar donde se acepte un nombre de credencial, puedes referenciar directamente un almacén (`fnCredentials`, `fnRestBasic`,
el `credentials:` de un formulario, el `dbConfig` de una consulta).

```javascript
fn.fnCredentials('secret:vault:secret/myapp/prod')   // secret:<store>:<reference>
fn.fnCredentials('vault:secret/myapp/prod')          // the store named `vault`
```

```yaml
- name: servers
  type: enum
  query: SELECT name FROM servers
  dbConfig: secret:vault:secret/cmdb/db
```

Desde la 7.5.0 un `dbConfig` nombra primero una [base de datos](../databases.html); una referencia como esta no es una base de datos, así que
se sigue leyendo del almacén. Una base de datos también puede leer su acceso de un almacén, mediante una credencial de tipo base de datos que use uno.

Sin fila de credencial, un secreto de base de datos necesita al menos un `db_type` y un host, por ejemplo:

```json
{ "username": "forms", "password": "...", "host": "cmdb.example.com", "port": 3306,
  "db_type": "mysql", "database": "cmdb" }
```

Sin `db_type`, el secreto es una credencial simple (usuario, contraseña y cualquier otra clave), y una consulta sobre él asume `mysql`.

### Nombres de clave

Un secreto se asigna a una credencial con estos alias. Las demás claves se pasan tal cual.

| Campo de la credencial | Claves aceptadas en el secreto |
|---|---|
| `user` | `user`, `username`, `login` |
| `password` | `password`, `token`, `api_key`, `apikey`, `secret` |
| `host` | `host`, `address` |
| `port` | `port` |
| `db_name` | `db_name`, `database` |
| `db_type`, `secure` | el mismo nombre (solo secretos en línea) |

Para una fila de credencial, el host, el puerto y el nombre de la base de datos del secreto solo se usan donde la
fila los deja vacíos.

Un secreto con otra estructura se puede remodelar con una expresión `jq`, pasada como tercer argumento de
`fnCredentials`:

```javascript
// secret: { "creds": { "u": "admin", "p": "Netapp12" } }
fn.fnCredentials('vault:secret/weird', '', '.creds | { user: .u, password: .p }')
```

---

## Escribir credenciales

Desde 7.6.0, el usuario y la contraseña de una credencial se pueden escribir en un almacén al guardarla, sin tener que ponerlos allí antes.

En el paso **Almacén** de la credencial, elige **Almacén de secretos** y **Escribir en una clave**, elige el almacén y rellena la **Referencia**.
El paso **Acceso** pide entonces el usuario y la contraseña, y **Guardar** los escribe en el almacén; AnsibleForms solo guarda el almacén y la referencia.

- Solo se ofrece un almacén con **Permitir la escritura** activado en sus **Opciones**, y solo escribe donde sus opciones lo permiten.
- Una clave que ya tiene un secreto solo se reemplaza si **Sobrescribir un secreto que ya esté allí** está marcado; si no, no se escribe ni se guarda nada.
- Solo un admin puede escribir, y cada escritura se audita como `credential.secret_write`, sin el secreto.

Cómo se configura cada gestor de secretos para escribir:

| Página | Qué trata |
|---|---|
| [HashiCorp Vault](hashicorp-vault.html#writing-credentials) | Un prefijo de escritura, y las capacidades del token |
| [CyberArk](cyberark.html#writing-credentials) | Las cajas fuertes, y el PVWA con su credencial y plataforma |

---

## En la semilla de configuración

Los almacenes también se pueden declarar en la semilla de configuración, como los demás objetos de administración:

```yaml
secret_stores:
  items:
    - name: vault
      type: vault
      credential: vault-login        # its address and token

credentials:
  items:
    - name: vault-login
      credential_type: vault
      url: https://vault.example.com:8200
      password: ${SEED_VAULT_TOKEN}  # the Vault token
    - name: production-db
      secret_store: vault
      secret_ref: secret/forms/production-db
      host: db.example.com
      port: 3306
      db_type: mysql
      is_database: true
```

El almacén inicia sesión con su credencial: una `vault` contiene la dirección del Vault en `url` y el token como contraseña, una `cyberark`
el AppID y la dirección del CCP. Sin credencial, se usan el `url` y el `token` propios del almacén.
Un almacén que permite escribir define `write_enabled: true` y `write_prefix` (en CyberArk, sus cajas fuertes), y un CyberArk también `pvwa_url`,
`pvwa_credential`, `pvwa_auth` y `platform_id`. Para más detalles, consulta [Semilla de configuración](../seed).

---

## Actualizar desde las variables VAULT_*

Antes de la 7 el único almacén era un HashiCorp Vault configurado con variables de entorno `VAULT_*`,
y una credencial apuntaba a él con **Ruta de Vault**.

- **Las variables se importan una vez** como un almacén llamado `vault`; elimínalas después.
- **Las credenciales con un `vault_path`** usan ahora ese almacén; `vault_path` desaparece en la 8.
