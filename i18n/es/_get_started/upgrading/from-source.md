---
layout: default
title: Desde el código fuente
parent: Actualizar
nav_order: 3
translated_from: f01384ded41bf8e1913196bb78e7ea1a6532989c
---

# Desde el código fuente
{: .no_toc }

Actualiza una instalación compilada desde el código fuente
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Una instalación compilada desde el código fuente se actualiza haciendo checkout de la nueva release, volviéndola a compilar y reiniciando la
aplicación. Tus ajustes, formularios, playbooks, certificados y logs se guardan en `server/persistent`, que ni Git ni la
compilación modifican.

---

## Antes de actualizar

Prepara la actualización para poder volver atrás si algo sale mal:

* **Haz una copia de seguridad** en **Configuración → Copias de seguridad**. La nueva release actualiza el esquema de la base de datos en su primer arranque.
* **Lee el [registro de cambios](../changelog)** de las releases entre tu versión y la nueva.
* **¿Pasas a una nueva versión mayor?** Sigue primero [Actualizar a la v7](../upgrade-7.html).
* **Comprueba la versión de Node.js** que requiere la nueva release, en el registro de cambios.

---

## 1. Obtén la nueva release

Descarga las etiquetas de release y haz checkout de la release que quieras. Las etiquetas de release llevan el número de versión, y `git tag` las
lista; la rama `main` puede contener cambios que todavía no se han publicado:

```bash
cd /srv/apps/ansibleforms
git fetch --tags
git checkout <version>
```

---

## 2. Vuelve a compilar

Vuelve a compilar con los mismos tres pasos que en la instalación. Primero vuelve a compilar el cliente:

```bash
cd client
npm ci
npm run build
```

Después actualiza las dependencias del servidor:

```bash
cd ../server
npm ci --omit=dev
```

Por último, vuelve a copiar el cliente compilado en la carpeta `views` del servidor:

```bash
rm -rf views
mkdir views
cp -r ../client/dist/. views/
```

Compara `.env.example`, en la raíz del repositorio, con tu `persistent/.env` para incorporar los ajustes que añada la release.

---

## 3. Reinicia

Reinicia la aplicación y su RTE para cargar el nuevo código. El esquema de la base de datos se actualiza en el primer arranque:

```bash
pm2 restart ansibleforms ansibleforms-rte
```

Si vienes de la 7.2, el RTE funcionaba en modo database, con los ajustes de la base de datos y `RTE_URL`, obsoleto en la 7.3.0 y eliminado en la 8.0.0.
Vuelve a arrancarlo en modo inbound, y declara su runner con una credencial de RTE en la semilla o en **Conexiones → Runners**, como muestra la
[instalación](../installation/from-source.html#run): `pm2 delete ansibleforms-rte`, y después su comando `pm2 start`.

Si ejecutas la aplicación sin PM2, detén `npm run start` y vuelve a arrancarlo.

---

## 4. Comprueba la actualización

Sigue el log de la aplicación mientras arranca:

```bash
pm2 logs ansibleforms
```

En AnsibleForms, **Ayuda → Acerca de** muestra la versión que se está ejecutando, y **Configuración → Estado** muestra el estado de la
base de datos, del esquema y de los demás sistemas de los que depende AnsibleForms.

---

## Volver atrás

Para volver a la release que ejecutabas antes, la versión que mostraba **Ayuda → Acerca de** antes de la actualización, haz checkout de su etiqueta con
`git checkout <version>`, y después vuelve a compilar y reinicia como en los pasos 2 y 3. Si esa release no arranca sobre la base de datos actualizada, restaura la copia de seguridad que hiciste en
**Configuración → Copias de seguridad**.
