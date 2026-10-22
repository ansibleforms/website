---
layout: default
title: Symbole zastępcze
parent: Wyrażenia
nav_order: 0.5
translated_from: bd63e437a4f77c707a1bf8d8ee99b1516063b62a
---

# Symbole zastępcze
{: .no_toc }

Odwołanie do innego pola, stałej lub bieżącego użytkownika przez `$(...)`
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Czym jest symbol zastępczy

Symbol zastępczy to odwołanie zapisane jako `$(reference)`. Zanim tekst, który go zawiera, zostanie użyty, symbol jest zastępowany wartością.

Symbole zastępcze działają we właściwościach pola `expression`, `query` i `default` (obliczanej przy `evalDefault`), a także w `label`,
`help` i `placeholder`. Pole, które zawiera symbol zastępczy, zależy od pola, które ten symbol wskazuje: czeka, aż tamto pole będzie miało
wartość, i jest obliczane ponownie przy każdej zmianie tej wartości. W ten sposób buduje się kaskadowe listy rozwijane.

```yaml
- name: city
  type: enum
  values: [Amsterdam, Brussels]
- name: datacenter
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select name from cmdb.datacenter where city='$(city)'
```

---

## Do czego może odwoływać się symbol zastępczy

Symbol zastępczy wskazuje pole formularza albo jedną z poniższych wartości, które ma każdy formularz:

| Odwołanie | Co zawiera |
|---|---|
| `$(field)` | wartość innego pola formularza |
| `$(name)`, stała | [stała](../config/constants.html) z `config.yaml` albo wartość z `varsFiles` formularza |
| `$(__user__)` | zalogowany użytkownik: `username`, `type`, `groups`, `roles` |
| `$(__parent__.field)` | w [podformularzu](../forms/subform.html) (wiersz listy, krok kreatora) wartość formularza nadrzędnego |

```yaml
expression: "'$(__user__.username)'"
expression: $(__user__.groups)
```

---

## Sięganie w głąb wartości

Notacja kropkowa i indeksowa odczytuje część wartości, o ile ścieżka zawiera tylko litery, cyfry, `_`, `-`, `.` i `[n]`:

| Symbol zastępczy | Na | Daje |
|---|---|---|
| `$(field)` | polu tekstowym, liczbowym lub haśle | wartość |
| `$(field)` | polu enum z rekordami | `placeholderColumn` wybranego rekordu, a w przeciwnym razie jego pierwszą kolumnę |
| `$(field.col)` | polu enum z rekordami | tę kolumnę wybranego rekordu |
| `$(field)` | polu enum z `multiple: true` | wybraną kolumnę każdego zaznaczonego rekordu, jako tablicę |
| `$(field)` | wyrażeniu, liście lub stałej | całą wartość (lista daje swoje wiersze) |
| `$(field.a.b)`, `$(f[0].x)` | wyrażeniu, liście lub stałej | tę część obiektu lub tablicy |

Ustawienie `placeholderColumn: "*"` w polu enum sprawia, że `$(field)` daje cały wybrany rekord zamiast jednej kolumny.

```yaml
- name: city
  type: enum
  dbConfig: { name: CMDB, type: mysql }
  query: select id, name from cmdb.city
  valueColumn: name
  placeholderColumn: id        # $(city) gives the id; $(city.name) still gives the name
- name: servers
  type: expression
  expression: "[{name: 'web1'}, {name: 'web2'}]"
  runLocal: true
- name: first_server
  type: expression
  expression: $(servers[0].name)   # 'web1'
  runLocal: true
```

---

## Jak wartość jest wstawiana

Sposób wstawienia wartości do tekstu zależy od miejsca, w którym stoi symbol zastępczy.

| Gdzie | Przykład | Staje się |
|---|---|---|
| w wyrażeniu, poza cudzysłowem | `$(count) + 1` | literałem JavaScript: liczba zostaje liczbą, tekst staje się ciągiem w cudzysłowie, obiekt lub tablica literałem |
| w wyrażeniu, jako cały ciąg w cudzysłowie | `fn.fnLs('$(dir)')` | tym samym literałem, łącznie z cudzysłowem, więc wartość zawierająca cudzysłów nie może się z niego wydostać |
| w wyrażeniu, wewnątrz dłuższego ciągu | `'$(dir)/vars'` | tekstem, poddanym escapowaniu dla tego ciągu |
| w zapytaniu, etykiecie, tekście pomocy | `where city='$(city)'` | tekstem |

Pole, którego symboli zastępczych nie da się jeszcze wszystkich rozwiązać, nie jest obliczane; przy `ignoreIncomplete: true` brakująca wartość
jest wstawiana jako `undefined`.

### Grawisy i `${` w wartości

Od wersji 7.3.0 wartość pola nie może zostać wykonana jako kod, gdy serwer wstawia ją do wyrażenia (wyrażenia zdalne, weryfikacja
uruchomienia, MCP i czat). Grawis lub `${` w wartości jest zapisywany jako sekwencja unicode (`\u0060`, `\u0024{`), więc pozostaje
tekstem nawet wewnątrz literału szablonowego. Wyrażenia po stronie serwera w ogóle odrzucają literały szablonowe; do nich używaj `runLocal`.

Wyrażenie `runLocal` obliczane w przeglądarce wstawia wartość tak, jak mówi powyższa tabela, bez tego escapowania, więc nie umieszczaj tam
symbolu zastępczego wewnątrz literału szablonowego.

---

## Zobacz też

Powiązane strony i wpisy FAQ:

- [Wyrażenia lokalne](local.html) i [Wyrażenia zdalne](remote.html): miejsca, gdzie używa się większości symboli zastępczych
- [FAQ: Kaskadowe listy rozwijane](../faq.html#cascaded-dropdowns) i [Symbole zastępcze pól](../faq.html#field-placeholders): więcej przykładów
- [FAQ: Jak uzyskać dostęp do danych formularza nadrzędnego w podformularzu?](../faq.html#how-do-i-access-parent-form-data-inside-a-subform)
