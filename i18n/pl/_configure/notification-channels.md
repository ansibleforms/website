---
layout: default
title: Kanały powiadomień
nav_order: 10
has_children: true
has_toc: false
permalink: /notification-channels.html
translated_from: 1756db6ff7b9197f88b34a0c089953a68493e008
---

# Kanały powiadomień
{: .no_toc }

Wysyłaj prośby o zatwierdzenie i powiadomienia o zadaniach pocztą, na Slack, do Microsoft Teams, na Telegram lub do dowolnego webhooka
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dla administratorów: dodaj serwery poczty i kanały czatu, do których formularze wysyłają powiadomienia i zatwierdzenia.

---

## W tej sekcji

| Strona | Czego dotyczy |
|---|---|
| [Poczta](notification-channels/mail.html) | Serwery SMTP, serwer domyślny i ich logowanie |
| [Slack i Microsoft Teams](notification-channels/slack-and-teams.html) | Webhook kanału Slack lub Teams |
| [Telegram](notification-channels/telegram.html) | Bot piszący na czacie Telegram |
| [Webhook](notification-channels/webhook.html) | Żądanie JSON do dowolnego endpointu HTTP |
| [Kanały w formularzu](notification-channels/in-a-form.html) | Wskazywanie kanałów w powiadomieniach i zatwierdzeniach |
| [Testowanie kanału](notification-channels/testing.html) | Wyślij test i co on dowodzi |


---

## Jak to działa

**Kanał powiadomień** to miejsce, do którego trafiają powiadomienia, dodawane w **Połączenia > Powiadomienia**. Każdy kanał ma
jeden z tych typów:

| Typ | Co wysyła |
|---|---|
| Poczta | Pocztę przez serwer SMTP: prośby o zatwierdzenie i powiadomienia o zadaniach. |
| Slack | Wiadomość na kanale Slack, przez jego webhook przychodzący, z przyciskiem do zadania. |
| Microsoft Teams | Kartę na kanale Teams, przez webhook Workflows, z przyciskiem do zadania. |
| Telegram | Wiadomość od bota na czacie Telegram, z linkiem do zadania. |
| Webhook | Żądanie JSON do dowolnego endpointu HTTP, zbudowane z szablonu. |

Formularz wskazuje swoje kanały w [powiadomieniach](forms/notifications.html) i w [zatwierdzeniu](forms/approval.html),
przez `channels:`. Powiadomienie, którego nie da się wysłać, trafia do dziennika; nigdy nie powoduje niepowodzenia zadania ani zatwierdzenia.

---

## Strona powiadomień

Strona w **Połączenia > Powiadomienia** wyświetla każdy kanał z tymi kolumnami:

| Kolumna | Znaczenie |
|---|---|
| Włączony | Czy wysyłane są do niego powiadomienia, zobacz [Kanały w formularzu](notification-channels/in-a-form.html). |
| Nazwa | Jak formularze odwołują się do niego w `channels:`. |
| Typ | Poczta, Slack, Microsoft Teams, Telegram lub Webhook. Domyślny kanał pocztowy pokazuje po typie pigułkę **Domyślny**. |
| Opis | Do czego służy kanał. |

**Dodaj kanał powiadomień** otwiera okno: **Kanał** (nazwa i opis), **Typ**, a potem kroki wybranego
typu. Typ ustala się przy tworzeniu kanału i potem się nie zmienia. Wiersz otwiera własną stronę kanału, z tymi samymi krokami jako
kartami po **Szczegóły** oraz z **Wyślij test**, **Usuń** i **Zapisz** w prawym górnym rogu. Menu wiersza oferuje
**Edytuj**, **Włącz** lub **Wyłącz** (zależnie od stanu), **Ustaw jako domyślny** (poczta), **Wyślij test** i **Usuń**.

Karta **Szczegóły** na stronie kanału zawiera przełącznik **Włączony**, który zapisuje się od razu, a dla poczty przełącznik **Domyślny**,
który zapisuje się przyciskiem **Zapisz**.

Użytkownik, który otwiera te strony z `showConnectionsSettings`, ale bez roli admin, nie może wybrać poświadczenia, które
może wskazać tylko admin, zobacz [Kto może zmienić poświadczenie](credentials.html#who-may-change-a-credential). Gdy taki użytkownik zmienia,
dokąd kanał wysyła (url webhooka lub jego sprawdzanie certyfikatu, adres Bot API Telegrama), kanał traci
wskazane poświadczenie, chyba że w tej samej zmianie wybierze nowe.

Kanał zadeklarowany w [config seed](seed/) jest na tej stronie tylko do odczytu, ale nadal można go przetestować.

