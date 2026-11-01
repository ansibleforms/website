---
layout: default
title: FAQ
nav_order: 2
translated_from: 487a25c7f3b24b3a0c0d4df08c858a52d48f8556
---

# Domande frequenti
{: .no_toc }

Domande e risposte comuni su AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Primi passi

### Topologia della distribuzione: un container o più nodi

Per impostazione predefinita, un container di AnsibleForms esegue l'applicazione web e il lavoro in background in un unico processo, accanto a un container RTE che
esegue i playbook. Eseguilo con una restart policy (per esempio `restart: unless-stopped` in Docker), e fai il backup sia del database sia
del volume persistente.

Per eseguire più repliche dietro un load balancer, dividi il processo con `AF_ROLE`:

- i nodi `app` servono l'interfaccia web e l'API: eseguine quanti vuoi, ognuno con lo stesso `ACCESS_TOKEN_SECRET`
- un `worker` esegue il lavoro in background: lo schema e i suoi aggiornamenti, il config seed, le pianificazioni, il backup notturno, le sincronizzazioni
  dei repository e le pulizie. Lavora un solo worker alla volta, tenendo un lock sul database; un secondo aspetta e subentra quando il primo si ferma
- i container `rte` eseguono i playbook: eseguine di più per eseguire più playbook contemporaneamente

I nodi dell'app e il worker condividono il database, il volume persistente e `ENCRYPTION_SECRET`. Un RTE in modalità socket (in uscita o
in entrata, vedi [Modalità](rte/modes.html)) non ha bisogno né del database né di `ENCRYPTION_SECRET`. L'assistente chat ha bisogno di sessioni sticky, e
ogni nodo tiene il proprio log. Vedi [Scalabilità](production/scaling.html) e la configurazione
[examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale).

### Gestione dei moduli su più repository

I moduli di ogni repository Git con **Usare per moduli?** attivo vengono uniti automaticamente; in caso di nomi di modulo duplicati vince il primo
e viene registrato un avviso. Tieni `config.yaml` in un solo repository. Vedi [Repository Git](repositories/).

### Sui repository

AnsibleForms clona e aggiorna i repository Git nel percorso dei repository (`REPO_PATH`), gestiti in **Impostazioni > Repository**.
Gli interruttori su ogni repository stabiliscono cosa contiene: configurazione, moduli, playbook o file di variabili. Vedi [Repository Git](repositories/).

### Validazione in VS Code dei file dei moduli

Aggiungi un'intestazione di schema ai file YAML dei tuoi moduli per avere validazione in tempo reale e completamento automatico in VS Code.

Installa l'[estensione YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) e aggiungi questo commento come **prima riga** di qualsiasi file di modulo:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
```

Funziona sia per i file con un solo modulo (un dizionario YAML) sia per quelli con più moduli (una lista YAML):

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
- name: My Form
  type: ansible
  playbook: site.yml
  roles: [default]
  fields:
    - name: env
      type: enum
      values: [dev, staging, prod]
```

VS Code evidenzia le proprietà sconosciute, i campi obbligatori mancanti e i tipi sbagliati mentre scrivi.

---

## Gestione dei job

### Rilanciare un job con i dati precompilati

Il pulsante di rilancio apre il modulo precompilato con i valori del job precedente; i campi password non vengono mai salvati.
Richiede l'opzione di ruolo `allowJobRelaunch`, e un modulo può disattivarlo con `allowRelaunch: false`. Vedi [Rilanciare un job](jobs/actions.html#relaunch-a-job).

### File di log del job

Segui l'avanzamento tramite un file di log specifico del job (v6.1.2).

AnsibleForms può mostrare un **file di log specifico del job** accanto all'output di Ansible. Questo ti permette di seguire l'avanzamento di moduli personalizzati di lunga durata che altrimenti non darebbero nessun riscontro visibile durante l'esecuzione.

{: .note }
> Questa funzione funziona solo per i playbook eseguiti su un RTE. I template e i job su AWX, AAP, Ascender, Semaphore, Rundeck o
> Jenkins non hanno file di log.

**Come funziona:**
- Durante l'esecuzione di un job, l'RTE tiene d'occhio un file di log in un percorso noto dentro la cartella del playbook
- Ogni due secondi, quando il file è cambiato, l'RTE ne copia il contenuto nel job, e un'ultima volta quando il playbook termina
- Il file di log viene mostrato in una sezione **Log file** dell'output del job, numerato come le righe dell'output : il timestamp e il livello di una riga di log (ERROR, WARNING, INFO, DEBUG) vengono letti e colorati come quelli dell'output, e i colori ANSI sono supportati

**Convenzione per il percorso del file di log:**

Il file di log deve essere scritto in questo percorso:

```
<playbook_dir>/.joblogs/job_log_<jobid>.log
```

**AnsibleForms passa `__jobid__` automaticamente**, quindi puoi comporre il percorso nel tuo playbook senza nessuna configurazione aggiuntiva:

{% raw %}
```yaml
job_log_path: "{{ vars['playbook_dir'] }}/.joblogs/job_log_{{ __jobid__ }}.log"
```
{% endraw %}

Passa questa variabile a qualsiasi ruolo o modulo personalizzato che debba scrivere l'avanzamento nel file.

**Responsabilità di chi sviluppa il playbook / il modulo:**
- **Creare** il file di log (e la sua directory `.joblogs/`) all'inizio dell'operazione
- **Scrivere** messaggi di avanzamento significativi man mano che l'operazione procede

L'RTE elimina il file quando il playbook termina e l'ultimo contenuto è stato salvato nel job.

**La codifica a colori ANSI è supportata.**  
I codici di escape ANSI standard (per esempio `\033[92m` per il verde e `\033[91m` per il rosso) nei tuoi messaggi di log vengono resi come colori nell'interfaccia, così gli stati di successo, avviso ed errore si distinguono a colpo d'occhio.

**Caso d'uso tipico:**  
Un modulo Ansible personalizzato in Python che esegue una lunga sequenza di chiamate API o operazioni sui dati (per esempio un workflow di DR con SnapMirror) può aggiungere una riga per ogni passo al file di log. Un operatore che guarda il job in AnsibleForms vede allora l'avanzamento in tempo reale nella sezione Log file, mentre la pagina del job segue il job.

