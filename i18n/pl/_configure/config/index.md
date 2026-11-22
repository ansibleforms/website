---
layout: default
title: config.yaml
nav_order: 5
has_children: true
has_toc: false
permalink: /config/
translated_from: 8919bfbc931f85d08a064e868a9a6bb42461525a
---

# config.yaml
{: .no_toc }

Kategorie, role i stałe dla wszystkich formularzy
{: .fs-6 .fw-300 }

---

Dla administratorów: plik config.yaml, który przechowuje kategorie, role i stałe wspólne dla wszystkich formularzy.

AnsibleForms używa pliku config.yaml do konfiguracji kategorii, ról i stałych. Jeśli nie podano żadnego pliku, generowany jest plik z minimalną konfiguracją. Konfigurację można też zaimportować do bazy danych, dzięki czemu plik config.yaml nie jest już potrzebny, a każdy z tych trzech elementów można przechowywać w repozytorium git.

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

Od wersji 7.8.0 kategorie, role i stałe są wczytywane każde osobno, z pierwszego z poniższych źródeł, które je zawiera.

1. **Z REPOZYTORIUM** : repozytorium z typem zastosowania **Kategorie**, **Role** lub **Stałe**, z jego pliku podającego
   `controller_categories:`, `controller_roles:` lub `controller_constants:`, o dowolnej nazwie i w dowolnym folderze (zobacz
   [Konfiguracja w git](../repositories/config-as-code.html#roles-categories-and-constants))
2. **Z config.yaml REPOZYTORIUM** : zwykły klucz w `config.yaml` tego repozytorium, przestarzały od wersji 7.8.0 i
   nieodczytywany w 8.0; informują o tym dziennik serwera, wynik pull i strona repozytorium
3. **Z BAZY DANYCH** : konfiguracja zaimportowana do bazy danych, tylko gdy `ENABLE_CONFIG_IN_DATABASE=1` albo gdy ta
   zmienna nie jest ustawiona, a źródło konfiguracji zapisane w bazie danych to `database` (pusta kopia przechodzi z powrotem na plik)
4. **Z PLIKU LOKALNEGO** : lokalny plik `config.yaml` (zmienna środowiskowa CONFIG_PATH)

{: .warning }
> **Uwaga:** Przełącznika **Używać do konfiguracji?** nie ma od wersji 7.8.0. Aktualizacja nadaje **Role**, **Kategorie** i **Stałe**
> repozytorium, które go miało, a `use_for_config` w config seed lub w API jest przestarzałym aliasem tych trzech.

---

## W tej sekcji

Plik ma trzy atrybuty najwyższego poziomu, a każdy ma własną stronę:

| Strona | Czego dotyczy |
|---|---|
| [Kategorie](categories.html) | Grupowanie formularzy na pulpicie w drzewo kategorii z ikonami |
| [Role](roles.html) | Mapowanie użytkowników i grup na role oraz ustalanie, co każda rola może robić |
| [Stałe](constants.html) | Dowolne obiekty, których może używać każdy formularz |
