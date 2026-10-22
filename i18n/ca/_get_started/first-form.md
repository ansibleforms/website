---
layout: default
title: El teu primer formulari
nav_order: 2
translated_from: 26f445060b68070d02251e1c756c6253e5cf85fb
---

# El teu primer formulari
{: .no_toc }

Escriu un playbook, crea-hi un formulari al Dissenyador, llança'l i troba la tasca
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Aquest tutorial parteix d'una instal·lació nova, consulta [Instal·lació](installation/). Dura uns quinze minuts.

---

## 1. Inicia sessió

Obre AnsibleForms en un navegador i inicia sessió com a administrador.

El compte predeterminat és `admin` / `AnsibleForms!123` (o els teus valors d'[`ADMIN_*`](customization/server.html#env_ADMIN_USERNAME)); s'obre la pàgina **Formularis**:

![La pàgina Formularis, amb formularis d'exemple](assets/screenshots/dashboard.jpg)

---

## 2. Escriu el playbook

Un formulari `ansible` executa un playbook de la carpeta de playbooks, així que primer va el playbook. Desa això com a `hello.yaml`:

{% raw %}
```yaml
- name: Hello world
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Show the values from the form
      ansible.builtin.debug:
        msg: "Hello {{ your_name }}: a {{ vm_size }} machine in {{ target_env }} (dry run: {{ dry_run }})"
```
{% endraw %}

El playbook llegeix quatre variables. El formulari que crearàs a continuació les envia com a extravars, una per camp.

Posa el fitxer a la carpeta `playbooks` de la carpeta persistent
([`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH)); crea la carpeta si encara no existeix:

<div class="af-tabs" data-tab-group="install">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="compose" aria-selected="false">Docker Compose</button>
<button type="button" role="tab" class="af-tab" data-tab="kubernetes" aria-selected="false">Kubernetes</button>
<button type="button" role="tab" class="af-tab" data-tab="source" aria-selected="false">Des del codi font</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

La carpeta que vas muntar a `/app/dist/persistent`, `/srv/apps/ansibleforms/persistent` a l'exemple d'instal·lació:

```bash
mkdir -p /srv/apps/ansibleforms/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/persistent/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="compose" markdown="1" hidden>

La carpeta `data/playbooks` del projecte de docker-compose:

```bash
cp hello.yaml data/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="kubernetes" markdown="1" hidden>

El volum persistent, muntat a `/app/dist/persistent` al pod d'AnsibleForms. Busca el nom del pod i després copia-hi el fitxer:

```bash
kubectl -n ansibleforms get pods
kubectl -n ansibleforms exec <pod> -- mkdir -p /app/dist/persistent/playbooks
kubectl -n ansibleforms cp hello.yaml <pod>:/app/dist/persistent/playbooks/hello.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="source" markdown="1" hidden>

La carpeta `persistent/playbooks` del servidor, `/srv/apps/ansibleforms/server` a l'exemple d'instal·lació:

```bash
mkdir -p /srv/apps/ansibleforms/server/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/server/persistent/playbooks/
```

</div>
</div>

{: .note }
> Quan un repositori git té activat **Utilitzar per als playbooks ?**, els playbooks s'executen des d'aquest repositori:
> fes-hi commit de `hello.yaml`. Consulta [Dissenyador i git](gui/designer-and-git.html).

---

## 3. Crea el formulari

Els formularis són fitxers YAML a la carpeta de formularis. El Dissenyador els edita al navegador i els comprova abans de desar-los.

1. Fes clic a **Dissenyador** al menú superior, i després a **Formularis** al menú de l'esquerra.
2. Fes clic a l'interruptor de dalt a la dreta (**Inicia el dissenyador**). Bloqueja la configuració perquè ningú més l'editi alhora,
   i després mostra **Bloquejat per mi**.
3. Fes clic a **Fitxer nou**, el primer botó de la barra d'eines, i introdueix el nom de fitxer `hello-world.yaml`. El Dissenyador hi afegeix un formulari
   anomenat `New Form`.
4. Substitueix el YAML de l'editor per aquest formulari:

```yaml
name: Hello world
type: ansible
playbook: hello.yaml
description: Greets you with the values you picked
icon: play
roles:
  - default
categories:
  - Default
fields:
  - name: your_name
    type: text
    label: Your name
    required: true
  - name: target_env
    type: enum
    label: Environment
    values:
      - development
      - test
      - production
    default: development
    required: true
  - name: vm_size
    type: enum
    label: Size
    expression: "[{size:'small',cpus:1},{size:'medium',cpus:2},{size:'large',cpus:4}]"
    runLocal: true
    default: __auto__
    required: true
  - name: dry_run
    type: checkbox
    label: Dry run
    default: true
```

{:start="5"}
5. Fes clic a **Valida** (la marca de verificació), i després a **Desa**. En desar, s'escriu `hello-world.yaml` a la carpeta de formularis.
6. Torna a fer clic a l'interruptor per alliberar el bloqueig.

![El Dissenyador, editant un formulari](assets/screenshots/designer.jpg)

El formulari fa servir quatre tipus de camp:

| Camp | Tipus | Què fa |
|---|---|---|
| `your_name` | [`text`](formfields/text.html) | Un quadre de text obligatori |
| `target_env` | [`enum`](formfields/enum.html) | Un desplegable amb una llista fixa de `values` |
| `vm_size` | [`enum`](formfields/enum.html) | Un desplegable emplenat per una [expressió](expressions/local.html) local; `__auto__` selecciona el primer element |
| `dry_run` | [`checkbox`](formfields/checkbox.html) | Una casella, enviada com a `true` o `false` |

`vm_size` mostra les dues columnes, `size` i `cpus`, i envia `size`, la primera; `valueColumn` en tria una altra.

`roles: [default]` permet que qualsevol usuari que hagi iniciat sessió executi el formulari, i `categories: [Default]` el posa a la categoria que defineix el
`config.yaml` predeterminat.

{: .note }
> També pots copiar `hello-world.yaml` a [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH), i [validar-lo a VS Code](faq.html#vs-code-validation-for-form-files).

---

## 4. Llança'l

Obre el formulari des de la pàgina **Formularis**: fes clic a **Formularis** al menú superior i tria **Hello world** a la categoria **Default**.

Emplena el teu nom i canvia els altres camps si vols. Fes clic a **Mostra les extravars** per veure què rebrà el playbook,
i després fes clic a **Envia**:

![Un formulari](assets/screenshots/form.jpg)

---

## 5. Mira la sortida

La tasca s'inicia a l'instant, i la seva sortida apareix sota el formulari mentre s'executa, i acaba amb una barra **Acabada**:

![La sortida d'una tasca](assets/screenshots/run.jpg)

La tasca de debug mostra els teus valors, per exemple `Hello Alice: a small machine in development (dry run: True)`.

L'avís sobre el localhost implícit és normal sense inventari; un formulari real defineix [`inventory`](forms/ansible.html).

---

## 6. Troba-la a l'historial de tasques

Cada llançament es conserva com una tasca. Fes clic a **Tasques** al menú superior: la tasca nova és a dalt de tot de **Totes les tasques**.

Fes clic a la tasca per tornar a veure'n la sortida, i a **Mostra les extravars** per veure què s'ha enviat. Les icones davant de cada tasca
la rellancen o la suprimeixen:

![L'historial de tasques](assets/screenshots/job-output.jpg)

---

## Passos següents

Amplia aquest formulari amb les pàgines de referència:

* **[Formularis](forms/)** : totes les propietats d'un formulari, plantilles en runners, formularis de workflow, punts d'aprovació i notificacions
* **[Camps de formulari](formfields/)** : tots els tipus de camp, amb validació, dependències i disposició
* **[Expressions](expressions/)** : emplena camps des d'API REST, bases de dades i fitxers
* **[Rols](config/roles.html)** i **[categories](config/categories.html)** a `config.yaml` : decideix qui veu cada formulari
* **[Com funciona](how-it-works.html)** : què passa darrere d'un llançament, i on es desa tot
