---
layout: default
title: Imágenes
parent: RTE
nav_order: 1
translated_from: 793f1c4efa7fb085bdd4b1551161e3b57b52ff12
---

# Imágenes del RTE
{: .no_toc }

Las tres imágenes publicadas del RTE, y un RTE propio con las colecciones y librerías que usan tus playbooks
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Las imágenes del RTE

El RTE se publica en tres capas, cada una construida sobre la anterior, con las mismas etiquetas que el controlador (consulta [Etiquetas de imagen](../installation/#image-tags)):

| Imagen | Qué contiene | Cuándo usarla |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js y el servidor de AnsibleForms, git, ssh y sshpass. Sin python ni ansible, así que por sí sola no ejecuta ningún playbook | Para construir un RTE con tus propias versiones de python y ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | La base, más python 3.14, ansible-core y algunas librerías comunes (`jmespath`, `netaddr`, `requests`, `paramiko`). Sin colecciones | Para construir un RTE más pequeño solo con las colecciones y librerías que usan tus playbooks |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | La core, más el paquete `ansible` sobre el mismo ansible-core, y lo que tenía la imagen de AnsibleForms 6.5: las colecciones de NetApp, AWS y community, `pandas`, `pyvmomi`, `boto3`, el cliente de mariadb, ytt y algunas herramientas del sistema | **La predeterminada.** Úsala tal cual: los playbooks de la 6.5 encuentran lo que usaban |

Como la imagen del controlador, todas las capas se ejecutan como el usuario `node` (uid 1000), y los playbooks también se ejecutan como ese usuario.

Desde la 7.6.0 cada capa se publica para `linux/amd64` y `linux/arm64` con la misma etiqueta. Un RTE propio sale para la arquitectura
de la máquina que lo construye: para hosts arm64, constrúyelo en uno o con `docker buildx build --platform linux/arm64`.

---

## Construir tu propio RTE

Construye sobre `ansibleforms-rte-core` y añade las colecciones y librerías de python que usan tus playbooks. Este ejemplo de NetApp es uno de
los Dockerfiles de [ansibleforms/rte](https://github.com/ansibleforms/rte/tree/main/examples):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

El entorno de python y la carpeta de colecciones pertenecen a `node`, así que estas instalaciones no necesitan root. Una capa que instala paquetes
del sistema cambia a `USER root` para ellos y vuelve a `USER node` al final. Para usar tu propio python y ansible, construye sobre
`ansibleforms-rte-base` (`Dockerfile.own-ansible` en la misma carpeta).

Mantén la imagen en la versión del controlador: `:7` sigue al `:7` del controlador. Las colecciones y los roles también se pueden montar en lugar de incluirlos, en
`/etc/ansible/collections` y `/etc/ansible/roles`. Así no hace falta reconstruir con cada cambio, pero lo que se ejecuta depende de ese volumen;
las librerías de python van siempre en la imagen. Incluirlo todo en la imagen es reproducible y arranca rápido, por eso es la opción para producción.

---

## Constrúyelo en el Diseñador

Desde 7.9.0 describes un entorno de ejecución en el Diseñador; un [builder](builder.html) construye su imagen, la sube y la firma.

1. Da a un repositorio el uso **Entornos de ejecución** (Configuración > Repositorios); guarda las definiciones.
2. En el Diseñador, abre **Entornos de ejecución** y haz clic en **Nuevo**: rellénalo en la pestaña **Visual**, o escríbelo en la pestaña **YAML**.
3. **Guardar**, luego **Push** para hacer commit en el repositorio, y **Compilar**: la compilación es un trabajo en la página **Trabajos**, con su log en vivo.

Cada entorno de ejecución es una carpeta propia en el repositorio, con su nombre, que solo guarda su definición:

```text
rte-netapp/
  rte.yaml
```

El Dockerfile, `ansible.cfg` y los archivos de requisitos se escriben de nuevo en cada compilación, a partir de la definición y de la versión
de la app, así que nunca quedan desfasados en el repositorio. La pestaña **Archivos** los muestra tal como los recibe el builder.

```yaml
runner_rte:
  - name: rte-netapp
    description: NetApp playbooks of the storage team
    arch: all
    python: "3.15"
    ansible_core: "2.22"
    ansible_collections:
      - name: netapp.ontap
        version: 23.1.0
    python_packages:
      - netapp-lib
    os_packages:
      - sshpass
    registry:
      credential: ghcr
      path: af/rte-netapp
      tag: app
    sbom: true
    sign:
      credential: cosign-key
```

Todas las claves salvo el nombre se pueden omitir; la barra de herramientas de la pestaña **YAML** ajusta cada parte en un diálogo.

| Clave | Qué es |
|---|---|
| `name` | El nombre del entorno de ejecución, el de su carpeta y el de su imagen: letras minúsculas, dígitos, puntos, guiones y guiones bajos |
| `arch` | `all`, una imagen para amd64 y arm64 como las publicadas, o solo `amd64` o `arm64`; `all` si se omite. Una arquitectura distinta de la del host del builder necesita [QEMU en ese host](builder.html#amd64-and-arm64) |
| `python` | El python que ejecuta la imagen, de 3.11 a 3.15; 3.15 si se omite |
| `ansible_core` | Una release de ansible-core (`2.22`) o una versión (`2.22.0`) que funcione con ese python; la más reciente que lo haga si se omite |
| `ansible_collections` | Las colecciones, cada una con su `name` (namespace.name) y una `version` opcional; la última si se omite. Lo que cada colección necesita, su `requirements.txt` y `bindep.txt` (o su `meta/execution-environment.yml`), se instala con ella, como hace ansible-builder |
| `python_packages` | Paquetes de python, como líneas de un `requirements.txt` |
| `os_packages` | Paquetes de Debian 13 (trixie) |
| `registry` | `credential`: una credencial de **Registro de contenedores**, que guarda la dirección del registro y su login; `path`: la ruta de la imagen en él, su nombre si se omite; `tag`: `app`, la versión de la app (`7.9.0`), para que una recompilación siga cada actualización, o una etiqueta propia |
| `sbom` | `true` adjunta a la imagen una lista de materiales de software (SBOM) |
| `sign` | `credential`: una credencial de **Clave de firma**, con la que el builder firma la imagen con cosign 3; compruébala con `cosign verify --key <clave pública>` de cosign 3 (cosign 2 no lee sus firmas) |

Cada entorno de ejecución se construye a partir de `ansibleforms-rte-base` de la versión de la app, así que uno con la etiqueta `app` cuya imagen se
construyó para una versión anterior aparece como tal en la página **Entornos de ejecución**, con **Recompilarlos**.

---

## El contrato

Lo que el controlador y un RTE deben compartir es su contrato, un número del que informan ambos. Un RTE de una versión anterior sigue funcionando con un
controlador más reciente mientras ambos hablen el mismo contrato; cuando una versión lo cambia, sus notas de versión indican que hay que actualizar los RTE. Cada modo
tiene el suyo:

| Modo | Contrato | Si no coinciden |
|---|---|---|
| Saliente, Entrante | 3, nuevo en la 7.3.0 | El controlador cierra el socket del RTE con el código `4409` y escribe en el log *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Un RTE saliente escribe *the controller speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Un trabajo enviado con otro contrato se rechaza |
| Base de datos (obsoleto) | 2, desde la 7.0.0 | El RTE rechaza los trabajos del controlador |

**Probar conexión** en el runner indica qué contrato habla el RTE y cuál necesita el controlador (consulta
[Probar conexión](../runners/runner-page.html#test-connection)), y la fila **Runners** de la página **Estado** hace la misma comprobación.
