---
layout: default
title: Medidas de seguridad
nav_order: 2
translated_from: 1ceeb1a74d9235a43a8600d8bf7e0a39015a124a
---

# Medidas de seguridad
{: .no_toc }

Cómo se protegen el inicio de sesión, los permisos y los secretos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Dónde se ejecuta

AnsibleForms es autoalojado, en tu infraestructura, con sus datos en una base de datos que gestionas tú.

* No hay ningún servicio en la nube de AnsibleForms ni servidor de licencias, ni telemetría ni comprobación de actualizaciones.
* La interfaz la sirve la propia aplicación y no carga nada de otro sitio.
* La aplicación solo se conecta a los sistemas que configura un administrador, listados en [Conexiones salientes](#outbound-connections).

Las partes y lo que guarda cada una:

| Parte | Qué hace | Qué guarda |
|---|---|---|
| Aplicación | La interfaz web, la API REST, el planificador | Ningún dato propio: todo está en la base de datos |
| MySQL o MariaDB | La base de datos de la aplicación | Usuarios, grupos, credenciales (cifradas), trabajos con sus extravars y su salida, el registro de auditoría |
| Entorno de ejecución (RTE) | Ejecuta los playbooks, en su propio contenedor | Los archivos de los trabajos que ejecuta, y los secretos de un trabajo solo mientras se ejecuta |
| Carpeta persistente | La configuración, los formularios, los playbooks y los archivos subidos | Los archivos que usan los formularios y los playbooks |

Consulta [Cómo funciona](../how-it-works.html) para ver el conjunto, y [RTE](../rte/) para el entorno de ejecución.

---

## Inicio de sesión

Toda página y llamada a la API que lee o cambia datos necesita un usuario con sesión iniciada. Los pocos endpoints abiertos sin ella sirven el
propio inicio de sesión, la versión, el nombre y el logo de la instancia, la documentación de la API y la configuración de la base de datos del
primer arranque, que [`ALLOW_SCHEMA_CREATION`](../security/hardening.html#the-database)`=0` cierra:

| Método | Cómo funciona |
|---|---|
| Cuentas locales | Contraseñas con hash bcrypt, una [longitud mínima](../security/hardening.html#sign-in-limits-and-passwords), y la contraseña de admin predeterminada pública debe cambiarse en el primer inicio de sesión |
| LDAP / Active Directory | El directorio comprueba la contraseña, y sus grupos se asignan a roles. Consulta [LDAP](../authentication/ldap.html) |
| OpenID Connect, Entra ID | Inicio de sesión único a través de tu proveedor de identidad, que además aporta su propia autenticación multifactor. Consulta [Autenticación](../authentication/) |

* Los inicios de sesión fallidos [bloquean la cuenta](../security/hardening.html#sign-in-limits-and-passwords), y el inicio de sesión tiene límite de peticiones.
* Un inicio de sesión devuelve un token de acceso firmado válido 30 minutos y un token de renovación válido 24 horas.
* Los tokens pueden terminarse antes de caducar: cerrar sesión, cambiar la contraseña, bloquear al usuario o revocar un token de API los termina
  en todos los nodos a la vez, consulta [Tokens](../security/secrets.html#tokens).
* AnsibleForms no tiene autenticación multifactor propia: usa el inicio de sesión único donde se exija.

---

## Permisos

Lo que puede hacer un usuario viene de los roles de sus grupos, y el servidor lo comprueba en cada petición:

* Los roles se definen en [config.yaml](../config/roles.html): qué formularios ve un usuario y qué opciones tiene,
  como el diseñador, las páginas de ajustes o los trabajos de otros usuarios.
* El servidor comprueba cada lanzamiento contra las reglas del formulario (sus campos, sus valores y el acceso del usuario),
  incluidos los lanzamientos por la API REST, consulta [Validación del lanzamiento](../launch-validation/).
* El rol admin ejecuta cualquier playbook por diseño. Los demás roles solo obtienen lo concedido: un usuario con varios roles
  tiene una opción solo si ninguno de esos roles la deniega, así que basta un rol restrictivo para retirarla.

---

## Secretos guardados

Las contraseñas, los tokens y las claves se cifran antes de escribirse en la base de datos:

* Todo secreto guardado (credenciales, la contraseña de enlace LDAP, los tokens de runner, los secretos de cliente del inicio de sesión
  único, las direcciones de webhook y las claves de API) se cifra con AES-256 y un vector de inicialización aleatorio por valor, con el
  [`ENCRYPTION_SECRET`](../security/secrets.html#the-two-master-secrets) que defines tú.
* Ninguna llamada a la API ni página de ajustes muestra un secreto guardado, y las copias de seguridad omiten los secretos maestros.
* Los secretos pueden quedarse en tu almacén: [HashiCorp Vault y CyberArk](../secret-stores/) se leen cuando un trabajo los necesita.
* Los secretos de un trabajo llegan al entorno de ejecución sellados con AES-256-GCM, con una clave derivada de su token.
* Las extravars con nombre de secreto se enmascaran en la vista del trabajo, y los campos de contraseña siempre, consulta [Datos de los trabajos](../security/hardening.html#job-data).

El resto de la base de datos (los trabajos, sus extravars y su salida) se guarda tal cual: protégelo con el cifrado en reposo y el
control de acceso de la propia base de datos, consulta [La base de datos](../security/hardening.html#the-database).

---

## Registro de auditoría

Se registra todo cambio, y todo intento denegado:

* Cada creación, cambio y borrado, por la interfaz o por la API, se escribe en el registro de auditoría con el usuario, su
  dirección, la acción, el objeto y el resultado. También se registran las denegaciones y los inicios de sesión, incluidos los fallidos.
* Los valores que parecen secretos se ocultan antes de escribirse.
* El registro se conserva 365 días por defecto, y puede copiarse a syslog por UDP, TCP o TLS.

---

## En el navegador

La interfaz está protegida contra código inyectado en una página:

* Una [Content-Security-Policy](../security/hardening.html#the-content-security-policy) solo permite los scripts y marcos de la propia aplicación.
* Toda respuesta lleva cabeceras de protección: nosniff, protección de marcos y HSTS sobre HTTPS.
* El HTML de los formularios, los textos de ayuda y las respuestas del chat se sanea, y la salida de los trabajos se escapa.

---

## En el servidor

El código que trata la entrada del usuario evita las inyecciones clásicas:

* Las consultas a la base de datos pasan sus valores como parámetros, nunca como texto pegado a la consulta.
* Los comandos, git incluido, se ejecutan desde una lista de argumentos, nunca un shell, así que los caracteres del shell no hacen nada.
* Las expresiones de servidor pasan un [sanitizador de expresiones](../security/hardening.html#expressions-and-outbound-calls), y sus llamadas REST un filtro de hosts.
* El [servidor MCP](../mcp/), el [asistente de chat](../chat/) y el endpoint de métricas están desactivados hasta que los activas.

---

## Conexiones

El tráfico desde y hacia AnsibleForms puede cifrarse de extremo a extremo:

* La aplicación sirve [HTTPS](../security/https.html) ella misma, o se sitúa tras tu proxy inverso.
* Un entorno de ejecución habla con la aplicación por un WebSocket, `wss://` con una dirección HTTPS, y la aplicación
  fija el certificado de uno entrante, consulta [Modos de RTE](../rte/modes.html).
* LDAP, el inicio de sesión único, los runners, git, los almacenes de secretos y las llamadas REST de las expresiones comprueban el
  certificado del servidor al que llegan, salvo que un administrador desactive la comprobación para un servidor con certificado autofirmado.

### Conexiones salientes

AnsibleForms solo se conecta a lo que configura un administrador:

| Conexión | Cuándo |
|---|---|
| LDAP, OpenID Connect, Entra ID (inicio de sesión de Microsoft y Graph) | Cuando se configura ese método de inicio de sesión |
| AWX / AAP / Ascender, Semaphore, Rundeck, Jenkins | Cuando un formulario se ejecuta en ese runner |
| Servidores git | Cuando se configura un repositorio |
| Servidor de correo, Slack, Teams, Telegram, webhooks | Cuando se configura un canal de notificación |
| HashiCorp Vault, CyberArk | Cuando se configura un almacén de secretos |
| Un proveedor de modelos (Anthropic, OpenAI y otros) | Solo con el [asistente de chat](../chat/) activado, que está desactivado por defecto |
| Hosts y APIs nombrados en los formularios | Cuando las expresiones de un formulario o un playbook los llaman |
| Servidores syslog | Cuando se configura el reenvío de la auditoría o de los logs |

---

## Los contenedores

Las imágenes se construyen para ejecutarse con el menor privilegio posible:

* La aplicación y el entorno de ejecución se ejecutan como el usuario sin privilegios `node`, no como root.
* Se basan en imágenes Debian slim fijadas por digest, consulta [Desarrollo seguro](development.html#code-analysis-and-dependencies).
* La aplicación escucha en un solo puerto, el 8000.

Para los pasos que protegen una instancia nueva, sigue [Bastionado](../security/hardening.html).
