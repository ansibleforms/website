---
layout: default
title: CyberArk
parent: Almacenes de secretos
nav_order: 2
translated_from: 2c82742312515c87bc1c83fea368929c0a32bfb3
---

# CyberArk
{: .no_toc }

Leer credenciales a través del CCP de CyberArk, escribirlas a través de su PVWA
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

{: .warning }
> **Experimental.** Aún no se ha probado con una instalación real de CyberArk; por favor, comparte lo que encuentres.

El CCP es la interfaz REST del Application Access Manager de CyberArk.

---

## Campos del almacén

Además de los [campos que tiene todo almacén](./#adding-a-store), un almacén CyberArk tiene estos campos:

| Campo | Significado |
|---|---|
| Credencial | Una credencial **CyberArk** de [Conexiones > Credenciales](../credentials.html): la URL base del CCP, p. ej. `https://ccp.example.com` (se añade `/AIMWebService/api/Accounts`), sus ajustes TLS, su AppID (la aplicación definida para AnsibleForms en CyberArk), y un certificado y una clave de cliente en PEM, solo cuando el AppID los exige. |

---

## Referencia del secreto

La referencia del secreto identifica la cuenta como pares clave-valor separados por `;`:

```
Safe=Linux;Object=root-srv01
Safe=DB;UserName=forms;Address=db01.example.com
Query=Safe=Linux;Folder=Root;Object=root-srv01
```

- Claves permitidas: `Safe`, `Folder`, `Object`, `UserName`, `Address`, `Database`, `PolicyID`,
  `Reason`, `Query`, `QueryFormat`, `ConnectionTimeout`, `FailRequestOnPasswordChange`.
- `Query=` pasa el resto de la referencia como una consulta nativa del CCP, con `QueryFormat=Exact`
  salvo que indiques otro.
- Un `AppID` en la referencia se ignora: siempre se usa el AppID del almacén.
- La contraseña de la cuenta (`Content`) pasa a ser la contraseña; `UserName`, `Address`, `Port` y
  `Database` rellenan el usuario, el host, el puerto y el nombre de la base de datos.

---

## Escribir credenciales

Desde 7.6.0, el usuario y la contraseña de una credencial se pueden escribir en CyberArk al **Guardar** (ver [Escribir credenciales](./#writing-credentials)).
El CCP solo lee, así que AnsibleForms escribe a través de la API REST del PVWA, con una credencial propia.

Activa **Permitir la escritura** en las **Opciones** del almacén y rellena:

| Campo | Significado |
|---|---|
| Permitir la escritura | Permite que una credencial escriba su usuario y contraseña en este almacén al **Guardar**. Desactivado por defecto. |
| Cajas fuertes donde escribir | Las cajas fuertes donde se pueden escribir credenciales, separadas por comas, p. ej. `Linux, DB`. Obligatorio con la escritura activada. |
| Dirección del PVWA | La URL base del PVWA, p. ej. `https://pvwa.example.com`. Obligatoria. |
| Credencial del PVWA | Una credencial propia de tipo **Usuario y contraseña** o **API**, nunca leída de un almacén de secretos, que puede añadir cuentas a esas cajas fuertes y cambiar sus contraseñas. Obligatoria. |
| Método de inicio de sesión | Cómo inicia sesión la credencial del PVWA: CyberArk (por defecto), LDAP, RADIUS o Windows. |
| ID de plataforma | La plataforma de las cuentas que añade, p. ej. `UnixSSH`. Necesario para añadir una cuenta nueva. |

La referencia nombra la cuenta como al leer, `Safe=Linux;Object=srv01-root`, con `Address=srv01.example.com` cuando su plataforma lo necesita.

- Una cuenta nueva se añade a la caja fuerte con la plataforma, el nombre de usuario y la contraseña.
- Una cuenta existente solo se cambia si **Sobrescribir un secreto que ya esté allí** está marcado: su nombre de usuario y luego su contraseña.
- La sesión del PVWA se cierra después de cada escritura. El inicio de sesión OAuth de Privilege Cloud no está soportado.

---

## Opciones adicionales

Las opciones adicionales del almacén se definen como un objeto JSON:

| Clave | Significado |
|---|---|
| `reason` | Se envía como `Reason` cuando la referencia no lleva ninguno, para la auditoría de CyberArk. |
| `check_ref` | Una referencia que **Probar conexión** lee de verdad. Sin ella, la prueba solo verifica que el CCP responde y acepta el AppID. |
| `timeout_ms` | Tiempo de espera de la petición, 10000 por defecto. |

Por ejemplo, para enviar un motivo y dejar que **Probar conexión** lea una cuenta de prueba:

```json
{ "reason": "AnsibleForms", "check_ref": "Safe=Test;Object=ansibleforms-probe" }
```
