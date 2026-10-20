---
layout: default
title: Qué es AnsibleForms
nav_order: 1
translated_from: a331f74d2fa27a41cd4321b636ac9640550cac26
---

# Qué es AnsibleForms
{: .no_toc }

Formularios de autoservicio delante de Ansible y AWX, y cuándo los necesitas
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Qué hace

AnsibleForms pone un formulario web delante de un playbook, un workflow, o una plantilla o un job en AWX, AAP, Ascender, Semaphore, Rundeck
o Jenkins, para que la gente pueda ejecutar automatizaciones sin la línea de comandos.

Un formulario recoge los datos, los comprueba, les da forma de extravars y lanza el trabajo. Los datos de un formulario pueden venir de bases de datos,
APIs REST, archivos y otros campos, y cada lanzamiento queda registrado en el historial de trabajos con su salida.

---

## Usos habituales

Los equipos usan AnsibleForms para poner la automatización rutinaria en manos de quienes la solicitan:

* **Solicitudes de autoservicio** : una máquina virtual, un volumen de almacenamiento, un recurso compartido o una cuenta de usuario, rellenados por quien los solicita
* **Operaciones protegidas** : acciones con puntos de aprobación, para que una segunda persona dé el visto bueno antes de que se ejecute el trabajo
* **Elecciones basadas en datos** : desplegables rellenados desde una CMDB, una base de datos o una API REST, encadenados de un campo al siguiente
* **Trabajos recurrentes** : formularios ejecutados más tarde o según una programación cron, con los mismos datos validados cada vez
* **Automatización para herramientas y agentes** : la API REST, el servidor MCP y el asistente de chat lanzan los mismos formularios

---

## ¿AnsibleForms o encuestas de AWX?

AWX, AAP y Ascender tienen sus propias encuestas (surveys). Cuál encaja mejor depende de lo que necesiten las personas que lanzan los trabajos.

Una **encuesta** basta cuando:

* las preguntas son fijas: texto, números, contraseñas y opciones de una lista estática
* los usuarios ya trabajan en AWX, AAP o Ascender, y sus permisos les sirven
* no quieres ejecutar y mantener otra aplicación y otra base de datos

**AnsibleForms** ayuda cuando:

* las opciones vienen de otro sitio: una base de datos, una API REST, un archivo u otro campo (desplegables encadenados)
* los datos necesitan validación, estructura (listas, objetos anidados) o valores calculados antes de llegar al playbook
* los trabajos necesitan puntos de aprobación, programación o un workflow que encadene playbooks, plantillas y aprobaciones desde un solo formulario
* los usuarios no deberían ver AWX en absoluto, o también ejecutas playbooks sin AWX

AnsibleForms lanza plantillas de AWX, AAP y Ascender, así que ambos trabajan juntos: los formularios recogen los datos y les dan forma, y
AWX sigue ejecutando los trabajos.

---

## Siguientes pasos

El resto de esta sección explica las piezas antes de instalar:

| Página | Qué trata |
|---|---|
| [Cómo funciona](how-it-works.html) | La arquitectura, los pasos de un lanzamiento y dónde se guardan los datos |
| [Recorrido por la interfaz](gui/) | Capturas de todas las pantallas, desde el inicio de sesión hasta las páginas de administración |
| [Conceptos](concepts.html) | Los términos que se usan en esta documentación |
| [Requisitos previos](prerequisites.html) | Lo que necesitas antes de instalar |
