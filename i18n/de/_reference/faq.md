---
layout: default
title: FAQ
nav_order: 2
translated_from: 6616eaf626411a615cb68d8cc4f2a43401fe21d9
---

# Häufig gestellte Fragen
{: .no_toc }

Häufige Fragen und Antworten zu AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Erste Schritte

### Bereitstellungstopologie: ein Container oder mehrere Knoten

Standardmäßig betreibt ein AnsibleForms-Container die Webanwendung und die Hintergrundarbeit in einem Prozess, neben einem RTE-Container, der
die Playbooks ausführt. Betreiben Sie ihn mit einer Neustart-Richtlinie (zum Beispiel `restart: unless-stopped` in Docker) und sichern Sie sowohl die Datenbank als auch
das persistente Volume.

Um mehrere Replikas hinter einem Load Balancer zu betreiben, teilen Sie den Prozess mit `AF_ROLE` auf:

- `app`-Knoten stellen die Weboberfläche und die API bereit: betreiben Sie so viele, wie Sie möchten, jeden mit demselben `ACCESS_TOKEN_SECRET`
- ein `worker` erledigt die Hintergrundarbeit: das Schema und seine Aktualisierungen, den Konfigurations-Seed, die Zeitpläne, das nächtliche Backup, die Repository-
  Synchronisierungen und die Aufräumarbeiten. Ein Worker arbeitet gleichzeitig und hält dabei eine Datenbanksperre; ein zweiter wartet und übernimmt, wenn der erste stoppt
- `rte`-Container führen die Playbooks aus: betreiben Sie mehr davon, um mehr Playbooks gleichzeitig auszuführen

Die App-Knoten und der Worker teilen sich die Datenbank, das persistente Volume und `ENCRYPTION_SECRET`. Eine RTE in einem Socket-Modus (ausgehend oder
eingehend, siehe [Modi](rte/modes.html)) braucht weder die Datenbank noch `ENCRYPTION_SECRET`. Der Chat-Assistent braucht Sticky Sessions, und
jeder Knoten führt sein eigenes Protokoll. Siehe [Skalierung](production/scaling.html) und das Setup
[examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale).

### Formulare aus mehreren Repositories verwalten

Formulare aus jedem Git-Repository mit eingeschaltetem **Für Formulare verwenden?** werden automatisch zusammengeführt; bei doppelten Formularnamen gewinnt das erste,
und eine Warnung wird protokolliert. Behalten Sie `config.yaml` in nur einem Repository. Siehe [Git-Repositories](repositories/).

### Über Repositories

AnsibleForms klont und pullt Git-Repositories unter dem Repository-Pfad (`REPO_PATH`), verwaltet unter **Einstellungen > Repositories**.
Schalter an jedem Repository legen fest, was es enthält: Konfiguration, Formulare, Playbooks oder Vars-Dateien. Siehe [Git-Repositories](repositories/).

### VS-Code-Validierung für Formulardateien

Fügen Sie Ihren Formular-YAML-Dateien einen Schema-Header hinzu, um in VS Code Live-Validierung und Autovervollständigung zu erhalten.

