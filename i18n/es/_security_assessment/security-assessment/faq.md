---
layout: default
title: Preguntas de evaluación
nav_order: 6
translated_from: 731a656c844e6262715e5c8d0a7a291e3b6321f2
---

# Preguntas de evaluación
{: .no_toc }

Respuestas breves a las preguntas habituales de los cuestionarios
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Datos y alojamiento

Dónde están los datos, y quién puede llegar a ellos:

| Pregunta | Respuesta |
|---|---|
| ¿Dónde se guardan nuestros datos? | En la base de datos MySQL o MariaDB que gestionas tú, y en la carpeta persistente de tu instancia. AnsibleForms es autoalojado, sin ningún servicio en la nube detrás. |
| ¿Envía datos a sus autores? | No. No hay telemetría, ni informes de uso, ni comprobación de actualizaciones. |
| ¿A qué se conecta? | Solo a los sistemas que configura un administrador: consulta [Conexiones salientes](measures.html#outbound-connections). |
| ¿Usa IA o envía datos a un proveedor de modelos? | Solo con el [asistente de chat](../chat/) activado, que está desactivado por defecto. Entonces envía las definiciones de los formularios y los valores que se rellenan al proveedor que configures. |
| ¿Puede funcionar sin acceso a internet? | Sí. La aplicación no necesita acceso a internet; los playbooks necesitan lo que alcancen sus tareas. |

---

## Cifrado

Qué se cifra, y con qué claves:

| Pregunta | Respuesta |
|---|---|
| ¿Se cifran los datos en tránsito? | Con [HTTPS](../security/https.html), servido por la aplicación o por tu proxy inverso, y `wss://` entre la aplicación y sus entornos de ejecución. |
| ¿Se cifran los datos en reposo? | Todo secreto guardado lo cifra la aplicación con AES-256. Los trabajos y su salida se guardan tal cual: usa el cifrado en reposo de la propia base de datos. Consulta [Secretos guardados](measures.html#stored-secrets). |
| ¿Quién tiene las claves? | Tú: el [`ENCRYPTION_SECRET`](../security/secrets.html) lo defines tú, queda fuera de las copias de seguridad y puede rotarse. |
| ¿Pueden quedarse los secretos en nuestro almacén? | Sí: [HashiCorp Vault y CyberArk](../secret-stores/) se leen cuando un trabajo los necesita. |

---

## Acceso y responsabilidad

Quién puede iniciar sesión, qué puede hacer y qué se registra:

| Pregunta | Respuesta |
|---|---|
| ¿Admite inicio de sesión único? | Sí: LDAP / Active Directory, OpenID Connect y Entra ID. Consulta [Autenticación](../authentication/). |
| ¿Admite autenticación multifactor? | A través del inicio de sesión único: se aplica la MFA de tu proveedor de identidad. Las cuentas locales no tienen MFA propia. |
| ¿Cómo se gestionan los permisos? | Con roles asignados a grupos, que el servidor comprueba en cada petición. Consulta [Permisos](measures.html#permissions). |
| ¿Hay registro de auditoría? | Sí: todo cambio y todo intento denegado, conservado 365 días por defecto y reenviable a syslog. Consulta [Registro de auditoría](measures.html#audit-trail). |
| ¿Hay una contraseña predeterminada? | La primera cuenta admin tiene una contraseña predeterminada pública, que debe cambiarse en el primer inicio de sesión. Consulta [La cuenta admin](../security/hardening.html#the-admin-account). |

---

## Vulnerabilidades y actualizaciones

Cómo se encuentran, corrigen y anuncian los problemas:

| Pregunta | Respuesta |
|---|---|
| ¿Se han encontrado vulnerabilidades? | Sí. Todas las publicadas aparecen en [Avisos de seguridad](advisories.html), con la versión que las corrigió. |
| ¿Cómo informamos de una? | En privado, a través de GitHub: consulta [Informar de una vulnerabilidad](reporting.html). |
| ¿Cómo se comprueba el código? | Análisis estático con CodeQL y revisión de dependencias en cada pull request, tests automáticos y actualizaciones de Dependabot. Consulta [Desarrollo seguro](development.html). |
| ¿Qué versiones reciben correcciones de seguridad? | 7.x y 6.5.x. Consulta [Versiones con soporte](development.html#supported-versions). |
| ¿Cómo nos enteramos de un aviso nuevo? | Sigue las alertas de seguridad del repositorio en GitHub. Consulta [Enterarte de los avisos nuevos](advisories.html#being-told-of-new-advisories). |
| ¿Se ha hecho una prueba de penetración? | No se publica ningún informe de prueba de penetración de terceros. El código es público, así que tu propio equipo o auditor puede evaluarlo, y los hallazgos se notifican como se indica arriba. |

---

## Imágenes y cadena de suministro

De dónde vienen las imágenes, y cómo comprobarlas:

| Pregunta | Respuesta |
|---|---|
| ¿Dónde se publican las imágenes? | En el GitHub Container Registry, `ghcr.io/ansibleforms/ansibleforms`, construidas por workflows públicos de GitHub Actions. Consulta [Versiones e imágenes](development.html#releases-and-images). |
| ¿Los contenedores se ejecutan como root? | No: como el usuario sin privilegios `node`. |
| ¿Están firmadas las imágenes? | Todavía no. Descárgalas por digest (`@sha256:...`) para asegurarte de ejecutar la imagen que revisaste. |
| ¿Hay un SBOM? | Todavía no se publica ninguno con las imágenes. Un escáner como Trivy o Syft lo genera a partir de la imagen. |
| ¿Se escanean las imágenes en busca de vulnerabilidades? | No en el pipeline de publicación. Sus imágenes base se fijan por digest y Dependabot las mantiene al día; escanea las imágenes en tu propio registry para aplicar tu propia política. |
| ¿Bajo qué licencia está? | GPL-3.0, código abierto, sin garantía. |
