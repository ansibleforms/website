---
layout: default
title: Servidor MCP
nav_order: 2
has_children: true
has_toc: false
permalink: /mcp/
translated_from: a5acf44b528914d81ce5c387c685d4fd41a0fdd6
---

# Servidor MCP
{: .no_toc }

Deja que los agentes de IA usen tus formularios mediante el Model Context Protocol
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Para administradores e integradores: permite que los clientes MCP listen, rellenen y lancen formularios como el usuario cuyo token tienen.

AnsibleForms puede servir un servidor
[Model Context Protocol](https://modelcontextprotocol.io), para que un cliente MCP, como
el backend de un chat o un asistente de un IDE, pueda listar los formularios que un usuario puede usar, conocer sus campos,
lanzar trabajos y seguir su progreso.

---

## Qué es y qué no es

El servidor MCP es una interfaz técnica al mismo flujo de formularios que usa el navegador. Se ejecuta
**como el usuario cuyo token recibe**: los mismos roles de formulario, la misma visibilidad de trabajos y las
mismas comprobaciones de extravars reservadas que un envío desde el navegador.

No añade ninguna política de IA propia. Si un agente debe pedir confirmación antes de un lanzamiento,
qué formularios puede usar o cuántas peticiones puede hacer depende del cliente MCP. La
herramienta de lanzamiento está marcada como destructiva, así que un cliente bien diseñado pide confirmación antes,
pero el servidor no lo impone.

---

## En esta sección

Cada tema tiene su propia página:

| Página | Qué trata |
|---|---|
| [Configuración inicial](setup.html) | Activar el servidor y autenticar al cliente |
| [Herramientas](tools.html) | Las herramientas que usa un agente para rellenar, aprobar y relanzar formularios |
| [Limitaciones](limitations.html) | Las expresiones se ejecutan en el servidor, y lo que no hace el servidor MCP |
