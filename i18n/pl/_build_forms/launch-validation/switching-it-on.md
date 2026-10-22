---
layout: default
title: Włączanie
parent: Weryfikacja uruchomienia
nav_order: 1
translated_from: 2e5de5654a03389c7c8a7c05179e9dd79456b50b
---

# Włączanie
{: .no_toc }

Dla całej instancji lub dla jednego formularza
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Weryfikacja uruchomienia ma dwa ustawienia. **Obowiązuje bardziej restrykcyjne z nich.**

---

## Dla całej instancji: `LAUNCH_VALIDATION`

Zmienna środowiskowa [`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) dotyczy każdego formularza:

- `off` - brak sprawdzania po stronie serwera: zadanie działa z extravars wysłanymi przez przeglądarkę lub wywołującego.
- `log` - każde uruchomienie jest sprawdzane; to, co zostałoby odrzucone, trafia do logu jako
  ostrzeżenie, a uruchomienie przebiega jak dotąd.
- `enforce` (domyślnie) - nieprawidłowe uruchomienie jest odrzucane, a prawidłowe działa z extravars
  zbudowanymi przez serwer.

Pusta lub nieznana wartość również oznacza `enforce`. Zmiany obowiązują bez restartu.

{: .warning }
> **Aktualizacja zmienia zachowanie.** Instancja, która nie ustawia `LAUNCH_VALIDATION`, po aktualizacji
> egzekwuje każde uruchomienie. Skrypty, które wywołują `POST /api/v2/job` bez `rawFormData`
> lub z wartościami łamiącymi reguły formularza, są odrzucane z kodem `422`. Ustaw
> `LAUNCH_VALIDATION=log` przed aktualizacją, aby zobaczyć, co zostałoby odrzucone, albo `off`, aby zachować
> dotychczasowe zachowanie (zobacz [Wdrażanie](rolling-it-out.html)).

---

## Dla jednego formularza: `launchValidation`

Formularz może ustawić własny poziom:

```yaml
- name: Create VM
  type: ansible
  roles:
    - default
  playbook: vm.yml
  launchValidation: enforce   # off | log | enforce
  fields:
    - name: vm_name
      type: text
      required: true
```

Używaj tego ustawienia w instancji działającej z `off` lub `log`, dla formularza, o którym wiesz, że będzie
uruchamiany przez REST: ten formularz jest egzekwowany, a reszta instancji nie. Można je też ustawić w projektancie, w
ustawieniach formularza.

**Formularz może być bardziej restrykcyjny niż instancja, nigdy mniej.** Gdy `LAUNCH_VALIDATION`
ma wartość `enforce`, `launchValidation: off` w formularzu nie ma żadnego efektu: formularz nie może nadpisać
decyzji operatora.

Formularze kreatora również z niego korzystają: uruchomienie kreatora jest sprawdzane krok po kroku, każdy krok względem własnego
podformularza (zobacz [Formularze kreatora](rolling-it-out.html#wizard-forms)).
