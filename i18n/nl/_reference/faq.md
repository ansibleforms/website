---
layout: default
title: FAQ
nav_order: 2
translated_from: 6616eaf626411a615cb68d8cc4f2a43401fe21d9
---

# Veelgestelde vragen
{: .no_toc }

Veelgestelde vragen en antwoorden over AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Aan de slag

### Deploymenttopologie: één container of meerdere nodes

Standaard draait één AnsibleForms-container de webapplicatie en het achtergrondwerk in één proces, naast een RTE-container die
de playbooks uitvoert. Draai hem met een restart policy (bijvoorbeeld `restart: unless-stopped` in Docker), en maak een back-up van zowel de database als
het persistente volume.

Om meerdere replica's achter een load balancer te draaien, splits je het proces met `AF_ROLE`:

- `app`-nodes bieden de webinterface en de API aan: draai er zoveel als je wilt, elk met hetzelfde `ACCESS_TOKEN_SECRET`
- een `worker` voert het achtergrondwerk uit: het schema en de upgrades ervan, de config seed, de planningen, de nachtelijke back-up, de synchronisatie
  van repositories en de opruimtaken. Er werkt één worker tegelijk, met een vergrendeling in de database; een tweede wacht en neemt het over als de eerste stopt
- `rte`-containers voeren de playbooks uit: draai er meer om meer playbooks tegelijk uit te voeren

De app-nodes en de worker delen de database, het persistente volume en `ENCRYPTION_SECRET`. Een RTE in een socketmodus (uitgaand of
inkomend, zie [Modi](rte/modes.html)) heeft de database noch `ENCRYPTION_SECRET` nodig. De chat-assistent heeft sticky sessions nodig, en
elke node houdt zijn eigen log bij. Zie [Schalen](production/scaling.html) en de opzet in
[examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale).

### Formulieren beheren over meerdere repositories

Formulieren uit elke Git-repository waarbij **Gebruiken voor formulieren** aan staat, worden automatisch samengevoegd; bij dubbele formuliernamen wint
de eerste en wordt een waarschuwing gelogd. Bewaar `config.yaml` in slechts één repository. Zie [Git-repositories](repositories/).

### Over repositories

AnsibleForms clonet en pullt Git-repositories onder het pad voor repositories (`REPO_PATH`), beheerd onder **Instellingen > Repositories**.
Schakelaars op elke repository bepalen wat hij bevat: configuratie, formulieren, playbooks of vars-bestanden. Zie [Git-repositories](repositories/).

### VS Code-validatie voor formulierbestanden

Voeg een schemaheader toe aan je YAML-formulierbestanden voor live validatie en autocomplete in VS Code.

