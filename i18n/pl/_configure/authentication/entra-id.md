---
layout: default
title: Entra ID
parent: Uwierzytelnianie
nav_order: 3
translated_from: c5dad595f7df36cfd31a902ad0a44c7b5bb02f4e
---

# Entra ID
{: .no_toc }

Logowanie jednokrotne przez Microsoft Entra ID (Azure AD), z rolami z grup Entra ID użytkownika
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Jak to działa

Gdy dostawca Entra ID jest włączony, strona logowania pokazuje przycisk Entra ID pod **Zaloguj się**. Logowanie przebiega wtedy tak:

1. Przycisk wysyła przeglądarkę do `/api/v2/auth/entraid`, który przekierowuje ją do Microsoft.
2. Użytkownik loguje się w Microsoft, a ten przekierowuje z powrotem na **Redirect URL** z kodem autoryzacji. Serwer
   wymienia ten kod w Microsoft na token ID i token dostępu do Microsoft Graph.
3. Serwer odczytuje grupy użytkownika z Microsoft Graph (`/v1.0/me/transitiveMemberOf`), więc liczą się też grupy zagnieżdżone.
4. Grupy są filtrowane **Filtrem grup** po nazwie wyświetlanej, a każda zachowana grupa jest zapisywana dwukrotnie,
   jako `azuread/<object id>` i jako `azuread/<display name>`.

Nazwa użytkownika to claim `upn` tokenu, np. `jdoe@example.com`, albo claim `preferred_username`, gdy token
nie ma `upn`; dla konta służbowego oba mają tę samą wartość.

---

## Zarejestruj aplikację

AnsibleForms potrzebuje rejestracji aplikacji w centrum administracyjnym Entra, w **App registrations > New registration**:

1. Nadaj jej nazwę, jako obsługiwane typy kont wybierz **Accounts in this organizational directory only** i dodaj
   identyfikator URI przekierowania typu **Web**: `https://af.example.com/api/v2/auth/entraid/callback`.
2. W **Certificates & secrets** utwórz client secret i skopiuj jego wartość; jest pokazywana tylko raz.
3. W **API permissions** dodaj **delegowane** uprawnienia Microsoft Graph `User.Read` i `GroupMember.Read.All`
   i udziel dla nich zgody administratora.
4. Na stronie **Overview** zanotuj **Application (client) ID** i **Directory (tenant) ID**.

