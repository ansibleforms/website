---
layout: default
title: Poczta
parent: Kanały powiadomień
nav_order: 1
translated_from: 912c390487fa6b9e65cd83eb1e626c18c44f981a
---

# Poczta
{: .no_toc }

Serwery poczty, serwer domyślny i sposób ich logowania
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Kanał pocztowy

Kanał pocztowy to serwer, przez który aplikacja wysyła pocztę: serwer SMTP albo, od wersji 7.6.0, Microsoft 365. Możesz mieć ich kilka;
ten oznaczony jako **Domyślny** to serwer, przez który aplikacja wysyła pocztę, gdy formularz nie wskazuje żadnego kanału pocztowego:

| Krok | Pole | Znaczenie |
|---|---|---|
| Poświadczenia | Poświadczenie | Poświadczenie **smtp** z [Połączenia > Poświadczenia](../credentials.html) (serwer poczty, jego port i TLS oraz logowanie, lub **Bez logowania** dla przekaźnika) albo poświadczenie **Microsoft Entra ID** do wysyłania przez [Microsoft 365](microsoft-365.html). Wymagane dla nowego kanału; krok nie pyta o nic więcej na temat serwera. |
| Poświadczenia | Serwer poczty, Port poczty, Używaj TLS | Nie w oknie. Tylko na stronie kanału bez poświadczenia lub takiego, którego poświadczenie smtp nie ma serwera, zobacz niżej. |
| Poświadczenia | Wysyłaj przez | Tylko z poświadczeniem Microsoft Entra ID: **Microsoft Graph** (domyślnie) lub **SMTP (OAuth2)**, zobacz [Microsoft 365](microsoft-365.html). |
| Nadawca | Nadawca | Adres nadawcy widoczny dla odbiorców. Przy Microsoft 365 skrzynka, w imieniu której wysyłana jest poczta. |

---

## Przekaźnik bez logowania

Serwera poczty, który przyjmuje pocztę bez logowania (przekaźnika), można użyć na dwa sposoby, a oba wysyłają bez uwierzytelniania:

- **Poświadczenie smtp z Bez logowania** (od wersji 7.6.0): zawiera tylko **Serwer poczty**, **Port poczty** i **Używaj TLS**, bez użytkownika i hasła.
- **Bez poświadczenia**: kanał bez niego (sprzed tej wersji lub przekaźnik z aktualizacji, zobacz niżej) zachowuje na swojej stronie własny **Serwer poczty**, **Port poczty** i **Używaj TLS**.

Kanał, którego poświadczenie smtp nie ma serwera (utworzone, zanim poświadczenia go zawierały), również zachowuje na swojej stronie własny
serwer, port i TLS, gdzie loguje się login jego poświadczenia. Kanał wskazujący poświadczenie z własnym serwerem zapomina wcześniej wpisany serwer.

---

## Kanał domyślny

Pierwszy kanał pocztowy staje się domyślnym, a **Ustaw jako domyślny** w menu wiersza przenosi to na inny. Przełącznik **Domyślny**
na karcie **Szczegóły** strony kanału pocztowego działa tak samo.

Od wersji 7.6.0 aplikacja nie wysyła żadnej poczty, dopóki żaden kanał pocztowy nie jest domyślny lub dopóki domyślny jest wyłączony.
Wcześniej wracała do ustawień poczty ze strony ustawień lub z config seed. Aktualizacja do 7.6.0 zamienia te ustawienia w domyślny
kanał pocztowy `default`, gdy żaden kanał pocztowy nie był jeszcze aktywny: z logowaniem wskazuje on nowe poświadczenie smtp `mail-login`,
a dla przekaźnika ma własny serwer i nie ma poświadczenia. W [config seed](../seed/) zadeklaruj kanał pocztowy w `notification_channels:`
(zobacz [Przykład](../seed/example.html)): stare klucze `mail_*` w `settings:` nadal działają, ale są przestarzałe.
