---
layout: default
title: OIDC
parent: Uwierzytelnianie
nav_order: 4
translated_from: 5451df911884021544dea5ffbaa7228a7a4435ef
---

# OIDC
{: .no_toc }

Logowanie jednokrotne przez dostawcę OpenID Connect, np. Keycloak, z rolami z claimu grup
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Jak to działa

Gdy dostawca OIDC jest włączony, strona logowania pokazuje przycisk OpenID pod **Zaloguj się**. Logowanie przebiega wtedy tak:

1. Przycisk wysyła przeglądarkę do `/api/v2/auth/oidc`, który przekierowuje ją do dostawcy (przepływ kodu autoryzacji
   z PKCE).
2. Użytkownik loguje się u dostawcy, a ten przekierowuje z powrotem na **Redirect URL**.
3. Serwer wymienia kod na tokeny i odczytuje claimy tokenu ID.
4. Nazwa użytkownika to claim `preferred_username`, a każda wartość claimu `groups`, która przejdzie przez
   **Filtr grup**, staje się grupą `oidc/<value>`.

AnsibleForms żąda zakresów `openid profile email`; zakresów nie można konfigurować. Wylogowanie z AnsibleForms
wysyła też przeglądarkę do punktu końcowego zakończenia sesji u dostawcy, jeśli dostawca go publikuje.

{: .note }
> OIDC zostało przetestowane z Keycloak. Inni dostawcy działają, jeśli spełniają poniższe wymagania.

---

## Wymagania wobec dostawcy

Dostawca musi oferować OpenID Connect discovery i klienta poufnego dla AnsibleForms:

- **Discovery**: AnsibleForms odczytuje `<issuer>/.well-known/openid-configuration`, więc wystawca musi być osiągalny z
  serwera AnsibleForms, przez HTTPS.
- **Klient poufny** z przepływem kodu autoryzacji, client ID i client secret.
- **Identyfikator URI przekierowania** `https://af.example.com/api/v2/auth/oidc/callback`, czyli adres, pod którym użytkownicy otwierają
  AnsibleForms, z dopisanym `/api/v2/auth/oidc/callback`. Przy [`BASE_URL`](../customization/server.html#env_BASE_URL)
  `/forms` staje się on `https://af.example.com/forms/api/v2/auth/oidc/callback`.
- **Claim `groups` w tokenie ID**, zawierający listę nazw grup. Bez niego użytkownik nie dostaje żadnych grup OIDC.
- **Claim `preferred_username`**, który staje się nazwą użytkownika.

---

## Przykład Keycloak

Ten przykład używa realmu `example` na `https://keycloak.example.com`; wystawca to wtedy
`https://keycloak.example.com/realms/example`. W tym realmie:

1. W **Clients** utwórz klienta OpenID Connect z client ID `ansibleforms`. Włącz **Client authentication**,
   zostaw **Standard flow** i ustaw **Valid redirect URIs** na `https://af.example.com/api/v2/auth/oidc/callback`.
2. Na karcie **Credentials** klienta skopiuj **Client secret**.
3. Na karcie **Client scopes** otwórz `ansibleforms-dedicated` i dodaj mapper **By configuration > Group Membership**,
   z **Token Claim Name** `groups`, wyłączonym **Full group path** i włączonym **Add to ID token**.

Przy włączonym **Full group path** claim zawiera ścieżki takie jak `/af-admins`, a rola musi wtedy używać `oidc//af-admins`.

---

## Dodaj dostawcę

Dodaj dostawcę w **Dostęp > SSO**: kreator pyta o pola w czterech krokach, z **Open ID** w kroku **Typ**:

| Krok | Pole | Znaczenie |
|---|---|---|
| Szczegóły | Nazwa, Opis | Unikalna nazwa dostawcy i opcjonalny opis |
| Typ | Dostawca | **Open ID**; ustawiany przy tworzeniu, potem się nie zmienia |
| Poświadczenia | Poświadczenie | Poświadczenie **Open ID** z [Połączenia > Poświadczenia](../credentials.html), zobacz niżej |
| Grupy | Filtr grup | Wyrażenie regularne; zachowywane są tylko pasujące wartości claimu `groups`. Puste zachowuje wszystkie grupy |

Poświadczenie przechowuje klienta, więc tylko admin może je dodać lub zmienić:

| Pole | Znaczenie |
|---|---|
| Wystawca | Wymagane. Adres URL wystawcy, np. `https://keycloak.example.com/realms/example` |
| Client ID | Client ID u dostawcy, np. `ansibleforms` |
| Client secret | Client secret, przechowywany w postaci zaszyfrowanej lub odczytywany z [magazynu sekretów](../secret-stores/) |
| Identyfikator URI przekierowania | Tak jak zarejestrowano, np. `https://af.example.com/api/v2/auth/oidc/callback`. Puste: adres URL aplikacji i ścieżka zwrotna |

Do wersji 7.2.0 wystawca, client ID, secret i redirect URL były polami dostawcy. Aktualizacja do 7.3.0 przenosi je do
poświadczenia o nazwie `<provider>-sso`, zobacz [Adresy w poświadczeniach](../credentials/types.html#addresses-in-credentials).
Wybierz poświadczenie dla każdego nowego dostawcy: serwer nadal akceptuje dostawcę z własnym client ID i secret sprzed
7.3.0, który loguje nimi, dopóki nie zostanie wybrane poświadczenie.

Naraz włączony jest jeden dostawca OIDC, ten, przez którego loguje przycisk OpenID. **Włącz** w menu wiersza innego dostawcy
albo jego przełącznik **Włączony** wyłącza pozostałych tego typu; kolumna **Włączony** na liście pokazuje, który jest używany.
Dostawca może też pomijać stronę logowania, zobacz [Przełączanie logowania jednokrotnego](./#switching-single-sign-on).

Zapisanie dostawcy stosuje go natychmiast. Gdy wystawca jest nieosiągalny, serwer zapisuje w dzienniku
`Failed to initialize OIDC strategy`, a logowania OIDC się nie udają, dopóki dostawca nie zostanie ponownie zapisany lub serwer nie zostanie uruchomiony ponownie.

---

## Mapowanie na role

W config.yaml grupa OIDC to `oidc/<group>`, a użytkownik to `oidc/<preferred_username>`:

```yaml
roles:
  - name: admin
    groups:
      - local/admins
      - oidc/af-admins
  - name: operator
    groups:
      - oidc/af-operators
    users:
      - oidc/jdoe
```

Wartości są dopasowywane dokładnie, z uwzględnieniem wielkości liter. Opcje ról opisuje strona [Role](../config/roles.html).

---

## Ograniczenia

Użytkownicy OIDC logują się u dostawcy, więc kilka rzeczy działa inaczej niż w przypadku kont lokalnych i LDAP:

- Nie mają hasła w AnsibleForms, więc nie mogą go tam zmienić; od wersji 7.2.0 [token API](../profile/api-token.html)
  tworzy się z ich sesji.
- Utrzymuj krótki claim `groups`: wysyłaj tylko grupy istotne dla AnsibleForms, np. przez dedykowany
  client scope lub strukturę grup u dostawcy, albo filtruj je **Filtrem grup**. Od wersji 7.1.0 token logowania
  AnsibleForms nie zawiera już grup; wcześniej użytkownik w stu lub więcej grupach mógł nie widzieć żadnych formularzy, zobacz
  [Puste formularze i zadania po logowaniu jednokrotnym](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
