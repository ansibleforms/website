---
layout: default
title: Subida de archivos
parent: Validación del lanzamiento
nav_order: 4
translated_from: 5756d90b62ddac51996f0bdb05befd6bf5589e0d
---

# Subida de archivos
{: .no_toc }

Cómo se validan los campos de archivo
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Un campo de archivo nunca se fía de lo que la petición de lanzamiento dice sobre un archivo. La validación del lanzamiento comprueba el propio archivo, en el
disco del servidor.

---

## Cómo llega una subida a un trabajo

Un archivo se sube antes de lanzar el formulario, en dos pasos:

1. El navegador sube el archivo con `POST /api/v2/job/upload`. El servidor lo guarda en `UPLOAD_PATH`.
2. La petición de lanzamiento describe esa subida en su parte `files`.

Después, la validación del lanzamiento contrasta la descripción con el disco:

* El archivo debe existir dentro de `UPLOAD_PATH`.
* Su ruta y su tamaño se leen del disco, nunca de la petición.

---

## Qué se acepta

Un campo de archivo solo obtiene un valor de una subida verificada. Todo lo demás se descarta:

* Se ignora una ruta que quien llama escriba en `rawFormData` o `extravars`.
* Un campo de archivo obligatorio sin una subida real se notifica como `missing`.

---

## Reglas de archivo

Las reglas de un campo de archivo se comprueban contra la subida real, con los tamaños en bytes:

```yaml
- name: firmware
  type: file
  required: true
  maxSize: 104857600        # 100 MB
  regex:
    expression: '\.bin$'
    description: Upload a .bin firmware image
```

`minSize` y `maxSize` comparan el tamaño real del archivo, y `regex` su nombre. Con independencia de cualquier formulario,
`UPLOAD_MAX_GB` limita el tamaño de una sola subida (10 GB por defecto).
