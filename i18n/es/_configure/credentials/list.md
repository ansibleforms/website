---
layout: default
title: La página de credenciales
parent: Credenciales
nav_order: 2
translated_from: 986d768c15d0b91bdc3760026bd904d3f89ff3e0
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
| Acceso | Con qué y dónde inicia sesión el tipo, ver más abajo. |
| Almacén | Dónde se guardan el usuario y la contraseña: **Base de datos** (cifrados en la base de datos de AnsibleForms) o **Almacén de secretos**, con el almacén y la **Referencia** dentro de él. No para CyberArk ni HashiCorp Vault, con los que inicia sesión un almacén de secretos. |

El paso **Tipo** lista los tipos por su nombre: AAP, API, Ascender, AWX, CyberArk, Base de datos, Git, HashiCorp Vault, Jenkins, LDAP,
Microsoft Entra ID, Open ID, RTE, Rundeck, Semaphore, SMTP, SSH y Usuario y contraseña (consulta [Tipos de credencial](types.html)).

El paso **Acceso** contiene todos los campos del tipo, la dirección incluida; no hay un paso de conexión aparte:

| Tipos | Campos del paso Acceso |
|---|---|
| Todos los tipos salvo CyberArk | La contraseña, o lo que la sustituye: la contraseña de vinculación de LDAP, el secreto de cliente de Entra ID y Open ID, el token de HashiCorp Vault, el token del RTE, el token de API de Semaphore, Rundeck y Jenkins, un token o una contraseña para AWX, AAP y Ascender |
| Todos los tipos salvo HashiCorp Vault, RTE, Semaphore y Rundeck | El usuario: el AppID de CyberArk, el DN de vinculación de LDAP, el ID de cliente de Entra ID y Open ID, opcional para AWX, AAP y Ascender |
| SSH, Base de datos | **Servidor** y **Puerto**; para una base de datos también el **Tipo de base de datos** y la **Base de datos** |
| SMTP | **Servidor de correo** (obligatorio), su **Puerto** y **Usar TLS** |
| LDAP | Los **Servidores** del directorio (obligatorio), su **Puerto** y **Habilitar TLS**; con TLS, **Ignorar certificados**, el **Paquete CA** y un **Certificado de cliente** |
| Microsoft Entra ID | **ID de inquilino** (obligatorio) y **URI de redirección** |
| Open ID | **Emisor** (obligatorio) y **URI de redirección** |
| HashiCorp Vault, CyberArk, RTE, AWX, AAP, Ascender, Semaphore, Rundeck, Jenkins | **Servidor**, la dirección en la que inicia sesión, obligatorio, con **Omitir la verificación del certificado** y el **Paquete CA** |
| CyberArk | **Certificado de cliente** y **Clave de cliente** |

Una fila abre la página propia de la credencial. Su menú ofrece **Editar**, **Probar conexión** (solo credenciales de base de datos) y **Eliminar**. La
contraseña se cambia en la página de la credencial, en su pestaña **Acceso**.
