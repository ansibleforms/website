---
layout: default
title: Resumen
nav_order: 1
permalink: /security-assessment/
translated_from: 4357493c88da7b9bbd30f0a5ea185be3e6438abd
---

# Evaluación de seguridad
{: .no_toc }

Para revisiones de seguridad: medidas, desarrollo y avisos
{: .fs-6 .fw-300 }

---

## En resumen

AnsibleForms ejecuta playbooks y guarda sus credenciales, así que forma parte de tu cadena de confianza:

* Es **autoalojado**: se ejecuta en tu infraestructura, guarda sus datos en tu base de datos y no envía nada a sus autores.
* Es **código abierto** (GPL-3.0): el código, sus pipelines y todos los avisos son públicos.
* Todo secreto guardado está **cifrado**, todo cambio **auditado**, y los **roles** se comprueban en cada petición.
* Las vulnerabilidades se **notifican en privado**, se corrigen en cada versión con soporte y se **publican**.

---

## En esta sección

Las páginas responden a las preguntas de una revisión de seguridad, desde el diseño hasta la lista de CVE:

| Página | Qué cubre |
|---|---|
| [Medidas de seguridad](measures.html) | Inicio de sesión, permisos, secretos guardados, la auditoría, el navegador, el servidor, las conexiones y los contenedores |
| [Desarrollo seguro](development.html) | Cómo se revisa y prueba un cambio, el análisis del código y las dependencias, cómo se construyen las imágenes, las versiones con soporte |
| [Informar de una vulnerabilidad](reporting.html) | Cómo informar de un problema en privado, y qué ocurre después |
| [Avisos de seguridad](advisories.html) | Cada vulnerabilidad publicada, con su CVE, su gravedad y la versión que la corrige |
| [Preguntas de evaluación](faq.html) | Respuestas breves a las preguntas más habituales de los cuestionarios de seguridad |

Para proteger una instancia en lugar de evaluarla, consulta [Seguridad](../security/) en la guía del administrador.