### Jobid

Passa l'ID del job corrente.

AnsibleForms invia automaticamente l'ID del job corrente nelle extravars come `__jobid__`; non serve nessuna configurazione.

### Informazioni sull'utente

Passa l'utente corrente.

AnsibleForms invia automaticamente le informazioni sull'utente nelle extravars come `ansibleforms_user`; non serve nessuna configurazione.

Puoi scegliere quanta parte inviarne. `EXTRAVARS_USER_FIELDS` accetta un elenco separato da virgole di chiavi di primo livello
(`username,email,type`), o `none` per non inviare nulla; un modulo può sovrascriverlo con la propria proprietà `userExtravars`.
Il valore predefinito è l'intero oggetto, come prima. Il `__user__` lato modulo descritto sotto viene dal token di accesso e non ne è mai influenzato.

### Informazioni sull'utente nel modulo

Accedi alle informazioni sull'utente corrente nel modulo (v4.0.2).

Il campo `__user__` viene aggiunto automaticamente al modulo e si può usare nelle espressioni:

```yaml
expression: $(__user__)
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
expression: $(__user__.roles)
```

---

## Campi del modulo

### Menu a tendina a cascata

Crea menu a tendina a cascata.

I campi `enum` (menu a tendina) possono contenere placeholder nella loro proprietà `query` o `expression`, nel formato `$(another_field)` o `$(another_field[0].name)`.  
Non appena il campo referenziato cambia, il campo che lo referenzia viene rivalutato, il che produce menu a tendina dinamici e a cascata.  
L'applicazione web client rivaluta i campi ogni 100 ms; con i processori attuali e il motore Chromium, l'esperienza risulta fluida.

{: .note }
> Un riferimento a un altro campo enum restituisce i valori selezionati, **non** l'intero elenco del menu a tendina. Usa la proprietà `placeholderColumn` o la notazione a punti come `$(city.name)`.  
> **Novità della v4.0.20**: impostare placeholderColumn su "*" restituisce l'intero record invece di una singola colonna.

Gli esempi interrogano `CONN1`, un [database](databases.html) di Connessioni > Database (dalla 7.5.0) o una credenziale di tipo database.

```yaml
- type: enum
  dbConfig: CONN1
  query: select name from cmdb.city
  name: city_name
  label: Select a city
  default: Amsterdam
  required: true
  model: cmdb.city
  group: CMDB
- type: enum
  dbConfig: CONN1
  query: select datacenter.name from cmdb.datacenter,cmdb.city where datacenter.city_id=city.id
    and city.name='$(city_name)'
  name: datacenter_name
  label: Select a datacenter
  default: __auto__    # default can be "__auto__" (first item) or "__all__" (all items) or "__none__" (no default)
  multiple: true
  outputObject: true
  required: true
  model: cmdb.datacenter
  group: CMDB      

# or use the placeholderColumn property

- type: enum
  dbConfig: CONN1
  query: select id,name,description from cmdb.city
  name: city
  label: Select a city
  default: Amsterdam         # evaluated against valueColumn
  required: true
  model: cmdb.city
  group: CMDB
  valueColumn: name          # we choose the name column as value for placeholders
  placeholderColumn: id      # we can reference the id by using $(city)
  previewColumn: description # when you select a value, the dropdown will show description
  columns:                   # we hide id
  - name
  - description
- type: enum
  dbConfig: CONN1
  query: select name, capacity_pct from cmdb.datacenter where datacenter.city_id=$(city)
# this cascaded dropdown will react using "id" as placeholder
# or "query":"select name from cmdb.datacenter where datacenter.city_id=$(city.id)",  
# or reference the column in the placeholder                            
  name: datacenter_name
  label: Select a datacenter
  default: __auto__         # default can be "__auto__" (first item) or "__all__" (all items) or "__none__" (no default)
  multiple: true
  pctColumns:
  - capacity_pct
  outputObject: true
  required: true
  model: cmdb.datacenter
  group: CMDB
```

### Placeholder dei campi

Fai riferimento al valore di un altro campo.

I placeholder sono riferimenti ad altri campi del modulo.  
Un placeholder ha sempre il formato `$(reference)`, e sia le espressioni sia le query possono contenere placeholder.  
Un placeholder che punta a un campo semplice (text, number, password) contiene il valore di quel campo.  
Un placeholder che punta a un campo enum basato su oggetti deve usare o la proprietà `placeholderColumn` o la notazione a punti come `$(city.name)`.  
Un placeholder che punta a un campo expression restituisce l'intero oggetto, oppure puoi usare un riferimento avanzato, simile a JavaScript, come `$(myarray[0].name)`.

{: .important }
> Il placeholder viene sostituito **prima** che l'espressione venga valutata. Se ti aspetti che il risultato sia una stringa, devi racchiuderlo tra virgolette.  
> **Novità della v4.0.20**: impostare placeholderColumn su "*" restituisce l'intero record invece di una singola colonna.

```yaml
- name: field1
  type: expression
  expression: "[{name: 'foo'},{name: 'bar'},{name: 'ansible'}]"
  runLocal: true
- name: field2
  type: expression
  expression: "'$(field1[0].name)'"  # result : 'foo' (note the wrapping quotes)
  runLocal: true
- name: field3
  type: expression
  expression: "$(field1)[0].name"  # result : {name: 'foo'}.name => 'foo'  
  runLocal: true    
- name: field4
  type: expression
  expression: "$(field1).slice(-1)[0].name"  # result : {name: 'ansible'}.name => 'ansible' 
  runLocal: true
- name: field5
  type: enum
  expression: $(field1).filter(x => x.name.includes('a'))   # result : [{name: 'bar'},{name: 'ansible'}]
  runLocal: true
  default: __auto__                                         # result: bar
- name: field6
  type: expression
  expression: "'$(field5)'"   # result : the selected item from field5 (default=bar)
  runLocal: true        
```

### Nascondere un campo

Nascondi un campo.

