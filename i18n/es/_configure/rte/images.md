---
layout: default
title: Imágenes
parent: RTE
nav_order: 1
translated_from: cb917c5cb9cbca9d530398171265e91f1ba8e94b
---

# Imágenes del RTE
{: .no_toc }

Las tres imágenes publicadas del RTE, y un RTE propio con las colecciones y librerías que usan tus playbooks
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Las imágenes del RTE

El RTE se publica en tres capas, cada una construida sobre la anterior, con las mismas etiquetas que la aplicación (consulta [Etiquetas de imagen](../installation/#image-tags)):

| Imagen | Qué contiene | Cuándo usarla |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js y el servidor de AnsibleForms, git, ssh y sshpass. Sin python ni ansible, así que por sí sola no ejecuta ningún playbook | Para construir un RTE con tus propias versiones de python y ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base, más python 3.14, ansible-core y algunas librerías comunes (`jmespath`, `netaddr`, `requests`, `paramiko`). Sin colecciones | Para construir un RTE más pequeño solo con las colecciones y librerías que usan tus playbooks |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | La core, más el paquete `ansible` sobre el mismo ansible-core, y lo que tenía la imagen de AnsibleForms 6.5: las colecciones de NetApp, AWS y community, `pandas`, `pyvmomi`, `boto3`, el cliente de mariadb, ytt y algunas herramientas del sistema | **La predeterminada.** Úsala tal cual: los playbooks de la 6.5 encuentran lo que usaban |

Como la imagen de la aplicación, todas las capas se ejecutan como el usuario `node` (uid 1000), y los playbooks también se ejecutan como ese usuario.

---

## Construir tu propio RTE

Construye sobre `ansibleforms-rte-core` y añade las colecciones y librerías de python que usan tus playbooks. Este ejemplo de NetApp es uno de
los Dockerfiles de [examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

El entorno de python y la carpeta de colecciones pertenecen a `node`, así que estas instalaciones no necesitan root. Una capa que instala paquetes
del sistema cambia a `USER root` para ellos y vuelve a `USER node` al final. Para usar tu propio python y ansible, construye sobre
`ansibleforms-rte-base` (`Dockerfile.own-ansible` en la misma carpeta).

Mantén la imagen en la versión de la aplicación: `:7` sigue al `:7` de la aplicación. Las colecciones y los roles también se pueden montar en lugar de incluirlos, en
`/etc/ansible/collections` y `/etc/ansible/roles`. Así no hace falta reconstruir con cada cambio, pero lo que se ejecuta depende de ese volumen;
las librerías de python van siempre en la imagen. Incluirlo todo en la imagen es reproducible y arranca rápido, por eso es la opción para producción.

---

## El contrato

Lo que la aplicación y un RTE deben compartir es su contrato, un número del que informan ambos. Un RTE de una versión anterior sigue funcionando con una
aplicación más reciente mientras ambos hablen el mismo contrato; cuando una versión lo cambia, sus notas de versión indican que hay que actualizar los RTE. Cada modo
tiene el suyo:

| Modo | Contrato | Si no coinciden |
|---|---|---|
| Saliente, Entrante | 3, nuevo en la 7.3.0 | La aplicación cierra el socket del RTE con el código `4409` y escribe en el log *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Un RTE saliente escribe *the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Un trabajo enviado con otro contrato se rechaza |
| Base de datos (obsoleto) | 2, desde la 7.0.0 | El RTE rechaza los trabajos de la aplicación |

**Probar conexión** en el runner indica qué contrato habla el RTE y cuál necesita la aplicación (consulta
[Probar conexión](../runners/runner-page.html#test-connection)), y la fila **Runners** de la página **Estado** hace la misma comprobación.
