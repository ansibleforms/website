---
layout: default
title: Autenticación
parent: Repositorios git
nav_order: 2
translated_from: 9e2bb180b35951e97851c21f388db0d7d54d4c73
---

# Autenticación
{: .no_toc }

HTTPS con un token, SSH con la clave generada y comandos de git personalizados
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Autenticación

Cómo se autentica AnsibleForms depende de la forma de la **Uri**.

### HTTPS con un token

Para un remoto HTTPS privado, elige una **Credencial** cuyo usuario sea el usuario de git y cuya contraseña sea un token de acceso personal
(o la contraseña).

Desde 7.3.0 git inicia sesión mediante `GIT_ASKPASS`: el usuario y el token van a cada comando de git que habla con el servidor, nunca a
la URL, así que no se guardan en el `.git/config` del clon y un token cambiado se usa en el siguiente pull o push. El token necesita
acceso de lectura para hacer pull, y de escritura para hacer push. Un remoto público no necesita credencial.

Hasta 7.2.0 ambos se insertaban en la URL, como `https://<user>:<token>@git.example.com/team/forms.git`. Un clon hecho entonces conserva
esa URL hasta su siguiente pull o push, que vuelve a poner su remoto en la propia **Uri** del repositorio.

### SSH con la clave generada

Para un remoto SSH, AnsibleForms se autentica con su propio par de claves, que genera en el primer inicio.

1. Abre **Configuración > Conexiones > SSH**, en su pestaña **Clave**, y copia la **Clave pública**.
2. Añádela en el servidor git, como deploy key del repositorio (con acceso de escritura si haces push), o a un usuario con acceso.
3. Añade el repositorio con una **Uri** SSH, por ejemplo `git@git.example.com:team/forms.git`, y no elijas ninguna credencial.

El par de claves está en `.ssh/id_rsa` bajo [`HOME_PATH`](../customization/paths.html#env_HOME_PATH), así que mantén esa carpeta en
almacenamiento persistente, o la clave cambiará cuando se recree el contenedor.

En un clone con una Uri `user@host:path`, AnsibleForms ejecuta primero `ssh-keyscan` sobre el host y añade su clave a los
hosts conocidos. Para otros remotos, añade el host en la pestaña **Hosts conocidos** de **Configuración > Conexiones > SSH** antes del
primer clone.

### Comandos de git personalizados

Los comandos de clone, pull y push se pueden sustituir, por ejemplo para añadir opciones de git, con tres ajustes.

| Ajuste | Predeterminado | Qué añade AnsibleForms |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>`, `--verbose`, la Uri y el nombre |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |

Desde 7.3.0 estos comandos se ejecutan sin shell: las comillas funcionan, pero un operador de shell como `;`, `|`, `&&` o `>` se rechaza.
