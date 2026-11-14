---
layout: default
title: Poczta
parent: Kanały powiadomień
nav_order: 1
translated_from: 8348d14d37bdc4afc9b68869be9fe8021197597e
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
| Poświadczenia | Poświadczenie | Poświadczenie **smtp** z [Połączenia > Poświadczenia](../credentials.html) (serwer poczty, jego port i TLS oraz logowanie) albo poświadczenie **Microsoft Entra ID** do wysyłania przez [Microsoft 365](microsoft-365.html). Opcjonalne od wersji 7.6.0: bez niego poczta idzie przez własny serwer poczty kanału, zobacz niżej. |
| Poświadczenia | Serwer poczty, Port poczty, Używaj TLS | Tylko bez poświadczenia: serwer, przez który kanał wysyła bez logowania (przekaźnik). **Serwer poczty** jest wtedy wymagany. |
| Poświadczenia | Wysyłaj przez | Tylko z poświadczeniem Microsoft Entra ID: **Microsoft Graph** (domyślnie) lub **SMTP (OAuth2)**, zobacz [Microsoft 365](microsoft-365.html). |
| Nadawca | Nadawca | Adres nadawcy widoczny dla odbiorców. Przy Microsoft 365 skrzynka, w imieniu której wysyłana jest poczta. |

---

## Przekaźnik bez logowania

Serwera poczty, który przyjmuje pocztę bez logowania (przekaźnika), można użyć na dwa sposoby, a oba wysyłają bez uwierzytelniania:

- **Poświadczenie smtp tylko z serwerem**: jego **Użytkownik (opcjonalnie)** i **Hasło (opcjonalnie)** pozostają puste.
- **Bez poświadczenia** (od wersji 7.6.0): krok **Poświadczenia** pyta o własny **Serwer poczty**, **Port poczty** i **Używaj TLS** kanału.

Kanał, który wskazuje poświadczenie z własnym serwerem, zapomina serwer wpisany wcześniej w kanale.

---

## Kanał domyślny

Pierwszy kanał pocztowy staje się domyślnym, a **Ustaw jako domyślny** w menu wiersza przenosi to na inny. Przełącznik **Domyślny**
na karcie **Szczegóły** strony kanału pocztowego działa tak samo.

Od wersji 7.6.0 aplikacja nie wysyła żadnej poczty, dopóki żaden kanał pocztowy nie jest domyślny lub dopóki domyślny jest wyłączony.
Wcześniej wracała do ustawień poczty ze strony ustawień lub z config seed. Aktualizacja do 7.6.0 zamienia te ustawienia w domyślny
kanał pocztowy `default`, gdy żaden kanał pocztowy nie był jeszcze aktywny: z logowaniem wskazuje on nowe poświadczenie smtp `mail-login`,
a dla przekaźnika ma własny serwer i nie ma poświadczenia. W [config seed](../seed/) zadeklaruj kanał pocztowy w `notification_channels:`
(zobacz [Przykład](../seed/example.html)): stare klucze `mail_*` w `settings:` nadal działają, ale są przestarzałe.
