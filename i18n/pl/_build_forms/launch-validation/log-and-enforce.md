---
layout: default
title: Log i enforce
parent: Weryfikacja uruchomienia
nav_order: 2
translated_from: 10a187b350155ce68bfc50e379e1b6b8637df57a
---

# Log i enforce
{: .no_toc }

Co każdy tryb robi z uruchomieniem, które łamie reguły
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Co robi `log`

Każde uruchomienie jest sprawdzane, ale dla użytkownika nic się nie zmienia. Ostrzeżenie trafia do logu, gdy:

- uruchomienie **zostałoby odrzucone**, wraz z powodem (tylko nazwy pól i typy reguł, nigdy
  wartości):

  ```
  Launch validation would refuse form 'Create VM' for alice (launch validation 'log') :
  failing rules : hostname (regex) ; failing rows : disks[1].size (maxValue)
  ```

- extravars wysłane przez klienta **różnią się** od tych, które buduje serwer, wraz z
  kluczami najwyższego poziomu, które się różnią:

  ```
  Launch of form 'Create VM' : the extravars differ from the ones the server builds for
  created_at, vm (launch validation 'log' ; 'enforce' would run the server's)
  ```

Najpierw uruchom `log` przez jakiś czas w rzeczywistej instancji. Pokazuje to, które formularze zostałyby odrzucone, a
które obliczają wartości inaczej na serwerze, zanim ktokolwiek zostanie tym dotknięty.

---

## Co robi `enforce`

W trybie `enforce` nieprawidłowe uruchomienie jest odrzucane, a prawidłowe działa z extravars zbudowanymi
przez serwer.

### Uruchomienie łamiące reguły jest odrzucane

`POST /api/v2/job` odpowiada kodem `422` z listą błędnych pól:

```json
{
  "error": "The form data is not valid",
  "details": {
    "missing": ["owner"],
    "invalid": ["hostname", "disks"],
    "waiting": [],
    "validationErrors": {
      "hostname": [{ "type": "regex", "description": "Must start with prod-" }]
    },
    "rowErrors": {
      "disks": [{ "index": 1, "invalid": ["size"],
                  "validationErrors": { "size": [{ "type": "maxValue", "description": "size must be at most 500" }] } }]
    }
  }
}
```

- `missing` - wymagane pola bez wartości;
- `invalid` - pola łamiące regułę, wybory spoza dostępnych opcji oraz pola list
  z błędnym wierszem;
- `waiting` - pola, których nie dało się obliczyć (pole, którego potrzebują, nigdy nie otrzymało wartości);
- `validationErrors` - dla każdego pola każda niespełniona reguła z komunikatem, który pokazuje przeglądarka;
- `rowErrors` - dla każdego pola listy błędne wiersze (zobacz [Wiersze list](list-rows-and-subforms.html));
- `uploads` - pola plików, których przesłania nie dało się zweryfikować.

Uruchomienie **bez `rawFormData`** również jest odrzucane: jego wartości nie da się sprawdzić.

### Prawidłowe uruchomienie działa z extravars serwera

Zadanie nie działa z extravars wysłanymi przez klienta. Serwer buduje je ze sprawdzonych
wartości, tym samym kodem co przeglądarka, i uruchamia właśnie je. Wywołujący, który wysyła prawidłowe
`rawFormData` obok innych `extravars`, otrzymuje extravars odpowiadające wartościom, a nie
te, które wysłał.

Z żądania serwer zachowuje `__verbose__` (tylko dla użytkowników, którym wolno używać trybu verbose).
Klucze zastrzeżone (`__playbook__`, `__inventory__`, ...) jak zawsze pochodzą z formularza, a
`ansibleforms_user` to użytkownik, który uruchamia zadanie.

### To, co widział użytkownik, nie zawsze jest tym, co działa

Zbudowanie extravars oznacza ponowne obliczenie formularza: każde wyrażenie i zapytanie wykonuje się
jeszcze raz na serwerze, chwilę po tym, jak wykonała je przeglądarka, jako uruchamiający użytkownik. Wartość,
która zależy od tego, **kiedy** lub **gdzie** jest obliczana, może się różnić i wtedy
używana jest wartość serwera:

| Co | Dlaczego może się różnić | Jak bardzo |
|---|---|---|
| `fn.fnTime()`, znacznik czasu, nazwa zbudowana z czasu | obliczane ponownie, kilka sekund później | ma znaczenie tylko na granicy sekundy lub daty. `fnTime` także w przepływie przeglądarki działa już na serwerze, w tej samej strefie czasowej (`TZ` kontenera) |
| zapytanie, `fnRestAdvanced`, `fnSsh`, `fnDnsResolve`, odczyt pliku | dane zewnętrzne zmieniły się w międzyczasie | tylko gdy się zmieniły |
| wyrażenie `runLocal` używające `new Date()`, `toLocaleString`, `Intl` | przeglądarka używa strefy czasowej i ustawień regionalnych użytkownika, serwer własnych | tylko takie wyrażenia |

To samo dotyczy **walidacji**: reguła, która odczytuje takie pole (`notIn` względem wyniku zapytania,
`validIf` na obliczonej fladze), jest sprawdzana względem wartości serwera. Formularze, których
extravars się różnią, pojawiają się w opisanych wyżej ostrzeżeniach `log`; przejrzyj je przed włączeniem enforce.
