---
layout: default
title: Aceptaciones
parent: Aviso legal
nav_order: 3
translated_from: 952000db809a111ac98ba2850a5eb8b31e7a96f5
---

# Aceptaciones
{: .no_toc }

Quién aceptó cada versión, y cómo volver a pedírsela a los usuarios que elijas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Quién la aceptó

Cada aceptación se registra con el usuario y la versión, y la pestaña **Aceptaciones** de la página de una versión las lista, la más reciente primero:

| Columna | Significado |
|---|---|
| **Usuario** | El nombre de usuario |
| **Inicio de sesión** | Cómo inició sesión: Local, LDAP, Microsoft Entra ID u OpenID Connect |
| **Aceptado** | Cuándo |
| **Dirección IP** | Desde dónde |
| **Navegador** | Su navegador |

---

## Volver a pedirla

Desde la 7.3.0 se puede pedir a los usuarios que elijas que vuelvan a aceptar una versión, sin pedírselo a todos.

**Volver a pedir**, en el menú de una fila o sobre las filas marcadas en la lista, borra esas aceptaciones tras una confirmación: esos
usuarios vuelven a ver el aviso legal en su siguiente petición, sin tener que iniciar sesión de nuevo. La lista también se puede exportar, como cualquier tabla.

El [registro de auditoría](../production/logs.html#audit-trail) también guarda cada aceptación, cada rechazo y cada cambio del aviso legal.
