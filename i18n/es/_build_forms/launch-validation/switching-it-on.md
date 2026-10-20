---
layout: default
title: Activarlo
parent: Validación del lanzamiento
nav_order: 1
translated_from: 2e5de5654a03389c7c8a7c05179e9dd79456b50b
---

# Activarlo
{: .no_toc }

Para toda la instancia o para un formulario
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

La validación del lanzamiento tiene dos ajustes. **Se aplica el más estricto de los dos.**

---

## Para toda la instancia: `LAUNCH_VALIDATION`

La variable de entorno [`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) se aplica a todos los formularios:

- `off` - sin comprobación en el servidor: el trabajo se ejecuta con las extravars que envió el navegador o quien llama.
- `log` - se comprueba cada lanzamiento; lo que se rechazaría se escribe en el log como
  advertencia, y el lanzamiento se ejecuta igual que antes.
- `enforce` (predeterminado) - un lanzamiento no válido se rechaza, y uno válido se ejecuta con las extravars que
  construye el servidor.

Un valor vacío o desconocido también significa `enforce`. Los cambios surten efecto sin reiniciar.

{: .warning }
> **Actualizar cambia el comportamiento.** Una instancia que no define `LAUNCH_VALIDATION` impone la validación en
> todos los lanzamientos tras la actualización. Los scripts que llaman a `POST /api/v2/job` sin `rawFormData`,
> o con valores que incumplen las reglas de un formulario, se rechazan con un `422`. Define
> `LAUNCH_VALIDATION=log` antes de actualizar para ver qué se rechazaría, u `off` para mantener el
> comportamiento anterior (consulta [Despliegue](rolling-it-out.html)).

---

## Para un formulario: `launchValidation`

Un formulario puede definir su propio nivel:

```yaml
- name: Create VM
  type: ansible
  roles:
    - default
  playbook: vm.yml
  launchValidation: enforce   # off | log | enforce
  fields:
    - name: vm_name
      type: text
      required: true
```

Usa este ajuste en una instancia que funciona con `off` o `log`, para un formulario que sabes que se va a
lanzar por REST: ese formulario se impone, mientras que el resto de la instancia no. También se puede definir en el diseñador, en los
ajustes del formulario.

**Un formulario puede ser más estricto que la instancia, nunca más permisivo.** Con `LAUNCH_VALIDATION`
en `enforce`, el `launchValidation: off` de un formulario no tiene efecto: un formulario no puede anular
la decisión de un operador.

Los formularios con asistente también lo usan: el lanzamiento de un asistente se comprueba paso a paso, cada paso contra su propio
subformulario (consulta [Formularios con asistente](rolling-it-out.html#wizard-forms)).
