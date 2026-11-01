---
layout: default
title: Preguntas frecuentes
nav_order: 2
translated_from: 487a25c7f3b24b3a0c0d4df08c858a52d48f8556
---

# Preguntas frecuentes
{: .no_toc }

Preguntas y respuestas habituales sobre AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Primeros pasos

### Topología del despliegue: un contenedor o varios nodos

Por defecto, un contenedor de AnsibleForms ejecuta la aplicación web y el trabajo en segundo plano en un solo proceso, junto a un contenedor RTE que
ejecuta los playbooks. Ejecútalo con una política de reinicio (por ejemplo `restart: unless-stopped` en Docker), y haz copia de seguridad tanto de la base de datos como
del volumen persistente.

Para ejecutar varias réplicas detrás de un balanceador de carga, divide el proceso con `AF_ROLE`:

- los nodos `app` sirven la interfaz web y la API: ejecuta tantos como quieras, cada uno con el mismo `ACCESS_TOKEN_SECRET`
- un `worker` ejecuta el trabajo en segundo plano: el esquema y sus actualizaciones, la semilla de configuración, las programaciones, la copia de seguridad nocturna, las sincronizaciones
  de repositorios y las limpiezas. Solo trabaja un worker a la vez, con un bloqueo en la base de datos; un segundo espera y toma el relevo cuando el primero se detiene
- los contenedores `rte` ejecutan los playbooks: ejecuta más para ejecutar más playbooks a la vez

Los nodos de aplicación y el worker comparten la base de datos, el volumen persistente y `ENCRYPTION_SECRET`. Un RTE en un modo de socket (outbound o
inbound, consulta [Modos](rte/modes.html)) no necesita ni la base de datos ni `ENCRYPTION_SECRET`. El asistente de chat necesita sesiones persistentes (sticky), y
cada nodo mantiene su propio log. Consulta [Escalado](production/scaling.html) y la configuración de
[examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale).

### Gestión de formularios en varios repositorios

Los formularios de todos los repositorios git con **usar para formularios** activado se combinan automáticamente; si hay nombres de formulario duplicados, gana el
primero y se registra un aviso. Mantén `config.yaml` en un solo repositorio. Consulta [Repositorios git](repositories/).

### Sobre los repositorios

AnsibleForms clona repositorios git y trae sus cambios en la ruta de repositorios (`REPO_PATH`), y se gestionan en **Configuración > Repositorios**.
Los interruptores de cada repositorio definen lo que contiene: configuración, formularios, playbooks o archivos de variables. Consulta [Repositorios git](repositories/).

### Validación en VS Code de los archivos de formularios

Añade una cabecera de esquema a tus archivos YAML de formularios para tener validación y autocompletado en directo en VS Code.

