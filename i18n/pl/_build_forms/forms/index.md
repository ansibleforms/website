---
layout: default
title: Formularze
nav_order: 3
has_children: true
has_toc: false
permalink: /forms/
translated_from: 8cf41438dcd6f75b145856a890b8bbbcd674c9fc
---

# Formularze
{: .no_toc }

Definiowanie formularzy, które wypełniają twoi użytkownicy
{: .fs-6 .fw-300 }

---

Dla autorów formularzy: jak formularze zapisuje się w YAML, skąd są ładowane i jakie właściwości ma każdy typ formularza.

Formularze są sercem AnsibleForms. Każdy formularz to interfejs webowy, który zbiera dane od użytkownika i na ich podstawie uruchamia
playbook Ansible, szablon AWX, AAP lub Ascender, szablon Semaphore, zadanie Rundeck lub Jenkins albo
[workflow](../workflows/).

Formularze definiuje się w plikach YAML w folderze formularzy. Każdy plik YAML zawiera jeden formularz lub listę formularzy, a do ich porządkowania można używać podfolderów.

**WIDEO**: [Utwórz swój pierwszy formularz](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

---

## Struktura formularza

Każdy formularz w AnsibleForms konfiguruje się zestawem właściwości. **[Wspólne właściwości](common.html)** wymienia właściwości dotyczące wszystkich typów formularzy; strony poszczególnych typów opisują dodatkowe.

---

## Jak ładowane są formularze

AnsibleForms ładuje formularze z następujących miejsc:

1. **Z REPOZYTORIÓW** : wszystkie repozytoria z włączonym przełącznikiem „Używać do formularzy?” (obsługiwanych jest wiele repozytoriów)
   - Formularze ze wszystkich włączonych repozytoriów są scalane automatycznie.
   - W każdym repozytorium najpierw sprawdzany jest podfolder `forms/`.
   - Jeśli podfolder `forms/` nie istnieje, używany jest katalog główny repozytorium.
   - Formularze utworzone w projektancie i jeszcze niewypchnięte są przechowywane w folderze przejściowym
     ([`FORMS_STAGING_PATH`](../customization/paths.html#env_FORMS_STAGING_PATH)) i ładowane razem z nimi.

2. **Z FOLDERU LOKALNEGO** : lokalny folder `forms/`
   ([`FORMS_FOLDER_PATH`](../customization/paths.html#env_FORMS_FOLDER_PATH)), gdy żadne repozytorium nie ma włączonego „Używać do formularzy?”

{: .warning }
> **Uwaga:** Gdy „Używać do formularzy?” jest włączone w kilku repozytoriach, wszystkie ich formularze są scalane. Nazwy formularzy muszą być unikalne we wszystkich repozytoriach, aby uniknąć konfliktów.

---

## Gdzie działa formularz

Typ formularza decyduje o rodzaju [runnera](../runners.html), na którym działa jego zadanie: RTE dla `ansible`, runner AWX dla `awx`,
`aap` i `ascender` oraz runner własnego typu dla `semaphore`, `rundeck` i `jenkins`.

- `runner: <name>` w formularzu wybiera runner tego typu po nazwie; bez tego zadanie działa na domyślnym runnerze danego typu.
- Runner wyłączony w **Połączenia > Runnery** powoduje błąd zadania, niezależnie od tego, czy formularz go wskazuje, czy jest on domyślny. Zadanie
  nigdy nie przechodzi na inny runner.
- Gdy jedna z ról użytkownika ma listę `runners` w `config.yaml`, zadanie może działać tylko na runnerze wymienionym przez taką rolę, w przeciwnym razie
  zostaje odrzucone. Role bez tej listy go nie ograniczają, a administrator nigdy nie jest ograniczony.

---

## W tej sekcji

Na kolejnych stronach szczegółowo opisano właściwości formularzy:

| Strona | Czego dotyczy |
|---|---|
| [Wspólne właściwości](common.html) | Właściwości dotyczące wszystkich typów formularzy (`name`, `description`, `help`, `type`, `fields`) |
| [Formularze Ansible](ansible.html) | Właściwości specyficzne dla `type: ansible` |
| [Formularze AWX](awx.html) | Właściwości specyficzne dla `type: awx` |
| [Formularze Semaphore](semaphore.html) | Właściwości specyficzne dla `type: semaphore`, który uruchamia szablon Semaphore |
| [Formularze Rundeck](rundeck.html) | Właściwości specyficzne dla `type: rundeck`, który uruchamia zadanie Rundeck |
| [Formularze Jenkins](jenkins.html) | Właściwości specyficzne dla `type: jenkins`, który buduje zadanie Jenkins |
| [Formularze wieloetapowe](multistep.html) | Właściwości specyficzne dla `type: multistep`, przestarzałego na rzecz `workflow` |
| [Formularze workflow](workflow.html) | Właściwości specyficzne dla `type: workflow`, który uruchamia [workflow](../workflows/) |
| [Kreator](wizard.html) | Podział danych formularza na kilka stron (działa z każdym wykonywalnym typem formularza) |
| [Podformularz](subform.html) | Podformularze używają tylko wspólnych właściwości |
| [Punkty zatwierdzenia](approval.html) | Wstrzymanie zadania do czasu zatwierdzenia (`approval`) |
| [Powiadomienia](notifications.html) | Wysyłanie e-maili i wiadomości na kanały przy stanie zadania lub zdarzeniach (`notifications`) |
| [Akcje stanu zadania](job-status-action.html) | Działania na formularzu, gdy zadanie zmienia stan (`onSubmit`, `onSuccess`, ...) |