Installieren Sie die [YAML-Erweiterung](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) und fügen Sie diesen Kommentar als **erste Zeile** jeder Formulardatei ein:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
```

Das funktioniert sowohl für Dateien mit einem Formular (ein YAML-Dict) als auch für Dateien mit mehreren Formularen (eine YAML-Liste):

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

VS Code hebt unbekannte Eigenschaften, fehlende Pflichtfelder und falsche Typen schon beim Tippen hervor.

---

## Job-Verwaltung

### Job erneut starten mit vorausgefüllten Daten

Die Schaltfläche zum erneuten Start öffnet das Formular, vorausgefüllt mit den Werten des früheren Jobs; Passwortfelder werden nie gespeichert.
Sie erfordert die Rollenoption `allowJobRelaunch`, und ein Formular kann sie mit `allowRelaunch: false` abschalten. Siehe [Einen Job erneut starten](jobs/actions.html#relaunch-a-job).

### Logdatei eines Jobs

Den Fortschritt über eine jobspezifische Logdatei verfolgen (v6.1.2).

AnsibleForms kann neben der Ansible-Ausgabe eine **jobspezifische Logdatei** anzeigen. So lässt sich der Fortschritt lang laufender eigener Module verfolgen, die während der Ausführung sonst keine sichtbare Rückmeldung liefern würden.

{: .note }
> Diese Funktion funktioniert nur für Playbooks, die auf einer RTE laufen. Vorlagen und Jobs auf AWX, AAP, Ascender, Semaphore, Rundeck oder
> Jenkins haben keine Logdatei.

**Wie es funktioniert:**
- Während eines Joblaufs beobachtet die RTE eine Logdatei unter einem bekannten Pfad im Playbook-Ordner
- Alle zwei Sekunden, wenn sich die Datei geändert hat, kopiert die RTE ihren Inhalt in den Job, und noch einmal, wenn das Playbook endet
- Die Logdatei wird in einem Abschnitt **Logdatei** der Job-Ausgabe angezeigt, nummeriert wie die Zeilen der Ausgabe : Zeitstempel und Stufe einer Logzeile (ERROR, WARNING, INFO, DEBUG) werden gelesen und wie in der Ausgabe eingefärbt, und ANSI-Farben werden unterstützt

**Konvention für den Pfad der Logdatei:**

Die Logdatei muss unter diesen Pfad geschrieben werden:

```
<playbook_dir>/.joblogs/job_log_<jobid>.log
```

**AnsibleForms übergibt `__jobid__` automatisch**, sodass Sie den Pfad in Ihrem Playbook ohne zusätzliche Konfiguration zusammensetzen können:

{% raw %}
```yaml
job_log_path: "{{ vars['playbook_dir'] }}/.joblogs/job_log_{{ __jobid__ }}.log"
```
{% endraw %}

Übergeben Sie diese Variable an jede Rolle oder jedes eigene Modul, das Fortschritt in die Datei schreiben soll.

**Aufgaben des Playbook- / Modulentwicklers:**
- **Anlegen** der Logdatei (und ihres Verzeichnisses `.joblogs/`) zu Beginn des Vorgangs
- **Schreiben** aussagekräftiger Fortschrittsmeldungen, während der Vorgang läuft

Die RTE löscht die Datei, sobald das Playbook endet und der letzte Inhalt im Job gespeichert ist.

**ANSI-Farbcodes werden unterstützt.**
Standard-ANSI-Escape-Codes (zum Beispiel `\033[92m` für Grün und `\033[91m` für Rot) in Ihren Logmeldungen werden in der Oberfläche als Farben dargestellt, sodass sich Erfolg, Warnung und Fehler auf einen Blick unterscheiden lassen.

**Typischer Anwendungsfall:**
Ein eigenes Python-Modul für Ansible, das eine lange Folge von API-Aufrufen oder Datenoperationen ausführt (zum Beispiel einen SnapMirror-DR-Workflow), kann pro Schritt eine Zeile an die Logdatei anhängen. Ein Bediener, der den Job in AnsibleForms beobachtet, sieht dann im Abschnitt Logdatei den Fortschritt live, während die Job-Seite den Job verfolgt.

### Jobid

Die aktuelle Job-ID übergeben.

AnsibleForms sendet die aktuelle Job-ID automatisch in den Extravars als `__jobid__`; es ist keine Konfiguration nötig.

### Benutzerinfo

Den aktuellen Benutzer übergeben.

AnsibleForms sendet die Benutzerinformationen automatisch in den Extravars als `ansibleforms_user`; es ist keine Konfiguration nötig.

Sie können wählen, wie viel davon gesendet wird. `EXTRAVARS_USER_FIELDS` nimmt eine kommagetrennte Liste von Schlüsseln der obersten Ebene
(`username,email,type`) oder `none`, um nichts zu senden; ein Formular kann es mit seiner eigenen Eigenschaft `userExtravars` überschreiben.
Der Standard ist das ganze Objekt, wie bisher. Das unten beschriebene `__user__` auf Formularseite kommt aus dem Login-Token und ist davon nie betroffen.

### Benutzerinfo im Formular

Auf die Informationen des aktuellen Benutzers im Formular zugreifen (v4.0.2).

Das Feld `__user__` wird dem Formular automatisch hinzugefügt und kann in Ausdrücken referenziert werden:

```yaml
expression: $(__user__)
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
expression: $(__user__.roles)
```

---

## Formularfelder

### Kaskadierende Auswahllisten

Kaskadierende Auswahllisten bauen.

`enum`-Felder (Auswahllisten) können in ihrer Eigenschaft `query` oder `expression` Platzhalter enthalten, im Format `$(another_field)` oder `$(another_field[0].name)`.
Sobald sich das referenzierte Feld ändert, wird das referenzierende Feld neu ausgewertet, was dynamische, kaskadierende Auswahllisten ergibt.
Die Client-Webanwendung wertet Felder alle 100 ms neu aus; mit aktuellen Prozessoren und der Chromium-Engine ergibt das ein nahtloses Erlebnis.

{: .note }
> Eine Referenz auf ein anderes Enum-Feld gibt die ausgewählten Werte zurück, **nicht** die ganze Auswahlliste. Verwenden Sie die Eigenschaft `placeholderColumn` oder die Punktnotation wie `$(city.name)`.
> **Neu in v4.0.20**: wird placeholderColumn auf "*" gesetzt, wird der ganze Datensatz statt einer einzelnen Spalte ausgegeben.

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

### Feld-Platzhalter

Auf den Wert eines anderen Felds verweisen.

Platzhalter sind Verweise auf andere Felder im Formular.
Ein Platzhalter hat immer das Format `$(reference)`, und sowohl Ausdrücke als auch Abfragen können Platzhalter enthalten.
Ein Platzhalter, der auf ein einfaches Feld (Text, Zahl, Passwort) zeigt, enthält den Wert dieses Felds.
Ein Platzhalter, der auf ein objektbasiertes Enum-Feld zeigt, muss entweder die Eigenschaft `placeholderColumn` oder die Punktnotation wie `$(city.name)` verwenden.
Ein Platzhalter, der auf ein Ausdrucksfeld zeigt, gibt das ganze Objekt zurück, oder Sie verwenden einen fortgeschrittenen, JavaScript-ähnlichen Verweis wie `$(myarray[0].name)`.

{: .important }
> Der Platzhalter wird ersetzt, **bevor** der Ausdruck ausgewertet wird. Wenn Sie als Ergebnis einen String erwarten, müssen Sie ihn in Anführungszeichen setzen.
> **Neu in v4.0.20**: wird placeholderColumn auf "*" gesetzt, wird der ganze Datensatz statt einer einzelnen Spalte ausgegeben.

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

### Ein Feld verbergen

Ein Feld verbergen.

Verbergen Sie ein Feld mit der Feldeigenschaft `hide`, oder zeigen und verbergen Sie es dynamisch mit den Feldeigenschaften `dependencies` und `dependencyFn`.

### Felder gruppieren

Felder in einem Block zusammenfassen.

Verwenden Sie die Feldeigenschaft `group`. Felder mit demselben Gruppennamen werden in einem Block zusammengefasst.

### Feldvalidierung

Ein Feld validieren.

Verwenden Sie die Validierungseigenschaften der Felder, etwa `regex`, `minValue` und `notIn`.

### Standardwert bei Enum

Standardwert eines Enum.

Die Feldeigenschaft `default` setzt einen Standardwert, und bei `enum`-Feldern können Sie Werte wie `__auto__` verwenden, um automatisch den ersten Eintrag zu wählen.

Für einen dynamischen Standard auf Grundlage eines Ausdrucks verschieben Sie den Standardeintrag an den Anfang der Liste, wie im folgenden Beispiel.

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

### Standardwert per Ausdruck

Standardwert per Ausdruck.

Bei Text-, Zahl- oder Datumsfeldern setzt die Eigenschaft `default` einen statischen Standardwert.

Um den Standard dynamisch zu machen, auf Grundlage eines Ausdrucks, verwenden Sie eine von zwei Eigenschaften:
* `editable`: mit der Eigenschaft editable machen Sie ein Ausdrucksfeld bearbeitbar
* `evalDefault`: mit der Eigenschaft evalDefault wird der Standard als Ausdruck ausgewertet

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

## Wizard und Workflows

### Was ist der Unterschied zwischen einem Wizard und einem Workflow?

Ein **Wizard** und ein **Workflow** kommen beide in Schritten, arbeiten aber auf unterschiedlichen Ebenen und lassen sich kombinieren.

| | [`workflow`](forms/workflow.html) (Workflow) | [`wizard`](forms/wizard.html) |
|---|---|---|
| **Ebene** | Ausführung | Formular / Oberfläche |
| **Was es aufteilt** | Den Job in Knoten, die nacheinander oder nebeneinander laufen | Die Eingaben eines Formulars auf mehrere Seiten |
| **Ergebnis** | 1 Workflow-Job, mit einem Job pro Knoten (jeder mit eigenem Playbook oder eigener Vorlage) | 1 Job läuft am Ende |
| **Formular-`type`** | Muss `workflow` sein | Funktioniert mit jedem Formulartyp außer `subform` |
| **Definiert durch** | Eine [Workflow-Datei](workflows/file.html) des Designers (`workflow:`) | Eine Liste von [Subform](forms/subform.html)-Verweisen (`wizard:`) |
| **Verwenden, wenn** | „Mach A, dann B, dann C als separate Jobs“ | „Mein Formular hat zu viele Felder für eine Seite“ |

**Kernaussage:** bei einem Workflow geht es darum, *was läuft und in welcher Reihenfolge*; bei `wizard` darum, *wie der Benutzer das Formular ausfüllt*.

{: .note }
> Der Formulartyp `multistep` übernahm mit seinen `steps` vor 7 den Teil der Ausführung. Er ist seit 7 veraltet und wird in
> 8 entfernt: ein Workflow kann alles, was ein Multistep kann, siehe [Multistep-Formulare](forms/multistep.html).

#### Nur Workflow
{: .no_toc }

Ein Formular mit `type: workflow` führt einen der Workflows des Designers aus. Der Benutzer füllt eine einzige Seite mit Feldern aus und drückt Senden,
und der Workflow führt seine Knoten aus, jeden mit den Werten des Formulars als Extra-Variablen:

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

#### Nur Wizard
{: .no_toc }

Ein Block `wizard:` in einem Formular verteilt die Erfassung der Eingaben auf mehrere Seiten. Am Ende läuft nur **ein** Job: die zusammengeführten Extravars aller Seiten gehen an ein einziges Playbook, eine einzige Vorlage oder einen einzigen Workflow.

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

Eine schreibgeschützte Übersichtsseite wird automatisch als letzte Seite des Wizards angehängt; Sie deklarieren sie nicht in YAML.

#### Kombiniert (Wizard über einem Workflow)
{: .no_toc }

Ein Wizard lässt sich über ein Workflow-Formular legen. Der Benutzer füllt die Seiten des Wizards aus und drückt Senden, und **dann** startet der
Workflow. Indem Sie das `defaultModel` eines Wizard-Schritts mit dem
[`extra_vars_key`](workflows/file.html#ansibleforms-own-keys) eines Knotens in Übereinstimmung bringen, können Sie **eine Seite des Wizards an einen Knoten** leiten:

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

Und der Workflow `provision-host`, in einer Workflow-Datei des Designers:

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

`extra_vars_key` ist ein Nachschlagen auf nur einer Ebene, verwenden Sie daher einen flachen Namen in `defaultModel` (zum Beispiel `defaultModel: basics`, nicht `defaultModel: input.basics`), wenn beide übereinstimmen sollen.

Siehe die [Seite zum Wizard](forms/wizard.html) für die vollständige Referenz der Eigenschaften.

### Wie zeige oder überspringe ich Schritte des Wizards bedingt?

Verwenden Sie `when:`, um einen Schritt ganz zu **verbergen**, oder `optional: true`, damit der Benutzer einen sichtbaren Schritt **überspringen** kann. Beide sind unabhängig voneinander und sollten in der Regel nicht kombiniert werden.

#### `when:`: bedingte Sichtbarkeit
{: .no_toc }

Der Schritt wird verborgen, wenn der Ausdruck einen falsy Wert ergibt. Der Benutzer sieht ihn nie, und seine Werte werden nicht erfasst. Der Ausdruck kann frühere Schritte über `__parent__.<stepname>.<field>` lesen:

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

Nur die Seite, die zur gewählten `kind` passt, wird gezeigt. Schritte nach einem verborgenen werden automatisch neu nummeriert.

#### `optional: true`: einen sichtbaren Schritt überspringen lassen
{: .no_toc }

Der Schritt wird im Stepper **immer gezeigt**, aber der Benutzer kann **Weiter** drücken, ohne ihn auszufüllen, und **Senden** ist erlaubt, auch wenn die Seite nie besucht oder ausgefüllt wurde:

```yaml
wizard:
  - subform: basics
    title: Basics
  - subform: advanced
    title: Advanced (optional)
    optional: true
```

Der Benutzer kann die Seite Advanced öffnen, sie leer lassen, Weiter drücken und direkt zur Übersichtsseite weitergehen.

{: .note }
> `when:` steuert die *Sichtbarkeit*; `optional:` steuert, *ob die Seite ausgefüllt werden muss*. Kombinieren Sie sie nicht: um eine Seite verschwinden zu lassen, verwenden Sie `when:`; um sie sichtbar, aber überspringbar zu halten, verwenden Sie `optional:`.

### Wie verweise ich auf Werte aus einem früheren Schritt des Wizards?

Verwenden Sie `$(__parent__.<stepname>.<field>)` in einem beliebigen Feld eines späteren Schritts.

Der `name` eines Wizard-Schritts (standardmäßig der Name seines `subform`) ist der Namensraum, unter dem seine Werte späteren Schritten zur Verfügung stehen:

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

Das ist derselbe `__parent__`-Mechanismus, den `list`- und `yaml`-Subforms verwenden; siehe [Wie greife ich in einem Subform auf Daten des übergeordneten Formulars zu?](#how-do-i-access-parent-form-data-inside-a-subform).

---

## Sicherheit und Anmeldedaten

### Anmeldedaten

Anmeldedaten übergeben.

Anmeldedaten lassen sich auf mehrere Arten übergeben:
* mit der Feldeigenschaft `asCredential`
* mit der Formulareigenschaft `credentials` (Schlüssel-Wert-Paare)
* mit einer Extravar namens `__credentials__`

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

### Ein verlorenes Admin-Passwort wiederherstellen

Wenn Sie das Passwort des lokalen Kontos `admin` verloren haben und kein anderer Admin-Benutzer verfügbar ist, verwenden Sie die Wiederherstellungsoption `REINIT_ADMIN`. **Das ist keine Umgehung der Authentifizierung zur Laufzeit**: sie erzwingt beim Start nur ein einmaliges Zurücksetzen des lokalen Admin-Kontos, danach läuft die normale Authentifizierung.

**Wie es funktioniert**

Wenn `REINIT_ADMIN=1` beim Start gesetzt ist, tut AnsibleForms Folgendes:

1. Es stellt sicher, dass die Gruppe `admins` existiert (und legt sie an, falls sie fehlt).
2. Es sucht den lokalen Admin-Benutzer (Standard-Benutzername `admin`, überschrieben durch `ADMIN_USERNAME`).
3. Wenn er existiert, setzt es sein Passwort auf den Wert von `ADMIN_PASSWORD` zurück und fügt ihn wieder der Gruppe `admins` hinzu.
4. Wenn er nicht existiert, legt es ihn an (wie bei einer Neuinstallation).
5. Es protokolliert die Aktion deutlich sichtbar, damit sie in den Protokollen auffällt.

**Schritte**

1. Stoppen Sie AnsibleForms.
2. Setzen Sie die Umgebungsvariablen (verwenden Sie ein starkes Passwort):
   ```bash
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourNewStrongPasswordHere
   REINIT_ADMIN=1
   ```
   In Docker Compose fügen Sie sie dem Block `environment:` des AnsibleForms-Dienstes hinzu.
3. Starten Sie AnsibleForms und achten Sie in den Protokollen auf eine Zeile wie:
   ```
   REINIT_ADMIN: admin user 'admin' has been recreated. UNSET REINIT_ADMIN now.
   ```
4. Melden Sie sich mit `admin` / `YourNewStrongPasswordHere` an.
5. **Entfernen Sie `REINIT_ADMIN` (oder setzen Sie es wieder auf `0`)** und starten Sie neu, damit künftige Neustarts das Admin-Passwort nicht erneut zurücksetzen.

**Hinweise**

- Wenn Sie ausgesperrt waren, weil LDAP die einzige konfigurierte Anmeldemethode war und ausgefallen ist, fällt das wiederhergestellte lokale Konto `admin` immer auf die Authentifizierung gegen die lokale Datenbank zurück, was genügt, um sich anzumelden und LDAP zu reparieren.
- Die frühere Umgebungsvariable `ENABLE_BYPASS` wurde entfernt. Sie erlaubte die Anmeldung als Admin mit beliebigem Passwort und war unsicher, wenn sie eingeschaltet blieb. `REINIT_ADMIN` setzt nur das Passwort zurück; danach gilt die normale Authentifizierung.
- `REINIT_ADMIN` macht bestehende Sitzungen und Tokens nicht ungültig; nur der Passwort-Hash und die Gruppenmitgliedschaft ändern sich.

### Ziele der REST-Hilfsfunktionen einschränken (Erlaubt-/Sperrlisten)

Die Hilfsfunktionen `fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt` und `fn.fnRestJwtSecure` lassen sich aus den `expression`-Eigenschaften von Formularen aufrufen, um Daten über HTTP zu holen. Standardmäßig können Autoren von Ausdrücken **jede** URL ansprechen, die der AnsibleForms-Host erreicht, was Sie in einem sensiblen Netzwerk einschränken möchten.

Zwei Umgebungsvariablen liefern eine Erlaubtliste und eine Sperrliste:

| Variable | Verhalten |
|---|---|
| `REST_ALLOWED_HOSTS` | Kommagetrennte Hostnamen oder CIDRs. Wenn gesetzt, sind **nur** diese Ziele erlaubt. |
| `REST_DENIED_HOSTS` | Kommagetrennte Hostnamen oder CIDRs. Immer gesperrt. Hat Vorrang vor der Erlaubtliste. |

Hostnamen werden ohne Beachtung der Groß- und Kleinschreibung mit dem Host der URL verglichen. CIDRs werden mit jeder IP verglichen, zu der der Host aufgelöst wird, daher sperrt `10.0.0.0/8` jeden DNS-Namen, der in den privaten Bereich auflöst.

**Beispiele:**

Die erste Zeile erlaubt nur zwei Hosts; die zweite sperrt bestimmte Ziele:

```bash
# Whitelist: only your two API partners are reachable
REST_ALLOWED_HOSTS=api.example.com,partner.api.com

# Blacklist: block cloud metadata + internal admin UIs
REST_DENIED_HOSTS=169.254.169.254,127.0.0.0/8,internal-admin.example
```

{: .warning }
> **Dieser Schutz schützt nur den Node.js-Prozess von AnsibleForms.** Sobald ein Playbook läuft, kann Ansible selbst alles vom Host aus erreichen, außerhalb der Kontrolle von AnsibleForms. Verwenden Sie diese Listen, um zu verhindern, dass Formularautoren Ausdrücke in einen Proxy für Metadatendienste oder interne Oberflächen verwandeln; verlassen Sie sich nicht auf sie als Netzwerk-Firewall.

Seit 7.3.0 prüfen die REST-Hilfsfunktionen das TLS-Zertifikat des Endpunkts, wie jede andere Verbindung auch, und geben nach
[`REST_TIMEOUT_SECONDS`](customization/security.html#env_REST_TIMEOUT_SECONDS) auf (standardmäßig `60`). Vertrauen Sie einer privaten CA mit
`NODE_EXTRA_CA_CERTS`, oder setzen Sie [`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) nur für Endpunkte mit einem
selbstsignierten Zertifikat auf `1`.

### Anbindung an HashiCorp Vault

Anmeldedaten können ihren Benutzer und ihr Passwort aus HashiCorp Vault lesen, konfiguriert als
**Secret Store**. Siehe [Secret Stores](secret-stores). Die `VAULT_*`-Umgebungsvariablen
früherer Versionen werden beim ersten Start von 7.x einmalig als Store `vault` importiert.

Für Secrets, die nur innerhalb eines Playbooks verwendet werden, können Sie auch das Lookup-Plugin `community.hashi_vault`
verwenden, das direkt aus Vault liest und AnsibleForms umgeht.

---

## Integration

### AWX/Tower/AAP abfragen

Informationen aus AWX oder der Ansible Automation Platform abfragen.

Um Auswahllisten mit Daten aus AWX oder Tower zu füllen, verwenden Sie `fn.fnRestBasic` oder `fn.fnRestJwtSecure`. Seit 7.3.0 prüfen diese Hilfsfunktionen
das Zertifikat der AWX-Adresse: bei einem selbstsignierten vertrauen Sie seiner CA mit `NODE_EXTRA_CA_CERTS`, oder setzen Sie
[`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) auf `1`.

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

## Anpassung

### Anpassung

AnsibleForms anpassen.

AnsibleForms ist eine Webanwendung. Wenn Sie es nativ in Node.js betreiben, können Sie seine Dateien ersetzen oder ändern.
Empfohlen ist jedoch, es als Docker-Image zu betreiben und Volume- oder Datei-Mappings hinzuzufügen. Die Docker-Compose-Projekte mappen bereits Verzeichnisse, damit Datenbank, Playbooks, Protokolle, Zertifikate und SSH-Schlüssel persistent bleiben, und Sie können weitere Mappings hinzufügen. Ein eigenes Logo wird auf der Einstellungsseite **Logo** hochgeladen.
Die Datei `custom.js` enthält Ihre eigenen JavaScript-Funktionen zur Verwendung in Ausdrücken. Die eingebauten Funktionen verwenden das Präfix `fn.` (zum Beispiel fn.fnRestBasic); eigene Funktionen verwenden das Präfix `fnc.`.
Auf dieselbe Weise können Sie eigene jq-Definitionen in der Datei `jq.custom.definitions` hinzufügen.

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

### YTT aktivieren

ytt aktivieren.

Um ytt zu verwenden, setzen Sie `USE_YTT=1`.
Mehr Informationen über ytt finden Sie unter https://carvel.dev/ytt/.

{: .important }
> Diese Funktion wurde nicht umfassend getestet, und seit sie als Erweiterung hinzugefügt wurde, kam keine Rückmeldung dazu.
> Wenn Sie ytt verwenden, müssen Sie den Designer deaktivieren: der Designer wandelt die YAML-Dateien in zwischengeschaltetes JSON um und verwirft dabei die ytt-Syntax (die aus YAML-Kommentaren besteht).

Im Wurzelverzeichnis muss ein Verzeichnis `lib` existieren; es wird automatisch in den ytt-Aufruf einbezogen.
Daten lassen sich global bereitstellen, indem man Umgebungsvariablen mit Präfix setzt:

```bash
YTT_VARS_PREFIX=YTT_VAR
YTT_VAR_INVENTORY_PATH=/tmp/inventory.yml
YTT_VAR_default_host=localhost
```  

Alternativ stellen Sie Bibliotheks-Datendateien bereit:

```bash
YTT_LIB_DATA_DEMO=/tmp/demo_data.yml
```  

```yaml
# /tmp/demo_data.yml
message: 'hello demo'
```

**Die Bibliothek `demo` muss im ytt-Kontext existieren (lib/_ytt_lib/demo/values.yml)**

```yaml
# lib/_ytt_lib/demo/values.yml
#@ data/values
---
demo: {}
```  

Die geladenen Daten lassen sich dann verwenden:

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

## Zugriffskontrolle

### Wie schränke ich ein, was Benutzer tun können (Rollenoptionen)?

Über die Einschränkung hinaus, welche Formulare eine Rolle sehen kann, schalten die `options` einer Rolle Funktionen der Oberfläche für ihre Mitglieder ein oder aus.
Siehe [Rollenoptionen](config/roles.html#role-options) für jede Option, ihren Standard und wie sich Optionen über Rollen hinweg kombinieren.

### Wie setze ich eigene RBAC-Logik in meinen Playbooks oder Formularen um?

Die Identität des Benutzers steht bei jeder Ausführung sowohl im Frontend als auch im Backend zur Verfügung.

Bei jeder Übermittlung eines Formulars fügt AnsibleForms automatisch die vollständige Identität des aktuellen Benutzers in die Extravars ein, die an Ansible gesendet werden:

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

Ihr Playbook oder jedes eigene Ansible-Modul kann daher `ansibleforms_user` direkt für feingranulare Entscheidungen verwenden, zum Beispiel um nur bestimmten Gruppen das Ändern des Produktionsinventars zu erlauben oder um einen Audit-Trail mit dem Benutzernamen des Absenders zu schreiben.

Im **Frontend** steht dasselbe Objekt über das spezielle Feld `__user__` zur Verfügung:

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

**Typische Muster:**

Die Benutzeridentität unterstützt Muster wie die folgenden:

- **Abgleich mit einer RBAC-Konfigurationsdatei oder -Datenbank**: laden Sie eine YAML- oder JSON-Datei (mit `fn.fnReadYamlFile` oder einem Ausdruck), die Gruppen auf erlaubte Ressourcen abbildet, und filtern Sie dann nach `$(__user__.groups)`
- **Audit-Trail**: übergeben Sie `ansibleforms_user.username` als Extra-Variable, um festzuhalten, wer den Job ausgelöst hat
- **Dynamische Feldwerte**: zeigen Sie eine andere Menge von Enum-Auswahlen, füllen Sie Felder vor oder verbergen Sie Abschnitte abhängig von den Gruppen oder Rollen des Benutzers
- **Autorisierung im Playbook**: stellen Sie sicher, dass `ansibleforms_user.groups` eine erforderliche Gruppe enthält, bevor das Playbook fortfährt, als zusätzliche Prüfung unabhängig von der `roles`-Liste des Formulars

{: .note }
> Das obige Objekt wird standardmäßig gesendet. Wenn die Instanz `EXTRAVARS_USER_FIELDS` setzt
> oder das Formular `userExtravars` setzt, werden nur die dort genannten Schlüssel gesendet, daher braucht ein Playbook, das
> auf `ansibleforms_user.groups` prüft, `groups` unter diesen Schlüsseln. Das Feld `__user__` im Frontend
> kommt aus dem Login-Token und wird von keiner der beiden Einstellungen gekürzt.

---

## Job-Zeitplanung

### Wie plane ich ein Formular so ein, dass es automatisch läuft?

Öffnen Sie die Auswahl neben **Senden** und wählen Sie **Planen (wiederkehrend)** oder **Später ausführen (einmalig)**; sie erfordern die Rollen-
optionen `allowScheduledJobs` (Admin-Ebene) und `allowPlannedJobs`. Siehe [Zeitpläne](jobs/schedules.html).

### Welche Cron-Ausdrücke kann ich verwenden?

Ein wiederkehrender Zeitplan nimmt einen Standard-Cron-Ausdruck mit 5 Feldern (Minute, Stunde, Tag des Monats, Monat, Wochentag).

| Ausdruck | Läuft |
|---|---|
| `*/15 * * * *` | Alle 15 Minuten |
| `0 * * * *` | Jede Stunde, zur vollen Stunde |
| `0 */6 * * *` | Alle 6 Stunden, um 00:00, 06:00, 12:00 und 18:00 |
| `0 2 * * *` | Jeden Tag um 02:00 |
| `30 7 * * 1-5` | Montag bis Freitag um 07:30 |
| `0 8 * * MON` | Jeden Montag um 08:00 (Tages- und Monatsnamen werden akzeptiert) |
| `0 0 1 * *` | Um Mitternacht am ersten Tag jedes Monats |
| `0 22 L * *` | Um 22:00 am letzten Tag jedes Monats |
| `0 6 * * 1#1` | Um 06:00 am ersten Montag jedes Monats |
| `*/30 * * * * *` | Alle 30 Sekunden (ein optionales sechstes Feld vorn ist die Sekunde) |

Wenn sowohl der Tag des Monats als auch der Wochentag gesetzt sind, läuft der Zeitplan, sobald eines davon passt: `0 0 13 * 5` läuft am 13.
und an jedem Freitag. Der Server lehnt einen Ausdruck ab, den er nicht ausführen kann, oder einen, der nie eintreten kann (`0 0 30 2 *`).

Auf der Seite **Zeitpläne** beschreibt der Cron-Editor den Ausdruck und zeigt eine Vorschau seiner nächsten Läufe. Er akzeptiert keine Kurznamen
wie `@daily`, keinen Platzhalter `?` und keinen Modifikator `W` (nächster Werktag), halten Sie sich daher an die Formen in der Tabelle.

{: .note }
> **Zeitzone** Cron-Zeitpläne laufen in der Zeitzone des Servers, gesetzt mit [`LOG_TZ`](customization/logging.html#env_LOG_TZ)
> (Standard `UTC`), nicht in der Zeitzone Ihres Profils oder Ihres Browsers. `0 2 * * *` mit `LOG_TZ=Europe/Madrid` läuft das ganze Jahr um 02:00
> Madrider Zeit und folgt dabei der Sommerzeit. Der Cron-Editor zeigt die Vorschau der nächsten Läufe in derselben Zone. Pull-Zeitpläne für Repositories
> verwenden dieselbe Zone.

---

## Formulardaten speichern und laden

### Wie speichere und lade ich Formulardaten, ohne einen Job auszuführen?

Wählen Sie **Speichern** in der Auswahl neben **Senden**, um die Feldwerte zu speichern, und später **Aus Speicher laden**, um sie wiederherzustellen.
Passwortfelder werden nie gespeichert. Das erfordert die Rollenoption `allowStoredJobs`. Siehe [Gespeicherte Jobs](jobs/stored-jobs.html).

---

## Verschachtelte Formulare und strukturierte Felder

### Wie erfasse ich strukturierte oder wiederholte Daten in einem Formular?

Verwenden Sie `list`- und `yaml`-Felder mit Subforms (6.2.0+).

Um komplexe strukturierte Daten zu erfassen, etwa eine Liste von Servern, eine Menge von Netzwerkschnittstellen oder ein einzelnes verschachteltes Objekt, verwenden Sie den Feldtyp `list` oder `yaml` zusammen mit einem `subform`.

Ein **Subform** ist ein wiederverwendbares Formularfragment (definiert mit `type: subform`), das nie als eigenständige Kachel gezeigt wird. Es existiert nur, um von Feldern in anderen Formularen referenziert zu werden. Siehe die [Dokumentation zu Subforms](forms/subform.html) für die vollständige Referenz.

**Eine Liste strukturierter Zeilen erfassen: Feld `list`:**

Ein Feld `list` öffnet das referenzierte Subform einmal pro Zeile:

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

Die Extravar `servers`, die an Ansible gesendet wird, ist ein Array von Objekten: `[{hostname: "web1", ip: "10.0.0.1"}, ...]`

**Ein einzelnes strukturiertes Objekt bearbeiten: Feld `yaml`:**

Das Feld `yaml` hat drei Modi:

| Modus | Wie | Verhalten |
|---|---|---|
| **Editor** | Standard | Zeigt einen vollständigen YAML-Editor mit Syntaxhervorhebung, in den der Benutzer direkt tippen kann |
| **Schreibgeschützt** | `readonly: true` | Stellt den YAML-Wert als formatierten, schreibgeschützten Text dar, ohne Bearbeitung |
| **Subform** | `subform: MySubform` | Verbirgt den rohen Editor; öffnet das Subform beim Klick als Drilldown-Editor |

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

**Hoch- und Herunterladen: Felder `list` und `yaml`:**

Beide Feldtypen unterstützen clientseitige Dateiübertragung über zwei optionale Eigenschaften:

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
> Das Feld `list` und der Formulartyp `subform` haben das Feld `table` und `tableFields` ersetzt, die in 7.0.0 entfernt wurden.

### Wie greife ich in einem Subform auf Daten des übergeordneten Formulars zu?

Auf Feldwerte des übergeordneten Formulars aus einem Subform heraus über `__parent__` verweisen (v6.3.0+).

Wenn sich ein Subform öffnet, ob aus einem Feld **`list`** (jeder Zeileneditor) oder einem Feld **`yaml`** im Subform-Modus, fügt AnsibleForms automatisch ein spezielles schreibgeschütztes Feld namens `__parent__` in das Subform ein. Es enthält eine Momentaufnahme **jedes Feldwerts des übergeordneten Formulars zum Zeitpunkt, als das Subform geöffnet wurde**, einschließlich Konstanten und Vars.

So können Subform-Felder Ausdrücke verwenden, die auf Daten des übergeordneten Formulars verweisen, ohne zusätzliche Konfiguration.

#### Was steht in `__parent__`?
{: .no_toc }

`__parent__` ist ein einfaches Objekt, dessen Schlüssel die Feldnamen des übergeordneten Formulars sind:

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
> `__parent__` wird **nicht an Ansible gesendet**; wie `__user__` wird es aus den Extravars entfernt. Es ist eine reine Frontend-Hilfe für Ausdrücke in Subforms.

#### Auf Werte des übergeordneten Formulars in Subform-Ausdrücken zugreifen
{: .no_toc }

Verweisen Sie mit der üblichen Ausdruckssyntax `$(...)` auf Werte des übergeordneten Formulars:

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

#### Verschachtelte Subforms
{: .no_toc }

`__parent__` verweist immer auf das **unmittelbar übergeordnete** Formular. Wenn Sie eine `list` in ein Subform verschachteln, das selbst aus einem übergeordneten Formular geöffnet wird, enthält das `__parent__` des inneren Subforms die Daten des mittleren Subforms. Um weitere Ebenen zu erreichen, verketten Sie Verweise wie `$(__parent__.__parent__.someField)`, sofern das mittlere Subform sein eigenes `__parent__` ebenfalls weitergibt.

### Wie migriere ich von `table` / `tableFields` zu `list` / `subform`?

Das Feld `table` und die Eigenschaft `tableFields` wurden in 6.2.0 als veraltet markiert und in 7.0.0 entfernt, und ein Formular, das sie noch verwendet, besteht die Validierung nicht. So migrieren Sie:

1. Übernehmen Sie die Spalten aus `tableFields` in ein neues Formular mit `type: subform` und regulären `formfields`
2. Ersetzen Sie das Feld `table` durch ein Feld `list`, das über `subform: MySubformName` auf das Subform verweist

**Vorher:**
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

**Nachher:**
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

#### `from` in `tableFields` zu `__parent__`-Ausdrücken migrieren
{: .no_toc }

Die Eigenschaft `from` von Enum-Spalten in `tableFields` füllte die Auswahlmöglichkeiten aus einem anderen Feld des übergeordneten Formulars. In einem `subform` wird sie durch eine `expression` ersetzt, die denselben Wert über `__parent__` liest.

**Vorher: `tableFields` mit `from`:**

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

**Nachher: Subform mit `__parent__`-Ausdruck:**

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
> `$(__parent__.available_departments)` gibt den **aktuellen Wert** dieses Felds zurück; ist dieses Feld selbst ein dynamisches Ausdrucksfeld, sieht das Subform daher immer das zuletzt ausgewertete Ergebnis aus dem übergeordneten Formular.