Nascondi un campo con la proprietà di campo `hide`, o mostralo e nascondilo dinamicamente con le proprietà di campo `dependencies` e `dependencyFn`.

### Raggruppare i campi

Raggruppa i campi in un blocco.

Usa la proprietà di campo `group`. I campi con lo stesso nome di gruppo vengono raggruppati in un blocco.

### Validazione dei campi

Valida un campo.

Usa le proprietà di validazione dei campi, come `regex`, `minValue` e `notIn`.

### Valore predefinito su un enum

Valore predefinito di un enum.

La proprietà di campo `default` imposta un valore predefinito, e sui campi `enum` puoi usare valori come `__auto__` per selezionare automaticamente il primo elemento.

Per un valore predefinito dinamico basato su un'espressione, sposta l'elemento predefinito in cima all'elenco, come nell'esempio seguente.

```yaml
# using client javascript manipulation

- type: expression
  expression: "[{name:'bert'},{name:'ernie'},{name:'pino'}]"
  name: dropdownsource
  label: Dropdown source
  runLocal: true
- type: expression
  expression: "'pino'"
  name: dropdownsourceDefault
  label: Default source
  runLocal: true
- type: enum
  expression: "[...[{name:'$(dropdownsourceDefault)'}],...$(dropdownsource).filter(x => x.name!=='$(dropdownsourceDefault)')]"
  name: dropdownwithdefault
  label: Example with expression default by moving it to top
  runLocal: true
  default: __auto__     

# explained : 
# we take our default and merge it with the source where we filter out the default (to avoid doubles)    
# the default is thus shifted to the first element, which we can now select with the default `__auto__`
```

### Valore predefinito da un'espressione

Valore predefinito da un'espressione.

Per i campi text, number o date, la proprietà `default` imposta un valore predefinito statico.

Per rendere il valore predefinito dinamico, basato su un'espressione, usa una di due proprietà:
* `editable`: usa la proprietà editable per rendere modificabile un campo expression
* `evalDefault`: usa la proprietà evalDefault per valutare il valore predefinito come un'espressione

```yaml
# using editable
- type: expression
  expression: "'$(some_other_field)'.toLowerCase()"
  name: field1
  runLocal: true
  editable: true # this will add an edit-button so you manually overwrite the expression value

# using evalDefault
- type: text
  name: field1
  default: "'$(some_other_field)'.toLowerCase()"
  evalDefault: true # it will treat the default as if it was an expression.
  # note : when `some_other_field` changes, the default will be re-evaluated
  # note2 : works for other fields too.

# more complex evalDefault example
- name: checkbox
  type: checkbox
- name: textfield1
  type: text
  line: line2
  default: ping
- name: textfield2
  type: text
  line: line2
  default: pong
- name: checkbox3
  type: checkbox
  line: line3
  label: This checkbox will default check if checkbox or textfield1==textfield2
  default: |
    (
      (c=false,t1="",t2="") => { return c || (t1==t2) }
    )( $(checkbox) , "$(textfield1)" , "$(textfield2)" )
    
  evalDefault: true
```

---

## Wizard e workflow

### Qual è la differenza tra un wizard e un workflow?

Un **wizard** e un **workflow** sono entrambi divisi in passi, ma operano su livelli diversi e si possono combinare.

| | [`workflow`](forms/workflow.html) (Workflow) | [`wizard`](forms/wizard.html) |
|---|---|---|
| **Livello** | Esecuzione | Modulo / interfaccia |
| **Cosa divide** | Il job in nodi che girano uno dopo l'altro, o in parallelo | L'input di un modulo in più pagine |
| **Risultato** | 1 job workflow, con un job per nodo (ognuno con il proprio playbook o template) | 1 job eseguito alla fine |
| **`type` del modulo** | Deve essere `workflow` | Funziona con ogni tipo di modulo tranne `subform` |
| **Definito da** | Un [file di workflow](workflows/file.html) del designer (`workflow:`) | Un elenco di riferimenti a [subform](forms/subform.html) (`wizard:`) |
| **Usalo quando** | "Fai A, poi B, poi C come job separati" | "Il mio modulo ha troppi campi per una sola pagina" |

**Il punto chiave:** un workflow riguarda *cosa viene eseguito e in quale ordine*; `wizard` riguarda *come l'utente compila il modulo*.

{: .note }
> Il tipo di modulo `multistep`, con i suoi `steps`, si occupava della parte di esecuzione prima della 7. È deprecato dalla 7 e rimosso nella
> 8: un workflow fa tutto ciò che fa un multistep, vedi [Moduli multistep](forms/multistep.html).

#### Solo workflow
{: .no_toc }

Un modulo `type: workflow` esegue uno dei workflow del designer. L'utente compila un'unica pagina di campi e preme Invia,
e il workflow esegue i suoi nodi, ognuno con i valori del modulo come extra vars:

```yaml
- name: Provision host
  type: workflow
  workflow: provision-host
  roles:
    - default
  fields:
    - name: hostname
      type: text
```

#### Solo wizard
{: .no_toc }

Un blocco `wizard:` su un modulo distribuisce la raccolta dell'input su più pagine. Alla fine viene eseguito **un solo** job: le extravars unite di tutte le pagine vengono inviate a un unico playbook, template o workflow.

```yaml
- name: Provision host
  type: ansible
  roles:
    - default
  playbook: provision.yml
  wizard:
    - subform: basics
      title: Basics
    - subform: network
      title: Network
      defaultModel: net

- name: basics
  type: subform
  fields:
    - name: hostname
      type: text
      required: true

- name: network
  type: subform
  fields:
    - name: ipv4
      type: text
```

Una pagina di riepilogo in sola lettura viene aggiunta automaticamente come ultima pagina del wizard; non la dichiari nello YAML.

#### Combinati (wizard sopra un workflow)
{: .no_toc }

Un wizard si può sovrapporre a un modulo workflow. L'utente compila le pagine del wizard e preme Invia, e **poi** parte il
workflow. Facendo corrispondere il `defaultModel` di un passo del wizard con l'[`extra_vars_key`](workflows/file.html#ansibleforms-own-keys)
di un nodo, puoi indirizzare **una pagina del wizard a un nodo**:

