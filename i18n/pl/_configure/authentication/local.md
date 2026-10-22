---
layout: default
title: Konta lokalne
parent: Uwierzytelnianie
nav_order: 1
translated_from: 002a371f2b4dbe5cc9c99ee569b8cf17a2a4ac88
---

# Konta lokalne
{: .no_toc }

Wbudowany admin oraz użytkownicy i grupy przechowywani w bazie danych AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Wbudowany admin

Każde uruchomienie tworzy lokalną grupę `admins` i użytkownika admin, jeśli ich brakuje; admina kontrolują trzy zmienne:

| Zmienna | Domyślnie | Znaczenie |
|---|---|---|
| [`ADMIN_USERNAME`](../customization/server.html#env_ADMIN_USERNAME) | `admin` | Nazwa użytkownika admina, tworzonego w grupie `admins`, gdy żaden użytkownik nie ma tej nazwy. |
| [`ADMIN_PASSWORD`](../customization/server.html#env_ADMIN_PASSWORD) | `AnsibleForms!123` | Hasło nadawane adminowi przy tworzeniu (lub resetowaniu). |
| [`REINIT_ADMIN`](../customization/server.html#env_REINIT_ADMIN) | `0` | `1` resetuje hasło admina do `ADMIN_PASSWORD` i przywraca go do `admins`. |

`ADMIN_PASSWORD` jest używane tylko przy tworzeniu lub resetowaniu użytkownika: późniejsza zmiana sama w sobie nic nie robi.

Lokalny użytkownik, który loguje się publicznym hasłem domyślnym `AnsibleForms!123`, może tylko je zmienić. Przeglądarka otwiera
stronę zmiany hasła, której nie da się zamknąć, a serwer odpowiada na każde inne żądanie kodem `403` (kod
`password_change_required`), dopóki hasło nie zostanie zmienione. Nowe hasło musi różnić się od domyślnego; po
zmianie użytkownik loguje się ponownie nowym hasłem. Ustaw `ADMIN_PASSWORD` na własną wartość przed pierwszym uruchomieniem, aby pominąć ten krok.

Zmiana `ADMIN_USERNAME` po pierwszym uruchomieniu tworzy drugiego użytkownika admin o tej nazwie; stary zostaje.

{: .warning }
> `REINIT_ADMIN=1` resetuje hasło przy **każdym** uruchomieniu, dopóki jest ustawione. Użyj go, aby odzyskać utracone hasło admina,
> a potem je usuń i uruchom ponownie.

---

## Użytkownicy i grupy

Lokalnymi użytkownikami i grupami zarządza się w **Dostęp > Użytkownicy** i **Dostęp > Grupy**. Użytkownik ma te pola:

| Pole | Znaczenie |
|---|---|
| Nazwa użytkownika | Nazwa logowania. Musi być unikalna. |
| Opis | Opcjonalny. |
| Hasło | Przechowywane jako skrót. Zmienisz je później akcją **Zmień hasło**. |
| E-mail | Opcjonalny. |
| Grupa | Pierwsza lokalna grupa użytkownika. Kolejne dodasz na karcie **Grupy** na stronie użytkownika. |

Użytkownicy lokalni zmieniają własne hasło w swoim profilu; pozostali użytkownicy robią to w swoim katalogu lub u dostawcy tożsamości.

Użytkownik może należeć do kilku grup i dostaje role ich wszystkich. Karta **Grupy** na stronie użytkownika dodaje i
usuwa grupy, tak samo jak karta **Użytkownicy** na stronie grupy. Użytkownik zachowuje co najmniej jedną grupę: ostatniej nie można
usunąć.

Grupy, która nadal ma użytkowników, nie można usunąć: najpierw usuń z niej użytkowników. Grupy `admins` nigdy nie można usunąć ani
zmienić jej nazwy, a użytkownika `admin` nigdy nie można usunąć.

---

## Zezwalanie na logowanie

Karta **Szczegóły** na stronie użytkownika ma przełącznik **Zezwól na logowanie**, dostępny też jako **Zablokuj logowanie** i **Zezwól
na logowanie** w menu wiersza na liście użytkowników. Istnieje zarówno dla użytkowników lokalnych, jak i dla użytkowników LDAP i SSO:

- **Włączony**: użytkownik loguje się normalnie.
- **Wyłączony**: sesje użytkownika kończą się natychmiast, a każde logowanie jest odrzucane, dopóki admin go znowu nie włączy. Strona
  najpierw prosi o potwierdzenie.

Przełącznika nie można wyłączyć dla użytkownika `admin`, który jest drogą powrotną, ani nie może go wyłączyć admin dla własnego konta. Strona
użytkownika LDAP lub SSO ma też **Zakończ sesje**, co wylogowuje użytkownika wszędzie, bez blokowania go.

---

## Mapowanie na role

Role wskazują grupy lokalne jako `local/<group>`, a użytkowników jako `local/<user>`; domyślnie `admins` dostaje `admin`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
  - name: operator
    groups:
      - local/operators
    users:
      - local/svc-backup
```

Zachowaj `local/admins` w roli `admin`, żeby wbudowany admin zawsze mógł się zalogować, nawet gdy katalog lub
dostawca tożsamości jest niedostępny. Gdy config.yaml w ogóle nie da się wczytać, członkowie `local/admins` nadal dostają rolę
`admin`, więc możesz się zalogować i to naprawić. Opcje ról opisuje strona [Role](../config/roles.html).

---

## Konta lokalne i LDAP

Logowanie nazwą użytkownika i hasłem sprawdza użytkowników lokalnych przed LDAP. Gdy lokalny użytkownik ma tę samą nazwę co użytkownik
katalogu, konto lokalne zawsze wygrywa, a hasło z katalogu nie działa dla tej nazwy. Nadawaj kontom lokalnym nazwy,
które nie mogą kolidować z kontami katalogu, np. z prefiksem `svc-`.
