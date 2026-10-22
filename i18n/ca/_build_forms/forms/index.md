---
layout: default
title: Formularis
nav_order: 3
has_children: true
has_toc: false
permalink: /forms/
translated_from: 8cf41438dcd6f75b145856a890b8bbbcd674c9fc
---

# Formularis
{: .no_toc }

Defineix els formularis que omplen els teus usuaris
{: .fs-6 .fw-300 }

---

Per als autors de formularis: com s'escriuen els formularis en YAML, d'on es carreguen i les propietats de cada tipus de formulari.

Els formularis són el nucli d'AnsibleForms. Cada formulari és una interfície web que recull les dades de l'usuari i, amb aquestes dades, executa un
playbook d'Ansible, una plantilla d'AWX, AAP o Ascender, una plantilla de Semaphore, un job de Rundeck o de Jenkins, o un
[workflow](../workflows/).

Els formularis es defineixen en fitxers YAML a la carpeta de formularis. Cada fitxer YAML conté un sol formulari o una llista de formularis, i es poden fer servir subcarpetes per organitzar-los.

**VÍDEO**: [Crea el teu primer formulari](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

---

## Entendre l'estructura d'un formulari

Cada formulari d'AnsibleForms es configura amb un conjunt de propietats. **[Propietats comunes](common.html)** recull les propietats que s'apliquen a tots els tipus de formulari; les pàgines específiques de cada tipus descriuen les addicionals.

---

## Com es carreguen els formularis

AnsibleForms carrega els formularis des de les ubicacions següents:

1. **DES DELS REPOSITORIS**: tots els repositoris amb l'interruptor "Utilitzar per als formularis" activat (s'admeten diversos repositoris)
   - Els formularis de tots els repositoris activats es fusionen automàticament.
   - Primer es comprova si cada repositori té una subcarpeta `forms/`.
   - Si no hi ha cap subcarpeta `forms/`, es fa servir l'arrel del repositori.
   - Els formularis creats al dissenyador que encara no s'han enviat amb push es guarden en una carpeta de preparació
     ([`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH)) i es carreguen juntament amb els altres.

2. **DES DE LA CARPETA LOCAL**: la carpeta local `forms/`
   ([`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH)), quan cap repositori no té activat "Utilitzar per als formularis"

{: .warning }
> **Nota:** quan "Utilitzar per als formularis" està activat en diversos repositoris, se'n fusionen tots els formularis. Els noms dels formularis han de ser únics entre repositoris per evitar conflictes.

---

## On s'executa un formulari

El tipus d'un formulari decideix el tipus de [runner](../runners.html) on s'executa la seva tasca: un RTE per a `ansible`, un runner d'AWX per a `awx`,
`aap` i `ascender`, i un runner del seu mateix tipus per a `semaphore`, `rundeck` i `jenkins`.

- `runner: <name>` al formulari tria pel nom un runner d'aquest tipus; sense això, la tasca s'executa al runner per defecte del tipus.
- Un runner desactivat a **Connexions > Runners** fa fallar la tasca, tant si el formulari l'anomena com si és el per defecte. La tasca
  no recorre mai a un altre runner.
- Quan un dels rols de l'usuari inclou `runners` a `config.yaml`, la tasca només es pot executar en un runner que aquest rol inclogui, o es
  rebutja. Els rols sense la llista no la limiten, i un administrador no està mai limitat.

---

## En aquesta secció

Les pàgines següents descriuen en detall les propietats dels formularis:

| Pàgina | Què tracta |
|---|---|
| [Propietats comunes](common.html) | Propietats que s'apliquen a tots els tipus de formulari (`name`, `description`, `help`, `type`, `fields`) |
| [Formularis d'Ansible](ansible.html) | Propietats específiques de `type: ansible` |
| [Formularis d'AWX](awx.html) | Propietats específiques de `type: awx` |
| [Formularis de Semaphore](semaphore.html) | Propietats específiques de `type: semaphore`, que executa una plantilla de Semaphore |
| [Formularis de Rundeck](rundeck.html) | Propietats específiques de `type: rundeck`, que executa un job de Rundeck |
| [Formularis de Jenkins](jenkins.html) | Propietats específiques de `type: jenkins`, que fa un build d'un job de Jenkins |
| [Formularis multipas](multistep.html) | Propietats específiques de `type: multistep`, obsolet en favor de `workflow` |
| [Formularis de workflow](workflow.html) | Propietats específiques de `type: workflow`, que executa un [workflow](../workflows/) |
| [Assistent](wizard.html) | Repartir les dades d'un formulari en diverses pàgines (funciona sobre qualsevol tipus de formulari executable) |
| [Subformulari](subform.html) | Els subformularis només fan servir les propietats comunes |
| [Punts d'aprovació](approval.html) | Aturar una tasca fins que s'aprovi (`approval`) |
| [Notificacions](notifications.html) | Enviar correus i missatges a canals segons l'estat o els esdeveniments d'una tasca (`notifications`) |
| [Accions segons l'estat de la tasca](job-status-action.html) | Actuar sobre el formulari quan una tasca canvia d'estat (`onSubmit`, `onSuccess`, ...) |
