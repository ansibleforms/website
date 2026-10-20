---
layout: default
title: Activarlo
parent: Asistente de chat
nav_order: 1
translated_from: 9277301a5a83fdc57c5acd1ba4687f8b16497081
---

# Activarlo
{: .no_toc }

Habilita el asistente y ofrece formularios en él
{: .fs-6 .fw-300 }

---

El asistente necesita las cuatro condiciones siguientes:

1. **`ENABLE_CHAT=1`**: la variable de entorno. Si la cambias en la página de configuración, se aplica al momento, sin reiniciar; mientras
   está desactivada, los endpoints del chat responden `404`. Consulta [`ENABLE_CHAT`](../customization/features.html#env_ENABLE_CHAT).
2. **Un proveedor de modelos**: Configuración -> Conexiones -> **Asistente de chat** (o la [semilla de configuración](../seed) en Kubernetes).
3. **Formularios que participen**: `enableForChat: true` en cada formulario; el asistente ignora todos los demás.
4. **Usuarios que puedan usarlo**: la opción de rol `allowChat` (por defecto: true). Pon
   `allowChat: false` en un rol para excluir a sus miembros.

El botón del chat aparece para un usuario en cuanto se cumplen las cuatro condiciones.
