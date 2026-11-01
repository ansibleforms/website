---
layout: default
title: FAQ
nav_order: 2
translated_from: 487a25c7f3b24b3a0c0d4df08c858a52d48f8556
---

# Najczęściej zadawane pytania
{: .no_toc }

Typowe pytania i odpowiedzi dotyczące AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Pierwsze kroki

### Topologia wdrożenia: jeden kontener czy kilka węzłów

Domyślnie jeden kontener AnsibleForms uruchamia aplikację webową i pracę w tle w jednym procesie, obok kontenera RTE, który
uruchamia playbooki. Uruchamiaj go z polityką restartu (na przykład `restart: unless-stopped` w Dockerze) i twórz kopie zapasowe zarówno bazy danych, jak i
wolumenu trwałego.

Aby uruchomić kilka replik za load balancerem, podziel proces za pomocą `AF_ROLE`:

- węzły `app` obsługują interfejs webowy i API: uruchom ich tyle, ile chcesz, każdy z tym samym `ACCESS_TOKEN_SECRET`
- `worker` wykonuje pracę w tle: schemat i jego aktualizacje, config seed, harmonogramy, nocną kopię zapasową, synchronizację
  repozytoriów i porządki. Naraz pracuje jeden worker, trzymając blokadę w bazie danych; drugi czeka i przejmuje pracę, gdy pierwszy się zatrzyma
- kontenery `rte` uruchamiają playbooki: uruchom ich więcej, aby uruchamiać więcej playbooków jednocześnie

