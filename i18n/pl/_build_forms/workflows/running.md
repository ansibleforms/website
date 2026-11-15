---
layout: default
title: Uruchamianie workflow
parent: Workflowy
nav_order: 3
translated_from: 536c898264f954c5239764f9d4f7a2f61ea40f9d
---

# Uruchamianie workflow
{: .no_toc }

Uruchom workflow z formularza i śledź go na stronie zadań
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Formularz

Formularz [typu `workflow`](../forms/workflow.html) uruchamia workflow wskazany przez `workflow:`, tak jak playbook: przez
jego **plik** w folderze workflow, z podfolderami (`team/deploy-app.yml`), albo przez **nazwę** workflow wewnątrz
pliku (`deploy-app`):

```yaml
- name: Deploy the app
  type: workflow
  workflow: team/deploy-app.yml
  roles:
    - admin
  fields:
    - name: app_name
      type: text
      default: orders-api
```

Pola formularza trafiają do każdego węzła jako extra vars, podobnie jak jego [`credentials`](../forms/workflow.html#workflow_credentials), pod nazwami,
które nadaje im formularz, tak jak w formularzu wieloetapowym trafiają do jego kroków:

```yaml
- name: Provision NAS storage
  type: workflow
  workflow: nas.yml
  credentials:
    ontap: ontap_automation   # every node's playbook gets `ontap`
```

Własne poświadczenia węzła, ustawione w pliku workflow, trafiają do jego playbooka pod własną nazwą i wygrywają przy nazwie używanej przez oba. Na karcie Wizualny formularza w projektancie
**Workflow** to lista plików workflow projektanta.

Sama nazwa pliku zostanie znaleziona także w podfolderze, jeśli ma ją tylko jeden plik. Dwa workflowy o tej samej nazwie blokują formularz, który wskazuje
workflow po nazwie, a projektant ostrzega przy zapisywaniu drugiego: zmień nazwę jednego z nich albo wskaż jego plik. Workflow, którego nie da się
znaleźć, kończy zadanie błędem, z powodem w wyniku.

---

## Zadanie

Zadanie workflow działa na serwerze AnsibleForms, a każdy węzeł playbooka działa jako osobne zadanie, podrzędne wobec zadania
workflow, tak jak kroki formularza wieloetapowego: playbook projektanta na RTE albo, dla węzła z `runner:`, szablon
lub zadanie tego runnera na AWX, AAP, Ascender, Semaphore, Rundeck lub Jenkins (zobacz [Gdzie działa węzeł](designer.html#where-a-node-runs)).

Strona zadania rysuje workflow na żywo: każdy węzeł pokolorowany według stanu, połączenia, które zadziałały, i węzły, które
się nie uruchomią. Informacje na górze wskazują workflow zamiast playbooka.

- **Kliknij węzeł**, który się zakończył, aby otworzyć jego wynik w oknie dialogowym.
- **Wynik** zawiera wynik każdego węzła pod banerem `WORKFLOW NODE [identifier] (status)`, w kolejności, w jakiej węzły
  się zakończyły.
- **Pokaż extravars** i **Pokaż artefakty**, w nagłówku każdego węzła w wyniku i w oknie dialogowym otwieranym z grafu,
  pokazują własne extravars i artefakty tego węzła (`{}`, gdy ich nie ma), jako JSON lub YAML, z przyciskiem Kopiuj.

Extravars węzła zawierają to, co przekazały mu wcześniejsze węzły, a jego artefakty to, co jego playbook zebrał przez
`set_stats`. Oba przyciski zależą od [opcji ról](../config/roles.html#role-options) `showExtravars` i
`showArtifacts`. Te same dane zwraca `GET /api/v2/job/{id}/node/{nodeId}`, dla każdego, kto może widzieć zadanie.

Zadanie kończy się błędem, gdy węzeł zakończył się błędem i nic go nie obsłużyło, zgodnie z zasadą AWX; w przeciwnym razie kończy się sukcesem.

---

## Zatwierdzenia

Węzeł zatwierdzenia wstrzymuje zadanie workflow, dopóki ktoś nie udzieli odpowiedzi.

Gdy workflow dochodzi do węzła zatwierdzenia, stan zadania zmienia się na **Oczekuje na zatwierdzenie**: widać to przy dzwonku i na
stronie zadania, tak jak w przypadku [punktu zatwierdzenia](../forms/approval.html) formularza. Nazwa węzła jest tytułem zatwierdzenia, a jego opis
komunikatem; reszta pochodzi z `approval` formularza:

- jego `roles` decydują, kto może je zatwierdzić lub odrzucić, a `allowSelf`, czy uruchamiający także może je zatwierdzić;
- do jego `notifications` i `channels` wysyłana jest prośba.

Formularz workflow bez `approval` również wstrzymuje zadanie na węźle zatwierdzenia, ale wtedy zatwierdzić je może tylko administrator.

- **Zatwierdzone**: węzeł kończy się sukcesem, a workflow idzie dalej połączeniami *przy sukcesie*.
- **Odrzucone**: węzeł kończy się błędem, a workflow idzie dalej połączeniami *przy błędzie*.
- **Przekroczony czas**: po upływie limitu czasu węzła bez odpowiedzi węzeł również kończy się błędem.

---

## Przerywanie

**Przerwij** w działającym zadaniu workflow zatrzymuje je: działające zadania węzłów są przerywane, nic więcej nie startuje, a zatwierdzenie,
na które czeka, jest anulowane. Zadanie workflow czekające na zatwierdzenie także można przerwać.

---

## Ponowne uruchomienie od nieudanego węzła

Od wersji 7.8.0 zadanie workflow, które się nie powiodło, można uruchomić ponownie od nieudanego węzła, z przeniesieniem węzłów zakończonych sukcesem.

**Uruchom zadanie ponownie** na stronie zadania ma wtedy strzałkę z **Od pierwszego węzła**, pełnym ponownym uruchomieniem, i **Od nieudanego węzła**.
Nowe zadanie przechodzi to samo zatwierdzenie, weryfikację uruchomienia i uprawnienia co każde [ponowne uruchomienie](../jobs/actions.html#relaunch-a-job):

- **Węzły zakończone sukcesem** niczego nie uruchamiają. Graf pokazuje je wyszarzone, *z poprzedniego uruchomienia*, a wynik ma dla każdego baner
  `WORKFLOW NODE [identifier] (successful) #n carried over`, bez wyniku węzła do otwarcia.
- **To, co przekazały**, nadal trafia do węzłów po nich: ich artefakty z `set_stats` są zapisane z zadaniem i przekazywane dalej.
- **Przebieg zaczyna się** od nieudanego węzła (lub węzłów) i idzie dalej połączeniami workflow, jak przy pierwszym uruchomieniu.
- **Strona zadania** pokazuje **ponowienie #N**, z *nieudany węzeł* obok, a jej wynik zaczyna się od
  `ok: [Relaunch of job N from its failed node: 2 node(s) carried over]`.

Zadanie workflow AnsibleForms oferuje **Od nieudanego węzła** tylko wtedy, gdy spełnione są wszystkie te warunki; w przeciwnym razie **Uruchom zadanie ponownie** jest zwykłym przyciskiem:

| Warunek | Dlaczego |
|---|---|
| Zadanie nie powiodło się, z węzłem nieudanym i węzłem zakończonym sukcesem | Bez węzła do przeniesienia jest to pełne ponowne uruchomienie |
| Zadanie działało w wersji 7.8.0 lub nowszej | Od wersji 7.8.0 zadanie workflow zapisuje każdy węzeł tak, jak się zakończył, z tym, co przekazał dalej |
| Workflow jest taki sam jak wtedy, gdy zadanie działało | Zadanie zapisuje jego hash: zmieniony węzeł, połączenie, extra var lub nazwa daje tylko pełne ponowne uruchomienie |

Zadanie workflow, które działało na Ascender, używa własnego ponownego uruchomienia nieudanych węzłów przez Ascender, które tak samo przenosi
węzły zakończone sukcesem. AWX i AAP nie mają takiego ponownego uruchomienia, więc ich zadania workflow oferują tylko pełne ponowne uruchomienie, tak jak zadania wieloetapowe.

