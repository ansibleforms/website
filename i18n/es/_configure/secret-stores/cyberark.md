---
layout: default
title: CyberArk
parent: Almacenes de secretos
nav_order: 2
translated_from: f001addbd5578169444a321ab9e668e54139842b
---

# CyberArk
{: .no_toc }

Leer credenciales del Central Credential Provider (CCP) de CyberArk
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
