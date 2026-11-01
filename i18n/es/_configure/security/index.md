---
layout: default
title: Seguridad
nav_order: 15
has_children: true
has_toc: false
permalink: /security/
translated_from: e299ab0a4ffb1c12441a3b3fec6eaaef4a19de79
---

# Seguridad
{: .no_toc }

Protege una instancia: la cuenta admin, sus secretos, HTTPS y lo que pueden hacer los usuarios y los formularios
{: .fs-6 .fw-300 }

---

Para administradores que preparan una instancia para producción y para revisiones de seguridad de una existente.

---

## En esta sección

Cada tema tiene su propia página:

| Página | Qué cubre |
|---|---|
| [Bastionado](hardening.html) | La cuenta admin, los límites de inicio de sesión, la base de datos, las expresiones, los datos de los trabajos, la política del navegador, las funciones opcionales y las opciones de rol |
| [HTTPS](https.html) | Dónde termina TLS, servir HTTPS desde la aplicación y sustituir el certificado de ejemplo |
| [Secretos y cifrado](secrets.html) | `ENCRYPTION_SECRET`, `ACCESS_TOKEN_SECRET` y la duración de los tokens |

Páginas relacionadas: [Autenticación](../authentication/) para los métodos de inicio de sesión, [Validación del lanzamiento](../launch-validation/) para
las comprobaciones en el servidor de cada lanzamiento, y las [Variables de seguridad](../customization/security.html).
