---
layout: default
title: Wiersze list
parent: Weryfikacja uruchomienia
nav_order: 3
translated_from: 2f28c42b47c253f87a9be9d5b1bd8638f7dca685
---

# Wiersze list
{: .no_toc }

Jak weryfikowane są wiersze pól list
{: .fs-6 .fw-300 }

---

Pole `list` zawiera wiersze; każdy wiersz jest instancją jego podformularza, wypełnianą w edytorze
wierszy. Pole `yaml` z `subform` to jeden taki wiersz. Serwer traktuje je tak samo
jak edytor wierszy w przeglądarce: każdy wiersz jest rozwiązywany przez swój podformularz, z wartościami formularza
jako `__parent__`, z sprawdzeniem jego reguł i obliczeniem pól wyliczanych. Zagnieżdżone listy działają
tak samo: we własnej liście wiersza `$(__parent__.__parent__.x)` sięga do formularza.

Wiersze są sprawdzane w następujący sposób:

- **Wiersz, który użytkownik dodał lub edytował** w edytorze, jest rozwiązywany i weryfikowany.
- **Wiersz, którego nikt nie ruszał**, wygenerowany przez własną wartość domyślną, wyrażenie lub zapytanie listy
  (np. istniejące wpisy listy ACL), przechodzi **dokładnie w takiej postaci, w jakiej przyszedł**, tak jak w
  przeglądarce: nie jest ponownie weryfikowany i nic nie jest do niego dodawane. Istniejący wpis, który łamie regułę
  dopisaną później, nie blokuje uruchomienia.
- **Wiersz oznaczony jako usunięty** (`deleteMarker` listy) jest zachowywany bez zmian i nie jest weryfikowany.

Aby odróżnić te wiersze bez ufania żądaniu, serwer ponownie uruchamia własne
źródło listy (jej wartość domyślną, a w przeciwnym razie wyrażenie lub zapytanie) w ramach weryfikacji uruchomienia. Wiersz,
który nie przeszedł przez edytor, przechodzi bez zmian **tylko wtedy, gdy jest jednym z wierszy, które
to źródło generuje**. Każdy inny wiersz, na przykład wymyślony przez wywołującego REST, jest rozwiązywany i
weryfikowany jak wiersz edytowany. Zwykły wiersz nie może więc ominąć sprawdzeń, a nieruszane wiersze
z przeglądarki nadal przechodzą bez zmian.

Użytkownik przeglądarki zauważy to tylko w jednym przypadku: dane źródła zmieniły się między otwarciem
formularza a jego uruchomieniem (wpis został w międzyczasie zmieniony lub usunięty), **a** ten wiersz
łamie regułę swojego podformularza. Wiersz nie jest wtedy już traktowany jako jeden z wierszy źródła, więc
jest weryfikowany, a uruchomienie zostaje odrzucone ze wskazaniem wiersza, na przykład
`acls[2].user_or_group (regex)`.

Błędne wiersze pojawiają się w `rowErrors` ze swoim `index` (pole `yaml` go nie ma) oraz w logu jako
`disks[1].size (maxValue)`.

Uruchomienie może zawierać najwyżej **500 wierszy** na wszystkich poziomach zagnieżdżenia, ponieważ każdy wiersz uruchamia zapytania swojego podformularza.

---

## Znaczniki wierszy

Znaczniki, które lista ustawia na swoich wierszach (`insertMarker`, `updateMarker` i `deleteMarker`; bez
`insertMarker` nowe wiersze dostają `__inserted__`, gdy lista ustawia `allowDelete: false`, `deleteMarker` lub `updateMarker`),
trafiają do playbooka w każdym wierszu, który je ma. Usunięty wiersz jest wysyłany ze swoim znacznikiem
usunięcia, aby playbook mógł go usunąć. Przed wersją 6.4.1 wiersz listy miał znacznik tylko wtedy, gdy jego
podformularz deklarował go jako (ukryte) pole.
