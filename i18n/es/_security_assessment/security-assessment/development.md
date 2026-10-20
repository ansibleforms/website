---
layout: default
title: Desarrollo seguro
nav_order: 3
translated_from: b5b66a3ebecfb686b0cf33ed8724fe96622c7d0f
---

# Desarrollo seguro
{: .no_toc }

Cómo se revisan y publican los cambios, y qué tiene soporte
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## El código fuente

AnsibleForms es código abierto, así que todo lo de esta página puede comprobarse en el propio repositorio:

* El código, su historial y sus pipelines de build son públicos en [github.com/ansibleforms/ansibleforms](https://github.com/ansibleforms/ansibleforms).
* La [licencia](https://github.com/ansibleforms/ansibleforms/blob/main/LICENSE) es GPL-3.0.
* El [registro de cambios](../changelog.html) lista todos los cambios de cada versión, correcciones de seguridad incluidas.

---

## Cómo se fusiona un cambio

Todo cambio llega a `main` mediante un pull request, bajo un ruleset que nadie puede saltarse:

| Regla | Qué significa |
|---|---|
| Pull request obligatorio | No se hace push directo a `main` |
| Comprobaciones obligatorias | El pull request solo se fusiona cuando pasan todas las comprobaciones de abajo |
| Sin force push ni borrado | El historial de `main` no puede reescribirse ni eliminarse |
| Historial lineal | Cada pull request se convierte en un commit, así cada cambio puede rastrearse y revertirse por separado |

Las comprobaciones que debe pasar un pull request:

| Comprobación | Qué hace |
|---|---|
| Client, Server | Los tests unitarios de la interfaz web y del servidor |
| CodeQL | El análisis estático de GitHub del código JavaScript y TypeScript, en busca de inyección, cross-site scripting y otras debilidades |
| Public schema is up to date | El esquema de base de datos que espera el código coincide con el que incluye |
| Title, Branch | El pull request sigue las reglas de nombres, así el registro de cambios se mantiene exacto |

Otras dos se ejecutan en cada pull request e informan sobre él:

* **Database** prueba el servidor en MySQL y MariaDB, y **Browser** maneja la interfaz en un navegador.
* **Dependency review** bloquea una dependencia nueva con una vulnerabilidad conocida alta o crítica.

---

## Análisis del código y dependencias

El código y aquello de lo que depende se vuelven a comprobar tras fusionarse:

* **CodeQL** analiza también cada push a `main` y a las ramas de versión, y todo el código cada semana:
  así una regla nueva de CodeQL comprueba también el código fusionado antes de ella.
* **Dependabot** abre un pull request por cada versión nueva de una dependencia: los paquetes npm del servidor y de la
  interfaz, los paquetes Python del entorno de ejecución y las GitHub Actions de los pipelines cada semana, y
  las imágenes base de los contenedores cada día.
* Las imágenes base se fijan por digest (`node:26-trixie-slim@sha256:...`), así un build usa exactamente la imagen revisada.
  Dependabot mueve el digest cuando la imagen se reconstruye en origen.

---

## Versiones e imágenes

Una versión solo la construye y publica GitHub Actions, nunca la máquina de un desarrollador:

* Una versión se corta desde `main` (o `release/6.x`), con un registro de cambios generado a partir de sus pull requests.
* Las imágenes las construye el [workflow Publish](https://github.com/ansibleforms/ansibleforms/blob/main/.github/workflows/publish.yml)
  y se suben al GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, junto a las imágenes del entorno de
  ejecución. El workflow y sus logs son públicos, así que cualquiera puede ver qué entró en una imagen.
* Las imágenes de la aplicación y del entorno de ejecución se ejecutan como el usuario sin privilegios `node` (uid 1000), nunca como root.

---

## Versiones con soporte

Las correcciones de seguridad van a la versión más reciente de cada línea con soporte:

| Versión | Recibe correcciones de seguridad |
|---|---|
| 7.x | Sí |
| 6.5.x | Sí |
| Anterior a 6.5 | No: la corrección es actualizar |

La [guía de actualización](../upgrading/) explica cómo pasar a una versión más reciente, y [Actualizar a la v7](../upgrade-7.html) el paso desde 6.5.
