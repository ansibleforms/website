---
layout: default
title: Rutas
parent: Variables de entorno
nav_order: 2
translated_from: 232fd91a41c511e9f46867101d74d2313dc7ee3c
---

# Rutas
{: .no_toc }

Dónde están la configuración, los formularios, los playbooks, los archivos subidos y las copias de seguridad
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cambia estas variables para guardar parte de los datos en otro volumen, por ejemplo las copias de seguridad y los archivos subidos en un almacenamiento mayor o más barato.

---

## Ejemplo

Copias de seguridad y archivos subidos en un volumen aparte, y el resto de los datos en la carpeta persistente habitual. En `docker-compose.yml`:

```yaml
    environment:
      - BACKUP_PATH=/data/backups
      - FORMS_BACKUP_PATH=/data/forms_backups
      - UPLOAD_PATH=/data/uploads
    volumes:
      - /srv/ansibleforms-data:/data
```

Una ruta nueva solo se aplica a los archivos nuevos: lo que ya está en la carpeta antigua no se mueve, así que cópialo tú.

---

## Variables

Todas las variables de este grupo, con su tipo, su valor predeterminado y su descripción:

{% include env_vars_table.html group="paths" %}