```yaml
- name: Provision and verify host
  type: workflow
  workflow: provision-host
  roles:
    - default
  wizard:
    - subform: basics
      title: Basics
      defaultModel: basics            # wraps basics fields under `basics`
    - subform: network
      title: Network
      defaultModel: network           # wraps network fields under `network`
```

E il workflow `provision-host`, in un file di workflow del designer:

```yaml
workflow_job_templates:
  - name: provision-host
    related:
      workflow_nodes:
        - identifier: create
          unified_job_template:
            name: create_host.yml
            type: job_template
          extra_vars_key: basics      # only sees the basics page payload
          related:
            success_nodes:
              - identifier: network
        - identifier: network
          unified_job_template:
            name: configure_network.yml
            type: job_template
          extra_vars_key: network     # only sees the network page payload
```

`extra_vars_key` è una ricerca su un solo livello, quindi usa un nome piatto in `defaultModel` (per esempio `defaultModel: basics`, non `defaultModel: input.basics`) quando vuoi che corrispondano.

Vedi la [pagina Wizard](forms/wizard.html) per il riferimento completo delle proprietà.

### Come mostro o salto i passi del wizard in base a una condizione?

Usa `when:` per **nascondere** completamente un passo, o `optional: true` per permettere all'utente di **saltare** un passo visibile. Le due cose sono indipendenti e in genere non vanno combinate.

#### `when:`: visibilità condizionale
{: .no_toc }

Il passo è nascosto quando l'espressione restituisce un valore falsy. L'utente non lo vede mai, e i suoi valori non vengono raccolti. L'espressione può leggere i passi precedenti tramite `__parent__.<stepname>.<field>`:

```yaml
wizard:
  - subform: basics             # has a `kind` enum field with values vm/bare-metal/container
    title: Basics
  - subform: virtualization
    title: Virtualization
    when: $(__parent__.basics.kind) === 'vm'
  - subform: hardware
    title: Hardware
    when: $(__parent__.basics.kind) === 'bare-metal'
```

Viene mostrata solo la pagina corrispondente al `kind` scelto. I passi dopo uno nascosto vengono rinumerati automaticamente.

#### `optional: true`: permettere di saltare un passo visibile
{: .no_toc }

Il passo è **sempre mostrato** nella barra dei passi, ma l'utente può premere **Avanti** senza compilarlo, e **Invia** è consentito anche se la pagina non è mai stata visitata o completata:

```yaml
wizard:
  - subform: basics
    title: Basics
  - subform: advanced
    title: Advanced (optional)
    optional: true
```

L'utente può aprire la pagina Advanced, lasciarla vuota, premere Avanti e passare direttamente alla pagina di riepilogo.

{: .note }
> `when:` controlla la *visibilità*; `optional:` controlla *se la pagina deve essere completata*. Non combinarli: per far sparire una pagina, usa `when:`; per tenerla visibile ma saltabile, usa `optional:`.

### Come faccio riferimento ai valori di un passo precedente del wizard?

Usa `$(__parent__.<stepname>.<field>)` dentro qualsiasi campo di un passo successivo.

Il `name` di un passo del wizard (per impostazione predefinita il nome del suo `subform`) è lo spazio dei nomi sotto cui i suoi valori vengono esposti ai passi successivi:

```yaml
- name: Provision host
  type: ansible
  playbook: provision.yml
  roles:
    - default
  wizard:
    - subform: basics          # step name defaults to "basics"
      title: Basics
    - subform: network
      title: Network

- name: basics
  type: subform
  fields:
    - name: hostname
      type: text
      required: true

- name: network
  type: subform
  fields:
    - name: fqdn
      type: text
      # Re-evaluated when basics.hostname changes
      default: $(__parent__.basics.hostname).local
```