Identyfikator URI przekierowania to adres, pod którym użytkownicy otwierają AnsibleForms, z dopisanym `/api/v2/auth/entraid/callback`.
Przy [`BASE_URL`](../customization/server.html#env_BASE_URL) `/forms` staje się on
`https://af.example.com/forms/api/v2/auth/entraid/callback`. Musi dokładnie odpowiadać polu **Identyfikator URI przekierowania** w poświadczeniu
dostawcy.

Do wersji 7.2.0 ścieżka brzmiała `/api/v2/auth/azureadoauth2/callback`. Od 7.3.0 nadal działa, więc istniejąca rejestracja
nie wymaga zmian; poświadczenie z pustym **Identyfikatorem URI przekierowania** używa nowej ścieżki, więc wtedy dodaj ją do rejestracji.

AnsibleForms odczytuje grupy z Graph i nie używa claimu groups w tokenie, więc w rejestracji nie trzeba konfigurować
żadnego claimu grup.

---

## Dodaj dostawcę

Dodaj dostawcę w **Dostęp > SSO**: kreator pyta o pola w czterech krokach, z **Microsoft Entra ID** w kroku **Typ**:

| Krok | Pole | Znaczenie |
|---|---|---|
| Szczegóły | Nazwa, Opis | Unikalna nazwa dostawcy i opcjonalny opis |
| Typ | Dostawca | **Microsoft Entra ID**; ustawiany przy tworzeniu, potem się nie zmienia |
| Poświadczenia | Poświadczenie | Poświadczenie **Microsoft Entra ID** z [Połączenia > Poświadczenia](../credentials.html), zobacz niżej |
| Grupy | Filtr grup | Wyrażenie regularne; zachowywane są tylko grupy, których nazwa wyświetlana pasuje. Puste zachowuje wszystkie grupy |

Poświadczenie przechowuje rejestrację aplikacji, więc tylko admin może je dodać lub zmienić:

| Pole | Znaczenie |
|---|---|
| Tenant ID | Wymagane. Directory (tenant) ID, czyli GUID, albo jedna z domen dzierżawy. Zalogować się mogą tylko użytkownicy tej dzierżawy |
| Client ID | Application (client) ID |
| Client secret | Wartość client secret, przechowywana w postaci zaszyfrowanej lub odczytywana z [magazynu sekretów](../secret-stores/) |
| Identyfikator URI przekierowania | Tak jak zarejestrowano, np. `https://af.example.com/api/v2/auth/entraid/callback`. Puste: adres URL aplikacji i ścieżka zwrotna |

Poświadczenie z pustym tenant ID jest odrzucane przy zapisie. Wielodzierżawowe punkty końcowe `common`, `organizations`
i `consumers` są odrzucane przy zapisie dostawcy, który wskazuje to poświadczenie, bo pozwoliłyby zalogować się użytkownikom dowolnej
dzierżawy Microsoft. Przy logowaniu serwer sprawdza też, czy token pochodzi ze skonfigurowanej dzierżawy. Dostawca
zapisany wcześniej bez tenant ID nikogo nie loguje: dopóki tenant ID nie zostanie uzupełniony, serwer zapisuje w dzienniku
`Could not enable Microsoft Entra ID: set the tenant id to your tenant ('' would let any Microsoft tenant log in)`.

Do wersji 7.2.0 tenant, client ID, secret i redirect URL były polami dostawcy. Aktualizacja do 7.3.0 przenosi je do
poświadczenia o nazwie `<provider>-sso`, zobacz [Adresy w poświadczeniach](../credentials/types.html#addresses-in-credentials).
Wybierz poświadczenie dla każdego nowego dostawcy: serwer nadal akceptuje dostawcę z własnym client ID i secret sprzed
7.3.0, który loguje nimi, dopóki nie zostanie wybrane poświadczenie.

Naraz włączony jest jeden dostawca Entra ID, ten, przez którego loguje przycisk Entra ID. **Włącz** w menu wiersza innego dostawcy
albo jego przełącznik **Włączony** wyłącza pozostałych tego typu; kolumna **Włączony** na liście pokazuje, który jest używany. Dostawca
może też pomijać stronę logowania, zobacz [Przełączanie logowania jednokrotnego](./#switching-single-sign-on). Zapis działa od razu, bez restartu.

---

## Mapowanie na role

W config.yaml grupa Entra ID to `entraid/<object id>` lub `entraid/<display name>`, a użytkownik to `entraid/<upn>`.
Object id jest unikalny w dzierżawie, więc to bezpieczniejszy wybór; nazwa wyświetlana jest łatwiejsza do odczytania:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - entraid/0b6c8e1a-2f4d-4c7e-9a3b-5d1e7f2a4c6b
  - name: operator
    groups:
      - entraid/AF-Operators
    users:
      - entraid/jdoe@example.com
```

Do wersji 7.2.0 prefiks brzmiał `azuread/`. W roli od 7.3.0 nadal pasuje do tych samych członków i zostanie usunięty w 8.0;
edytor ról zapisuje `entraid/`. Tylko role przyjmują `entraid/`: grupy użytkownika są zapisywane jako `azuread/<object id>` i
`azuread/<display name>` i tak pokazują je strona profilu oraz extravar `ansibleforms_user`. **Filtr grup** taki jak `^AF-` zachowuje tylko grupy, których używają Twoje role; zobacz [Role](../config/roles.html). Od wersji 7.1.0
token logowania nie zawiera już grup, więc jego rozmiar nie rośnie razem z nimi. Filtr nadal ma znaczenie dla
użytkowników w wielu grupach: przy każdym logowaniu mniej grup jest dopasowywanych do ról, a
[wpis w katalogu](../users-and-groups/directory.html) użytkownika pokazuje tylko grupy, które się liczą. Przed wersją 7.1.0
użytkownik w stu lub więcej grupach potrzebuje go, żeby w ogóle zobaczyć formularze, zobacz
[Puste formularze i zadania po logowaniu jednokrotnym](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).

---

## Punkt końcowy Microsoft Graph

Serwer domyślnie loguje użytkowników w `https://login.microsoftonline.com` i wywołuje Microsoft Graph pod `https://graph.microsoft.com`:

| Zmienna | Co zmienia |
|---|---|
| [`ENTRA_AUTHORITY_URI`](../customization/security.html#env_ENTRA_AUTHORITY_URI) | Urząd logowania (authority), dla chmury krajowej, np. `https://login.microsoftonline.us` |
| [`ENTRA_GRAPH_URI`](../customization/security.html#env_ENTRA_GRAPH_URI) | Punkt końcowy Graph, z którego odczytywane są grupy, np. `https://graph.microsoft.us` |

Obie przyjmują bazowy URI bez końcowego ukośnika i są nowe w wersji 7.3.0. `AZURE_AUTHORITY_URI` i `AZURE_GRAPH_URI` są nadal odczytywane,
gdy tamte nie są ustawione, z ostrzeżeniem w dzienniku, i zostaną usunięte w 8.0. Serwer musi mieć dostęp do Graph: logowanie się nie udaje, gdy nie da się odczytać grup.

---

## Ograniczenia

Użytkownicy Entra ID logują się przez Microsoft, więc kilka rzeczy działa inaczej niż w przypadku kont lokalnych i LDAP:

- Nie mają hasła w AnsibleForms, więc nie mogą go tam zmienić; [token API](../profile/api-token.html) tworzy się z ich sesji.
- Nazwy wyświetlane nie są w Entra ID unikalne: dwie grupy o tej samej nazwie mapują się na tę samą rolę. Wskaż grupę w roli
  przez jej object id, `entraid/<object id>`, żeby pasowała tylko ta grupa.
