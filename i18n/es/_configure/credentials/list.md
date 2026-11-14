---
layout: default
title: La página de credenciales
parent: Credenciales
nav_order: 2
translated_from: e91c49850d61e193daa84ddbd0b841f65d8b3090
---

# La página de credenciales
{: .no_toc }

La lista de credenciales y el diálogo que añade una
{: .fs-6 .fw-300 }

La página de **Conexiones > Credenciales** lista todas las credenciales con su **Nombre**, **Tipo**, **Descripción** y **Usado por**, el
número de registros, formularios y workflows que la nombran (consulta [Credenciales en uso](../credentials.html#credentials-in-use)).

**Añadir credencial** abre un diálogo por pasos:

| Paso | Campos |
|---|---|
| Credencial | Nombre y descripción, ambos obligatorios. |
| Tipo | Uno de 18 tipos, ver más abajo. |
| Almacén | Dónde se guardan el usuario y la contraseña: **Base de datos** (cifrados en la base de datos de AnsibleForms) o **Almacén de secretos**. En **Almacén de secretos**, **Apuntar a una clave** lee un secreto que ya está en el almacén, y **Escribir en una clave** escribe en el almacén, al **Guardar**, el usuario y la contraseña escritos en el paso **Acceso**. Luego elige el almacén y rellena la **Referencia**; su ejemplo sigue al almacén: una ruta de HashiCorp Vault o una cuenta de CyberArk. No para CyberArk ni HashiCorp Vault, con los que inicia sesión un almacén de secretos. |
| Acceso | Con qué y dónde inicia sesión el tipo, ver más abajo. |

El paso **Tipo** lista los tipos por su nombre: AAP, API, Ascender, AWX, CyberArk, Base de datos, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH y Usuario y contraseña (consulta [Tipos de credencial](types.html)).

El paso **Acceso** contiene todos los campos del tipo, la dirección incluida; no hay un paso de conexión aparte. Desde la 7.6.0 algunos
tipos preguntan primero cómo inician sesión, y luego muestran solo lo que eso pide (consulta [Cómo inicia sesión una credencial](types.html#how-a-credential-signs-in)):

| Tipos | Campos del paso Acceso |
|---|---|
| Todos los tipos salvo CyberArk | La contraseña, o lo que la sustituye: la **Contraseña** de LDAP (su contraseña de vinculación), el **Secreto de cliente** de Entra ID y Open ID, el **Token** de HashiCorp Vault y del RTE, el **Token de API** de Semaphore, Rundeck y Jenkins, el **Token** o la **Contraseña** de AWX, AAP, Ascender y Git. Ninguna para una clave privada SSH, un relay SMTP o un certificado de Entra ID |
| Todos los tipos salvo HashiCorp Vault, RTE, Semaphore y Rundeck | El usuario: el AppID de CyberArk, el DN de vinculación de LDAP, el ID de cliente de Entra ID y Open ID. Ninguno con **Token** (AWX, AAP, Ascender, Git) o **Sin inicio de sesión** (SMTP) |
| SSH, Base de datos | **Servidor** y **Puerto**; para una base de datos también su **Motor** y la **Base de datos** |
| SSH | Desde la 7.6.0 **Iniciar sesión con**: **Contraseña**, o **Clave privada** con la **Clave privada** y su **Frase de contraseña** opcional |
| AWX, AAP, Ascender, Git | Desde la 7.6.0 **Iniciar sesión con**: **Token** (sin usuario) o **Contraseña** (un usuario y su contraseña) |
| Usuario y contraseña, API | Desde la 7.6.0 el interruptor **Añadir un host y un puerto**, tras la contraseña, muestra un **Servidor** y un **Puerto** opcionales |
| SMTP | **Servidor de correo** (obligatorio), **Puerto de correo** y **Usar TLS**; desde la 7.6.0 **Iniciar sesión con**: **Sin inicio de sesión** (un relay) o **Inicio de sesión** (un usuario y su contraseña) |
| LDAP | Los **Servidores** del directorio (obligatorio), su **Puerto** y **Habilitar TLS**; con TLS, **Ignorar certificados**, el **Paquete CA** y un **Certificado de cliente** |
| Microsoft Entra ID | **ID de inquilino** (obligatorio) y **URI de redirección**; desde la 7.6.0 **Iniciar sesión con**: **Secreto** (el **Secreto de cliente**) o **Certificado** (un **Certificado** y su clave privada, solo correo) |
| Open ID | **Emisor** (obligatorio) y **URI de redirección** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Servidor**, la dirección en la que inicia sesión, obligatorio, con **Omitir la verificación del certificado** y el **Paquete CA** |
| CyberArk | **Certificado de cliente** y **Clave de cliente** |

Con **Apuntar a una clave**, no se piden el usuario ni la contraseña: los da el almacén. El paso **Acceso** solo conserva los campos de dirección del tipo (SSH, base de datos, servidores de correo y de directorio, la dirección de un servidor, el host y el puerto opcionales de Usuario y contraseña y API desde la 7.6.0), y un acceso Git no tiene paso **Acceso**: se guarda desde el paso **Almacén**.

Con **Escribir en una clave** (desde 7.6.0), el paso **Acceso** pide el usuario y la contraseña, y solo ofrece las opciones de inicio de sesión con contraseña
(consulta [Cómo inicia sesión una credencial](types.html#how-a-credential-signs-in)), y **Guardar** los escribe en el almacén en la **Referencia**; AnsibleForms solo guarda el almacén y la referencia. Solo se ofrecen los almacenes que permiten escribir, y **Añadir almacén de secretos** crea uno con la escritura ya activada. Una clave que ya tiene un secreto solo se reemplaza si **Sobrescribir un secreto que ya esté allí** está marcado, ver [Escribir credenciales](../secret-stores/#writing-credentials).

Una fila abre la página propia de la credencial. Su menú ofrece **Editar**, **Probar conexión** (solo credenciales de base de datos) y **Eliminar**. La
contraseña se cambia en la página de la credencial, en su pestaña **Acceso**.
