---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 8919bfbc931f85d08a064e868a9a6bb42461525a
---

# config.yaml
{: .no_toc }

Categorías, roles y constantes para todos los formularios
{: .fs-6 .fw-300 }

---

Para administradores: el archivo config.yaml que contiene las categorías, los roles y las constantes compartidos por todos los formularios.

AnsibleForms usa un archivo config.yaml para configurar categorías, roles y constantes. Si no se proporciona ningún archivo, se genera uno con una configuración mínima. La configuración también se puede importar a la base de datos, con lo que deja de hacer falta un archivo config.yaml, y cada una de las tres partes puede guardarse en un repositorio git.

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

Desde la 7.8.0 las categorías, los roles y las constantes se leen cada uno por separado, del primer origen de la lista que lo contenga.

1. **DESDE UN REPOSITORIO** : el repositorio con el tipo de uso **Categorías**, **Roles** o **Constantes**, del archivo que da
   `controller_categories:`, `controller_roles:` o `controller_constants:`, con cualquier nombre y en cualquier carpeta (consulta
   [Configuración en git](../repositories/config-as-code.html#roles-categories-and-constants))
2. **DESDE EL config.yaml DEL REPOSITORIO** : la clave simple en el `config.yaml` de ese repositorio, obsoleta desde la 7.8.0 y que ya
   no se lee en la 8.0; el log del servidor, la salida del pull y la página del repositorio lo indican
3. **DESDE LA BASE DE DATOS** : la configuración importada a la base de datos, solo cuando `ENABLE_CONFIG_IN_DATABASE=1`, o cuando esa
   variable no está definida y el origen de configuración guardado en la base de datos es `database` (una copia vacía recurre al archivo)
4. **DESDE UN ARCHIVO LOCAL** : el archivo local `config.yaml` (variable de entorno CONFIG_PATH)

{: .warning }
> **Nota:** El interruptor **¿Usar para configuración?** desaparece en la 7.8.0. Una actualización da **Roles**, **Categorías** y
> **Constantes** al repositorio que lo tenía, y `use_for_config` en el config seed o la API es un alias obsoleto de los tres.

---

## En esta sección

El archivo tiene tres atributos de nivel superior, y cada uno tiene su propia página:

| Página | Qué trata |
|---|---|
| [Categorías](categories.html) | Agrupa los formularios del panel en un árbol de categorías con iconos |
| [Roles](roles.html) | Asigna usuarios y grupos a roles, y define qué puede hacer cada rol |
| [Constantes](constants.html) | Objetos libres que todos los formularios pueden reutilizar |
