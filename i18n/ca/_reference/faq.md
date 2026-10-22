---
layout: default
title: PMF
nav_order: 2
translated_from: 6616eaf626411a615cb68d8cc4f2a43401fe21d9
---

# Preguntes més freqüents
{: .no_toc }

Preguntes i respostes habituals sobre AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Primers passos

### Topologia del desplegament: un contenidor o diversos nodes

Per defecte, un contenidor d'AnsibleForms executa l'aplicació web i la feina en segon pla en un sol procés, al costat d'un contenidor d'RTE que
executa els playbooks. Executa'l amb una política de reinici (per exemple `restart: unless-stopped` a Docker), i fes còpia de seguretat tant de la base de dades com
del volum persistent.

Per executar diverses rèpliques darrere d'un balancejador de càrrega, divideix el procés amb `AF_ROLE`:

- els nodes `app` serveixen la interfície web i l'API: executa'n tants com vulguis, cadascun amb el mateix `ACCESS_TOKEN_SECRET`
- un `worker` executa la feina en segon pla: l'esquema i les seves actualitzacions, el config seed, les programacions, la còpia de seguretat nocturna, les
  sincronitzacions de repositoris i les neteges. Només treballa un worker alhora, amb un bloqueig a la base de dades; un segon espera i pren el relleu quan el primer s'atura
- els contenidors `rte` executen els playbooks: executa'n més per executar més playbooks alhora

Els nodes d'aplicació i el worker comparteixen la base de dades, el volum persistent i `ENCRYPTION_SECRET`. Un RTE en un mode de socket (outbound o
inbound, consulta [Modes](rte/modes.html)) no necessita ni la base de dades ni `ENCRYPTION_SECRET`. L'assistent de xat necessita sessions persistents (sticky sessions), i
cada node manté el seu propi registre. Consulta [Escalat](production/scaling.html) i la configuració
[examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale).

### Gestió de formularis en diversos repositoris

Els formularis de tots els repositoris git amb **Utilitzar per als formularis ?** activat es fusionen automàticament; si hi ha noms de formulari duplicats, guanya
el primer i es registra un avís. Mantén `config.yaml` en un sol repositori. Consulta [Repositoris git](repositories/).

### Sobre els repositoris

AnsibleForms clona i fa pull dels repositoris git sota la ruta de repositoris (`REPO_PATH`), que es gestionen a **Configuració > Repositoris**.
Els interruptors de cada repositori defineixen què conté: configuració, formularis, playbooks o fitxers de variables. Consulta [Repositoris git](repositories/).

### Validació a VS Code dels fitxers de formulari

Afegeix una capçalera d'esquema als fitxers YAML dels teus formularis per tenir validació en directe i autocompletat a VS Code.

