---
layout: default
title: Informar de una vulnerabilidad
nav_order: 4
translated_from: 382775f2312f05fd6dcd85154cb81c2709000d69
---

# Informar de una vulnerabilidad
{: .no_toc }

Informar en privado de un problema de seguridad, y qué sigue
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Infórmalo en privado

AnsibleForms guarda credenciales y tokens de vault, así que nunca informes de un problema de seguridad en una issue pública:

1. Abre **[Report a vulnerability](https://github.com/ansibleforms/ansibleforms/security/advisories/new)**: un aviso privado que solo ven los mantenedores.
2. Si esa página no está disponible para ti, abre una issue normal que diga solo que tienes un informe de seguridad y pida
   un canal privado: sin detalles, sin reproductor, sin números de versión. Un mantenedor abre un aviso privado y
   te invita a él.

La política completa es el [SECURITY.md](https://github.com/ansibleforms/ansibleforms/blob/main/SECURITY.md) del repositorio.

---

## Qué incluir

Cuanto más de esto aporte un informe, antes se corrige:

* Qué gana un atacante: datos de otro usuario, un playbook que no puede ejecutar, el host o derechos de admin.
* La versión, y cómo está desplegada: Docker, Kubernetes o instalada de forma nativa.
* Un reproductor, o la petición que lo provoca.
* Si necesita un usuario con sesión iniciada, y con qué [opciones de rol](../config/roles.html).

---

## Qué ocurre después

Un informe pasa por el mismo aviso privado desde el primer mensaje hasta la publicación:

| Paso | Qué recibes |
|---|---|
| Acuse de recibo | Confirmación de que el informe ha llegado, y de si se reproduce |
| Aceptado | Una corrección en la próxima versión de cada [versión con soporte](development.html#supported-versions), y un aviso publicado que te da el crédito, salvo que prefieras no aparecer |
| Rechazado | El razonamiento, normalmente que el comportamiento necesita un permiso que quien informa ya tenía |

Cuando se publica la corrección, el aviso se publica y aparece en [Avisos de seguridad](advisories.html).

---

## Alcance

La política traza la línea donde la traza el modelo de roles:

| Dentro del alcance | Fuera del alcance |
|---|---|
| Todo lo que un usuario con sesión iniciada puede alcanzar más allá de lo que concede su rol | Hallazgos que requieren que la cuenta admin ya esté comprometida: un admin que ejecuta cualquier playbook es el producto |
| Todo lo alcanzable sin iniciar sesión | Informes de escáneres sin impacto demostrado |
| Credenciales guardadas que pasan a ser legibles, o se escriben en un log | |
| Inyección en el shell, la base de datos o el navegador | |
