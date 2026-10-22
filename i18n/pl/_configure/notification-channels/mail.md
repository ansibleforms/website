---
layout: default
title: Poczta
parent: Kanały powiadomień
nav_order: 1
translated_from: 3ab21a1f2987744527863f5f25ce347dbdf2cd3d
---

# Poczta
{: .no_toc }

Serwery SMTP, serwer domyślny i ich logowanie
{: .fs-6 .fw-300 }

Kanał pocztowy to serwer SMTP. Możesz mieć ich kilka; ten oznaczony jako **Domyślny** to serwer, przez który aplikacja wysyła
pocztę, gdy formularz nie wskazuje żadnego kanału pocztowego. Pierwszy kanał pocztowy staje się domyślnym, a **Ustaw jako domyślny** to zmienia.

| Krok | Pole | Znaczenie |
|---|---|---|
| Poświadczenia | Poświadczenie | Wymagane. Poświadczenie **smtp** z [Połączenia > Poświadczenia](../credentials.html): serwer poczty, jego port i TLS oraz logowanie. Dla przekaźnika bez logowania poświadczenie smtp bez użytkownika. |
| Nadawca | Nadawca | Adres nadawcy widoczny dla odbiorców. |

Przełącznik **Domyślny** na karcie **Szczegóły** strony kanału pocztowego ustawia go jako domyślny, tak jak **Ustaw jako domyślny**.
Ustawienia poczty z config seed są używane, dopóki żaden kanał pocztowy nie jest domyślny lub dopóki domyślny jest wyłączony.