Instal·la l'[extensió YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) i afegeix aquest comentari com a **primera línia** de qualsevol fitxer de formulari:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
```

Això funciona tant per als fitxers d'un sol formulari (un diccionari YAML) com per als de diversos formularis (una llista YAML):

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

VS Code ressalta les propietats desconegudes, els camps obligatoris que falten i els tipus incorrectes mentre escrius.

---

## Gestió de tasques

### Rellançar una tasca amb les dades emplenades

El botó de rellançar obre el formulari emplenat amb els valors de la tasca anterior; els camps de contrasenya mai es desen.
Necessita l'opció de rol `allowJobRelaunch`, i un formulari el pot desactivar amb `allowRelaunch: false`. Consulta [Rellançar una tasca](jobs/actions.html#relaunch-a-job).

### Fitxer de registre de la tasca

Segueix el progrés mitjançant un fitxer de registre propi de la tasca (v6.1.2).

AnsibleForms pot mostrar un **fitxer de registre propi de la tasca** al costat de la sortida d'Ansible. Això et permet seguir el progrés de mòduls personalitzats de llarga durada que altrament no donarien cap senyal visible durant l'execució.

{: .note }
> Aquesta funció només funciona per als playbooks que s'executen en un RTE. Les plantilles i els jobs a AWX, AAP, Ascender, Semaphore, Rundeck o
> Jenkins no tenen fitxer de registre.

**Com funciona:**
- Durant l'execució d'una tasca, l'RTE vigila un fitxer de registre en una ruta coneguda dins de la carpeta del playbook
- Cada dos segons, quan el fitxer ha canviat, l'RTE en copia el contingut a la tasca, i una vegada més quan el playbook acaba
- El fitxer de registre es mostra en una secció **Fitxer de registre** de la sortida de la tasca, numerada com les línies de la sortida : la marca de temps i el nivell (ERROR, WARNING, INFO, DEBUG) d'una línia del registre es llegeixen i s'acoloreixen com els de la sortida, i s'admeten els colors ANSI

**Convenció de la ruta del fitxer de registre:**

El fitxer de registre s'ha d'escriure en aquesta ruta:

```
<playbook_dir>/.joblogs/job_log_<jobid>.log
```

**AnsibleForms passa `__jobid__` automàticament**, així que pots construir la ruta al teu playbook sense cap configuració addicional:

{% raw %}
```yaml
job_log_path: "{{ vars['playbook_dir'] }}/.joblogs/job_log_{{ __jobid__ }}.log"
```
{% endraw %}

Passa aquesta variable a qualsevol rol o mòdul personalitzat que hagi d'escriure el progrés al fitxer.

**Responsabilitats del desenvolupador del playbook / mòdul:**
- **Crear** el fitxer de registre (i el seu directori `.joblogs/`) a l'inici de l'operació
- **Escriure** missatges de progrés útils a mesura que avança l'operació

L'RTE suprimeix el fitxer un cop el playbook acaba i el darrer contingut s'ha desat a la tasca.

**S'admeten els codis de color ANSI.**  
Els codis d'escapament ANSI estàndard (per exemple, `\033[92m` per al verd i `\033[91m` per al vermell) dels teus missatges de registre es mostren com a colors a la interfície, així que els estats d'èxit, avís i error es distingeixen d'un cop d'ull.

**Cas d'ús típic:**  
Un mòdul d'Ansible personalitzat en Python que fa una llarga seqüència de crides a API o d'operacions de dades (per exemple, un workflow de DR amb SnapMirror) pot afegir una línia per pas al fitxer de registre. Un operador que segueix la tasca a AnsibleForms veu aleshores el progrés en directe a la secció Fitxer de registre mentre la pàgina de la tasca la segueix.

### Jobid

Passar l'ID de la tasca actual.

AnsibleForms envia automàticament l'ID de la tasca actual a les extravars com a `__jobid__`; no cal cap configuració.

### Informació de l'usuari

Passar l'usuari actual.

AnsibleForms envia automàticament la informació de l'usuari a les extravars com a `ansibleforms_user`; no cal cap configuració.

Pots triar quanta s'envia. `EXTRAVARS_USER_FIELDS` accepta una llista de claus de primer nivell separades per comes
(`username,email,type`), o `none` per no enviar res; un formulari la pot substituir amb la seva pròpia propietat `userExtravars`.
El valor predeterminat és l'objecte complet, com abans. El `__user__` del costat del formulari que es descriu a continuació ve del token d'inici de sessió i mai no es veu afectat.

### Informació de l'usuari al formulari

Accedir a la informació de l'usuari actual al formulari (v4.0.2).

El camp `__user__` s'afegeix automàticament al formulari i es pot referenciar a les expressions:

```yaml
expression: $(__user__)
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
expression: $(__user__.roles)
```

---

## Camps de formulari

### Desplegables encadenats

Crear desplegables encadenats.

Els camps `enum` (desplegables) poden contenir marcadors a la seva propietat `query` o `expression`, amb el format `$(another_field)` o `$(another_field[0].name)`.  
Tan bon punt canvia el camp referenciat, el camp que el referencia es torna a avaluar, cosa que dona desplegables dinàmics i encadenats.  
L'aplicació web client torna a avaluar els camps cada 100 ms; amb els processadors actuals i el motor Chromium, això dona una experiència fluida.

{: .note }
> Una referència a un altre camp enum retorna els valors seleccionats, **no** la llista completa del desplegable. Fes servir la propietat `placeholderColumn` o la notació amb punts com ara `$(city.name)`.  
> **Novetat a la v4.0.20**: posar placeholderColumn a "*" retorna el registre complet en lloc d'una sola columna.

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

### Marcadors de camp

Fer referència al valor d'un altre camp.

Els marcadors són referències a altres camps del formulari.  
Un marcador sempre té el format `$(reference)`, i tant les expressions com les consultes poden contenir marcadors.  
Un marcador que apunta a un camp simple (text, número, contrasenya) conté el valor d'aquest camp.  
Un marcador que apunta a un camp enum basat en objectes ha de fer servir la propietat `placeholderColumn` o la notació amb punts com ara `$(city.name)`.  
Un marcador que apunta a un camp d'expressió retorna l'objecte complet, o pots fer servir una referència avançada, semblant a JavaScript, com ara `$(myarray[0].name)`.

{: .important }
> El marcador se substitueix **abans** que s'avaluï l'expressió. Si esperes que el resultat sigui una cadena, l'has d'envoltar amb cometes.  
> **Novetat a la v4.0.20**: posar placeholderColumn a "*" retorna el registre complet en lloc d'una sola columna.

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

### Ocultar un camp

Ocultar un camp.

Oculta un camp amb la propietat de camp `hide`, o mostra'l i oculta'l dinàmicament amb les propietats de camp `dependencies` i `dependencyFn`.

### Agrupar camps

Agrupar camps en un bloc.

Fes servir la propietat de camp `group`. Els camps amb el mateix nom de grup s'agrupen en un bloc.

### Validació de camps

Validar un camp.

Fes servir les propietats de validació dels camps, com ara `regex`, `minValue` i `notIn`.

### Valor predeterminat en un enum

Valor predeterminat d'un enum.

La propietat de camp `default` defineix un valor predeterminat, i als camps `enum` pots fer servir valors com ara `__auto__` per seleccionar automàticament el primer element.

Per a un valor predeterminat dinàmic basat en una expressió, mou l'element predeterminat al principi de la llista, com a l'exemple següent.

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

### Valor predeterminat amb una expressió

Valor predeterminat d'una expressió.

Per als camps de text, número o data, la propietat `default` defineix un valor predeterminat estàtic.

Per fer que el valor predeterminat sigui dinàmic, basat en una expressió, fes servir una d'aquestes dues propietats:
* `editable`: fes servir la propietat editable per fer editable un camp d'expressió
* `evalDefault`: fes servir la propietat evalDefault per avaluar el valor predeterminat com una expressió

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

## Assistent (wizard) i workflows

### Quina diferència hi ha entre un wizard i un workflow?

Un **wizard** i un **workflow** tots dos es presenten en passos, però actuen en capes diferents i es poden combinar.

| | [`workflow`](forms/workflow.html) (Workflow) | [`wizard`](forms/wizard.html) |
|---|---|---|
| **Capa** | Execució | Formulari / interfície |
| **Què divideix** | La tasca en nodes que s'executen l'un darrere l'altre, o en paral·lel | L'entrada d'un formulari en diverses pàgines |
| **Resultat** | 1 tasca de workflow, amb una tasca per node (cadascuna amb el seu propi playbook o plantilla) | 1 tasca s'executa al final |
| **`type` del formulari** | Ha de ser `workflow` | Funciona amb tots els tipus de formulari excepte `subform` |
| **Es defineix amb** | Un [fitxer de workflow](workflows/file.html) del dissenyador (`workflow:`) | Una llista de referències a [subforms](forms/subform.html) (`wizard:`) |
| **Fes-lo servir quan** | "Fes A, després B, després C com a tasques separades" | "El meu formulari té massa camps per a una sola pàgina" |

**Idea clau:** un workflow tracta de *què s'executa i en quin ordre*; `wizard` tracta de *com emplena el formulari l'usuari*.

{: .note }
> El tipus de formulari `multistep`, amb els seus `steps`, feia la part d'execució abans de la 7. És obsolet des de la 7 i s'elimina a la
> 8: un workflow fa tot el que fa un multistep, consulta [Formularis de diversos passos](forms/multistep.html).

#### Només workflow
{: .no_toc }

Un formulari `type: workflow` executa un dels workflows del dissenyador. L'usuari emplena una sola pàgina de camps i prem Envia,
i el workflow executa els seus nodes, cadascun amb els valors del formulari com a extra vars:

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

#### Només wizard
{: .no_toc }

Un bloc `wizard:` en un formulari reparteix la recollida de dades en diverses pàgines. Al final només s'executa **una** tasca: les extravars fusionades de totes les pàgines s'envien a un sol playbook, plantilla o workflow.

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

S'afegeix automàticament una pàgina de revisió de només lectura com a darrera pàgina del wizard; no la declares al YAML.

#### Combinats (wizard sobre un workflow)
{: .no_toc }

Un wizard es pot posar a sobre d'un formulari de workflow. L'usuari emplena les pàgines del wizard i prem Envia, i **aleshores**
s'inicia el workflow. Fent coincidir el `defaultModel` d'un pas del wizard amb l'
[`extra_vars_key`](workflows/file.html#ansibleforms-own-keys) d'un node, pots encaminar **una pàgina del wizard a un node**:

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

I el workflow `provision-host`, en un fitxer de workflow del dissenyador:

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

`extra_vars_key` és una cerca d'un sol nivell, així que fes servir un nom pla a `defaultModel` (per exemple, `defaultModel: basics`, no `defaultModel: input.basics`) quan vulguis que coincideixin.

Consulta la [pàgina del wizard](forms/wizard.html) per a la referència completa de propietats.

### Com mostro o omet passos del wizard segons una condició?

Fes servir `when:` per **ocultar** completament un pas, o `optional: true` per deixar que l'usuari **se salti** un pas visible. Les dues opcions són independents i en general no s'han de combinar.

#### `when:`: visibilitat condicional
{: .no_toc }

El pas s'oculta quan l'expressió s'avalua com un valor fals. L'usuari no el veu mai, i els seus valors no es recullen. L'expressió pot llegir passos anteriors mitjançant `__parent__.<stepname>.<field>`:

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

Només es mostra la pàgina que correspon al `kind` triat. Els passos posteriors a un d'ocult es tornen a numerar automàticament.

#### `optional: true`: permetre saltar-se un pas visible
{: .no_toc }

El pas **sempre es mostra** a l'indicador de passos, però l'usuari pot prémer **Següent** sense emplenar-lo, i **Envia** es permet encara que la pàgina no s'hagi visitat ni completat mai:

```yaml
wizard:
  - subform: basics
    title: Basics
  - subform: advanced
    title: Advanced (optional)
    optional: true
```

L'usuari pot obrir la pàgina Advanced, deixar-la buida, prémer Següent i anar directament a la pàgina de revisió.

{: .note }
> `when:` controla la *visibilitat*; `optional:` controla *si la pàgina s'ha de completar*. No els combinis: per fer desaparèixer una pàgina, fes servir `when:`; per mantenir-la visible però opcional, fes servir `optional:`.

### Com faig referència a valors d'un pas anterior del wizard?

Fes servir `$(__parent__.<stepname>.<field>)` dins de qualsevol camp d'un pas posterior.

El `name` d'un pas del wizard (per defecte el nom del seu `subform`) és l'espai de noms sota el qual s'exposen els seus valors als passos posteriors:

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

És el mateix mecanisme `__parent__` que fan servir els subforms de `list` i `yaml`; consulta [Com accedeixo a les dades del formulari pare dins d'un subform?](#how-do-i-access-parent-form-data-inside-a-subform).

---

## Seguretat i credencials

### Credencials

Passar credencials.

Les credencials es poden passar de diverses maneres:
* amb la propietat de camp `asCredential`  
* amb la propietat de formulari `credentials` (parells clau-valor)
* amb una extravar anomenada `__credentials__`

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

### Recuperar una contrasenya d'administrador perduda

Si has perdut la contrasenya del compte local `admin` i no hi ha cap altre usuari administrador disponible, fes servir l'opció de recuperació `REINIT_ADMIN`. **No és una manera d'eludir l'autenticació en temps d'execució**: només força un restabliment puntual del compte d'administrador local en iniciar-se, i després l'autenticació funciona amb normalitat.

**Com funciona**

Quan `REINIT_ADMIN=1` està definit en iniciar-se, AnsibleForms:

1. Assegura que existeix el grup `admins` (i el crea si falta).
2. Busca l'usuari administrador local (nom d'usuari predeterminat `admin`, que es pot canviar amb `ADMIN_USERNAME`).
3. Si existeix, en restableix la contrasenya amb el valor d'`ADMIN_PASSWORD` i el torna a afegir al grup `admins`.
4. Si no existeix, el crea (com en una instal·lació nova).
5. Registra l'acció de manera destacada perquè sigui visible als registres.

**Passos**

1. Atura AnsibleForms.
2. Defineix les variables d'entorn (fes servir una contrasenya robusta):
   ```bash
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourNewStrongPasswordHere
   REINIT_ADMIN=1
   ```
   A Docker Compose, afegeix-les al bloc `environment:` del servei d'AnsibleForms.
3. Inicia AnsibleForms i vigila als registres una línia com ara:
   ```
   REINIT_ADMIN: admin user 'admin' has been recreated. UNSET REINIT_ADMIN now.
   ```
4. Inicia sessió amb `admin` / `YourNewStrongPasswordHere`.
5. **Treu `REINIT_ADMIN` (o torna'l a posar a `0`)** i reinicia, perquè els reinicis futurs no tornin a restablir la contrasenya de l'administrador.

**Notes**

- Si t'havies quedat fora perquè LDAP era l'únic mètode d'inici de sessió configurat i fallava, el compte local `admin` recuperat sempre fa servir l'autenticació de la base de dades local, que és suficient per iniciar sessió i arreglar LDAP.
- S'ha eliminat l'antiga variable d'entorn `ENABLE_BYPASS`. Permetia iniciar sessió com a administrador amb qualsevol contrasenya i era insegur deixar-la activada. `REINIT_ADMIN` només restableix la contrasenya; després s'aplica l'autenticació normal.
- `REINIT_ADMIN` no invalida les sessions ni els tokens existents; només canvien el hash de la contrasenya i la pertinença al grup.

### Restringir les destinacions dels helpers REST (llistes de permesos i denegats)

Els helpers `fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt` i `fn.fnRestJwtSecure` es poden cridar des de les propietats `expression` dels formularis per obtenir dades per HTTP. Per defecte, els autors d'expressions poden apuntar a **qualsevol** URL a què pugui arribar l'host d'AnsibleForms, cosa que potser vols limitar en una xarxa sensible.

Dues variables d'entorn proporcionen una llista de permesos i una llista de denegats:

| Variable | Comportament |
|---|---|
| `REST_ALLOWED_HOSTS` | Noms d'host o CIDR separats per comes. Quan està definida, **només** es permeten aquestes destinacions. |
| `REST_DENIED_HOSTS` | Noms d'host o CIDR separats per comes. Sempre es bloquegen. Té prioritat sobre la llista de permesos. |

Els noms d'host es comparen amb l'host de l'URL sense distingir majúscules i minúscules. Els CIDR es comparen amb cada IP a què es resol l'host, així que `10.0.0.0/8` bloqueja qualsevol nom DNS que es resolgui dins del rang privat.

**Exemples:**

La primera línia només permet dos hosts; la segona bloqueja destinacions concretes:

```bash
# Whitelist: only your two API partners are reachable
REST_ALLOWED_HOSTS=api.example.com,partner.api.com

# Blacklist: block cloud metadata + internal admin UIs
REST_DENIED_HOSTS=169.254.169.254,127.0.0.0/8,internal-admin.example
```

{: .warning }
> **Aquesta protecció només protegeix el procés Node.js d'AnsibleForms.** Un cop s'executa un playbook, el mateix Ansible pot arribar a qualsevol cosa des de l'host, fora del control d'AnsibleForms. Fes servir aquestes llistes per evitar que els autors de formularis converteixin les expressions en un proxy cap a serveis de metadades o interfícies internes; no t'hi refiïs com a tallafoc de xarxa.

Des de la 7.3.0 els helpers REST comproven el certificat TLS de l'endpoint, com fan totes les altres connexions, i desisteixen després de
[`REST_TIMEOUT_SECONDS`](customization/security.html#env_REST_TIMEOUT_SECONDS) (`60` per defecte). Confia en una CA privada amb
`NODE_EXTRA_CA_CERTS`, o posa [`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) a `1` només per a endpoints amb un
certificat autosignat.

### Integració amb HashiCorp Vault

Les credencials poden llegir el seu usuari i contrasenya de HashiCorp Vault, configurat com a
**magatzem de secrets**. Consulta [Magatzems de secrets](secret-stores). Les variables d'entorn `VAULT_*`
de versions anteriors s'importen una vegada com el magatzem `vault` en el primer inici de la 7.x.

Per a secrets que només es fan servir dins d'un playbook, també pots fer servir el plugin de lookup `community.hashi_vault`,
que llegeix directament de Vault i passa per alt AnsibleForms.

---

## Integració

### Consultar AWX/Tower/AAP

Consultar informació d'AWX o d'Ansible Automation Platform.

Per emplenar desplegables amb dades d'AWX o Tower, fes servir `fn.fnRestBasic` o `fn.fnRestJwtSecure`. Des de la 7.3.0 aquests helpers comproven
el certificat de l'adreça d'AWX: amb un d'autosignat, confia en la seva CA amb `NODE_EXTRA_CA_CERTS`, o posa
[`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) a `1`.

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

## Personalització

### Personalització

Personalitzar AnsibleForms.

AnsibleForms és una aplicació web. Quan l'executes de manera nativa amb Node.js, en pots substituir o canviar els fitxers.  
Tanmateix, la manera recomanada és executar-la com una imatge de Docker i afegir-hi muntatges de volums o de fitxers. Els projectes de Docker Compose ja munten directoris per mantenir persistents la base de dades, els playbooks, els registres, els certificats i les claus SSH, i pots afegir-hi més muntatges. Un logotip propi es puja a la pàgina de configuració **Logotip**.  
El fitxer `custom.js` conté les teves pròpies funcions de JavaScript per fer-les servir a les expressions. Les funcions integrades fan servir el prefix `fn.` (per exemple, fn.fnRestBasic); les funcions personalitzades fan servir el prefix `fnc.`.  
De la mateixa manera, pots afegir les teves pròpies definicions de jq al fitxer `jq.custom.definitions`.

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

### Activar YTT

Activar ytt.

Per fer servir ytt, defineix `USE_YTT=1`.  
Per a més informació sobre ytt, consulta https://carvel.dev/ytt/.

{: .important }  
> Aquesta funció no s'ha provat a fons, i no s'ha rebut cap comentari des que es va afegir com a millora.  
> Quan facis servir ytt, has de desactivar el dissenyador: el dissenyador converteix els fitxers YAML a JSON intermedi i elimina la sintaxi de ytt (que consisteix en comentaris YAML).

Ha d'existir un directori `lib` al directori arrel; s'inclou automàticament a la crida de ytt.
Es poden proporcionar dades globalment definint variables d'entorn amb prefix:  

```bash
YTT_VARS_PREFIX=YTT_VAR
YTT_VAR_INVENTORY_PATH=/tmp/inventory.yml
YTT_VAR_default_host=localhost
```  

Alternativament, proporciona fitxers de dades de biblioteca:

```bash
YTT_LIB_DATA_DEMO=/tmp/demo_data.yml
```  

```yaml
# /tmp/demo_data.yml
message: 'hello demo'
```

**La biblioteca `demo` ha d'existir al context de ytt (lib/_ytt_lib/demo/values.yml)**

```yaml
# lib/_ytt_lib/demo/values.yml
#@ data/values
---
demo: {}
```  

Aleshores es poden fer servir les dades carregades:

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

## Control d'accés

### Com restringeixo el que poden fer els usuaris (opcions de rol)?

A més de restringir quins formularis pot veure un rol, les `options` d'un rol activen o desactiven funcions de la interfície per als seus membres.
Consulta [Opcions de rol](config/roles.html#role-options) per a cada opció, el seu valor predeterminat i com es combinen les opcions entre rols.

### Com implemento una lògica RBAC pròpia als meus playbooks o formularis?

La identitat de l'usuari està disponible tant al frontend com al backend a cada execució.

A cada enviament d'un formulari, AnsibleForms injecta automàticament la identitat completa de l'usuari actual a les extravars que s'envien a Ansible:

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

El teu playbook o qualsevol mòdul d'Ansible personalitzat pot, per tant, fer servir `ansibleforms_user` directament per a decisions detallades, per exemple per permetre només a certs grups modificar l'inventari de producció, o per escriure una traça d'auditoria amb el nom d'usuari de qui l'envia.

Al **frontend**, el mateix objecte està disponible a través del camp especial `__user__`:

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

**Patrons habituals:**

La identitat de l'usuari admet patrons com els següents:

- **Creuar dades amb un fitxer de configuració RBAC o una base de dades**: carrega un fitxer YAML o JSON (amb `fn.fnReadYamlFile` o una expressió) que relacioni grups amb recursos permesos, i després filtra per `$(__user__.groups)`
- **Traça d'auditoria**: passa `ansibleforms_user.username` com a variable extra per registrar qui ha llançat la tasca
- **Valors de camp dinàmics**: mostra un conjunt diferent d'opcions d'enum, emplena camps per avançat o oculta seccions segons els grups o els rols de l'usuari
- **Autorització al costat del playbook**: comprova que `ansibleforms_user.groups` conté un grup obligatori abans que el playbook continuï, com a comprovació de defensa en profunditat independent de la llista `roles` del formulari

{: .note }
> L'objecte anterior és el que s'envia per defecte. Si la instància defineix `EXTRAVARS_USER_FIELDS`,
> o el formulari defineix `userExtravars`, només s'envien les claus que s'hi indiquen, així que un playbook que
> comprova `ansibleforms_user.groups` necessita que `groups` en sigui una. El camp `__user__`
> del frontend ve del token d'inici de sessió i cap d'aquests paràmetres no el retalla mai.

---

## Programació de tasques

### Com programo un formulari perquè s'executi automàticament?

Obre el desplegable que hi ha al costat d'**Envia** i tria **Programa (recurrent)** o **Executa més tard (una vegada)**; necessiten les opcions de rol
`allowScheduledJobs` (de nivell d'administrador) i `allowPlannedJobs`. Consulta [Programacions](jobs/schedules.html).

### Quines expressions cron puc fer servir?

Una programació recurrent accepta una expressió cron estàndard de 5 camps (minut, hora, dia del mes, mes, dia de la setmana).

| Expressió | S'executa |
|---|---|
| `*/15 * * * *` | Cada 15 minuts |
| `0 * * * *` | Cada hora, en punt |
| `0 */6 * * *` | Cada 6 hores, a les 00:00, 06:00, 12:00 i 18:00 |
| `0 2 * * *` | Cada dia a les 02:00 |
| `30 7 * * 1-5` | De dilluns a divendres a les 07:30 |
| `0 8 * * MON` | Cada dilluns a les 08:00 (s'accepten els noms dels dies i dels mesos) |
| `0 0 1 * *` | A mitjanit el primer dia de cada mes |
| `0 22 L * *` | A les 22:00 el darrer dia de cada mes |
| `0 6 * * 1#1` | A les 06:00 el primer dilluns de cada mes |
| `*/30 * * * * *` | Cada 30 segons (un sisè camp opcional al davant són els segons) |

Quan es defineixen tant el dia del mes com el dia de la setmana, la programació s'executa quan coincideix qualsevol dels dos: `0 0 13 * 5` s'executa
el dia 13 i cada divendres. El servidor rebutja una expressió que no pot executar, o una que no es pot donar mai (`0 0 30 2 *`).

A la pàgina **Programacions**, l'editor de cron descriu l'expressió i en previsualitza les properes execucions. No accepta àlies
com ara `@daily`, el comodí `?` ni el modificador `W` (dia laborable més proper), així que limita't a les formes de la taula.

{: .note }
> **Zona horària** Les programacions cron s'executen a la zona horària del servidor, definida amb [`LOG_TZ`](customization/logging.html#env_LOG_TZ)
> (per defecte `UTC`), no a la zona horària del teu perfil o del teu navegador. `0 2 * * *` amb `LOG_TZ=Europe/Madrid` s'executa a les 02:00
> hora de Madrid tot l'any, seguint l'horari d'estiu. L'editor de cron previsualitza les properes execucions en aquesta mateixa zona. Les programacions de pull
> dels repositoris fan servir la mateixa zona.

---

## Desar i carregar dades de formularis

### Com deso i torno a carregar les dades d'un formulari sense executar cap tasca?

Tria **Desa** al desplegable que hi ha al costat d'**Envia** per desar els valors dels camps, i després **Carrega des de les desades** per restaurar-los més endavant.
Els camps de contrasenya mai es desen. Necessita l'opció de rol `allowStoredJobs`. Consulta [Tasques desades](jobs/stored-jobs.html).

---

## Formularis niats i camps estructurats

### Com recullo dades estructurades o repetides en un formulari?

Fes servir camps `list` i `yaml` amb subforms (6.2.0+).

Per recollir dades estructurades complexes, com ara una llista de servidors, un conjunt d'interfícies de xarxa o un sol objecte niat, fes servir el tipus de camp `list` o `yaml` juntament amb un `subform`.

Un **subform** és un fragment de formulari reutilitzable (definit amb `type: subform`) que mai es mostra com un mosaic independent. Només existeix perquè el referenciïn camps d'altres formularis. Consulta la [documentació de subform](forms/subform.html) per a la referència completa.

**Recollir una llista de files estructurades: camp `list`:**

Un camp `list` obre el subform referenciat una vegada per fila:

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

L'extravar `servers` que s'envia a Ansible és un array d'objectes: `[{hostname: "web1", ip: "10.0.0.1"}, ...]`

**Editar un sol objecte estructurat: camp `yaml`:**

El camp `yaml` té tres modes:

| Mode | Com | Comportament |
|---|---|---|
| **Editor** | per defecte | Mostra un editor YAML complet amb ressaltat de sintaxi on l'usuari pot escriure directament |
| **Només lectura** | `readonly: true` | Mostra el valor YAML com a text formatat de només lectura, sense edició |
| **Subform** | `subform: MySubform` | Amaga l'editor en brut; en fer-hi clic, obre el subform com un editor desplegable |

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

**Pujada i baixada: camps `list` i `yaml`:**

Tots dos tipus de camp admeten la transferència de fitxers al costat del client mitjançant dues propietats opcionals:

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
> El camp `list` i el tipus de formulari `subform` han substituït el camp `table` i `tableFields`, que es van eliminar a la 7.0.0.

### Com accedeixo a les dades del formulari pare dins d'un subform?

Fes referència als valors dels camps del pare des d'un subform mitjançant `__parent__` (v6.3.0+).

Quan s'obre un subform, tant des d'un camp **`list`** (l'editor de cada fila) com des d'un camp **`yaml`** en mode subform, AnsibleForms injecta automàticament al subform un camp especial de només lectura anomenat `__parent__`. Conté una instantània de **tots els valors dels camps del formulari pare en el moment d'obrir el subform**, incloses les constants i les variables.

Això permet que els camps del subform facin servir expressions que referencien dades del pare sense cap configuració addicional.

#### Què hi ha a `__parent__`?
{: .no_toc }

`__parent__` és un objecte simple les claus del qual són els noms dels camps del formulari pare:

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
> `__parent__` **no s'envia a Ansible**; com `__user__`, s'elimina de les extravars. És purament una ajuda del frontend per a les expressions dins dels subforms.

#### Accedir als valors del pare a les expressions d'un subform
{: .no_toc }

Fes referència als valors del pare amb la sintaxi d'expressió estàndard `$(...)`:

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

#### Subforms niats
{: .no_toc }

`__parent__` sempre fa referència al formulari pare **immediat**. Si nies un `list` dins d'un subform que al seu torn s'obre des d'un formulari pare, el `__parent__` del subform interior conté les dades del subform del mig. Per arribar a nivells superiors, encadena referències com ara `$(__parent__.__parent__.someField)` si el subform del mig també propaga el seu propi `__parent__`.

### Com migro de `table` / `tableFields` a `list` / `subform`?

El camp `table` i la propietat `tableFields` es van declarar obsolets a la 6.2.0 i es van eliminar a la 7.0.0, i un formulari que encara els fa servir no supera la validació. Per migrar:

1. Extreu les columnes de `tableFields` a un nou formulari `type: subform` amb `formfields` normals
2. Substitueix el camp `table` per un camp `list` que referenciï el subform mitjançant `subform: MySubformName`

**Abans:**
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

**Després:**
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

#### Migrar `from` de `tableFields` a expressions amb `__parent__`
{: .no_toc }

La propietat `from` de les columnes enum de `tableFields` emplenava les opcions del desplegable a partir d'un altre camp del formulari pare. En un `subform`, se substitueix per una `expression` que llegeix el mateix valor a través de `__parent__`.

**Abans: `tableFields` amb `from`:**

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

**Després: subform amb una expressió `__parent__`:**

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
> `$(__parent__.available_departments)` retorna el **valor actual** d'aquest camp, així que si aquest camp és al seu torn un camp d'expressió dinàmic, el subform sempre veu el darrer resultat avaluat del pare.

