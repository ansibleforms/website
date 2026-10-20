---
layout: default
title: Tipos de runner
parent: Runners
nav_order: 2
translated_from: d15bc7b93c01adc1a74f67135e114eca6b432a27
---

# Tipos de runner
{: .no_toc }

Los productos que puede ser un runner, su dirección y su login
{: .fs-6 .fw-300 }

El paso **Tipo** ofrece una opción por producto, cada una con una indicación; la del RTE da su nombre completo, *Entorno de ejecución*. AAP y
Ascender se guardan como un runner de tipo `awx` con una variante (`aap` o `ascender`), que es también lo que usa la semilla de configuración:

| Tipo | Ejemplo de Uri | Proyecto | Autenticación |
|---|---|---|---|
| RTE | `https://rte-vmware:8000` | | El `RTE_TOKEN` del RTE |
| AAP | `https://aap.example.com/api/controller/v2` | | Un token de API, o un usuario y una contraseña |
| Ascender | `https://ascender.example.com/api/v2` | | Un token de API, o un usuario y una contraseña |
| AWX | `https://awx.example.com/api/v2` | | Un token de API, o un usuario y una contraseña |
| Jenkins | `https://jenkins.example.com` | La carpeta en la que están los jobs (opcional) | Un usuario y el token de API de ese usuario |
| Rundeck | `https://rundeck.example.com` | El nombre del proyecto | El token de API de un usuario |
| Semaphore | `https://semaphore.example.com` | El id del proyecto, el número de `/project/<id>` | El token de API de un usuario |

Una dirección de AWX, AAP o Ascender lleva su ruta de API: `/api/v2`, o `/api/controller/v2` para AAP 2.5 y posteriores.
Un RTE es la imagen de AnsibleForms arrancada con `AF_ROLE=rte`; cómo ejecutar uno se describe en
[Entornos de ejecución](../rte/).
