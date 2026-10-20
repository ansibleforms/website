---
layout: default
title: Conceptos
nav_order: 4
translated_from: d62ee1e491a725a384186e3909ae1f9cee654bde
---

# Conceptos
{: .no_toc }

Los términos que se usan en esta documentación, cada uno enlazado a su página
{: .fs-6 .fw-300 }

---

## Glosario

Los términos que se usan en esta documentación:

| Término | Significado |
|---|---|
| **[Formulario](forms/)** | Una definición YAML que recoge datos y ejecuta un playbook, una plantilla o un workflow |
| **[Campo de formulario](formfields/)** | Una entrada de un formulario, como `text`, `enum` o `checkbox`; su valor se convierte en una extravar |
| **[Categoría](config/categories.html)** | Un grupo del árbol de formularios que se muestra en la página Formularios, definido en `config.yaml` |
| **[Rol](config/roles.html)** | Un conjunto de usuarios y grupos; un formulario lista los roles que pueden verlo y ejecutarlo, `default` para todos |
| **[Expresión](expressions/)** | JavaScript que calcula el valor de un campo, en el navegador (`runLocal: true`) o en el servidor |
| **[Extravars](formfields/)** | Las variables que se envían al playbook o a la plantilla, construidas a partir de los valores de los campos |
| **[Credencial](expressions/credentials.html)** | Un login guardado, cifrado con `ENCRYPTION_SECRET`: un usuario y una contraseña (y host, puerto, base de datos) o, desde la 7.3.0, la dirección y los secretos de un directorio LDAP, un proveedor de SSO, un runner o un HashiCorp Vault |
| **[Almacén de secretos](secret-stores/)** | Una conexión a HashiCorp Vault o CyberArk que proporciona el usuario y la contraseña de una credencial |
| **[Trabajo](gui/forms-and-jobs.html)** | Una ejecución de un formulario, con su estado, sus extravars y su salida, que se conserva en el historial de trabajos |
| **[Runner](runners.html)** | Dónde se ejecuta un trabajo, añadido en **Conexiones > Runners**: `rte` para playbooks, `awx` (AWX, o la variante `aap` o `ascender`), `semaphore`, `rundeck` o `jenkins` para plantillas y jobs. Un formulario elige uno con `runner:`, o se ejecuta en el runner `rte` (playbooks) o `awx` (plantillas) predeterminado |
| **[RTE](rte/)** | Un entorno de ejecución (runtime environment): el servidor de AnsibleForms arrancado con `AF_ROLE=rte` en su propio contenedor, junto a python y ansible, que ejecuta los playbooks de un runner de tipo `rte` |
| **[Punto de aprobación](forms/approval.html)** | Una pausa en un trabajo hasta que un usuario con un rol de aprobación lo aprueba o lo rechaza |
| **[Workflow](workflows/)** | Un grafo de playbooks, aprobaciones y otros workflows enlazados en caso de éxito, de fallo o siempre, con la sintaxis de AWX |
| **[Formulario de varios pasos](forms/multistep.html)** | Obsoleto desde la 7: un formulario que ejecuta varios playbooks o plantillas en secuencia; lo sustituye un workflow |
| **[Canal de notificación](notification-channels.html)** | Un servidor de correo, un webhook de Slack o Teams, un chat de Telegram o un webhook al que van las notificaciones y las solicitudes de aprobación |
| **[Diseñador](designer/)** | El editor del navegador para formularios, playbooks, inventories y workflows, que usa una sola persona a la vez |
| **[Subform](forms/subform.html)** | Un conjunto reutilizable de campos que describe las filas de un campo `list` o el objeto de un campo `yaml` |
| **[config.yaml](config/)** | El archivo con las categorías, los roles y las constantes; los formularios están en sus propios archivos |
| **[Semilla de configuración](seed/)** | Un archivo YAML (`CONFIG_SEED_PATH`) que declara los objetos de administración, como runners y credenciales |
| **[Carpeta persistente](customization/paths.html)** | La carpeta que contiene los archivos que AnsibleForms debe conservar entre reinicios y actualizaciones |
