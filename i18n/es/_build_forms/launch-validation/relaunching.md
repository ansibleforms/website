---
layout: default
title: Relanzar
parent: Validación del lanzamiento
nav_order: 6
translated_from: 6f166e0990776006b4835e37b8ba058f5629c0b0
---

# Relanzar
{: .no_toc }

Cómo se valida un trabajo relanzado
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un trabajo se puede relanzar de dos formas. Cómo se comprueba el relanzamiento depende de cuál se use, y del modo de validación
del lanzamiento.

---

## Dos tipos de relanzamiento

Los dos tipos se diferencian en si quien llama envía valores nuevos:

* **Tal como se ejecutó**: el botón Relanzar, `POST /api/v2/job/{id}/relaunch` sin cuerpo, o `relaunch_job` sin
  `values`.
* **Con cambios**: las mismas llamadas con valores nuevos, aplicados sobre los valores de campo guardados del trabajo:

```bash
curl -X POST https://af.example.com/api/v2/job/42/relaunch \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "values": { "vm_size": "large" } }'
```

---

## Cómo se comprueba cada uno

El modo de validación del lanzamiento decide si un relanzamiento se reproduce o se vuelve a comprobar:

| Relanzamiento | `off` / `log` | `enforce` |
|---|---|---|
| **Tal como se ejecutó** | reproduce las extravars guardadas del trabajo, contraseñas incluidas | la comprobación completa, a partir de los valores de campo guardados |
| **Con cambios** | la comprobación completa, sobre los valores guardados con los cambios aplicados encima | la comprobación completa, de la misma forma |

Una excepción con `enforce`: un trabajo lanzado por una programación de nivel administrador no tiene valores de campo propios, así que relanzarlo tal como se ejecutó
reproduce las extravars guardadas de la programación, para un administrador o un usuario con la opción de rol `allowScheduledJobs`.

Un relanzamiento comprobado (consulta [Registrar e imponer](log-and-enforce.html)) inicia un trabajo nuevo a nombre de quien llama.

Desde 7.7.0 un relanzamiento [en los hosts fallidos](../jobs/actions.html#relaunch-on-the-failed-hosts) o
[desde el nodo fallido](../jobs/actions.html#relaunch-from-the-failed-node) se comprueba según su tipo, tal como se ejecutó o con cambios. El
servidor añade los hosts, o los nodos que conservar, después de la comprobación.

---

## Campos de contraseña

Los valores de campo guardados no contienen contraseñas, así que un relanzamiento comprobado no tiene ninguna para un **campo de contraseña visible**:

* El relanzamiento se rechaza como `unsupported`, con los `passwordFields` que le faltan.
* Lanza de nuevo el formulario e introduce la contraseña.
* Un campo de contraseña que las dependencias del formulario **ocultan** no es necesario y no bloquea el relanzamiento.

Con `enforce`, esto también se aplica al botón Relanzar.

---

## Quién puede relanzar

Los dos tipos de relanzamiento requieren:

* que el formulario permita relanzar (`allowRelaunch`, true por defecto);
* la opción de rol `allowJobRelaunch`;
* que el usuario sea **el propietario del trabajo**, un administrador o un usuario con la opción de rol `manageAllJobs`.

Ver todos los trabajos (`showAllJobLogs`) no basta para relanzar el trabajo de otro usuario. Los aprobadores pueden ver un trabajo que espera su
aprobación, pero tampoco pueden relanzarlo.