Installeer de [YAML-extensie](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) en zet dit commentaar als **eerste regel** van elk formulierbestand:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
```

Dit werkt zowel voor bestanden met één formulier (een YAML-dict) als voor bestanden met meerdere formulieren (een YAML-lijst):

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

VS Code markeert onbekende eigenschappen, ontbrekende verplichte velden en onjuiste typen terwijl je typt.

---

## Jobbeheer

### Een job opnieuw starten met vooraf ingevulde gegevens

De knop voor opnieuw starten opent het formulier, vooraf ingevuld met de waarden van de eerdere job; wachtwoordvelden worden nooit opgeslagen.
Daarvoor is de rol-optie `allowJobRelaunch` nodig, en een formulier kan het uitschakelen met `allowRelaunch: false`. Zie [Een job opnieuw starten](jobs/actions.html#relaunch-a-job).

### Logbestand van een job

Volg de voortgang via een logbestand per job (v6.1.2).

AnsibleForms kan een **logbestand per job** naast de Ansible-uitvoer tonen. Zo kun je de voortgang volgen van langlopende custom modules die tijdens de uitvoering anders geen zichtbare feedback geven.

{: .note }
> Deze functie werkt alleen voor playbooks die op een RTE draaien. Templates en jobs op AWX, AAP, Ascender, Semaphore, Rundeck of
> Jenkins hebben geen logbestand.

**Hoe het werkt:**
- Tijdens een jobrun let de RTE op een logbestand op een vast pad binnen de map van het playbook
- Elke twee seconden kopieert de RTE, als het bestand is gewijzigd, de inhoud ervan naar de job, en nog één keer als het playbook eindigt
- Het logbestand wordt getoond in een sectie **Logbestand** van de uitvoer van de job, genummerd zoals de regels van de uitvoer: de tijdstempel en het niveau (ERROR, WARNING, INFO, DEBUG) van een logregel worden gelezen en gekleurd zoals die van de uitvoer, en ANSI-kleuren worden ondersteund

**Conventie voor het pad van het logbestand:**

Het logbestand moet naar dit pad worden geschreven:

```
<playbook_dir>/.joblogs/job_log_<jobid>.log
```

**AnsibleForms geeft `__jobid__` automatisch mee**, dus je kunt het pad in je playbook samenstellen zonder extra configuratie:

{% raw %}
```yaml
job_log_path: "{{ vars['playbook_dir'] }}/.joblogs/job_log_{{ __jobid__ }}.log"
```
{% endraw %}

Geef deze variabele door aan elke rol of custom module die voortgang naar het bestand moet schrijven.

**Verantwoordelijkheden van de ontwikkelaar van het playbook / de module:**
- **Maak** het logbestand (en de map `.joblogs/` ervan) aan het begin van de bewerking aan
- **Schrijf** zinvolle voortgangsberichten terwijl de bewerking verloopt

De RTE verwijdert het bestand zodra het playbook eindigt en de laatste inhoud bij de job is opgeslagen.

**ANSI-kleurcodes worden ondersteund.**  
Standaard ANSI-escapecodes (bijvoorbeeld `\033[92m` voor groen en `\033[91m` voor rood) in je logberichten worden in de UI als kleuren weergegeven, zodat je succes, waarschuwingen en fouten in één oogopslag onderscheidt.

**Typisch gebruik:**  
Een custom Python-module voor Ansible die een lange reeks API-aanroepen of gegevensbewerkingen uitvoert (bijvoorbeeld een SnapMirror DR-workflow) kan per stap één regel aan het logbestand toevoegen. Een operator die de job in AnsibleForms volgt, ziet dan live voortgang in de sectie Logbestand terwijl de jobpagina de job volgt.

### Jobid

Geef het huidige job-ID mee.

AnsibleForms stuurt het huidige job-ID automatisch mee in de extravars als `__jobid__`; er is geen configuratie nodig.

### Gebruikersinformatie

Geef de huidige gebruiker mee.

AnsibleForms stuurt de gebruikersinformatie automatisch mee in de extravars als `ansibleforms_user`; er is geen configuratie nodig.

Je kunt kiezen hoeveel ervan wordt verstuurd. `EXTRAVARS_USER_FIELDS` neemt een kommagescheiden lijst van sleutels op het hoogste niveau
(`username,email,type`), of `none` om niets te versturen; een formulier kan dit overschrijven met zijn eigen eigenschap `userExtravars`.
De standaard is het hele object, zoals voorheen. De `__user__` aan de formulierkant die hieronder wordt beschreven, komt uit het aanmeldtoken en wordt nooit beïnvloed.

### Gebruikersinformatie in het formulier

Gebruik de informatie van de huidige gebruiker in het formulier (v4.0.2).

Het veld `__user__` wordt automatisch aan het formulier toegevoegd en kan in expressies worden gebruikt:

```yaml
expression: $(__user__)
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
expression: $(__user__.roles)
```

---

## Formuliervelden

### Trapsgewijze keuzelijsten

Maak trapsgewijze keuzelijsten.

Velden van het type `enum` (keuzelijsten) kunnen placeholders bevatten in hun eigenschap `query` of `expression`, in de vorm `$(another_field)` of `$(another_field[0].name)`.  
Zodra het veld waarnaar wordt verwezen verandert, wordt het verwijzende veld opnieuw geëvalueerd, wat dynamische, trapsgewijze keuzelijsten oplevert.  
De webapplicatie aan de clientkant evalueert velden elke 100 ms opnieuw; met de huidige processors en de Chromium-engine levert dat een naadloze ervaring op.

{: .note }
> Een verwijzing naar een ander enum-veld geeft de geselecteerde waarden terug, **niet** de volledige keuzelijst. Gebruik de eigenschap `placeholderColumn` of puntnotatie zoals `$(city.name)`.  
> **Nieuw in v4.0.20**: als je placeholderColumn op "*" zet, wordt het hele record uitgevoerd in plaats van één kolom.

```yaml
- type: enum
  dbConfig: 
    name: CONN1
    type: mysql
  query: select name from cmdb.city
  name: city_name
  label: Select a city
  default: Amsterdam
  required: true
  model: cmdb.city
  group: CMDB
- type: enum
  dbConfig: 
    name: CONN1
    type: mysql
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
  dbConfig: 
    name: CONN1
    type: mysql
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
  dbConfig: 
    name: CONN1
    type: mysql
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

### Placeholders in velden

Verwijs naar de waarde van een ander veld.

Placeholders zijn verwijzingen naar andere velden in het formulier.  
Een placeholder heeft altijd de vorm `$(reference)`, en zowel expressies als queries kunnen placeholders bevatten.  
Een placeholder die naar een eenvoudig veld (text, number, password) wijst, bevat de waarde van dat veld.  
Een placeholder die naar een enum-veld op basis van objecten wijst, moet ofwel de eigenschap `placeholderColumn` gebruiken of puntnotatie zoals `$(city.name)`.  
Een placeholder die naar een expressieveld wijst, geeft het volledige object terug, of je gebruikt een geavanceerde, JavaScript-achtige verwijzing zoals `$(myarray[0].name)`.

{: .important }
> De placeholder wordt vervangen **voordat** de expressie wordt geëvalueerd. Verwacht je een string als resultaat, dan moet je hem tussen aanhalingstekens zetten.  
> **Nieuw in v4.0.20**: als je placeholderColumn op "*" zet, wordt het hele record uitgevoerd in plaats van één kolom.

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

### Een veld verbergen

Verberg een veld.

Verberg een veld met de veldeigenschap `hide`, of toon en verberg het dynamisch met de veldeigenschappen `dependencies` en `dependencyFn`.

### Velden groeperen

Groepeer velden samen in een blok.

Gebruik de veldeigenschap `group`. Velden met dezelfde groepsnaam worden in een blok gegroepeerd.

### Veldvalidatie

Valideer een veld.

Gebruik de validatie-eigenschappen van velden, zoals `regex`, `minValue` en `notIn`.

### Standaardwaarde bij een enum

Standaardwaarde van een enum.

De veldeigenschap `default` stelt een standaardwaarde in, en bij velden van het type `enum` kun je waarden zoals `__auto__` gebruiken om automatisch het eerste item te selecteren.

Voor een dynamische standaardwaarde op basis van een expressie verplaats je het standaarditem naar de top van de lijst, zoals in het volgende voorbeeld.

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

### Standaardwaarde met een expressie

Standaardwaarde met een expressie.

Voor tekst-, getal- of datumvelden stelt de eigenschap `default` een statische standaardwaarde in.

Om de standaardwaarde dynamisch te maken, op basis van een expressie, gebruik je een van twee eigenschappen:
* `editable`: gebruik de eigenschap editable om een expressieveld bewerkbaar te maken
* `evalDefault`: gebruik de eigenschap evalDefault om de standaardwaarde als expressie te evalueren

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

## Wizard en workflows

### Wat is het verschil tussen een wizard en een workflow?

Een **wizard** en een **workflow** werken allebei in stappen, maar ze werken op verschillende lagen en kunnen worden gecombineerd.

| | [`workflow`](forms/workflow.html) (Workflow) | [`wizard`](forms/wizard.html) |
|---|---|---|
| **Laag** | Uitvoering | Formulier / UI |
| **Wat het opsplitst** | De job in nodes die na elkaar, of naast elkaar, draaien | De invoer van één formulier in meerdere pagina's |
| **Resultaat** | 1 workflowjob, met een job per node (elk met een eigen playbook of template) | Aan het eind draait 1 job |
| **`type` van het formulier** | Moet `workflow` zijn | Werkt met elk formuliertype behalve `subform` |
| **Gedefinieerd door** | Een [workflowbestand](workflows/file.html) van de designer (`workflow:`) | Een lijst met verwijzingen naar [subforms](forms/subform.html) (`wizard:`) |
| **Gebruik het als** | "Doe A, dan B, dan C als aparte jobs" | "Mijn formulier heeft te veel velden voor één pagina" |

**Belangrijkste les:** een workflow gaat over *wat er draait en in welke volgorde*; `wizard` gaat over *hoe de gebruiker het formulier invult*.

{: .note }
> Het formuliertype `multistep`, met zijn `steps`, deed vóór 7 het uitvoeringsdeel. Het is verouderd sinds 7 en wordt verwijderd in
> 8: een workflow doet alles wat een multistep doet, zie [Multistep-formulieren](forms/multistep.html).

#### Alleen een workflow
{: .no_toc }

Een formulier met `type: workflow` voert een van de workflows van de designer uit. De gebruiker vult één pagina met velden in en drukt op Verzenden,
en de workflow voert zijn nodes uit, elk met de waarden van het formulier als extra vars:

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

#### Alleen een wizard
{: .no_toc }

Een blok `wizard:` op een formulier spreidt het verzamelen van invoer over meerdere pagina's. Aan het eind draait maar **één** job: de samengevoegde extravars van alle pagina's gaan naar één playbook, template of workflow.

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

Een alleen-lezen controlepagina wordt automatisch als laatste wizardpagina toegevoegd; die declareer je niet in YAML.

#### Gecombineerd (een wizard boven op een workflow)
{: .no_toc }

Een wizard kan boven op een workflowformulier worden gelegd. De gebruiker vult de wizardpagina's in en drukt op Verzenden, en **daarna**
start de workflow. Door de `defaultModel` van een wizardstap te laten overeenkomen met de
[`extra_vars_key`](workflows/file.html#ansibleforms-own-keys) van een node, kun je **één wizardpagina naar één node** sturen:

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

En de workflow `provision-host`, in een workflowbestand van de designer:

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

`extra_vars_key` zoekt op één niveau, dus gebruik een platte naam in `defaultModel` (bijvoorbeeld `defaultModel: basics`, niet `defaultModel: input.basics`) als je wilt dat ze overeenkomen.

Zie de [pagina over de wizard](forms/wizard.html) voor de volledige referentie van de eigenschappen.

### Hoe toon ik wizardstappen of sla ik ze over op basis van een voorwaarde?

Gebruik `when:` om een stap helemaal te **verbergen**, of `optional: true` om de gebruiker een zichtbare stap te laten **overslaan**. De twee staan los van elkaar en kun je doorgaans beter niet combineren.

#### `when:`: voorwaardelijke zichtbaarheid
{: .no_toc }

De stap wordt verborgen als de expressie een falsy waarde oplevert. De gebruiker ziet hem nooit, en de waarden ervan worden niet verzameld. De expressie kan eerdere stappen lezen via `__parent__.<stepname>.<field>`:

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

Alleen de pagina die bij de gekozen `kind` hoort, wordt getoond. Stappen na een verborgen stap worden automatisch opnieuw genummerd.

#### `optional: true`: een zichtbare stap laten overslaan
{: .no_toc }

De stap wordt **altijd getoond** in de stappenbalk, maar de gebruiker kan op **Volgende** drukken zonder hem in te vullen, en **Verzenden** mag ook als de pagina nooit is bezocht of afgerond:

```yaml
wizard:
  - subform: basics
    title: Basics
  - subform: advanced
    title: Advanced (optional)
    optional: true
```

De gebruiker kan de pagina Advanced openen, leeg laten, op Volgende drukken en direct doorgaan naar de controlepagina.

{: .note }
> `when:` regelt de *zichtbaarheid*; `optional:` regelt *of de pagina moet worden afgerond*. Combineer ze niet: om een pagina te laten verdwijnen, gebruik je `when:`; om haar zichtbaar maar overslaanbaar te houden, gebruik je `optional:`.

### Hoe verwijs ik naar waarden uit een eerdere wizardstap?

Gebruik `$(__parent__.<stepname>.<field>)` in een willekeurig veld van een latere stap.

De `name` van een wizardstap (standaard de naam van zijn `subform`) is de namespace waaronder de waarden ervan aan latere stappen worden aangeboden:

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

Dit is hetzelfde `__parent__`-mechanisme dat subforms van `list` en `yaml` gebruiken; zie [Hoe gebruik ik gegevens van het bovenliggende formulier in een subform?](#how-do-i-access-parent-form-data-inside-a-subform).

---

## Beveiliging en referenties

### Referenties

Geef referenties door.

Referenties kunnen op verschillende manieren worden doorgegeven:
* met de veldeigenschap `asCredential`  
* met de formuliereigenschap `credentials` (sleutel-waardeparen)
* met een extravar met de naam `__credentials__`

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

### Een verloren beheerderswachtwoord herstellen

Ben je het wachtwoord van het lokale account `admin` kwijt en is er geen andere beheerder beschikbaar, gebruik dan de herstel-optie `REINIT_ADMIN`. **Dit is geen manier om de authenticatie tijdens het draaien te omzeilen**: het dwingt alleen bij het opstarten een eenmalige reset van het lokale beheerdersaccount af, waarna de normale authenticatie verdergaat.

**Hoe het werkt**

Als `REINIT_ADMIN=1` bij het opstarten is ingesteld, doet AnsibleForms het volgende:

1. Het zorgt dat de groep `admins` bestaat (en maakt die aan als ze ontbreekt).
2. Het zoekt de lokale beheerder op (standaard gebruikersnaam `admin`, te overschrijven met `ADMIN_USERNAME`).
3. Als die bestaat, zet het het wachtwoord op de waarde van `ADMIN_PASSWORD` en koppelt het hem opnieuw aan de groep `admins`.
4. Als die niet bestaat, maakt het hem aan (zoals bij een verse installatie).
5. Het logt de actie duidelijk zichtbaar, zodat ze in de logs te zien is.

**Stappen**

1. Stop AnsibleForms.
2. Stel de omgevingsvariabelen in (gebruik een sterk wachtwoord):
   ```bash
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourNewStrongPasswordHere
   REINIT_ADMIN=1
   ```
   In Docker Compose voeg je ze toe aan het blok `environment:` van de AnsibleForms-service.
3. Start AnsibleForms en let in de logs op een regel zoals:
   ```
   REINIT_ADMIN: admin user 'admin' has been recreated. UNSET REINIT_ADMIN now.
   ```
4. Meld je aan met `admin` / `YourNewStrongPasswordHere`.
5. **Verwijder `REINIT_ADMIN` (of zet het terug op `0`)** en herstart, zodat toekomstige herstarts het beheerderswachtwoord niet opnieuw resetten.

**Opmerkingen**

- Was je buitengesloten omdat LDAP de enige ingestelde aanmeldmethode was en die faalde, dan valt het herstelde lokale account `admin` altijd terug op authenticatie via de lokale database, wat genoeg is om je aan te melden en LDAP te repareren.
- De vroegere omgevingsvariabele `ENABLE_BYPASS` is verwijderd. Die stond aanmelden als admin met elk wachtwoord toe en was onveilig om aan te laten staan. `REINIT_ADMIN` reset alleen het wachtwoord; daarna geldt de normale authenticatie.
- `REINIT_ADMIN` maakt bestaande sessies en tokens niet ongeldig; alleen de wachtwoordhash en het groepslidmaatschap veranderen.

### Bestemmingen van REST-helpers beperken (allow- en denylijsten)

De helpers `fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt` en `fn.fnRestJwtSecure` kunnen vanuit de eigenschap `expression` van een formulier worden aangeroepen om gegevens over HTTP op te halen. Standaard kunnen auteurs van expressies **elke** URL aanspreken die de AnsibleForms-host kan bereiken, wat je op een gevoelig netwerk misschien wilt beperken.

Twee omgevingsvariabelen bieden een allowlijst en een denylijst:

| Variabele | Gedrag |
|---|---|
| `REST_ALLOWED_HOSTS` | Kommagescheiden hostnamen of CIDR's. Als dit is ingesteld, zijn **alleen** deze doelen toegestaan. |
| `REST_DENIED_HOSTS` | Kommagescheiden hostnamen of CIDR's. Altijd geblokkeerd. Gaat voor de allowlijst. |

Hostnamen worden hoofdletterongevoelig vergeleken met de host van de URL. CIDR's worden vergeleken met elk IP-adres waarnaar de host wordt opgelost, dus `10.0.0.0/8` blokkeert elke DNS-naam die in het private bereik uitkomt.

**Voorbeelden:**

De eerste regel staat alleen twee hosts toe; de tweede blokkeert specifieke doelen:

```bash
# Whitelist: only your two API partners are reachable
REST_ALLOWED_HOSTS=api.example.com,partner.api.com

# Blacklist: block cloud metadata + internal admin UIs
REST_DENIED_HOSTS=169.254.169.254,127.0.0.0/8,internal-admin.example
```

{: .warning }
> **Deze bescherming geldt alleen voor het Node.js-proces van AnsibleForms.** Zodra een playbook draait, kan Ansible zelf alles bereiken vanaf de host, buiten de controle van AnsibleForms. Gebruik deze lijsten om te voorkomen dat formulierauteurs expressies tot een proxy voor metadataservices of interne UI's maken; vertrouw er niet op als netwerkfirewall.

Sinds 7.3.0 controleren de REST-helpers het TLS-certificaat van het endpoint, zoals elke andere verbinding dat doet, en geven ze het op na
[`REST_TIMEOUT_SECONDS`](customization/security.html#env_REST_TIMEOUT_SECONDS) (standaard `60`). Vertrouw een private CA met
`NODE_EXTRA_CA_CERTS`, of zet [`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) alleen op `1` voor endpoints met een
zelfondertekend certificaat.

### Integratie met HashiCorp Vault

Referenties kunnen hun gebruiker en wachtwoord uit HashiCorp Vault lezen, ingesteld als
**secret store**. Zie [Secret stores](secret-stores). De omgevingsvariabelen `VAULT_*`
van eerdere versies worden bij de eerste start van 7.x één keer geïmporteerd als de store `vault`.

Voor secrets die alleen binnen één playbook worden gebruikt, kun je ook de lookup-plugin `community.hashi_vault`
gebruiken, die rechtstreeks uit Vault leest en AnsibleForms omzeilt.

---

## Integratie

### AWX/Tower/AAP bevragen

Vraag informatie op uit AWX of Ansible Automation Platform.

Om keuzelijsten te vullen met gegevens uit AWX of Tower, gebruik je `fn.fnRestBasic` of `fn.fnRestJwtSecure`. Sinds 7.3.0 controleren deze helpers
het certificaat van het AWX-adres: bij een zelfondertekend certificaat vertrouw je de CA ervan met `NODE_EXTRA_CA_CERTS`, of zet je
[`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) op `1`.

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

## Aanpassen

### Aanpassen

Pas AnsibleForms aan.

AnsibleForms is een webapplicatie. Als je het native in Node.js draait, kun je de bestanden ervan vervangen of wijzigen.  
De aanbevolen aanpak is echter om het als Docker-image te draaien en volume- of bestandskoppelingen toe te voegen. De Docker Compose-projecten koppelen al mappen om de database, playbooks, logs, certificaten en SSH-sleutels persistent te houden, en je kunt meer koppelingen toevoegen. Een eigen logo upload je op de instellingenpagina **Logo**.  
Het bestand `custom.js` bevat je eigen JavaScript-functies voor gebruik in expressies. De ingebouwde functies gebruiken het voorvoegsel `fn.` (bijvoorbeeld fn.fnRestBasic); eigen functies gebruiken het voorvoegsel `fnc.`.  
Op dezelfde manier kun je eigen jq-definities toevoegen in het bestand `jq.custom.definitions`.

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

### YTT inschakelen

Schakel ytt in.

Om ytt te gebruiken, zet je `USE_YTT=1`.  
Zie https://carvel.dev/ytt/ voor meer informatie over ytt.

{: .important }  
> Deze functie is niet uitgebreid getest, en sinds ze als verbetering is toegevoegd, is er geen feedback over binnengekomen.  
> Als je ytt gebruikt, moet je de designer uitschakelen: de designer zet de YAML-bestanden om naar tussenliggende JSON en laat daarbij de ytt-syntaxis (die uit YAML-commentaar bestaat) vallen.

Er moet een map `lib` in de hoofdmap staan; die wordt automatisch meegenomen in de aanroep van ytt.
Gegevens kunnen globaal worden aangeleverd door omgevingsvariabelen met een voorvoegsel in te stellen:  

```bash
YTT_VARS_PREFIX=YTT_VAR
YTT_VAR_INVENTORY_PATH=/tmp/inventory.yml
YTT_VAR_default_host=localhost
```  

Je kunt ook gegevensbestanden voor bibliotheken aanleveren:

```bash
YTT_LIB_DATA_DEMO=/tmp/demo_data.yml
```  

```yaml
# /tmp/demo_data.yml
message: 'hello demo'
```

**De bibliotheek `demo` moet in de ytt-context bestaan (lib/_ytt_lib/demo/values.yml)**

```yaml
# lib/_ytt_lib/demo/values.yml
#@ data/values
---
demo: {}
```  

De geladen gegevens kunnen dan worden gebruikt:

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

## Toegangsbeheer

### Hoe beperk ik wat gebruikers kunnen doen (rol-opties)?

Naast het beperken van welke formulieren een rol kan zien, schakelen de `options` van een rol UI-functies aan of uit voor de leden ervan.
Zie [Rol-opties](config/roles.html#role-options) voor elke optie, de standaardwaarde en hoe opties over rollen heen worden gecombineerd.

### Hoe bouw ik eigen RBAC-logica in mijn playbooks of formulieren?

De identiteit van de gebruiker is bij elke uitvoering beschikbaar, zowel in de frontend als in de backend.

Bij elke verzending van een formulier voegt AnsibleForms automatisch de volledige identiteit van de huidige gebruiker toe aan de extravars die naar Ansible gaan:

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

Je playbook of een custom Ansible-module kan `ansibleforms_user` dus direct gebruiken voor fijnmazige beslissingen, bijvoorbeeld om alleen bepaalde groepen de productie-inventory te laten wijzigen, of om een audittrail met de gebruikersnaam van de indiener te schrijven.

In de **frontend** is hetzelfde object beschikbaar via het speciale veld `__user__`:

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

**Typische patronen:**

De identiteit van de gebruiker maakt patronen als de volgende mogelijk:

- **Vergelijken met een RBAC-configuratiebestand of -database**: laad een YAML- of JSON-bestand (met `fn.fnReadYamlFile` of een expressie) dat groepen aan toegestane resources koppelt, en filter dan op `$(__user__.groups)`
- **Audittrail**: geef `ansibleforms_user.username` mee als extra variabele om vast te leggen wie de job heeft gestart
- **Dynamische veldwaarden**: toon een andere set enum-keuzes, vul velden vooraf in, of verberg secties op basis van de groepen of rollen van de gebruiker
- **Autorisatie in het playbook**: controleer met een assert dat `ansibleforms_user.groups` een vereiste groep bevat voordat het playbook verdergaat, als extra verdedigingslaag die losstaat van de lijst `roles` van het formulier

{: .note }
> Het object hierboven is wat standaard wordt verstuurd. Als de instantie `EXTRAVARS_USER_FIELDS` instelt,
> of het formulier `userExtravars` instelt, worden alleen de sleutels verstuurd die daar staan, dus een playbook dat
> een assert doet op `ansibleforms_user.groups` vereist dat `groups` daar een van is. Het frontendveld
> `__user__` komt uit het aanmeldtoken en wordt door geen van beide instellingen ingekort.

---

## Jobs plannen

### Hoe plan ik een formulier om automatisch te draaien?

Open de keuzelijst naast **Verzenden** en kies **Schedule (terugkerend)** of **Later uitvoeren (eenmalig)**; daarvoor zijn de rol-opties
`allowScheduledJobs` (beheerdersniveau) en `allowPlannedJobs` nodig. Zie [Planningen](jobs/schedules.html).

### Welke cron-expressies kan ik gebruiken?

Een terugkerende planning neemt een standaard cron-expressie met 5 velden (minuut, uur, dag van de maand, maand, dag van de week).

| Expressie | Draait |
|---|---|
| `*/15 * * * *` | Elke 15 minuten |
| `0 * * * *` | Elk uur, op het hele uur |
| `0 */6 * * *` | Elke 6 uur, om 00:00, 06:00, 12:00 en 18:00 |
| `0 2 * * *` | Elke dag om 02:00 |
| `30 7 * * 1-5` | Maandag tot en met vrijdag om 07:30 |
| `0 8 * * MON` | Elke maandag om 08:00 (namen van dagen en maanden worden geaccepteerd) |
| `0 0 1 * *` | Om middernacht op de eerste dag van elke maand |
| `0 22 L * *` | Om 22:00 op de laatste dag van elke maand |
| `0 6 * * 1#1` | Om 06:00 op de eerste maandag van elke maand |
| `*/30 * * * * *` | Elke 30 seconden (een optioneel zesde veld vooraan is de seconde) |

Als zowel de dag van de maand als de dag van de week zijn ingesteld, draait de planning wanneer een van beide overeenkomt: `0 0 13 * 5` draait op
de 13e en op elke vrijdag. De server weigert een expressie die hij niet kan uitvoeren, of een die nooit kan voorkomen (`0 0 30 2 *`).

Op de pagina **Planner** beschrijft de cron-editor de expressie en toont hij een voorbeeld van de volgende runs. Hij accepteert geen bijnamen
zoals `@daily`, het jokerteken `?` of de modifier `W` (dichtstbijzijnde werkdag), dus houd je aan de vormen in de tabel.

{: .note }
> **Tijdzone** Cron-planningen draaien in de tijdzone van de server, ingesteld met [`LOG_TZ`](customization/logging.html#env_LOG_TZ)
> (standaard `UTC`), niet in de tijdzone van je profiel of je browser. `0 2 * * *` met `LOG_TZ=Europe/Madrid` draait het hele jaar om 02:00
> tijd in Madrid, en volgt de zomertijd. De cron-editor toont de volgende runs in diezelfde zone. Pull-planningen van repositories
> gebruiken dezelfde zone.

---

## Formuliergegevens opslaan en laden

### Hoe sla ik formuliergegevens op en laad ik ze opnieuw zonder een job uit te voeren?

Kies **Store** in de keuzelijst naast **Verzenden** om de veldwaarden op te slaan, en daarna **Laden uit opslag** om ze later terug te zetten.
Wachtwoordvelden worden nooit opgeslagen. Daarvoor is de rol-optie `allowStoredJobs` nodig. Zie [Opgeslagen jobs](jobs/stored-jobs.html).

---

## Geneste formulieren en gestructureerde velden

### Hoe verzamel ik gestructureerde of herhaalde gegevens in een formulier?

Gebruik velden `list` en `yaml` met subforms (6.2.0+).

Om complexe gestructureerde gegevens te verzamelen, zoals een lijst met servers, een set netwerkinterfaces of één genest object, gebruik je het veldtype `list` of `yaml` samen met een `subform`.

Een **subform** is een herbruikbaar formulierfragment (gedefinieerd met `type: subform`) dat nooit als losse tegel wordt getoond. Het bestaat alleen om naar te verwijzen vanuit velden in andere formulieren. Zie de [documentatie over subforms](forms/subform.html) voor de volledige referentie.

**Een lijst met gestructureerde rijen verzamelen: het veld `list`:**

Een veld `list` opent het subform waarnaar het verwijst één keer per rij:

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

De extravar `servers` die naar Ansible gaat, is een array van objecten: `[{hostname: "web1", ip: "10.0.0.1"}, ...]`

**Eén gestructureerd object bewerken: het veld `yaml`:**

Het veld `yaml` heeft drie modi:

| Modus | Hoe | Gedrag |
|---|---|---|
| **Editor** | standaard | Toont een volledige YAML-editor met syntaxiskleuring waarin de gebruiker direct kan typen |
| **Alleen-lezen** | `readonly: true` | Toont de YAML-waarde als opgemaakte alleen-lezen tekst, zonder bewerken |
| **Subform** | `subform: MySubform` | Verbergt de ruwe editor; opent bij een klik het subform als drilldown-editor |

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

**Uploaden en downloaden: de velden `list` en `yaml`:**

Beide veldtypen ondersteunen bestandsoverdracht aan de clientkant via twee optionele eigenschappen:

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
> Het veld `list` en het formuliertype `subform` vervangen het veld `table` en `tableFields`, die in 7.0.0 zijn verwijderd.

### Hoe gebruik ik gegevens van het bovenliggende formulier in een subform?

Verwijs vanuit een subform naar veldwaarden van het bovenliggende formulier via `__parent__` (v6.3.0+).

Als een subform opent, vanuit een veld **`list`** (elke rij-editor) of een veld **`yaml`** in subformmodus, voegt AnsibleForms automatisch een speciaal alleen-lezen veld `__parent__` aan het subform toe. Het bevat een momentopname van **elke veldwaarde in het bovenliggende formulier op het moment dat het subform werd geopend**, inclusief constanten en vars.

Zo kunnen velden van een subform expressies gebruiken die naar gegevens van het bovenliggende formulier verwijzen, zonder extra configuratie.

#### Wat zit er in `__parent__`?
{: .no_toc }

`__parent__` is een gewoon object waarvan de sleutels de veldnamen van het bovenliggende formulier zijn:

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
> `__parent__` wordt **niet naar Ansible gestuurd**; net als `__user__` wordt het uit de extravars gehaald. Het is puur een hulpmiddel in de frontend voor expressies binnen subforms.

#### Waarden van het bovenliggende formulier gebruiken in expressies van een subform
{: .no_toc }

Verwijs naar waarden van het bovenliggende formulier met de standaard expressiesyntaxis `$(...)`:

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

#### Geneste subforms
{: .no_toc }

`__parent__` verwijst altijd naar het **direct bovenliggende** formulier. Als je een `list` nest in een subform dat zelf vanuit een bovenliggend formulier wordt geopend, bevat de `__parent__` van het binnenste subform de gegevens van het middelste subform. Om verdere niveaus te bereiken, keten je verwijzingen zoals `$(__parent__.__parent__.someField)`, als het middelste subform ook zijn eigen `__parent__` doorgeeft.

### Hoe migreer ik van `table` / `tableFields` naar `list` / `subform`?

Het veld `table` en de eigenschap `tableFields` zijn verouderd sinds 6.2.0 en verwijderd in 7.0.0, en een formulier dat ze nog gebruikt, komt niet door de validatie. Om te migreren:

1. Haal de kolommen uit `tableFields` naar een nieuw formulier met `type: subform` en gewone `formfields`
2. Vervang het veld `table` door een veld `list` dat via `subform: MySubformName` naar het subform verwijst

**Voor:**
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

**Na:**
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

#### `from` in `tableFields` migreren naar expressies met `__parent__`
{: .no_toc }

De eigenschap `from` van enum-kolommen in `tableFields` vulde de keuzes van een keuzelijst vanuit een ander veld in het bovenliggende formulier. In een `subform` wordt die vervangen door een `expression` die dezelfde waarde via `__parent__` leest.

**Voor: `tableFields` met `from`:**

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

**Na: subform met een expressie op `__parent__`:**

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
> `$(__parent__.available_departments)` geeft de **huidige waarde** van dat veld terug, dus als dat veld zelf een dynamisch expressieveld is, ziet het subform altijd het laatst geëvalueerde resultaat van het bovenliggende formulier.
