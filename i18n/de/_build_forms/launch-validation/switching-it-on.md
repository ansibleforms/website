---
layout: default
title: Einschalten
parent: Start-Validierung
nav_order: 1
translated_from: 2e5de5654a03389c7c8a7c05179e9dd79456b50b
---

# Einschalten
{: .no_toc }

Für die ganze Instanz oder für ein Formular
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Die Start-Validierung hat zwei Einstellungen. **Es gilt die strengere der beiden.**

---

## Für die ganze Instanz: `LAUNCH_VALIDATION`

Die Umgebungsvariable [`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) gilt für jedes Formular:

- `off`: keine serverseitige Prüfung; der Job läuft mit den Extravars, die der Browser oder der Aufrufer gesendet hat.
- `log`: Jeder Start wird geprüft; was abgelehnt würde, wird als Warnung ins Protokoll
  geschrieben, und der Start läuft weiterhin wie bisher.
- `enforce` (Standard): Ein ungültiger Start wird abgelehnt, und ein gültiger läuft mit den Extravars, die der
  Server aufbaut.

Ein leerer oder unbekannter Wert bedeutet ebenfalls `enforce`. Änderungen wirken ohne Neustart.

{: .warning }
> **Ein Upgrade ändert das Verhalten.** Eine Instanz, die `LAUNCH_VALIDATION` nicht setzt, erzwingt
> nach dem Upgrade die Prüfung jedes Starts. Skripte, die `POST /api/v2/job` ohne `rawFormData` aufrufen
> oder mit Werten, die die Regeln eines Formulars verletzen, werden mit `422` abgelehnt. Setzen Sie
> `LAUNCH_VALIDATION=log` vor dem Upgrade, um zu sehen, was abgelehnt würde, oder `off`, um das
> alte Verhalten beizubehalten (siehe [Einführung](rolling-it-out.html)).

---

## Für ein Formular: `launchValidation`

Ein Formular kann seine eigene Stufe setzen:

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

Verwenden Sie diese Einstellung auf einer Instanz, die mit `off` oder `log` läuft, für ein Formular, von dem Sie wissen, dass es
über REST gestartet wird: Für dieses Formular wird die Prüfung erzwungen, für den Rest der Instanz nicht. Sie lässt sich auch im Designer setzen, in den
Formulareinstellungen.

**Ein Formular kann strenger als die Instanz sein, nie lockerer.** Steht `LAUNCH_VALIDATION`
auf `enforce`, hat `launchValidation: off` in einem Formular keine Wirkung: Ein Formular kann
die Entscheidung eines Betreibers nicht übergehen.

Wizard-Formulare nutzen sie ebenfalls: Der Start eines Wizards wird Schritt für Schritt geprüft, jeder Schritt gegen sein eigenes
Unterformular (siehe [Wizard-Formulare](rolling-it-out.html#wizard-forms)).
