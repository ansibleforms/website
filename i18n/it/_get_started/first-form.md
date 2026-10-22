---
layout: default
title: Il tuo primo modulo
nav_order: 2
translated_from: 26f445060b68070d02251e1c756c6253e5cf85fb
---

# Il tuo primo modulo
{: .no_toc }

Scrivi un playbook, crea un modulo per esso nel Designer, avvialo e ritrova il job
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Questo tutorial parte da un'installazione nuova, vedi [Installazione](installation/). Richiede circa quindici minuti.

---

## 1. Accedi

Apri AnsibleForms in un browser e accedi come amministratore.

L'account predefinito è `admin` / `AnsibleForms!123` (o i tuoi valori [`ADMIN_*`](customization/server.html#env_ADMIN_USERNAME)); si apre la pagina **Moduli**:

![La pagina Moduli, con moduli di esempio](assets/screenshots/dashboard.jpg)

---

## 2. Scrivi il playbook

Un modulo `ansible` esegue un playbook dalla cartella dei playbook, quindi il playbook viene prima. Salva questo come `hello.yaml`:

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

Il playbook legge quattro variabili. Il modulo che crei subito dopo le invia come extravars, una per campo.

Metti il file nella cartella `playbooks` della cartella persistente
([`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH)); crea la cartella se non esiste ancora:

<div class="af-tabs" data-tab-group="install">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="compose" aria-selected="false">Docker Compose</button>
<button type="button" role="tab" class="af-tab" data-tab="kubernetes" aria-selected="false">Kubernetes</button>
<button type="button" role="tab" class="af-tab" data-tab="source" aria-selected="false">Dai sorgenti</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

La cartella che hai montato su `/app/dist/persistent`, `/srv/apps/ansibleforms/persistent` nell'esempio di installazione:

```bash
mkdir -p /srv/apps/ansibleforms/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/persistent/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="compose" markdown="1" hidden>

La cartella `data/playbooks` del progetto docker-compose:

```bash
cp hello.yaml data/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="kubernetes" markdown="1" hidden>

Il volume persistente, montato su `/app/dist/persistent` nel pod di AnsibleForms. Trova il nome del pod, poi copia il file al suo interno:

```bash
kubectl -n ansibleforms get pods
kubectl -n ansibleforms exec <pod> -- mkdir -p /app/dist/persistent/playbooks
kubectl -n ansibleforms cp hello.yaml <pod>:/app/dist/persistent/playbooks/hello.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="source" markdown="1" hidden>

La cartella `persistent/playbooks` del server, `/srv/apps/ansibleforms/server` nell'esempio di installazione:

```bash
mkdir -p /srv/apps/ansibleforms/server/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/server/persistent/playbooks/
```

</div>
</div>

{: .note }
> Quando un repository git ha **Usare per playbook?** attivato, i playbook vengono eseguiti da quel repository:
> fai il commit di `hello.yaml` lì. Vedi [Designer e git](gui/designer-and-git.html).

---

## 3. Crea il modulo

I moduli sono file YAML nella cartella dei moduli. Il Designer li modifica nel browser e li controlla prima di salvarli.

1. Fai clic su **Designer** nel menu in alto, poi su **Moduli** nel menu a sinistra.
2. Fai clic sull'interruttore in alto a destra (**Avvia designer**). Blocca la configurazione in modo che nessun altro la modifichi
   nello stesso momento, e poi mostra **Bloccato da me**.
3. Fai clic su **Nuovo file**, il primo pulsante della barra degli strumenti, e inserisci il nome file `hello-world.yaml`. Il Designer vi aggiunge un modulo
   chiamato `New Form`.
4. Sostituisci lo YAML nell'editor con questo modulo:

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
5. Fai clic su **Valida** (il segno di spunta), poi su **Salva**. Il salvataggio scrive `hello-world.yaml` nella cartella dei moduli.
6. Fai di nuovo clic sull'interruttore per rilasciare il blocco.

![Il Designer, durante la modifica di un modulo](assets/screenshots/designer.jpg)

Il modulo usa quattro tipi di campo:

| Campo | Tipo | Cosa fa |
|---|---|---|
| `your_name` | [`text`](formfields/text.html) | Una casella di testo obbligatoria |
| `target_env` | [`enum`](formfields/enum.html) | Un menu a tendina con un elenco fisso di `values` |
| `vm_size` | [`enum`](formfields/enum.html) | Un menu a tendina riempito da un'[espressione](expressions/local.html) locale; `__auto__` seleziona il primo elemento |
| `dry_run` | [`checkbox`](formfields/checkbox.html) | Una casella di controllo, inviata come `true` o `false` |

`vm_size` mostra entrambe le colonne, `size` e `cpus`, e invia `size`, la prima; `valueColumn` ne sceglie un'altra.

`roles: [default]` permette a ogni utente che ha effettuato l'accesso di eseguire il modulo, e `categories: [Default]` lo mette nella categoria definita dal
`config.yaml` predefinito.

{: .note }
> Puoi anche copiare `hello-world.yaml` in [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) e [validarlo in VS Code](faq.html#vs-code-validation-for-form-files).

---

## 4. Avvialo

Apri il modulo dalla pagina **Moduli**: fai clic su **Moduli** nel menu in alto e scegli **Hello world** nella categoria **Default**.

Inserisci il tuo nome e cambia gli altri campi se vuoi. Fai clic su **Mostra variabili extra** per vedere cosa riceverà il playbook,
poi fai clic su **Invia**:

![Un modulo](assets/screenshots/form.jpg)

---

## 5. Segui l'output

Il job parte subito, e il suo output compare sotto il modulo mentre viene eseguito, terminando con una barra **Completato**:

![L'output di un job](assets/screenshots/run.jpg)

Il task di debug stampa i tuoi valori, per esempio `Hello Alice: a small machine in development (dry run: True)`.

L'avviso sul localhost implicito è normale senza un inventario; un modulo reale imposta [`inventory`](forms/ansible.html).

---

## 6. Ritrovalo nella cronologia dei job

Ogni avvio viene conservato come job. Fai clic su **Job** nel menu in alto: il nuovo job è in cima a **Tutti i job**.

Fai clic sul job per rivederne l'output, e su **Mostra variabili extra** per vedere cosa è stato inviato. Le icone davanti a ogni job
lo rilanciano o lo eliminano:

![La cronologia dei job](assets/screenshots/job-output.jpg)

---

## Prossimi passi

Amplia questo modulo con le pagine di riferimento:

* **[Moduli](forms/)** : ogni proprietà di un modulo, template sui runner, moduli workflow, punti di approvazione e notifiche
* **[Campi del modulo](formfields/)** : tutti i tipi di campo, con validazione, dipendenze e layout
* **[Espressioni](expressions/)** : riempi i campi da API REST, database e file
* **[Ruoli](config/roles.html)** e **[categorie](config/categories.html)** in `config.yaml` : decidi chi vede quale modulo
* **[Come funziona](how-it-works.html)** : cosa succede dietro un avvio, e dove viene salvato tutto
