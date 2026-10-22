---
layout: default
title: Activar-la
parent: Validació del llançament
nav_order: 1
translated_from: 2e5de5654a03389c7c8a7c05179e9dd79456b50b
---

# Activar-la
{: .no_toc }

Per a tota la instància, o per a un formulari
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

La validació del llançament té dues opcions. **S'aplica la més estricta de les dues.**

---

## Per a tota la instància: `LAUNCH_VALIDATION`

La variable d'entorn [`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) s'aplica a tots els formularis:

- `off`: cap comprovació al servidor; la tasca s'executa amb les extravars que ha enviat el navegador o qui fa la crida.
- `log`: es comprova cada llançament; el que es rebutjaria s'escriu al registre com a
  avís, i el llançament s'executa igual que abans.
- `enforce` (per defecte): un llançament no vàlid es rebutja, i un de vàlid s'executa amb les extravars que
  construeix el servidor.

Un valor buit o desconegut també equival a `enforce`. Els canvis tenen efecte sense reiniciar.

{: .warning }
> **L'actualització canvia el comportament.** Una instància que no defineix `LAUNCH_VALIDATION` aplica la validació a
> tots els llançaments després de l'actualització. Els scripts que criden `POST /api/v2/job` sense `rawFormData`,
> o amb valors que incompleixen les regles d'un formulari, es rebutgen amb un `422`. Defineix
> `LAUNCH_VALIDATION=log` abans d'actualitzar per veure què es rebutjaria, o `off` per mantenir el
> comportament antic (vegeu [Desplegar-la](rolling-it-out.html)).

---

## Per a un formulari: `launchValidation`

Un formulari pot definir el seu propi nivell:

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

Fes servir aquesta opció en una instància que funciona amb `off` o `log`, per a un formulari que saps que es
llançarà per REST: aquest formulari queda en enforce, mentre que la resta de la instància no. També es pot definir al dissenyador, a la
configuració del formulari.

**Un formulari es pot fer més estricte que la instància, mai més permissiu.** Amb `LAUNCH_VALIDATION`
a `enforce`, el `launchValidation: off` d'un formulari no té cap efecte: un formulari no pot passar per sobre
de la decisió d'un operador.

Els formularis amb assistent també la fan servir: el llançament d'un assistent es comprova pas a pas, cada pas amb el seu propi
subformulari (vegeu [Formularis amb assistent](rolling-it-out.html#wizard-forms)).