Instala la [extensión YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) y añade este comentario como **primera línea** de cualquier archivo de formulario:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
```

Funciona tanto con archivos de un solo formulario (un diccionario YAML) como con archivos de varios formularios (una lista YAML):

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

VS Code resalta las propiedades desconocidas, los campos obligatorios que faltan y los tipos incorrectos mientras escribes.

---

## Gestión de trabajos

### Relanzar un trabajo con los datos rellenados

El botón de relanzar abre el formulario rellenado con los valores del trabajo anterior; los campos Password nunca se guardan.
Requiere la opción de rol `allowJobRelaunch`, y un formulario puede desactivarlo con `allowRelaunch: false`. Consulta [Relanzar un trabajo](jobs/actions.html#relaunch-a-job).

### Archivo de registro del trabajo

Sigue el progreso mediante un archivo de registro propio del trabajo (v6.1.2).

AnsibleForms puede mostrar un **archivo de registro propio del trabajo** junto a la salida de Ansible. Así puedes seguir el progreso de módulos personalizados de larga duración que, de otro modo, no darían ninguna información visible durante la ejecución.

{: .note }
> Esta función solo funciona con playbooks que se ejecutan en un RTE. Las plantillas y los jobs de AWX, AAP, Ascender, Semaphore, Rundeck o
> Jenkins no tienen archivo de registro.

**Cómo funciona:**
- Durante la ejecución de un trabajo, el RTE vigila un archivo de registro en una ruta conocida dentro de la carpeta del playbook
- Cada dos segundos, si el archivo ha cambiado, el RTE copia su contenido en el trabajo, y una vez más cuando termina el playbook
- El archivo de registro se muestra en una sección **Archivo de registro** de la salida del trabajo, numerado como las líneas de la salida : la marca de tiempo y el nivel (ERROR, WARNING, INFO, DEBUG) de cada línea se leen y se colorean como los de la salida, y se admiten colores ANSI

**Convención de la ruta del archivo de registro:**

El archivo de registro debe escribirse en esta ruta:

```
<playbook_dir>/.joblogs/job_log_<jobid>.log
```

**AnsibleForms pasa `__jobid__` automáticamente**, así que puedes montar la ruta en tu playbook sin ninguna configuración adicional:

{% raw %}
```yaml
job_log_path: "{{ vars['playbook_dir'] }}/.joblogs/job_log_{{ __jobid__ }}.log"
```
{% endraw %}

Pasa esta variable a cualquier rol o módulo personalizado que deba escribir el progreso en el archivo.

**Responsabilidades de quien desarrolla el playbook o el módulo:**
- **Crear** el archivo de registro (y su directorio `.joblogs/`) al principio de la operación
- **Escribir** mensajes de progreso útiles a medida que avanza la operación

El RTE borra el archivo cuando termina el playbook y el último contenido se ha guardado en el trabajo.

**Se admiten códigos de color ANSI.**  
Los códigos de escape ANSI estándar (por ejemplo, `\033[92m` para verde y `\033[91m` para rojo) de tus mensajes de registro se muestran como colores en la interfaz, así que los estados de éxito, aviso y error se distinguen de un vistazo.

**Caso de uso típico:**  
Un módulo de Ansible personalizado en Python que realiza una larga secuencia de llamadas a APIs u operaciones de datos (por ejemplo, un workflow de DR con SnapMirror) puede añadir una línea por paso al archivo de registro. Un operador que vigila el trabajo en AnsibleForms ve entonces el progreso en directo en la sección Archivo de registro, a medida que la página del trabajo sigue el trabajo.

### Jobid

Pasar el ID del trabajo actual.

AnsibleForms envía automáticamente el ID del trabajo actual en las extravars como `__jobid__`; no hace falta ninguna configuración.

### Información del usuario

Pasar el usuario actual.

AnsibleForms envía automáticamente la información del usuario en las extravars como `ansibleforms_user`; no hace falta ninguna configuración.

Puedes elegir cuánta información se envía. `EXTRAVARS_USER_FIELDS` acepta una lista de claves de primer nivel separadas por comas
(`username,email,type`), o `none` para no enviar nada; un formulario puede sobrescribirlo con su propia propiedad `userExtravars`.
El valor predeterminado es el objeto completo, como antes. El `__user__` del lado del formulario, descrito más abajo, viene del token de login y nunca se ve afectado.

### Información del usuario en el formulario

Acceder a la información del usuario actual en el formulario (v4.0.2).

El campo `__user__` se añade automáticamente al formulario y se puede referenciar en las expresiones:

```yaml
expression: $(__user__)
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
expression: $(__user__.roles)
```

---

## Campos de formulario

### Desplegables encadenados

Crear desplegables encadenados.

Los campos `enum` (desplegables) pueden contener marcadores en su propiedad `query` o `expression`, con el formato `$(another_field)` o `$(another_field[0].name)`.  
En cuanto cambia el campo referenciado, el campo que lo referencia se vuelve a evaluar, lo que da lugar a desplegables dinámicos y encadenados.  
La aplicación web cliente vuelve a evaluar los campos cada 100 ms; con los procesadores actuales y el motor Chromium, la experiencia es fluida.

{: .note }
> Una referencia a otro campo enum devuelve los valores seleccionados, **no** la lista completa del desplegable. Usa la propiedad `placeholderColumn` o la notación con punto, como `$(city.name)`.  
> **Novedad en v4.0.20**: poner placeholderColumn a "*" devuelve el registro completo en lugar de una sola columna.

Los ejemplos consultan `CONN1`, una [base de datos](databases.html) de Conexiones > Bases de datos (desde la 7.5.0) o una credencial de tipo base de datos.

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

### Marcadores de campo

Referenciar el valor de otro campo.

Los marcadores son referencias a otros campos del formulario.  
Un marcador tiene siempre el formato `$(reference)`, y tanto las expresiones como las consultas pueden contener marcadores.  
Un marcador que apunta a un campo simple (text, number, password) contiene el valor de ese campo.  
Un marcador que apunta a un campo enum basado en objetos debe usar la propiedad `placeholderColumn` o la notación con punto, como `$(city.name)`.  
Un marcador que apunta a un campo expression devuelve el objeto completo, o puedes usar una referencia avanzada, al estilo de JavaScript, como `$(myarray[0].name)`.

{: .important }
> El marcador se sustituye **antes** de evaluar la expresión. Si esperas que el resultado sea una cadena, debes envolverlo entre comillas.  
> **Novedad en v4.0.20**: poner placeholderColumn a "*" devuelve el registro completo en lugar de una sola columna.

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

### Ocultar un campo

Ocultar un campo.

Oculta un campo con la propiedad de campo `hide`, o muéstralo y ocúltalo dinámicamente con las propiedades de campo `dependencies` y `dependencyFn`.

### Agrupar campos

Agrupar campos en un bloque.

Usa la propiedad de campo `group`. Los campos con el mismo nombre de grupo se agrupan en un bloque.

### Validación de campos

Validar un campo.

Usa las propiedades de validación del campo, como `regex`, `minValue` y `notIn`.

### Valor predeterminado en un Enum

Valor predeterminado de un enum.

La propiedad de campo `default` define un valor predeterminado, y en los campos `enum` puedes usar valores como `__auto__` para seleccionar automáticamente el primer elemento.

Para un valor predeterminado dinámico basado en una expresión, mueve el elemento predeterminado al principio de la lista, como en el ejemplo siguiente.

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

### Valor predeterminado con una expresión

Valor predeterminado con una expresión.

En los campos de texto, número o fecha, la propiedad `default` define un valor predeterminado estático.

Para que el valor predeterminado sea dinámico, basado en una expresión, usa una de estas dos propiedades:
* `editable`: usa la propiedad editable para que un campo expression sea editable
* `evalDefault`: usa la propiedad evalDefault para evaluar el valor predeterminado como una expresión

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

## Wizard y workflows

### ¿Qué diferencia hay entre un wizard y un workflow?

Un **wizard** y un **workflow** se componen ambos de pasos, pero actúan en capas distintas y se pueden combinar.

| | [`workflow`](forms/workflow.html) (Workflow) | [`wizard`](forms/wizard.html) |
|---|---|---|
| **Capa** | Ejecución | Formulario / interfaz |
| **Qué divide** | El trabajo en nodos que se ejecutan uno tras otro, o en paralelo | Los datos de un formulario en varias páginas |
| **Resultado** | 1 trabajo de workflow, con un trabajo por nodo (cada uno con su propio playbook o plantilla) | Se ejecuta 1 trabajo al final |
| **`type` del formulario** | Debe ser `workflow` | Funciona con todos los tipos de formulario salvo `subform` |
| **Se define con** | Un [archivo de workflow](workflows/file.html) del diseñador (`workflow:`) | Una lista de referencias a [subforms](forms/subform.html) (`wizard:`) |
| **Úsalo cuando** | "Haz A, después B, después C como trabajos separados" | "Mi formulario tiene demasiados campos para una sola página" |

**Idea clave:** un workflow trata de *qué se ejecuta y en qué orden*; `wizard` trata de *cómo rellena el usuario el formulario*.

{: .note }
> El tipo de formulario `multistep`, con sus `steps`, se encargaba de la parte de ejecución antes de la 7. Está obsoleto desde la 7 y se elimina en
> la 8: un workflow hace todo lo que hace un multistep, consulta [Formularios de varios pasos](forms/multistep.html).

#### Solo workflow
{: .no_toc }

Un formulario `type: workflow` ejecuta uno de los workflows del diseñador. El usuario rellena una sola página de campos y pulsa Enviar,
y el workflow ejecuta sus nodos, cada uno con los valores del formulario como extra vars:

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

Un bloque `wizard:` en un formulario reparte la recogida de datos en varias páginas. Solo se ejecuta **un** trabajo al final: las extravars combinadas de todas las páginas se envían a un único playbook, plantilla o workflow.

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

Se añade automáticamente una página de revisión de solo lectura como última página del wizard; no la declaras en el YAML.

#### Combinados (wizard sobre un workflow)
{: .no_toc }

Un wizard se puede poner encima de un formulario de workflow. El usuario rellena las páginas del wizard y pulsa Enviar, y **entonces** arranca el
workflow. Si haces coincidir el `defaultModel` de un paso del wizard con el
[`extra_vars_key`](workflows/file.html#ansibleforms-own-keys) de un nodo, puedes dirigir **una página del wizard a un nodo**:

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

Y el workflow `provision-host`, en un archivo de workflow del diseñador:

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

`extra_vars_key` es una búsqueda de un solo nivel, así que usa un nombre plano en `defaultModel` (por ejemplo, `defaultModel: basics`, no `defaultModel: input.basics`) cuando quieras que coincidan.

Consulta la [página de Wizard](forms/wizard.html) para ver la referencia completa de propiedades.

### ¿Cómo muestro u omito pasos del wizard según una condición?

Usa `when:` para **ocultar** un paso por completo, u `optional: true` para que el usuario pueda **saltarse** un paso visible. Ambos son independientes y, en general, no conviene combinarlos.

#### `when:`: visibilidad condicional
{: .no_toc }

El paso se oculta cuando la expresión da un valor falso. El usuario nunca lo ve, y sus valores no se recogen. La expresión puede leer pasos anteriores mediante `__parent__.<stepname>.<field>`:

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

Solo se muestra la página que corresponde al `kind` elegido. Los pasos posteriores a uno oculto se renumeran automáticamente.

#### `optional: true`: permitir saltarse un paso visible
{: .no_toc }

El paso se muestra **siempre** en la barra de pasos, pero el usuario puede pulsar **Siguiente** sin rellenarlo, y **Enviar** se permite aunque la página no se haya visitado ni completado nunca:

```yaml
wizard:
  - subform: basics
    title: Basics
  - subform: advanced
    title: Advanced (optional)
    optional: true
```

El usuario puede abrir la página Advanced, dejarla vacía, pulsar Siguiente y pasar directamente a la página de revisión.

{: .note }
> `when:` controla la *visibilidad*; `optional:` controla *si hay que completar la página*. No los combines: para que una página desaparezca, usa `when:`; para mantenerla visible pero que se pueda saltar, usa `optional:`.

### ¿Cómo hago referencia a valores de un paso anterior del wizard?

Usa `$(__parent__.<stepname>.<field>)` dentro de cualquier campo de un paso posterior.

El `name` de un paso del wizard (por defecto, el nombre de su `subform`) es el espacio de nombres con el que sus valores se exponen a los pasos posteriores:

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

Es el mismo mecanismo `__parent__` que usan los subforms de `list` y `yaml`; consulta [¿Cómo accedo a los datos del formulario padre dentro de un subform?](#how-do-i-access-parent-form-data-inside-a-subform).

---

## Seguridad y credenciales

### Credenciales

Pasar credenciales.

Las credenciales se pueden pasar de varias formas:
* con la propiedad de campo `asCredential`  
* con la propiedad de formulario `credentials` (pares clave-valor)
* con una extravar llamada `__credentials__`

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

### Recuperar una contraseña de admin perdida

Si has perdido la contraseña de la cuenta local `admin` y no hay ningún otro usuario administrador disponible, usa la opción de recuperación `REINIT_ADMIN`. **No es una forma de saltarse la autenticación en tiempo de ejecución**: solo fuerza un restablecimiento único de la cuenta de administrador local al arrancar, y después la autenticación funciona con normalidad.

**Cómo funciona**

Cuando se define `REINIT_ADMIN=1` al arrancar, AnsibleForms:

1. Se asegura de que existe el grupo `admins` (y lo crea si falta).
2. Busca el usuario administrador local (por defecto, el nombre de usuario `admin`, que se cambia con `ADMIN_USERNAME`).
3. Si existe, restablece su contraseña al valor de `ADMIN_PASSWORD` y lo vuelve a añadir al grupo `admins`.
4. Si no existe, lo crea (como en una instalación nueva).
5. Registra la acción de forma destacada para que se vea en los logs.

**Pasos**

1. Detén AnsibleForms.
2. Define las variables de entorno (usa una contraseña robusta):
   ```bash
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourNewStrongPasswordHere
   REINIT_ADMIN=1
   ```
   En Docker Compose, añádelas al bloque `environment:` del servicio de AnsibleForms.
3. Arranca AnsibleForms y busca en los logs una línea como esta:
   ```
   REINIT_ADMIN: admin user 'admin' has been recreated. UNSET REINIT_ADMIN now.
   ```
4. Inicia sesión con `admin` / `YourNewStrongPasswordHere`.
5. **Quita `REINIT_ADMIN` (o vuelve a ponerlo a `0`)** y reinicia, para que los próximos reinicios no vuelvan a restablecer la contraseña del administrador.

**Notas**

- Si te quedaste sin acceso porque LDAP era el único método de inicio de sesión configurado y falló, la cuenta local `admin` recuperada siempre recurre a la autenticación de la base de datos local, lo que basta para iniciar sesión y arreglar LDAP.
- Se ha eliminado la antigua variable de entorno `ENABLE_BYPASS`. Permitía iniciar sesión como admin con cualquier contraseña y no era seguro dejarla activada. `REINIT_ADMIN` solo restablece la contraseña; después se aplica la autenticación normal.
- `REINIT_ADMIN` no invalida las sesiones ni los tokens existentes; solo cambian el hash de la contraseña y la pertenencia al grupo.

### Restringir los destinos de los helpers REST (listas de permitidos y denegados)

Los helpers `fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt` y `fn.fnRestJwtSecure` se pueden llamar desde las propiedades `expression` de los formularios para obtener datos por HTTP. Por defecto, quienes escriben expresiones pueden apuntar a **cualquier** URL a la que llegue el host de AnsibleForms, algo que quizá quieras limitar en una red sensible.

Dos variables de entorno proporcionan una lista de permitidos y una de denegados:

| Variable | Comportamiento |
|---|---|
| `REST_ALLOWED_HOSTS` | Nombres de host o CIDR separados por comas. Si se define, **solo** se permiten estos destinos. |
| `REST_DENIED_HOSTS` | Nombres de host o CIDR separados por comas. Siempre se bloquean. Tiene prioridad sobre la lista de permitidos. |

Los nombres de host se comparan sin distinguir mayúsculas con el host de la URL. Los CIDR se comparan con todas las IP a las que resuelve el host, así que `10.0.0.0/8` bloquea cualquier nombre DNS que resuelva al rango privado.

**Ejemplos:**

La primera línea solo permite dos hosts; la segunda bloquea destinos concretos:

```bash
# Whitelist: only your two API partners are reachable
REST_ALLOWED_HOSTS=api.example.com,partner.api.com

# Blacklist: block cloud metadata + internal admin UIs
REST_DENIED_HOSTS=169.254.169.254,127.0.0.0/8,internal-admin.example
```

{: .warning }
> **Esta protección solo cubre el proceso Node.js de AnsibleForms.** En cuanto se ejecuta un playbook, el propio Ansible puede llegar a cualquier cosa desde el host, fuera del control de AnsibleForms. Usa estas listas para evitar que quienes crean formularios conviertan las expresiones en un proxy hacia servicios de metadatos o interfaces internas; no confíes en ellas como cortafuegos de red.

Desde la 7.3.0, los helpers REST comprueban el certificado TLS del endpoint, como cualquier otra conexión, y se rinden tras
[`REST_TIMEOUT_SECONDS`](customization/security.html#env_REST_TIMEOUT_SECONDS) (`60` por defecto). Confía en una CA privada con
`NODE_EXTRA_CA_CERTS`, o pon [`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) a `1` solo para endpoints con un
certificado autofirmado.

### Integración con HashiCorp Vault

Las credenciales pueden leer su usuario y su contraseña de HashiCorp Vault, configurado como
**almacén de secretos**. Consulta [Almacenes de secretos](secret-stores). Las variables de entorno `VAULT_*`
de versiones anteriores se importan una vez como el almacén `vault` en el primer arranque de una 7.x.

Para secretos que solo se usan dentro de un playbook, también puedes usar el plugin de lookup `community.hashi_vault`,
que lee directamente de Vault sin pasar por AnsibleForms.

---

## Integración

### Consultar AWX/Tower/AAP

Consultar información de AWX o de Ansible Automation Platform.

Para rellenar desplegables con datos de AWX o Tower, usa `fn.fnRestBasic` o `fn.fnRestJwtSecure`. Desde la 7.3.0 estos helpers comprueban
el certificado de la dirección de AWX: si es autofirmado, confía en su CA con `NODE_EXTRA_CA_CERTS`, o pon
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

## Personalización

### Personalización

Personalizar AnsibleForms.

AnsibleForms es una aplicación web. Cuando la ejecutas de forma nativa en Node.js, puedes sustituir o cambiar sus archivos.  
Sin embargo, lo recomendado es ejecutarla como imagen de Docker y añadir mapeos de volúmenes o de archivos. Los proyectos de Docker Compose ya mapean directorios para conservar la base de datos, los playbooks, los logs, los certificados y las claves SSH, y puedes añadir más mapeos. Un logotipo propio se sube en la página de configuración **Logo**.  
El archivo `custom.js` contiene tus propias funciones JavaScript para usarlas en las expresiones. Las funciones integradas usan el prefijo `fn.` (por ejemplo, fn.fnRestBasic); las funciones personalizadas usan el prefijo `fnc.`.  
Del mismo modo, puedes añadir tus propias definiciones de jq en el archivo `jq.custom.definitions`.

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

Para usar ytt, define `USE_YTT=1`.  
Para más información sobre ytt, consulta https://carvel.dev/ytt/.

{: .important }  
> Esta función no se ha probado a fondo, y no se ha recibido ningún comentario desde que se añadió como mejora.  
> Si usas ytt, debes desactivar el diseñador: el diseñador convierte los archivos YAML a un JSON intermedio y pierde la sintaxis de ytt (que consiste en comentarios YAML).

Debe existir un directorio `lib` en el directorio raíz; se incluye automáticamente en la llamada a ytt.
Se pueden proporcionar datos de forma global definiendo variables de entorno con prefijo:  

```bash
YTT_VARS_PREFIX=YTT_VAR
YTT_VAR_INVENTORY_PATH=/tmp/inventory.yml
YTT_VAR_default_host=localhost
```  

También puedes proporcionar archivos de datos de librería:

```bash
YTT_LIB_DATA_DEMO=/tmp/demo_data.yml
```  

```yaml
# /tmp/demo_data.yml
message: 'hello demo'
```

**La librería `demo` debe existir en el contexto de ytt (lib/_ytt_lib/demo/values.yml)**

```yaml
# lib/_ytt_lib/demo/values.yml
#@ data/values
---
demo: {}
```  

Después se pueden usar los datos cargados:

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

## Control de acceso

### ¿Cómo restrinjo lo que pueden hacer los usuarios (opciones de rol)?

Además de limitar qué formularios puede ver un rol, las `options` de un rol activan o desactivan funciones de la interfaz para sus miembros.
Consulta [Opciones de rol](config/roles.html#role-options) para ver cada opción, su valor predeterminado y cómo se combinan las opciones entre roles.

### ¿Cómo implemento una lógica RBAC propia en mis playbooks o formularios?

La identidad del usuario está disponible tanto en el frontend como en el backend en cada ejecución.

En cada envío de un formulario, AnsibleForms inyecta automáticamente la identidad completa del usuario actual en las extravars que se envían a Ansible:

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

Tu playbook o cualquier módulo de Ansible personalizado pueden usar por tanto `ansibleforms_user` directamente para tomar decisiones finas, por ejemplo para permitir que solo ciertos grupos modifiquen el inventory de producción, o para escribir una pista de auditoría con el nombre de usuario de quien envió el formulario.

En el **frontend**, el mismo objeto está disponible mediante el campo especial `__user__`:

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

**Patrones habituales:**

La identidad del usuario permite patrones como los siguientes:

- **Cruzar con un archivo de configuración RBAC o una base de datos**: carga un archivo YAML o JSON (con `fn.fnReadYamlFile` o una expresión) que asocie grupos con los recursos permitidos, y filtra después por `$(__user__.groups)`
- **Pista de auditoría**: pasa `ansibleforms_user.username` como variable extra para registrar quién lanzó el trabajo
- **Valores de campo dinámicos**: muestra un conjunto distinto de opciones de un enum, rellena campos de antemano u oculta secciones según los grupos o roles del usuario
- **Autorización en el playbook**: comprueba que `ansibleforms_user.groups` contiene un grupo obligatorio antes de que continúe el playbook, como comprobación de defensa en profundidad independiente de la lista `roles` del formulario

{: .note }
> El objeto de arriba es lo que se envía por defecto. Si la instancia define `EXTRAVARS_USER_FIELDS`,
> o el formulario define `userExtravars`, solo se envían las claves que se nombran ahí, así que un playbook que
> comprueba `ansibleforms_user.groups` necesita que `groups` sea una de ellas. El campo `__user__` del
> frontend viene del token de login y ninguno de los dos ajustes lo recorta nunca.

---

## Programación de trabajos

### ¿Cómo programo un formulario para que se ejecute automáticamente?

Abre el desplegable junto a **Enviar** y elige **Programación (recurrente)** o **Ejecutar más tarde (una sola vez)**; requieren las opciones de rol
`allowScheduledJobs` (de nivel administrador) y `allowPlannedJobs`. Consulta [Programaciones](jobs/schedules.html).

### ¿Qué expresiones cron puedo usar?

Una programación recurrente acepta una expresión cron estándar de 5 campos (minuto, hora, día del mes, mes, día de la semana).

| Expresión | Se ejecuta |
|---|---|
| `*/15 * * * *` | Cada 15 minutos |
| `0 * * * *` | Cada hora, en punto |
| `0 */6 * * *` | Cada 6 horas, a las 00:00, 06:00, 12:00 y 18:00 |
| `0 2 * * *` | Todos los días a las 02:00 |
| `30 7 * * 1-5` | De lunes a viernes a las 07:30 |
| `0 8 * * MON` | Todos los lunes a las 08:00 (se aceptan nombres de días y meses) |
| `0 0 1 * *` | A medianoche del primer día de cada mes |
| `0 22 L * *` | A las 22:00 del último día de cada mes |
| `0 6 * * 1#1` | A las 06:00 del primer lunes de cada mes |
| `*/30 * * * * *` | Cada 30 segundos (un sexto campo opcional delante indica el segundo) |

Cuando se definen tanto el día del mes como el día de la semana, la programación se ejecuta cuando coincide cualquiera de los dos: `0 0 13 * 5` se ejecuta
el día 13 y todos los viernes. El servidor rechaza una expresión que no puede ejecutar, o una que no puede darse nunca (`0 0 30 2 *`).

En la página **Programaciones**, el editor de cron describe la expresión y muestra sus próximas ejecuciones. No acepta alias
como `@daily`, el comodín `?` ni el modificador `W` (día laborable más cercano), así que cíñete a las formas de la tabla.

{: .note }
> **Zona horaria** Las programaciones cron se ejecutan en la zona horaria del servidor, definida con [`LOG_TZ`](customization/logging.html#env_LOG_TZ)
> (por defecto `UTC`), no en la zona horaria de tu perfil ni de tu navegador. `0 2 * * *` con `LOG_TZ=Europe/Madrid` se ejecuta a las 02:00
> hora de Madrid todo el año, siguiendo el horario de verano. El editor de cron muestra las próximas ejecuciones en esa misma zona. Las programaciones
> de pull de los repositorios usan la misma zona.

---

## Guardar y cargar datos de formularios

### ¿Cómo guardo y vuelvo a cargar los datos de un formulario sin ejecutar un trabajo?

Selecciona **Almacén** en el desplegable junto a **Enviar** para guardar los valores de los campos, y después **Cargar desde almacén** para restaurarlos más tarde.
Los campos Password nunca se guardan. Requiere la opción de rol `allowStoredJobs`. Consulta [Trabajos almacenados](jobs/stored-jobs.html).

---

## Formularios anidados y campos estructurados

### ¿Cómo recojo datos estructurados o repetidos en un formulario?

Usa campos `list` y `yaml` con subforms (6.2.0+).

Para recoger datos estructurados complejos, como una lista de servidores, un conjunto de interfaces de red o un único objeto anidado, usa el tipo de campo `list` o `yaml` junto con un `subform`.

Un **subform** es un fragmento de formulario reutilizable (definido con `type: subform`) que nunca se muestra como un mosaico independiente. Solo existe para que lo referencien campos de otros formularios. Consulta la [documentación de Subform](forms/subform.html) para ver la referencia completa.

**Recoger una lista de filas estructuradas: campo `list`:**

Un campo `list` abre el subform referenciado una vez por fila:

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

La extravar `servers` que se envía a Ansible es un array de objetos: `[{hostname: "web1", ip: "10.0.0.1"}, ...]`

**Editar un único objeto estructurado: campo `yaml`:**

El campo `yaml` tiene tres modos:

| Modo | Cómo | Comportamiento |
|---|---|---|
| **Editor** | por defecto | Muestra un editor YAML completo con resaltado de sintaxis en el que el usuario puede escribir directamente |
| **Solo lectura** | `readonly: true` | Muestra el valor YAML como texto formateado de solo lectura, sin edición |
| **Subform** | `subform: MySubform` | Oculta el editor en bruto; al hacer clic, abre el subform como editor de detalle |

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

**Subir y descargar: campos `list` y `yaml`:**

Ambos tipos de campo admiten la transferencia de archivos en el cliente mediante dos propiedades opcionales:

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
> El campo `list` y el tipo de formulario `subform` sustituyeron al campo `table` y a `tableFields`, que se eliminaron en la 7.0.0.

### ¿Cómo accedo a los datos del formulario padre dentro de un subform?

Referencia los valores de los campos del padre desde un subform mediante `__parent__` (v6.3.0+).

Cuando se abre un subform, ya sea desde un campo **`list`** (el editor de cada fila) o desde un campo **`yaml`** en modo subform, AnsibleForms inyecta automáticamente en el subform un campo especial de solo lectura llamado `__parent__`. Contiene una instantánea de **todos los valores de los campos del formulario padre en el momento en que se abrió el subform**, incluidas las constantes y las variables.

Así, los campos del subform pueden usar expresiones que referencian datos del padre sin ninguna configuración adicional.

#### ¿Qué hay en `__parent__`?
{: .no_toc }

`__parent__` es un objeto simple cuyas claves son los nombres de los campos del formulario padre:

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
> `__parent__` **no se envía a Ansible**; como `__user__`, se quita de las extravars. Es solo una ayuda del frontend para las expresiones dentro de los subforms.

#### Acceder a los valores del padre en las expresiones de un subform
{: .no_toc }

Referencia los valores del padre con la sintaxis de expresión estándar `$(...)`:

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

#### Subforms anidados
{: .no_toc }

`__parent__` siempre se refiere al formulario **padre inmediato**. Si anidas un `list` dentro de un subform que a su vez se abre desde un formulario padre, el `__parent__` del subform interior contiene los datos del subform intermedio. Para llegar a niveles superiores, encadena referencias como `$(__parent__.__parent__.someField)` si el subform intermedio también propaga su propio `__parent__`.

### ¿Cómo migro de `table` / `tableFields` a `list` / `subform`?

El campo `table` y la propiedad `tableFields` quedaron obsoletos en la 6.2.0 y se eliminaron en la 7.0.0, y un formulario que aún los usa no pasa la validación. Para migrar:

1. Extrae las columnas de `tableFields` a un nuevo formulario `type: subform` con `formfields` normales
2. Sustituye el campo `table` por un campo `list` que referencie el subform mediante `subform: MySubformName`

**Antes:**
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

**Después:**
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

#### Migrar `from` de `tableFields` a expresiones con `__parent__`
{: .no_toc }

La propiedad `from` de las columnas enum de `tableFields` rellenaba las opciones del desplegable a partir de otro campo del formulario padre. En un `subform`, se sustituye por una `expression` que lee el mismo valor mediante `__parent__`.

**Antes: `tableFields` con `from`:**

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

**Después: subform con una expresión `__parent__`:**

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
> `$(__parent__.available_departments)` devuelve el **valor actual** de ese campo, así que si ese campo es a su vez un campo expression dinámico, el subform siempre ve el último resultado evaluado en el padre.
