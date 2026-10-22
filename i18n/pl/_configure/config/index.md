---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 6c0e2d282bc1dc386b7392e3af1f60fea593f12b
---

# config.yaml
{: .no_toc }

Kategorie, role i stałe dla wszystkich formularzy
{: .fs-6 .fw-300 }

---

Dla administratorów: plik config.yaml, który przechowuje kategorie, role i stałe wspólne dla wszystkich formularzy.

AnsibleForms używa pliku config.yaml do konfiguracji kategorii, ról i stałych. Jeśli nie podano żadnego pliku, generowany jest plik z minimalną konfiguracją. Konfigurację można też zaimportować do bazy danych, dzięki czemu plik config.yaml nie jest już potrzebny.

---

## Przegląd

Plik config.yaml zawiera konfigurację kategorii, ról i stałych używanych przez AnsibleForms.

**WIDEO**: [Utwórz swój pierwszy formularz](https://www.youtube.com/watch?v=lIhYZ9Et5Ic)

Poniższy minimalny config.yaml służy jako punkt wyjścia. Zawiera tylko wymaganą kategorię `Default` oraz wymagane role `admin` i `default`.

```yaml
categories: # a list of categories to group forms
  - name: Default
    icon: bars
roles: # a list of roles
  - name: admin
    groups:
      - local/admins
  - name: default
    groups: []
    options:
      allowJobRelaunch: true
constants: {} # free objects to re-use over all forms
```

---

## Priorytet wczytywania konfiguracji

AnsibleForms wczytuje plik config.yaml w następującej kolejności (wygrywa pierwsze dopasowanie):

1. **Z BAZY DANYCH** : konfiguracja zaimportowana do bazy danych, tylko gdy `ENABLE_CONFIG_IN_DATABASE=1` albo gdy ta
   zmienna nie jest ustawiona, a źródło konfiguracji zapisane w bazie danych to `database` (pusta kopia przechodzi z powrotem na plik)
2. **Z REPOZYTORIUM (use_for_config)** : repozytorium z włączonym przełącznikiem "Używać do konfiguracji?" (nowość w 6.1.0)
3. **Z REPOZYTORIUM (use_for_forms)** : repozytorium z włączonym przełącznikiem "Używać do formularzy?" (rozwiązanie zapasowe dla zgodności wstecznej)
4. **Z PLIKU LOKALNEGO** : lokalny plik `config.yaml` (zmienna środowiskowa CONFIG_PATH)

{: .warning }
> **Uwaga:** Włącz "Używać do konfiguracji?" tylko w jednym repozytorium. Jeśli ma go włączone kilka, w dzienniku pojawia się ostrzeżenie i używane jest pierwsze.

---

## W tej sekcji

Plik ma trzy atrybuty najwyższego poziomu, a każdy ma własną stronę:

| Strona | Czego dotyczy |
|---|---|
| [Kategorie](categories.html) | Grupowanie formularzy na pulpicie w drzewo kategorii z ikonami |
| [Role](roles.html) | Mapowanie użytkowników i grup na role oraz ustalanie, co każda rola może robić |
| [Stałe](constants.html) | Dowolne obiekty, których może używać każdy formularz |