È lo stesso meccanismo `__parent__` usato dai subform di `list` e `yaml`; vedi [Come accedo ai dati del modulo padre dentro un subform?](#how-do-i-access-parent-form-data-inside-a-subform).

---

## Sicurezza e credenziali

### Credenziali

Passa le credenziali.

Le credenziali si possono passare in diversi modi:
* usando la proprietà di campo `asCredential`  
* usando la proprietà di modulo `credentials` (coppie chiave-valore)
* usando un'extravar chiamata `__credentials__`

```yaml
# assume you have 2 credentials created in Ansible Forms
# 1: vcenter
# 2: ad

# you want them exposed to the playbook as
# 1: vc_cred
# 2: ad_cred

# Method 1 : using asCredential field-property
fields:
- name: vc_cred
  type: expression
  runLocal: true
  asCredential: true
  expression: "'vcenter'"
- name: ad_cred
  type: expression
  runLocal: true
  asCredential: true
  expression: "'ad'"

# Method 2 : using credentials form-property   
name: myplaybook
type: ansible
playbook: myplaybook.yaml
roles:
  - default
credentials:
  vc_cred: vcenter
  ad_cred: ad
  veeam_cred : veeam_prod,veeam_dev # will first try veeam_prod, then as fallback veeam_dev

# Method 3 : using __credentials__ extravar
fields:
- name: __credentials__
  type: expression
  runLocal: true
  expression: "{vc_cred: 'vcenter',ad_cred: 'ad',veeam_cred:'$(veeam_server)'}"
  # note : in the expression you can use placeholders to make them dynamic
```

### Recuperare una password di admin persa

Se hai perso la password dell'account locale `admin` e non è disponibile nessun altro utente admin, usa l'opzione di recupero `REINIT_ADMIN`. **Non è un modo per aggirare l'autenticazione durante l'esecuzione**: forza solo un reset una tantum dell'account admin locale all'avvio, dopodiché l'autenticazione procede normalmente.

**Come funziona**

Quando `REINIT_ADMIN=1` è impostato all'avvio, AnsibleForms:

1. Si assicura che il gruppo `admins` esista (creandolo se manca).
2. Cerca l'utente admin locale (nome utente predefinito `admin`, sovrascritto da `ADMIN_USERNAME`).
3. Se esiste, reimposta la sua password al valore di `ADMIN_PASSWORD` e lo ricollega al gruppo `admins`.
4. Se non esiste, lo crea (come in un'installazione nuova).
5. Registra l'azione in modo ben visibile nei log.

**Passi**

1. Ferma AnsibleForms.
2. Imposta le variabili d'ambiente (usa una password robusta):
   ```bash
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourNewStrongPasswordHere
   REINIT_ADMIN=1
   ```
   In Docker Compose, aggiungile al blocco `environment:` del servizio AnsibleForms.
3. Avvia AnsibleForms e cerca nei log una riga come:
   ```
   REINIT_ADMIN: admin user 'admin' has been recreated. UNSET REINIT_ADMIN now.
   ```
4. Accedi con `admin` / `YourNewStrongPasswordHere`.
5. **Rimuovi `REINIT_ADMIN` (o rimettilo a `0`)** e riavvia, così che i riavvii futuri non reimpostino di nuovo la password dell'admin.

**Note**

- Se sei rimasto chiuso fuori perché LDAP era l'unico metodo di accesso configurato ed è andato in errore, l'account locale `admin` recuperato ricade sempre sull'autenticazione con il database locale, che basta per accedere e sistemare LDAP.
- La vecchia variabile d'ambiente `ENABLE_BYPASS` è stata rimossa. Permetteva di accedere come admin con qualsiasi password e non era sicuro lasciarla attiva. `REINIT_ADMIN` reimposta solo la password; dopo si applica la normale autenticazione.
- `REINIT_ADMIN` non invalida le sessioni e i token esistenti; cambiano solo l'hash della password e l'appartenenza al gruppo.

### Limitare le destinazioni degli helper REST (liste di consentiti e negati)

Gli helper `fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt` e `fn.fnRestJwtSecure` si possono chiamare dalle proprietà `expression` dei moduli per recuperare dati via HTTP. Per impostazione predefinita, chi scrive le espressioni può puntare a **qualsiasi** URL raggiungibile dall'host di AnsibleForms, cosa che su una rete sensibile potresti voler limitare.

Due variabili d'ambiente forniscono una lista di consentiti e una di negati:

| Variabile | Comportamento |
|---|---|
| `REST_ALLOWED_HOSTS` | Nomi host o CIDR separati da virgole. Quando è impostata, sono consentite **solo** queste destinazioni. |
| `REST_DENIED_HOSTS` | Nomi host o CIDR separati da virgole. Sempre bloccati. Ha la precedenza sulla lista dei consentiti. |

I nomi host vengono confrontati con l'host dell'URL senza distinzione tra maiuscole e minuscole. I CIDR vengono confrontati con ogni IP in cui si risolve l'host, quindi `10.0.0.0/8` blocca qualsiasi nome DNS che si risolva nell'intervallo privato.

**Esempi:**

La prima riga consente solo due host; la seconda blocca destinazioni specifiche:

```bash
# Whitelist: only your two API partners are reachable
REST_ALLOWED_HOSTS=api.example.com,partner.api.com

# Blacklist: block cloud metadata + internal admin UIs
REST_DENIED_HOSTS=169.254.169.254,127.0.0.0/8,internal-admin.example
```

{: .warning }
> **Questa protezione tutela solo il processo Node.js di AnsibleForms.** Una volta che un playbook gira, Ansible stesso può raggiungere qualsiasi cosa dall'host, fuori dal controllo di AnsibleForms. Usa queste liste per impedire a chi scrive i moduli di trasformare le espressioni in un proxy verso servizi di metadati o interfacce interne; non affidarti a esse come a un firewall di rete.

Dalla 7.3.0 gli helper REST controllano il certificato TLS dell'endpoint, come fa ogni altra connessione, e rinunciano dopo
[`REST_TIMEOUT_SECONDS`](customization/security.html#env_REST_TIMEOUT_SECONDS) (`60` per impostazione predefinita). Fai considerare attendibile una CA privata con
`NODE_EXTRA_CA_CERTS`, o imposta [`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) su `1` solo per endpoint con un
certificato autofirmato.

### Integrazione con HashiCorp Vault

Le credenziali possono leggere il loro utente e la loro password da HashiCorp Vault, configurato come
**archivio di segreti**. Vedi [Archivi di segreti](secret-stores). Le variabili d'ambiente `VAULT_*`
delle versioni precedenti vengono importate una volta come archivio `vault` al primo avvio della 7.x.

Per i segreti usati solo dentro un playbook, puoi anche usare il plugin di lookup `community.hashi_vault`,
che legge direttamente da Vault e scavalca AnsibleForms.

---

## Integrazione

### Interrogare AWX/Tower/AAP

Interroga informazioni da AWX o da Ansible Automation Platform.

Per riempire i menu a tendina con dati da AWX o Tower, usa `fn.fnRestBasic` o `fn.fnRestJwtSecure`. Dalla 7.3.0 questi helper controllano
il certificato dell'indirizzo di AWX: con uno autofirmato, fai considerare attendibile la sua CA con `NODE_EXTRA_CA_CERTS`, o imposta
[`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) su `1`.

```yaml
name: Query awx
type: awx
runner: myAwxConfigName # a runner of type awx
template: my_template # will be overwritten by the field __template__
description: ""
awxCredentials:
  - vmware
executionEnvironment: my_execution_environment
roles:
  - default
categories: []
inventory: my_inventory # will be overwritten by the field __inventory__
tileClass: bg-info-subtle
icon: bullseye
fields:
  # make sure you add credentials called "awx_rest" where the password holds the token
  # if you like basic authentication, switch the expressions below to fn.fnRestBasic instead

  - name: organization
    label: Organization
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/organizations','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: id # => we want the organisation field to hold the id !!
  - name: __template__  # use this special name to override the template from the form
    label: Template
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/job_templates?organization=$(organization)','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: name
  - name: __inventory__  # use this special name to override the inventory from the form
    label: Inventory
    type: enum
    default: __auto__
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/inventories?organization=$(organization)','','awx_rest','[.results[]]')"
    columns:
      - name
    valueColumn: name    
  - name: __awxCredentials__  # use this special name to override the credentials from the form
    label: Credentials
    type: enum
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/credentials?organization=$(organization)','','awx_rest','[.results[]]')"
    multiple: true
    default: __auto__
    columns:
      - name
    valueColumn: name     
  - name: __executionEnvironment__  # use this special name to override the executionEnvironment from the form
    label: Execution environment
    type: enum
    expression: "fn.fnRestJwtSecure('get','https://172.16.50.1/api/v2/execution_environments?organization=$(organization)','','awx_rest','[.results[]]')"
    default: __auto__
    columns:
      - name
    valueColumn: name           
```

---

## Personalizzazione

### Personalizzazione

Personalizza AnsibleForms.

AnsibleForms è un'applicazione web. Quando la esegui in modo nativo in Node.js, puoi sostituirne o modificarne i file.  
L'approccio consigliato, però, è eseguirla come immagine Docker e aggiungere mappature di volumi o file. I progetti Docker Compose mappano già delle directory per rendere persistenti il database, i playbook, i log, i certificati e le chiavi SSH, e puoi aggiungere altre mappature. Un logo personalizzato si carica nella pagina delle impostazioni **Logo**.  
Il file `custom.js` contiene le tue funzioni JavaScript da usare nelle espressioni. Le funzioni integrate usano il prefisso `fn.` (per esempio fn.fnRestBasic); le funzioni personalizzate usano il prefisso `fnc.`.  
Allo stesso modo, puoi aggiungere le tue definizioni jq nel file `jq.custom.definitions`.

```yaml
volumes:
  # Mount application folder to host folder (to maintain persistency)
  - ./data:/app/dist/persistent
  # Map custom functions for js expressions and jq
  - ./data/functions/custom.js:/app/dist/src/functions/custom.js
  - ./data/functions/jq.custom.definitions:/app/dist/src/functions/jq.custom.definitions
  # Map custom sshkey to local node .ssh location
  - ./data/ssh:$HOME_DIR/.ssh
  - ./data/git/.gitconfig:$HOME_DIR/.gitconfig
```

### Attivare YTT

Attiva ytt.

Per usare ytt, imposta `USE_YTT=1`.  
Per maggiori informazioni su ytt, vedi https://carvel.dev/ytt/.

{: .important }  
> Questa funzione non è stata testata a fondo, e non è arrivato nessun riscontro da quando è stata aggiunta come miglioramento.  
> Quando usi ytt, devi disattivare il designer: il designer converte i file YAML in JSON intermedio e scarta la sintassi di ytt (che consiste di commenti YAML).

Nella directory radice deve esistere una directory `lib`; viene inclusa automaticamente nella chiamata a ytt.
I dati si possono fornire globalmente impostando variabili d'ambiente con un prefisso:  

```bash
YTT_VARS_PREFIX=YTT_VAR
YTT_VAR_INVENTORY_PATH=/tmp/inventory.yml
YTT_VAR_default_host=localhost
```  

In alternativa, fornisci file di dati della libreria:

```bash
YTT_LIB_DATA_DEMO=/tmp/demo_data.yml
```  

```yaml
# /tmp/demo_data.yml
message: 'hello demo'
```

**La libreria `demo` deve esistere nel contesto di ytt (lib/_ytt_lib/demo/values.yml)**

```yaml
# lib/_ytt_lib/demo/values.yml
#@ data/values
---
demo: {}
```  

I dati caricati si possono poi usare:

```yaml
# config.yaml
#@ load("@ytt:data", "data")
#@ load("@ytt:library", "library")
#@ demo = library.get("demo")
---
categories:
  - name: Default
    icon: bars
roles:
  - name: admin
    groups:
      - local/admins
constants:
  data_values: #@ data.values
  demo: #@ demo.data_values()
```

---

## Controllo degli accessi

### Come limito ciò che gli utenti possono fare (opzioni di ruolo)?

Oltre a limitare quali moduli un ruolo può vedere, le `options` di un ruolo attivano o disattivano funzioni dell'interfaccia per i suoi membri.
Vedi [Opzioni di ruolo](config/roles.html#role-options) per ogni opzione, il suo valore predefinito e come si combinano le opzioni tra i ruoli.

### Come implemento una logica RBAC personalizzata nei miei playbook o moduli?

L'identità dell'utente è disponibile sia nel frontend sia nel backend a ogni esecuzione.

A ogni invio di un modulo, AnsibleForms inserisce automaticamente l'identità completa dell'utente corrente nelle extravars inviate ad Ansible:

```yaml
ansibleforms_user:
  username: jane.doe
  groups:
    - local/admins
    - ldap/network-team
  roles:
    - admin
    - operators
  options:
    showLogs: true
    allowJobRelaunch: true
    # ...all resolved role options
```

Il tuo playbook o qualsiasi modulo Ansible personalizzato può quindi usare `ansibleforms_user` direttamente per decisioni granulari, per esempio per consentire solo a certi gruppi di modificare l'inventario di produzione, o per scrivere una traccia di audit con il nome utente di chi ha inviato il modulo.

Nel **frontend**, lo stesso oggetto è disponibile tramite il campo speciale `__user__`:

```yaml
fields:
  - name: is_admin
    type: expression
    runLocal: true
    hide: true
    expression: "$(__user__.roles).includes('admin')"

  - name: target_env
    type: enum
    # hide the production option for non-admins by cross-referencing __user__
    expression: |
      $(__user__.roles).includes('admin')
        ? ['dev','staging','production']
        : ['dev','staging']
    runLocal: true
    default: __auto__
```

**Schemi tipici:**

L'identità dell'utente consente schemi come i seguenti:

- **Incrociare un file di configurazione RBAC o un database**: carica un file YAML o JSON (con `fn.fnReadYamlFile` o un'espressione) che associa i gruppi alle risorse consentite, poi filtra su `$(__user__.groups)`
- **Traccia di audit**: passa `ansibleforms_user.username` come variabile extra per registrare chi ha avviato il job
- **Valori dinamici dei campi**: mostra un insieme diverso di scelte enum, precompila campi o nascondi sezioni in base ai gruppi o ai ruoli dell'utente
- **Autorizzazione lato playbook**: verifica che `ansibleforms_user.groups` contenga un gruppo richiesto prima che il playbook prosegua, come controllo di difesa in profondità indipendente dall'elenco `roles` del modulo

{: .note }
> L'oggetto qui sopra è ciò che viene inviato per impostazione predefinita. Se l'istanza imposta `EXTRAVARS_USER_FIELDS`,
> o il modulo imposta `userExtravars`, vengono inviate solo le chiavi indicate lì, quindi un playbook che
> verifica `ansibleforms_user.groups` richiede che `groups` sia una di esse. Il campo `__user__`
> del frontend viene dal token di accesso e non viene mai ridotto da nessuna delle due impostazioni.

---

## Pianificazione dei job

### Come pianifico l'esecuzione automatica di un modulo?

Apri il menu a tendina accanto a **Invia** e scegli **Pianifica (ricorrente)** o **Esegui più tardi (una volta)**; richiedono le opzioni di ruolo
`allowScheduledJobs` (a livello admin) e `allowPlannedJobs`. Vedi [Pianificazioni](jobs/schedules.html).

### Quali espressioni cron posso usare?

Una pianificazione ricorrente accetta un'espressione cron standard a 5 campi (minuto, ora, giorno del mese, mese, giorno della settimana).

| Espressione | Esegue |
|---|---|
| `*/15 * * * *` | Ogni 15 minuti |
| `0 * * * *` | Ogni ora, allo scoccare dell'ora |
| `0 */6 * * *` | Ogni 6 ore, alle 00:00, 06:00, 12:00 e 18:00 |
| `0 2 * * *` | Ogni giorno alle 02:00 |
| `30 7 * * 1-5` | Dal lunedì al venerdì alle 07:30 |
| `0 8 * * MON` | Ogni lunedì alle 08:00 (i nomi dei giorni e dei mesi sono accettati) |
| `0 0 1 * *` | A mezzanotte del primo giorno di ogni mese |
| `0 22 L * *` | Alle 22:00 dell'ultimo giorno di ogni mese |
| `0 6 * * 1#1` | Alle 06:00 del primo lunedì di ogni mese |
| `*/30 * * * * *` | Ogni 30 secondi (un sesto campo facoltativo in testa indica i secondi) |

Quando sono impostati sia il giorno del mese sia il giorno della settimana, la pianificazione viene eseguita quando corrisponde uno dei due: `0 0 13 * 5` gira
il 13 e ogni venerdì. Il server rifiuta un'espressione che non può eseguire, o una che non può mai verificarsi (`0 0 30 2 *`).

Nella pagina **Pianificazioni**, l'editor cron descrive l'espressione e mostra in anteprima le sue prossime esecuzioni. Non accetta abbreviazioni
come `@daily`, il carattere jolly `?` né il modificatore `W` (giorno feriale più vicino), quindi attieniti alle forme della tabella.

{: .note }
> **Fuso orario** Le pianificazioni cron girano nel fuso orario del server, impostato con [`LOG_TZ`](customization/logging.html#env_LOG_TZ)
> (predefinito `UTC`), non nel fuso orario del tuo profilo o del tuo browser. `0 2 * * *` con `LOG_TZ=Europe/Madrid` gira alle 02:00
> ora di Madrid tutto l'anno, seguendo l'ora legale. L'editor cron mostra in anteprima le prossime esecuzioni in quello stesso fuso. Le pianificazioni
> di pull dei repository usano lo stesso fuso.

---

## Salvare e caricare i dati dei moduli

### Come salvo e ricarico i dati di un modulo senza eseguire un job?

Seleziona **Salva** nel menu a tendina accanto a **Invia** per salvare i valori dei campi, poi **Carica da archivio** per ripristinarli in seguito.
I campi password non vengono mai salvati. Richiede l'opzione di ruolo `allowStoredJobs`. Vedi [Job salvati](jobs/stored-jobs.html).

---

## Moduli annidati e campi strutturati

### Come raccolgo dati strutturati o ripetuti in un modulo?

Usa i campi `list` e `yaml` con dei subform (6.2.0+).

Per raccogliere dati strutturati complessi, come un elenco di server, un insieme di interfacce di rete o un singolo oggetto annidato, usa il tipo di campo `list` o `yaml` insieme a un `subform`.

Un **subform** è un frammento di modulo riutilizzabile (definito con `type: subform`) che non viene mai mostrato come riquadro a sé. Esiste solo per essere referenziato dai campi di altri moduli. Vedi la [documentazione dei subform](forms/subform.html) per il riferimento completo.

**Raccogliere un elenco di righe strutturate: campo `list`:**

Un campo `list` apre il subform referenziato una volta per riga:

```yaml
- name: Server
  type: subform
  fields:
    - name: hostname
      type: text
      required: true
    - name: ip
      type: text
      regex:
        expression: ^\d+\.\d+\.\d+\.\d+$
        description: Must be an IPv4 address

- name: Deploy to servers
  type: ansible
  roles:
    - default
  playbook: deploy.yml
  fields:
    - name: servers
      type: list
      subform: Server   # opens Server subform in a drilldown editor per row
```

L'extravar `servers` inviata ad Ansible è un array di oggetti: `[{hostname: "web1", ip: "10.0.0.1"}, ...]`

**Modificare un singolo oggetto strutturato: campo `yaml`:**

Il campo `yaml` ha tre modalità:

| Modalità | Come | Comportamento |
|---|---|---|
| **Editor** | predefinita | Mostra un editor YAML completo con evidenziazione della sintassi in cui l'utente può scrivere direttamente |
| **Sola lettura** | `readonly: true` | Mostra il valore YAML come testo formattato in sola lettura, senza modifica |
| **Subform** | `subform: MySubform` | Nasconde l'editor grezzo; al clic apre il subform come editor di dettaglio |

```yaml
fields:
  # editor mode (default)
  - name: raw_config
    type: yaml

  # readonly mode
  - name: generated_config
    type: yaml
    readonly: true

  # subform mode
  - name: network_config
    type: yaml
    subform: NetworkConfig   # opens NetworkConfig subform as a drilldown editor
```

**Upload e download: campi `list` e `yaml`:**

Entrambi i tipi di campo supportano il trasferimento di file lato client tramite due proprietà facoltative:

```yaml
fields:
  - name: servers
    type: list
    subform: Server
    showLoadButton: true      # shows an Upload button: imports content from a local file
    showDownloadButton: true  # shows a Download button: exports current content to a file

  - name: config
    type: yaml
    showLoadButton: true
    showDownloadButton: true
```

{: .note }
> Il campo `list` e il tipo di modulo `subform` hanno sostituito il campo `table` e `tableFields`, rimossi nella 7.0.0.

### Come accedo ai dati del modulo padre dentro un subform?

Fai riferimento ai valori dei campi del padre dall'interno di un subform tramite `__parent__` (v6.3.0+).

Quando si apre un subform, sia da un campo **`list`** (l'editor di ogni riga) sia da un campo **`yaml`** in modalità subform, AnsibleForms inserisce automaticamente nel subform un campo speciale in sola lettura chiamato `__parent__`. Contiene un'istantanea di **ogni valore di campo del modulo padre nel momento in cui il subform è stato aperto**, comprese costanti e variabili.

Questo permette ai campi del subform di usare espressioni che fanno riferimento ai dati del padre senza nessuna configurazione aggiuntiva.

#### Cosa c'è in `__parent__`?
{: .no_toc }

`__parent__` è un oggetto semplice le cui chiavi sono i nomi dei campi del modulo padre:

```yaml
__parent__:
  environment: production          # a regular field
  region: eu-west-1
  max_nodes: 10
  owner: jane.doe                  # a constant
  default_image: ubuntu-22.04      # from varsFiles
  __user__:                        # system fields are also included
    username: jane.doe
    roles: [admin]
```

{: .note }
> `__parent__` **non viene inviato ad Ansible**; come `__user__`, viene tolto dalle extravars. È solo un aiuto lato frontend per le espressioni dentro i subform.

#### Accedere ai valori del padre nelle espressioni di un subform
{: .no_toc }

Fai riferimento ai valori del padre con la sintassi standard delle espressioni `$(...)`:

```yaml
- name: NodeConfig
  type: subform
  fields:
    - name: node_name
      type: text
      label: Node name
      required: true

    - name: image
      type: enum
      label: Image
      # default to the parent form's chosen image
      expression: "'$(__parent__.default_image)'"
      runLocal: true

    - name: is_production
      type: expression
      hide: true
      runLocal: true
      expression: "'$(__parent__.environment)' === 'production'"

    - name: node_type
      type: enum
      # only offer gpu nodes in production
      expression: |
        '$(__parent__.environment)' === 'production'
          ? ['standard', 'high-memory', 'gpu']
          : ['standard', 'high-memory']
      runLocal: true
      default: __auto__

- name: Deploy cluster
  type: ansible
  roles:
    - default
  playbook: deploy_cluster.yml
  fields:
    - name: environment
      type: enum
      values: [dev, staging, production]

    - name: default_image
      type: text
      default: ubuntu-22.04

    - name: nodes
      type: list
      subform: NodeConfig
      columns: [node_name, node_type]
```

#### Subform annidati
{: .no_toc }

`__parent__` si riferisce sempre al modulo **padre diretto**. Se annidi un `list` dentro un subform che a sua volta viene aperto da un modulo padre, il `__parent__` del subform interno contiene i dati del subform intermedio. Per raggiungere livelli più lontani, concatena riferimenti come `$(__parent__.__parent__.someField)` se anche il subform intermedio propaga il proprio `__parent__`.

### Come migro da `table` / `tableFields` a `list` / `subform`?

Il campo `table` e la proprietà `tableFields` sono stati deprecati nella 6.2.0 e rimossi nella 7.0.0, e un modulo che li usa ancora non supera la validazione. Per migrare:

1. Estrai le colonne da `tableFields` in un nuovo modulo `type: subform` con normali `formfields`
2. Sostituisci il campo `table` con un campo `list` che fa riferimento al subform tramite `subform: MySubformName`

**Prima:**
```yaml
- name: Manage users
  type: ansible
  roles:
    - default
  playbook: users.yml
  fields:
    - name: users
      type: table
      tableFields:
        - name: username
          type: text
        - name: email
          type: text
```

**Dopo:**
```yaml
- name: User
  type: subform
  fields:
    - name: username
      type: text
    - name: email
      type: text

- name: Manage users
  type: ansible
  roles:
    - default
  playbook: users.yml
  fields:
    - name: users
      type: list
      subform: User
```

#### Migrare `from` di `tableFields` a espressioni con `__parent__`
{: .no_toc }

La proprietà `from` delle colonne enum di `tableFields` riempiva le scelte del menu a tendina da un altro campo del modulo padre. In un `subform`, viene sostituita da un'`expression` che legge lo stesso valore tramite `__parent__`.

**Prima: `tableFields` con `from`:**

```yaml
- name: Manage members
  type: ansible
  roles:
    - default
  playbook: members.yml
  fields:
    - name: available_departments
      type: expression
      expression: "['HR','Engineering','Finance']"
      runLocal: true
      hide: true

    - name: members
      type: table
      tableFields:
        - name: department
          type: enum
          from: available_departments   # pulls choices from the parent field above
        - name: firstname
          type: text
```

**Dopo: subform con un'espressione `__parent__`:**

```yaml
- name: Member
  type: subform
  fields:
    - name: department
      type: enum
      # replaces "from: available_departments"
      expression: "$(__parent__.available_departments)"
      runLocal: true

    - name: firstname
      type: text

- name: Manage members
  type: ansible
  roles:
    - default
  playbook: members.yml
  fields:
    - name: available_departments
      type: expression
      expression: "['HR','Engineering','Finance']"
      runLocal: true
      hide: true

    - name: members
      type: list
      subform: Member
```

{: .note }
> `$(__parent__.available_departments)` restituisce il **valore attuale** di quel campo, quindi se quel campo è a sua volta un campo expression dinamico, il subform vede sempre l'ultimo risultato valutato dal padre.
