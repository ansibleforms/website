---
layout: default
title: Formularios y trabajos
parent: Recorrido por la interfaz
nav_order: 1
redirect_from:
  - /gui/login.html
  - /gui/the-dashboard.html
  - /gui/a-form.html
  - /gui/form-json-preview.html
  - /gui/running-job.html
  - /gui/job-output.html
  - /gui/job-logs.html
  - /gui/multi-step.html
  - /gui/schedules.html
translated_from: 951f0d014ee94f1c1c52883277a003d7eb67a6ec
---

# Formularios y trabajos
{: .no_toc }

Iniciar sesión, el panel principal, rellenar un formulario y seguir sus trabajos
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Inicio de sesión

La página de autenticación de usuarios, compatible con autenticación local, LDAP, Entra ID y OIDC.

![Inicio de sesión](../assets/screenshots/login.jpg)

---

## El panel principal

El panel principal muestra todos los formularios disponibles, organizados por categoría.

![Panel principal](../assets/screenshots/dashboard.jpg)

---

## Un formulario

Un ejemplo de formulario con fuentes de datos externas y campos dinámicos.

![Ejemplo de formulario](../assets/screenshots/form.jpg)

---

## Vista previa JSON del formulario

Previsualiza el payload JSON y las variables extra que se pasan a Ansible antes de ejecutar el trabajo.

![Vista previa JSON del formulario](../assets/screenshots/form-json.jpg)

---

## Trabajo en ejecución

Ejecución en tiempo real de un playbook de Ansible, con la salida en directo.

![Trabajo en ejecución](../assets/screenshots/run.jpg)

---

## Salida del trabajo

La salida completa de un playbook de Ansible ya ejecutado.

![Salida del trabajo](../assets/screenshots/job-output.jpg)

---

## Registro de trabajos

Todos los trabajos con su estado y sus horas, filtrados por estado desde el menú de la izquierda.

![Registro de trabajos](../assets/screenshots/job-log.jpg)

---

## Varios pasos

Un trabajo de varios pasos, con la salida de cada paso bajo el trabajo principal. Los formularios de varios pasos están obsoletos desde la 7: un
[workflow](../workflows/) encadena playbooks, plantillas y aprobaciones en su lugar.

![Formulario de varios pasos](../assets/screenshots/multistep.jpg)

---

## Programaciones

Programa formularios para que se ejecuten a horas concretas o a intervalos. Los [ejemplos de cron](../faq.html#which-cron-expressions-can-i-use) listan
expresiones habituales y explican en qué zona horaria se ejecuta una programación.

![Programaciones](../assets/screenshots/schedules.jpg)
