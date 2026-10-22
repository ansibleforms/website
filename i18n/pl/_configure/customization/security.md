---
layout: default
title: Zmienne bezpieczeństwa
parent: Zmienne środowiskowe
nav_order: 6
translated_from: af00832e0e69ea667004fbe5ebe635dd70ff3684
---

# Zmienne bezpieczeństwa
{: .no_toc }

Tokeny, szyfrowanie, wychodzące hosty REST, maskowanie i stare ustawienia VAULT_*
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Zmień je, aby ustawić własne sekrety tokenów i szyfrowania oraz ograniczyć to, co formularze mogą wywoływać i pokazywać.

---

## Przykład

Własne sekrety, wywołania REST ograniczone do jednego API i sieci wewnętrznej oraz jeden dodatkowy maskowany klucz. W `.env` projektu compose:

```bash
ACCESS_TOKEN_SECRET=change-me-to-a-long-random-string
ENCRYPTION_SECRET=change-me-to-32-random-characters
REST_ALLOWED_HOSTS=api.example.com,10.20.0.0/16
MASK_EXTRAVARS_REGEX=password|secret|token|apikey
```

Ustaw `ENCRYPTION_SECRET`, zanim zostanie zapisane pierwsze poświadczenie. Od wersji 7.3.0 ustawienie lub zmiana go ponownie szyfruje każdy zapisany
sekret przy następnym uruchomieniu, przy czym `ENCRYPTION_SECRET_PREVIOUS` wskazuje stary klucz, jeśli był Twój własny, zobacz
[Zmiana sekretu szyfrowania](../security/secrets.html#changing-the-encryption-secret).

---

## Wywołania REST i jq

Od wersji 7.3.0 funkcje pomocnicze REST (`fn.fnRestBasic`, `fn.fnRestAdvanced`, `fn.fnRestJwt`, `fn.fnRestJwtSecure`) sprawdzają
certyfikat wywoływanego punktu końcowego, jak każde inne połączenie; do wersji 7.2.0 nigdy tego nie robiły. Dotyczą ich trzy ustawienia:

| Zmienna | Domyślnie | Efekt |
|---|---|---|
| [`REST_IGNORE_CERTS`](#env_REST_IGNORE_CERTS) | `0` | `1` pomija sprawdzanie certyfikatu: tylko dla punktów końcowych z certyfikatem samopodpisanym |
| [`REST_TIMEOUT_SECONDS`](#env_REST_TIMEOUT_SECONDS) | `60` | Jak długo wywołanie REST czeka na odpowiedź, zanim zakończy się błędem przekroczenia czasu |
| [`JQ_TIMEOUT_SECONDS`](#env_JQ_TIMEOUT_SECONDS) | `30` | Jak długo może działać filtr jq, zanim zostanie zatrzymany; wynik jq jest też ograniczony do 64 MB |

Wszystkie trzy działają po zapisaniu, bez restartu. Dla punktu końcowego, którego certyfikat jest podpisany przez prywatne CA, zostaw sprawdzanie włączone
i zamiast tego przekaż to CA do Node.js: ustaw w środowisku aplikacji `NODE_EXTRA_CA_CERTS` na plik PEM, który je zawiera, a potem uruchom aplikację ponownie.

---

## Zmienne

Każda zmienna tej grupy, z typem, wartością domyślną i opisem:

{% include env_vars_table.html group="security" %}
