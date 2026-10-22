---
layout: default
title: Prywatność i limity
parent: Asystent czatu
nav_order: 3
translated_from: d29279a71f7aaa5553602f5a463132c842600690
---

# Prywatność i limity
{: .no_toc }

Co opuszcza sieć i jakie są limity na użytkownika
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Co opuszcza sieć

Dla formularzy, które biorą udział w czacie, do dostawcy wysyłane są:

- nazwy i opisy formularzy, etykiety pól, teksty pomocy, opcje do wyboru i wypełniane
  wartości;
- rozmowa.

Nigdy nie są wysyłane do dostawcy, na stronę ani do dziennika:

- hasła (użytkownik wpisuje je w przeglądarce), zapisane poświadczenia i klucz API;
- wynik zadania i jego zapisane extravars (asystent odczytuje tylko stan zadania, i to tylko
  wtedy, gdy w ustawieniach włączona jest opcja **Pozwól asystentowi śledzić jego joby**).

Wszystko pod kluczem, który wygląda na sekret (`password`, `secret`, `token`, `api_key`, ...),
jest maskowane, zanim zobaczy to model lub strona.

Aby dane formularzy nie opuszczały firmy, używaj własnego tenanta (Azure OpenAI) lub lokalnego modelu (Ollama), a nie publicznego API.

---

## Limity

Te limity ustawia się na stronie ustawień:

- **Wiadomości na rozmowę** (20) - po ich wyczerpaniu użytkownik musi rozpocząć nową rozmowę.
- **Rundy narzędzi na wiadomość** (6) - ile razy model może wywołać narzędzie, zanim odpowie.
- **Limit czasu** (60 s) - na każde wywołanie dostawcy.

Te limity są stałe: jedna wiadomość naraz w rozmowie, najwyżej 4000 znaków na wiadomość, 60 wiadomości na
użytkownika na godzinę i 5 rozmów na użytkownika. Rozmowa jest odrzucana po 2 godzinach bez wiadomości.

Karty podsumowania z przyciskiem **Uruchom** można użyć raz, a po 15 minutach wygasa: wtedy Uruchom odpowiada, że
podsumowanie wygasło, i użytkownik prosi asystenta o nowe. Rozmowy i podsumowania są przechowywane w pamięci, więc po
restarcie użytkownik musi rozpocząć nową rozmowę.
