---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 6c0e2d282bc1dc386b7392e3af1f60fea593f12b
---

# config.yaml
{: .no_toc }

Categorías, roles y constantes para todos los formularios
{: .fs-6 .fw-300 }

---

Para administradores: el archivo config.yaml que contiene las categorías, los roles y las constantes compartidos por todos los formularios.

AnsibleForms usa un archivo config.yaml para configurar categorías, roles y constantes. Si no se proporciona ningún archivo, se genera uno con una configuración mínima. La configuración también se puede importar a la base de datos, con lo que deja de hacer falta un archivo config.yaml.

---

## Visión general

El archivo config.yaml contiene la configuración de las categorías, los roles y las constantes que usa AnsibleForms.

**VÍDEO**: [Crea tu primer formulario](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

El siguiente config.yaml mínimo sirve como punto de partida. Contiene solo la categoría obligatoria `Default` y los roles obligatorios `admin` y `default`.

```yaml
categories: # a list of categories to group forms
  - name: Default
    icon: bars
roles: # a list of roles
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
    options:
      allowJobRelaunch: true
constants: {} # free objects to re-use over all forms
```

---

## Prioridad de carga de la configuración

AnsibleForms carga el archivo config.yaml en el siguiente orden (gana la primera coincidencia):

1. **DESDE LA BASE DE DATOS** : la configuración importada a la base de datos, solo cuando `ENABLE_CONFIG_IN_DATABASE=1`, o cuando esa
   variable no está definida y el origen de configuración guardado en la base de datos es `database` (una copia vacía recurre al archivo)
2. **DESDE UN REPOSITORIO (use_for_config)** : el repositorio con el interruptor "usar para la configuración" activado (nuevo en la 6.1.0)
3. **DESDE UN REPOSITORIO (use_for_forms)** : el repositorio con el interruptor "usar para los formularios" activado (alternativa por compatibilidad con versiones anteriores)
4. **DESDE UN ARCHIVO LOCAL** : el archivo local `config.yaml` (variable de entorno CONFIG_PATH)

{: .warning }
> **Nota:** Activa "usar para la configuración" en un solo repositorio. Si varios lo tienen activado, se registra un aviso y se usa el primero.

---

## En esta sección

El archivo tiene tres atributos de nivel superior, y cada uno tiene su propia página:

| Página | Qué trata |
|---|---|
| [Categorías](categories.html) | Agrupa los formularios del panel en un árbol de categorías con iconos |
| [Roles](roles.html) | Asigna usuarios y grupos a roles, y define qué puede hacer cada rol |
| [Constantes](constants.html) | Objetos libres que todos los formularios pueden reutilizar |
