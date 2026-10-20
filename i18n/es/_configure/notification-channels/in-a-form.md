---
layout: default
title: Usar canales en un formulario
parent: Canales de notificación
nav_order: 5
translated_from: ab807b79469429faf3c3838f268af1ba6c29805a
---

# Usar canales en un formulario
{: .no_toc }

Cómo nombrar canales en las notificaciones y aprobaciones
{: .fs-6 .fw-300 }

Los formularios nombran los canales por su nombre, en `notifications` para el estado y los eventos del trabajo, y en `approval`:

```yaml
notifications:
  recipients:
    - ops@example.com
  channels:
    - ops-slack
    - ops-teams
  onStatus:
    - failed

approval:
  title: Remove host $(vm.name) ?
  roles:
    - approvers
  channels:
    - approvers-teams
```

- Los canales de chat y de webhook reciben un mensaje breve (el formulario, el trabajo, qué ha pasado) con un enlace al trabajo; en una
  aprobación, la página del trabajo es donde se aprueba o se rechaza.
- Un canal de **correo** de la lista envía el correo habitual a `recipients` (las direcciones de `notifications` de una aprobación) a través
  de ese servidor en lugar del predeterminado.
- Un nombre que no existe, o un canal de chat o de webhook desactivado, se omite y se indica en el log.
- Un canal de **correo** desactivado no se omite: el correo sale por el canal de correo predeterminado, y el
  log lo indica.
