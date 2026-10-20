---
layout: default
title: Permisos
parent: Tu perfil
nav_order: 4
translated_from: 08770187a1159539d1d450cf7dddf80c6943cfed
---

# Permisos
{: .no_toc }

Qué te permiten hacer tus roles
{: .fs-6 .fw-300 }

---

Las opciones de rol se agrupan en pestañas, cada una con cuántas de sus opciones tienes, como `5/8`:

| Pestaña | Opciones sobre |
|---|---|
| **Acceso e integraciones** | El inicio de sesión, el asistente de chat, el servidor MCP, la subida de archivos y los tokens de API |
| **Diseñador** | Abrir el diseñador y editar formularios, playbooks, workflows, inventarios y archivos de variables |
| **Jobs** | Ver los trabajos y sus extravars o artifacts, relanzar, eliminar, programar y guardar trabajos |
| **Configuración** | Las páginas de configuración, los logs, el registro de auditoría y las copias de seguridad |
| **Otros** | Una opción definida a mano en un rol que no está en ninguna otra pestaña; siempre la última pestaña |

Las demás pestañas van en orden alfabético. Cada pestaña es una tabla con las columnas **Ajuste** (la opción), **Descripción**
(qué hace) y **Tu acceso**: **Permitido** o **No permitido**. Una opción que se aplica por otra lo indica
bajo su descripción: **Incluido en** una opción que tienes la activa, y **Necesita** una opción que no tienes la mantiene desactivada.

Las opciones vienen de las `options` de tus roles en `config.yaml`; la página [Roles](../config/roles.html) explica cómo
se combinan.