Węzły aplikacji i worker współdzielą bazę danych, wolumen trwały i `ENCRYPTION_SECRET`. RTE w trybie gniazda (wychodzącym lub
przychodzącym, zobacz [Tryby](rte/modes.html)) nie potrzebuje ani bazy danych, ani `ENCRYPTION_SECRET`. Asystent czatu wymaga sesji sticky, a
każdy węzeł prowadzi własny dziennik. Zobacz [Skalowanie](production/scaling.html) i konfigurację
[examples/scale](https://github.com/ansibleforms/ansibleforms/tree/main/examples/scale).

### Zarządzanie formularzami z wielu repozytoriów

Formularze z każdego repozytorium Git z włączoną opcją **Używać do formularzy?** są scalane automatycznie; przy powtarzających się nazwach formularzy wygrywa
pierwszy, a w dzienniku zapisywane jest ostrzeżenie. Trzymaj `config.yaml` tylko w jednym repozytorium. Zobacz [Repozytoria git](repositories/).

### O repozytoriach

AnsibleForms klonuje i pobiera repozytoria Git w ścieżce repozytoriów (`REPO_PATH`), zarządzane w **Ustawienia > Repozytoria**.
Przełączniki w każdym repozytorium określają, co ono zawiera: konfigurację, formularze, playbooki lub pliki zmiennych. Zobacz [Repozytoria git](repositories/).

### Walidacja plików formularzy w VS Code

Dodaj nagłówek schematu do plików YAML formularzy, aby uzyskać walidację na żywo i autouzupełnianie w VS Code.

Zainstaluj [rozszerzenie YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) i dodaj ten komentarz jako **pierwszy wiersz** każdego pliku formularza:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/ansibleforms/ansibleforms/main/server/schema/public/form_schema.json
```

Działa to zarówno dla plików z jednym formularzem (słownik YAML), jak i z wieloma formularzami (lista YAML):

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

VS Code podczas pisania podświetla nieznane właściwości, brakujące wymagane pola i nieprawidłowe typy.

---

## Zarządzanie zadaniami

### Ponowne uruchamianie zadania z wypełnionymi danymi

Przycisk ponownego uruchomienia otwiera formularz wypełniony wartościami z wcześniejszego zadania; pola haseł nigdy nie są zapisywane.
Wymaga opcji roli `allowJobRelaunch`, a formularz może to wyłączyć przez `allowRelaunch: false`. Zobacz [Ponowne uruchamianie zadania](jobs/actions.html#relaunch-a-job).

### Plik dziennika zadania

Śledzenie postępu przez plik dziennika danego zadania (v6.1.2).

AnsibleForms może wyświetlać **plik dziennika danego zadania** obok wyniku Ansible. Pozwala to śledzić postęp długo działających modułów własnych, które w przeciwnym razie nie dawałyby podczas wykonywania żadnej widocznej informacji zwrotnej.

{: .note }
> Ta funkcja działa tylko dla playbooków uruchamianych na RTE. Szablony i joby w AWX, AAP, Ascender, Semaphore, Rundeck lub
> Jenkins nie mają pliku dziennika.

**Jak to działa:**
- Podczas działania zadania RTE obserwuje plik dziennika w znanej ścieżce wewnątrz folderu playbooka
- Co dwie sekundy, jeśli plik się zmienił, RTE kopiuje jego zawartość do zadania, i jeszcze raz, gdy playbook się kończy
- Plik dziennika jest wyświetlany w sekcji **Plik dziennika** wyniku zadania, z numeracją jak wiersze wyniku: znacznik czasu i poziom wiersza dziennika (ERROR, WARNING, INFO, DEBUG) są odczytywane i kolorowane tak jak w wyniku, a kolory ANSI są obsługiwane

**Konwencja ścieżki pliku dziennika:**

Plik dziennika musi być zapisywany w tej ścieżce:

```
<playbook_dir>/.joblogs/job_log_<jobid>.log
```

**AnsibleForms automatycznie przekazuje `__jobid__`**, więc możesz złożyć ścieżkę w playbooku bez dodatkowej konfiguracji:

{% raw %}
```yaml
job_log_path: "{{ vars['playbook_dir'] }}/.joblogs/job_log_{{ __jobid__ }}.log"
```
{% endraw %}

Przekaż tę zmienną do każdej roli lub modułu własnego, który ma zapisywać postęp do pliku.

**Obowiązki twórcy playbooka / modułu:**
- **Utworzyć** plik dziennika (i jego katalog `.joblogs/`) na początku operacji
- **Zapisywać** sensowne komunikaty o postępie w miarę trwania operacji

RTE usuwa plik, gdy playbook się kończy, a ostatnia zawartość zostaje zapisana w zadaniu.

**Kolorowanie ANSI jest obsługiwane.**  
Standardowe sekwencje ucieczki ANSI (na przykład `\033[92m` dla zielonego i `\033[91m` dla czerwonego) w komunikatach dziennika są wyświetlane w interfejsie jako kolory, więc stany sukcesu, ostrzeżenia i błędu można odróżnić na pierwszy rzut oka.

**Typowy przypadek użycia:**  
Własny moduł Ansible w Pythonie, który wykonuje długą sekwencję wywołań API lub operacji na danych (na przykład workflow DR SnapMirror), może dopisywać do pliku dziennika jeden wiersz na każdy krok. Operator obserwujący zadanie w AnsibleForms widzi wtedy postęp na żywo w sekcji Plik dziennika, ponieważ strona zadania je śledzi.

### Jobid

Przekazywanie ID bieżącego zadania.

AnsibleForms automatycznie wysyła ID bieżącego zadania w extravars jako `__jobid__`; konfiguracja nie jest wymagana.

### Informacje o użytkowniku

Przekazywanie bieżącego użytkownika.

AnsibleForms automatycznie wysyła informacje o użytkowniku w extravars jako `ansibleforms_user`; konfiguracja nie jest wymagana.

Możesz wybrać, ile z tych informacji jest wysyłane. `EXTRAVARS_USER_FIELDS` przyjmuje listę kluczy najwyższego poziomu oddzielonych przecinkami
(`username,email,type`) lub `none`, aby nic nie wysyłać; formularz może to nadpisać własną właściwością `userExtravars`.
Domyślnie wysyłany jest cały obiekt, jak wcześniej. Opisany niżej `__user__` po stronie formularza pochodzi z tokenu logowania i nigdy nie podlega temu ustawieniu.

### Informacje o użytkowniku w formularzu

Dostęp do informacji o bieżącym użytkowniku w formularzu (v4.0.2).

Pole `__user__` jest automatycznie dodawane do formularza i można się do niego odwoływać w wyrażeniach:

```yaml
expression: $(__user__)
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
expression: $(__user__.roles)
```

---

## Pola formularzy

### Kaskadowe listy rozwijane

Tworzenie kaskadowych list rozwijanych.

Pola `enum` (listy rozwijane) mogą zawierać symbole zastępcze we właściwości `query` lub `expression`, w formacie `$(another_field)` lub `$(another_field[0].name)`.  
Gdy tylko pole, do którego się odwołują, się zmieni, pole odwołujące się jest ponownie obliczane, co daje dynamiczne, kaskadowe listy rozwijane.  
Aplikacja webowa klienta ponownie oblicza pola co 100 ms; przy obecnych procesorach i silniku Chromium działa to zupełnie płynnie.

{: .note }
> Odwołanie do innego pola enum zwraca wybrane wartości, **a nie** całą listę rozwijaną. Użyj właściwości `placeholderColumn` lub notacji z kropką, na przykład `$(city.name)`.  
> **Nowość w v4.0.20**: ustawienie placeholderColumn na "*" zwraca cały rekord zamiast jednej kolumny.

Przykłady odpytują `CONN1`, [bazę danych](databases.html) z Połączenia > Bazy danych (od wersji 7.5.0) lub poświadczenie typu baza danych.

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

### Symbole zastępcze pól

Odwoływanie się do wartości innego pola.

Symbole zastępcze to odwołania do innych pól formularza.  
Symbol zastępczy ma zawsze format `$(reference)`, a symbole zastępcze mogą zawierać zarówno wyrażenia, jak i zapytania.  
Symbol zastępczy wskazujący proste pole (text, number, password) zawiera wartość tego pola.  
Symbol zastępczy wskazujący pole enum oparte na obiektach musi używać właściwości `placeholderColumn` lub notacji z kropką, na przykład `$(city.name)`.  
Symbol zastępczy wskazujący pole expression zwraca cały obiekt; możesz też użyć zaawansowanego odwołania w stylu JavaScript, na przykład `$(myarray[0].name)`.

{: .important }
> Symbol zastępczy jest podstawiany **przed** obliczeniem wyrażenia. Jeśli wynik ma być ciągiem znaków, musisz ująć go w cudzysłowy.  
> **Nowość w v4.0.20**: ustawienie placeholderColumn na "*" zwraca cały rekord zamiast jednej kolumny.

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

### Ukrywanie pola

Ukrycie pola.

Ukryj pole właściwością pola `hide` albo pokazuj i ukrywaj je dynamicznie właściwościami pola `dependencies` i `dependencyFn`.

### Grupowanie pól

Grupowanie pól w bloku.

Użyj właściwości pola `group`. Pola o tej samej nazwie grupy są grupowane w bloku.

### Walidacja pola

Walidacja pola.

Użyj właściwości walidacji pola, takich jak `regex`, `minValue` i `notIn`.

### Wartość domyślna w polu enum

Wartość domyślna pola enum.

Właściwość pola `default` ustawia wartość domyślną, a w polach `enum` możesz używać wartości takich jak `__auto__`, aby automatycznie wybrać pierwszą pozycję.

Aby uzyskać dynamiczną wartość domyślną opartą na wyrażeniu, przenieś domyślną pozycję na początek listy, jak w poniższym przykładzie.

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

### Wartość domyślna z wyrażenia

Wartość domyślna z wyrażenia.

Dla pól text, number lub date właściwość `default` ustawia statyczną wartość domyślną.

Aby wartość domyślna była dynamiczna, oparta na wyrażeniu, użyj jednej z dwóch właściwości:
* `editable`: użyj właściwości editable, aby pole expression było edytowalne
* `evalDefault`: użyj właściwości evalDefault, aby wartość domyślna była obliczana jako wyrażenie

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

## Kreator i workflow

### Czym różni się kreator (wizard) od workflow?

**Kreator** (wizard) i **workflow** składają się z kroków, ale działają na różnych warstwach i można je łączyć.

| | [`workflow`](forms/workflow.html) (Workflow) | [`wizard`](forms/wizard.html) |
|---|---|---|
| **Warstwa** | Wykonanie | Formularz / interfejs |
| **Co dzieli** | Zadanie na węzły, które działają jeden po drugim lub równolegle | Dane wejściowe jednego formularza na wiele stron |
| **Wynik** | 1 zadanie workflow, z zadaniem na każdy węzeł (każdy z własnym playbookiem lub szablonem) | Na końcu uruchamiane jest 1 zadanie |
| **`type` formularza** | Musi być `workflow` | Działa z każdym typem formularza z wyjątkiem `subform` |
| **Definiowany przez** | [Plik workflow](workflows/file.html) projektanta (`workflow:`) | Listę odwołań do [podformularzy](forms/subform.html) (`wizard:`) |
| **Używaj, gdy** | „Zrób A, potem B, potem C jako osobne zadania” | „Mój formularz ma za dużo pól na jedną stronę” |

**Najważniejsze:** workflow dotyczy tego, *co jest uruchamiane i w jakiej kolejności*; `wizard` dotyczy tego, *jak użytkownik wypełnia formularz*.

{: .note }
> Typ formularza `multistep`, z jego `steps`, realizował część wykonawczą przed wersją 7. Jest przestarzały od wersji 7 i zostanie usunięty w
> 8: workflow robi wszystko, co multistep, zobacz [Formularze wieloetapowe](forms/multistep.html).

#### Tylko workflow
{: .no_toc }

Formularz `type: workflow` uruchamia jeden z workflow projektanta. Użytkownik wypełnia jedną stronę pól i naciska Wyślij,
a workflow uruchamia swoje węzły, każdy z wartościami formularza jako extra vars:

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

#### Tylko kreator
{: .no_toc }

Blok `wizard:` w formularzu rozkłada zbieranie danych na wiele stron. Na końcu uruchamiane jest tylko **jedno** zadanie: scalone extravars ze wszystkich stron są wysyłane do jednego playbooka, szablonu lub workflow.

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

Strona przeglądu tylko do odczytu jest dołączana automatycznie jako ostatnia strona kreatora; nie deklarujesz jej w YAML.

#### Połączenie (kreator nad workflow)
{: .no_toc }

Kreator można nałożyć na formularz workflow. Użytkownik wypełnia strony kreatora i naciska Wyślij, a **dopiero potem**
uruchamia się workflow. Dopasowując `defaultModel` kroku kreatora do
[`extra_vars_key`](workflows/file.html#ansibleforms-own-keys) węzła, możesz skierować **jedną stronę kreatora do jednego węzła**:

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

A workflow `provision-host`, w pliku workflow projektanta:

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

`extra_vars_key` to wyszukiwanie jednopoziomowe, więc jeśli chcesz, aby się zgadzały, używaj płaskiej nazwy w `defaultModel` (na przykład `defaultModel: basics`, a nie `defaultModel: input.basics`).

Pełny opis właściwości znajdziesz na [stronie kreatora](forms/wizard.html).

### Jak warunkowo pokazywać lub pomijać kroki kreatora?

Użyj `when:`, aby całkowicie **ukryć** krok, lub `optional: true`, aby pozwolić użytkownikowi **pominąć** widoczny krok. Te dwie opcje są niezależne i zasadniczo nie należy ich łączyć.

#### `when:`: widoczność warunkowa
{: .no_toc }

Krok jest ukryty, gdy wyrażenie daje wartość fałszywą. Użytkownik nigdy go nie widzi, a jego wartości nie są zbierane. Wyrażenie może odczytywać wcześniejsze kroki przez `__parent__.<stepname>.<field>`:

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

Pokazywana jest tylko strona pasująca do wybranego `kind`. Kroki po ukrytym kroku są automatycznie przenumerowywane.

#### `optional: true`: możliwość pominięcia widocznego kroku
{: .no_toc }

Krok jest **zawsze widoczny** w pasku kroków, ale użytkownik może nacisnąć **Dalej** bez jego wypełniania, a **Wyślij** jest dozwolone, nawet jeśli strona nie została odwiedzona ani ukończona:

```yaml
wizard:
  - subform: basics
    title: Basics
  - subform: advanced
    title: Advanced (optional)
    optional: true
```

Użytkownik może otworzyć stronę Advanced, zostawić ją pustą, nacisnąć Dalej i przejść bezpośrednio do strony przeglądu.

{: .note }
> `when:` steruje *widocznością*; `optional:` steruje tym, *czy stronę trzeba ukończyć*. Nie łącz ich: aby strona zniknęła, użyj `when:`; aby pozostała widoczna, ale możliwa do pominięcia, użyj `optional:`.

### Jak odwołać się do wartości z wcześniejszego kroku kreatora?

Użyj `$(__parent__.<stepname>.<field>)` w dowolnym polu późniejszego kroku.

`name` kroku kreatora (domyślnie nazwa jego `subform`) to przestrzeń nazw, pod którą jego wartości są udostępniane późniejszym krokom:

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

To ten sam mechanizm `__parent__`, którego używają podformularze `list` i `yaml`; zobacz [Jak uzyskać dostęp do danych formularza nadrzędnego w podformularzu?](#how-do-i-access-parent-form-data-inside-a-subform).

---

## Bezpieczeństwo i poświadczenia

### Poświadczenia

Przekazywanie poświadczeń.

Poświadczenia można przekazywać na kilka sposobów:
* za pomocą właściwości pola `asCredential`  
* za pomocą właściwości formularza `credentials` (pary klucz-wartość)
* za pomocą extravar o nazwie `__credentials__`

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

### Odzyskiwanie utraconego hasła administratora

Jeśli utraciłeś hasło lokalnego konta `admin`, a żaden inny administrator nie jest dostępny, użyj opcji odzyskiwania `REINIT_ADMIN`. **Nie jest to obejście uwierzytelniania w czasie działania**: wymusza tylko jednorazowe zresetowanie lokalnego konta administratora przy uruchomieniu, po czym uwierzytelnianie działa normalnie.

**Jak to działa**

Gdy przy uruchomieniu ustawione jest `REINIT_ADMIN=1`, AnsibleForms:

1. Upewnia się, że grupa `admins` istnieje (tworzy ją, jeśli jej brakuje).
2. Wyszukuje lokalnego użytkownika administratora (domyślna nazwa `admin`, nadpisywana przez `ADMIN_USERNAME`).
3. Jeśli istnieje, resetuje jego hasło na wartość `ADMIN_PASSWORD` i ponownie dołącza go do grupy `admins`.
4. Jeśli nie istnieje, tworzy go (tak jak przy świeżej instalacji).
5. Wyraźnie zapisuje tę akcję w dzienniku, aby była w nim widoczna.

**Kroki**

1. Zatrzymaj AnsibleForms.
2. Ustaw zmienne środowiskowe (użyj silnego hasła):
   ```bash
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourNewStrongPasswordHere
   REINIT_ADMIN=1
   ```
   W Docker Compose dodaj je do bloku `environment:` usługi AnsibleForms.
3. Uruchom AnsibleForms i obserwuj dziennik, czekając na wiersz taki jak:
   ```
   REINIT_ADMIN: admin user 'admin' has been recreated. UNSET REINIT_ADMIN now.
   ```
4. Zaloguj się jako `admin` / `YourNewStrongPasswordHere`.
5. **Usuń `REINIT_ADMIN` (lub ustaw go z powrotem na `0`)** i uruchom ponownie, aby kolejne restarty nie resetowały znowu hasła administratora.

**Uwagi**

- Jeśli straciłeś dostęp, ponieważ LDAP był jedyną skonfigurowaną metodą logowania i przestał działać, odzyskane lokalne konto `admin` zawsze korzysta z uwierzytelniania w lokalnej bazie danych, co wystarcza, aby się zalogować i naprawić LDAP.
- Dawna zmienna środowiskowa `ENABLE_BYPASS` została usunięta. Pozwalała logować się jako administrator dowolnym hasłem, a pozostawienie jej włączonej było niebezpieczne. `REINIT_ADMIN` tylko resetuje hasło; potem obowiązuje normalne uwierzytelnianie.
- `REINIT_ADMIN` nie unieważnia istniejących sesji ani tokenów; zmieniają się tylko skrót hasła i członkostwo w grupie.

### Ograniczanie celów funkcji pomocniczych REST (listy dozwolonych i zabronionych)

Funkcje pomocnicze `fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt` i `fn.fnRestJwtSecure` można wywoływać we właściwościach `expression` formularza, aby pobierać dane przez HTTP. Domyślnie autorzy wyrażeń mogą kierować je do **dowolnego** adresu URL, do którego ma dostęp host AnsibleForms, co w wrażliwej sieci warto ograniczyć.

Dwie zmienne środowiskowe zapewniają listę dozwolonych i listę zabronionych:

| Zmienna | Działanie |
|---|---|
| `REST_ALLOWED_HOSTS` | Nazwy hostów lub CIDR oddzielone przecinkami. Gdy jest ustawiona, dozwolone są **tylko** te cele. |
| `REST_DENIED_HOSTS` | Nazwy hostów lub CIDR oddzielone przecinkami. Zawsze blokowane. Ma pierwszeństwo przed listą dozwolonych. |

Nazwy hostów są porównywane z hostem z adresu URL bez rozróżniania wielkości liter. CIDR są porównywane z każdym adresem IP, na który rozwiązuje się host, więc `10.0.0.0/8` blokuje każdą nazwę DNS rozwiązywaną do zakresu prywatnego.

**Przykłady:**

Pierwszy wiersz dopuszcza tylko dwa hosty; drugi blokuje określone cele:

```bash
# Whitelist: only your two API partners are reachable
REST_ALLOWED_HOSTS=api.example.com,partner.api.com

# Blacklist: block cloud metadata + internal admin UIs
REST_DENIED_HOSTS=169.254.169.254,127.0.0.0/8,internal-admin.example
```

{: .warning }
> **Ta ochrona chroni tylko proces Node.js AnsibleForms.** Gdy playbook już działa, sam Ansible może sięgnąć z hosta do czegokolwiek, poza kontrolą AnsibleForms. Używaj tych list, aby autorzy formularzy nie zamieniali wyrażeń w proxy do usług metadanych lub wewnętrznych interfejsów; nie traktuj ich jak sieciowej zapory.

Od wersji 7.3.0 funkcje pomocnicze REST sprawdzają certyfikat TLS punktu końcowego, tak jak każde inne połączenie, i rezygnują po
[`REST_TIMEOUT_SECONDS`](customization/security.html#env_REST_TIMEOUT_SECONDS) (domyślnie `60`). Zaufaj prywatnemu CA przez
`NODE_EXTRA_CA_CERTS` lub ustaw [`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) na `1` tylko dla punktów końcowych z
certyfikatem samopodpisanym.

### Integracja z HashiCorp Vault

Poświadczenia mogą odczytywać użytkownika i hasło z HashiCorp Vault, skonfigurowanego jako
**magazyn sekretów**. Zobacz [Magazyny sekretów](secret-stores). Zmienne środowiskowe `VAULT_*`
z wcześniejszych wersji są importowane raz jako magazyn `vault` przy pierwszym uruchomieniu 7.x.

W przypadku sekretów używanych tylko w jednym playbooku możesz też użyć pluginu lookup `community.hashi_vault`,
który odczytuje dane bezpośrednio z Vault, z pominięciem AnsibleForms.

---

## Integracja

### Odpytywanie AWX/Tower/AAP

Pobieranie informacji z AWX lub Ansible Automation Platform.

Aby wypełniać listy rozwijane danymi z AWX lub Tower, użyj `fn.fnRestBasic` lub `fn.fnRestJwtSecure`. Od wersji 7.3.0 te funkcje sprawdzają
certyfikat adresu AWX: przy certyfikacie samopodpisanym zaufaj jego CA przez `NODE_EXTRA_CA_CERTS` lub ustaw
[`REST_IGNORE_CERTS`](customization/security.html#env_REST_IGNORE_CERTS) na `1`.

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

## Dostosowywanie

### Dostosowywanie

Dostosowywanie AnsibleForms.

AnsibleForms to aplikacja webowa. Gdy uruchamiasz ją natywnie w Node.js, możesz zastępować lub zmieniać jej pliki.  
Zalecanym podejściem jest jednak uruchamianie jej jako obrazu Docker i dodawanie mapowań wolumenów lub plików. Projekty Docker Compose już mapują katalogi, aby baza danych, playbooki, dzienniki, certyfikaty i klucze SSH były trwałe, i możesz dodać kolejne mapowania. Własne logo przesyła się na stronie ustawień **Logo**.  
Plik `custom.js` zawiera Twoje własne funkcje JavaScript do użycia w wyrażeniach. Funkcje wbudowane mają prefiks `fn.` (na przykład fn.fnRestBasic); funkcje własne mają prefiks `fnc.`.  
W ten sam sposób możesz dodać własne definicje jq w pliku `jq.custom.definitions`.

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

### Włączanie YTT

Włączanie ytt.

Aby używać ytt, ustaw `USE_YTT=1`.  
Więcej informacji o ytt znajdziesz na https://carvel.dev/ytt/.

{: .important }  
> Ta funkcja nie została gruntownie przetestowana i od czasu dodania jej jako usprawnienia nie otrzymano żadnych opinii.  
> Używając ytt, musisz wyłączyć projektanta: projektant konwertuje pliki YAML do pośredniego JSON i usuwa składnię ytt (która składa się z komentarzy YAML).

W katalogu głównym musi istnieć katalog `lib`; jest on automatycznie dołączany do wywołania ytt.
Dane można dostarczyć globalnie, ustawiając zmienne środowiskowe z prefiksem:  

```bash
YTT_VARS_PREFIX=YTT_VAR
YTT_VAR_INVENTORY_PATH=/tmp/inventory.yml
YTT_VAR_default_host=localhost
```  

Alternatywnie dostarcz pliki danych biblioteki:

```bash
YTT_LIB_DATA_DEMO=/tmp/demo_data.yml
```  

```yaml
# /tmp/demo_data.yml
message: 'hello demo'
```

**Biblioteka `demo` musi istnieć w kontekście ytt (lib/_ytt_lib/demo/values.yml)**

```yaml
# lib/_ytt_lib/demo/values.yml
#@ data/values
---
demo: {}
```  

Wczytanych danych można następnie użyć:

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

## Kontrola dostępu

### Jak ograniczyć, co mogą robić użytkownicy (opcje ról)?

Poza ograniczaniem tego, które formularze widzi rola, `options` roli włączają lub wyłączają funkcje interfejsu dla jej członków.

Wszystkie opcje, ich wartości domyślne i sposób łączenia opcji z różnych ról opisuje [Opcje ról](config/roles.html#role-options).

### Jak zaimplementować własną logikę RBAC w playbookach lub formularzach?

Tożsamość użytkownika jest dostępna zarówno we frontendzie, jak i w backendzie przy każdym wykonaniu.

Przy każdym wysłaniu formularza AnsibleForms automatycznie wstawia pełną tożsamość bieżącego użytkownika do extravars wysyłanych do Ansible:

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

Twój playbook lub dowolny własny moduł Ansible może więc bezpośrednio używać `ansibleforms_user` do szczegółowych decyzji, na przykład aby pozwolić tylko określonym grupom modyfikować inwentarz produkcyjny lub aby zapisywać ślad audytu z nazwą użytkownika zgłaszającego.

We **frontendzie** ten sam obiekt jest dostępny przez specjalne pole `__user__`:

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

**Typowe wzorce:**

Tożsamość użytkownika umożliwia wzorce takie jak:

- **Odwołanie do pliku konfiguracji RBAC lub bazy danych**: wczytaj plik YAML lub JSON (przez `fn.fnReadYamlFile` lub wyrażenie), który przypisuje grupom dozwolone zasoby, a następnie filtruj po `$(__user__.groups)`
- **Ślad audytu**: przekaż `ansibleforms_user.username` jako dodatkową zmienną, aby zapisać, kto uruchomił zadanie
- **Dynamiczne wartości pól**: pokazuj inny zestaw opcji enum, wypełniaj wstępnie pola lub ukrywaj sekcje w zależności od grup lub ról użytkownika
- **Autoryzacja po stronie playbooka**: sprawdź, czy `ansibleforms_user.groups` zawiera wymaganą grupę, zanim playbook będzie kontynuował, jako dodatkową warstwę ochrony niezależną od listy `roles` formularza

{: .note }
> Powyższy obiekt jest wysyłany domyślnie. Jeśli instancja ustawia `EXTRAVARS_USER_FIELDS`
> lub formularz ustawia `userExtravars`, wysyłane są tylko wymienione tam klucze, więc playbook, który
> sprawdza `ansibleforms_user.groups`, wymaga, aby `groups` był jednym z nich. Pole frontendu
> `__user__` pochodzi z tokenu logowania i nigdy nie jest przycinane przez żadne z tych ustawień.

---

## Planowanie zadań

### Jak zaplanować automatyczne uruchamianie formularza?

Otwórz listę rozwijaną obok **Wyślij** i wybierz **Harmonogram (cykliczny)** lub **Uruchom później (jednorazowo)**; wymagają one opcji
roli `allowScheduledJobs` (na poziomie administratora) i `allowPlannedJobs`. Zobacz [Harmonogramy](jobs/schedules.html).

### Jakich wyrażeń cron mogę używać?

Harmonogram cykliczny przyjmuje standardowe 5-polowe wyrażenie cron (minuta, godzina, dzień miesiąca, miesiąc, dzień tygodnia).

| Wyrażenie | Uruchamia się |
|---|---|
| `*/15 * * * *` | Co 15 minut |
| `0 * * * *` | Co godzinę, o pełnej godzinie |
| `0 */6 * * *` | Co 6 godzin, o 00:00, 06:00, 12:00 i 18:00 |
| `0 2 * * *` | Codziennie o 02:00 |
| `30 7 * * 1-5` | Od poniedziałku do piątku o 07:30 |
| `0 8 * * MON` | W każdy poniedziałek o 08:00 (nazwy dni i miesięcy są akceptowane) |
| `0 0 1 * *` | O północy pierwszego dnia każdego miesiąca |
| `0 22 L * *` | O 22:00 ostatniego dnia każdego miesiąca |
| `0 6 * * 1#1` | O 06:00 w pierwszy poniedziałek każdego miesiąca |
| `*/30 * * * * *` | Co 30 sekund (opcjonalne szóste pole na początku to sekunda) |

Gdy ustawione są zarówno dzień miesiąca, jak i dzień tygodnia, harmonogram uruchamia się, gdy pasuje którykolwiek z nich: `0 0 13 * 5` uruchamia się
13. dnia miesiąca i w każdy piątek. Serwer odrzuca wyrażenie, którego nie potrafi wykonać, lub takie, które nigdy nie może wystąpić (`0 0 30 2 *`).

Na stronie **Harmonogramy** edytor cron opisuje wyrażenie i pokazuje podgląd jego następnych uruchomień. Nie akceptuje skrótów
takich jak `@daily`, symbolu wieloznacznego `?` ani modyfikatora `W` (najbliższy dzień roboczy), więc trzymaj się postaci z tabeli.

{: .note }
> **Strefa czasowa** Harmonogramy cron działają w strefie czasowej serwera, ustawianej przez [`LOG_TZ`](customization/logging.html#env_LOG_TZ)
> (domyślnie `UTC`), a nie w strefie czasowej Twojego profilu lub przeglądarki. `0 2 * * *` z `LOG_TZ=Europe/Madrid` uruchamia się o 02:00
> czasu madryckiego przez cały rok, z uwzględnieniem czasu letniego. Edytor cron pokazuje podgląd następnych uruchomień w tej samej strefie. Harmonogramy
> pobierania repozytoriów używają tej samej strefy.

---

## Zapisywanie i wczytywanie danych formularza

### Jak zapisać i ponownie wczytać dane formularza bez uruchamiania zadania?

Wybierz **Zapisz** z listy rozwijanej obok **Wyślij**, aby zapisać wartości pól, a później **Wczytaj zapisany formularz**, aby je przywrócić.
Pola haseł nigdy nie są zapisywane. Wymaga to opcji roli `allowStoredJobs`. Zobacz [Zapisane zadania](jobs/stored-jobs.html).

---

## Formularze zagnieżdżone i pola strukturalne

### Jak zbierać w formularzu dane strukturalne lub powtarzające się?

Użyj pól `list` i `yaml` z podformularzami (6.2.0+).

Aby zbierać złożone dane strukturalne, na przykład listę serwerów, zestaw interfejsów sieciowych lub pojedynczy zagnieżdżony obiekt, użyj typu pola `list` lub `yaml` razem z `subform`.

**Podformularz** to fragment formularza wielokrotnego użytku (definiowany przez `type: subform`), który nigdy nie jest pokazywany jako samodzielny kafelek. Istnieje wyłącznie po to, aby odwoływały się do niego pola innych formularzy. Pełny opis znajdziesz w [dokumentacji podformularzy](forms/subform.html).

**Zbieranie listy wierszy strukturalnych: pole `list`:**

Pole `list` otwiera wskazany podformularz raz dla każdego wiersza:

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

Extravar `servers` wysyłany do Ansible to tablica obiektów: `[{hostname: "web1", ip: "10.0.0.1"}, ...]`

**Edycja pojedynczego obiektu strukturalnego: pole `yaml`:**

Pole `yaml` ma trzy tryby:

| Tryb | Jak | Działanie |
|---|---|---|
| **Edytor** | domyślnie | Pokazuje pełny edytor YAML z podświetlaniem składni, w którym użytkownik może pisać bezpośrednio |
| **Tylko do odczytu** | `readonly: true` | Wyświetla wartość YAML jako sformatowany tekst tylko do odczytu, bez edycji |
| **Podformularz** | `subform: MySubform` | Ukrywa surowy edytor; po kliknięciu otwiera podformularz jako edytor szczegółów |

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

**Przesyłanie i pobieranie: pola `list` i `yaml`:**

Oba typy pól obsługują przesyłanie plików po stronie klienta przez dwie opcjonalne właściwości:

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
> Pole `list` i typ formularza `subform` zastąpiły pole `table` i `tableFields`, które zostały usunięte w 7.0.0.

### Jak uzyskać dostęp do danych formularza nadrzędnego w podformularzu?

Odwoływanie się do wartości pól formularza nadrzędnego z poziomu podformularza przez `__parent__` (v6.3.0+).

Gdy otwiera się podformularz, czy to z pola **`list`** (edytor każdego wiersza), czy z pola **`yaml`** w trybie podformularza, AnsibleForms automatycznie wstawia do podformularza specjalne pole tylko do odczytu o nazwie `__parent__`. Zawiera ono migawkę **wartości wszystkich pól formularza nadrzędnego w chwili otwarcia podformularza**, łącznie ze stałymi i zmiennymi.

Dzięki temu pola podformularza mogą używać wyrażeń odwołujących się do danych formularza nadrzędnego bez dodatkowej konfiguracji.

#### Co zawiera `__parent__`?
{: .no_toc }

`__parent__` to zwykły obiekt, którego klucze są nazwami pól formularza nadrzędnego:

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
> `__parent__` **nie jest wysyłany do Ansible**; podobnie jak `__user__` jest usuwany z extravars. To wyłącznie pomocnik frontendu dla wyrażeń w podformularzach.

#### Dostęp do wartości nadrzędnych w wyrażeniach podformularza
{: .no_toc }

Odwołuj się do wartości nadrzędnych standardową składnią wyrażeń `$(...)`:

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

#### Zagnieżdżone podformularze
{: .no_toc }

`__parent__` zawsze odnosi się do **bezpośredniego** formularza nadrzędnego. Jeśli zagnieździsz `list` w podformularzu, który sam jest otwierany z formularza nadrzędnego, `__parent__` wewnętrznego podformularza zawiera dane środkowego podformularza. Aby sięgnąć dalszych poziomów, łącz odwołania, na przykład `$(__parent__.__parent__.someField)`, jeśli środkowy podformularz również przekazuje swój `__parent__`.

### Jak przejść z `table` / `tableFields` na `list` / `subform`?

Pole `table` i właściwość `tableFields` zostały oznaczone jako przestarzałe w 6.2.0 i usunięte w 7.0.0, a formularz, który nadal ich używa, nie przechodzi walidacji. Aby przeprowadzić migrację:

1. Przenieś kolumny z `tableFields` do nowego formularza `type: subform` ze zwykłymi `formfields`
2. Zastąp pole `table` polem `list`, które odwołuje się do podformularza przez `subform: MySubformName`

**Przed:**
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

**Po:**
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

#### Migracja `from` z `tableFields` na wyrażenia `__parent__`
{: .no_toc }

Właściwość `from` kolumn enum w `tableFields` wypełniała opcje listy rozwijanej z innego pola formularza nadrzędnego. W `subform` zastępuje ją `expression`, które odczytuje tę samą wartość przez `__parent__`.

**Przed: `tableFields` z `from`:**

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

**Po: podformularz z wyrażeniem `__parent__`:**

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
> `$(__parent__.available_departments)` zwraca **bieżącą wartość** tego pola, więc jeśli samo to pole jest dynamicznym polem expression, podformularz zawsze widzi najnowszy obliczony wynik z formularza nadrzędnego.
