---
layout: default
title: HTTPS
parent: Bezpieczeństwo
nav_order: 2
redirect_from:
  - /production/https.html
translated_from: 2d8601a66c8f664c1cf762e7829e2c1251248a19
---

# HTTPS
{: .no_toc }

Udostępniaj HTTPS z samej aplikacji i zastąp przykładowy certyfikat
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Gdzie kończy się TLS

TLS może kończyć się w jednym z trzech miejsc, a tylko pierwsze dotyczy ustawień z tej strony:

* **w AnsibleForms**, z `HTTPS=1` : HTTPS na [`PORT`](../customization/server.html#env_PORT) z poniższymi plikami, jak robi to docker-compose na porcie 443.
* **w reverse proxy**, z `HTTPS=0` za nim : zobacz [Reverse proxy](../production/reverse-proxy.html).
* **w ingressie Kubernetes** : zobacz kartę Ingress na stronie [Kubernetes](../installation/kubernetes.html#7-open-ansibleforms) i README chartu.

Pierwsze możesz połączyć z dwoma pozostałymi, żeby szyfrować także odcinek między proxy a aplikacją.

---

## Ustawienia

HTTPS w aplikacji kontrolują trzy zmienne:

| Zmienna | Domyślnie | Znaczenie |
|----------|---------|---------|
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` | `1` udostępnia HTTPS, `0` zwykłe HTTP |
| [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) | `%PERSISTENT_FOLDER%/certificates/key.pem` | Klucz prywatny, PEM |
| [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) | `%PERSISTENT_FOLDER%/certificates/cert.pem` | Certyfikat serwera, PEM |

W obrazie kontenera folder trwały to `/app/dist/persistent`, więc domyślne pliki to
`/app/dist/persistent/certificates/key.pem` i `cert.pem`. W projekcie docker-compose jest to `data/certificates/`
na hoście.

---

## Przykładowy certyfikat

Gdy `HTTPS=1`, a przy starcie brakuje któregoś z plików, AnsibleForms zapisuje w dzienniku `httpsKey or httpsCert not found, copying from
templates` i kopiuje przykładowy klucz i certyfikat z obrazu do skonfigurowanych ścieżek. Jeśli kopiowanie się nie uda,
aplikacja się zatrzymuje.

Ten certyfikat jest samopodpisany dla `CN=ansibleforms` i jest **taki sam w każdej instalacji**: jego klucz prywatny
jest dostarczany w publicznym obrazie. Wystarczy do pierwszego zapoznania się, ale przeglądarki ostrzegają przed nim, a każdy może odszyfrować ruch
nim chroniony. Zastąp go, zanim instancja będzie przechowywać prawdziwe poświadczenia.

---

## Zastąpienie certyfikatu

Użyj certyfikatu wystawionego dla nazwy hosta, którą wpisują użytkownicy, przez Twoje CA lub klienta ACME, w formacie PEM.
Plik certyfikatu może zawierać pełny łańcuch: najpierw certyfikat serwera, potem pośrednie.

1. Skopiuj pliki do folderu trwałego lub w dowolne miejsce, z którego aplikacja może je odczytać:

   ```bash
   sudo cp forms.example.com.key data/certificates/key.pem
   sudo cp forms.example.com.fullchain.crt data/certificates/cert.pem
   sudo chmod 600 data/certificates/key.pem
   ```

2. Jeśli znajdują się gdzie indziej, ustaw `HTTPS_KEY` i `HTTPS_CERT` na ich ścieżki **wewnątrz kontenera**.

3. Uruchom ponownie aplikację, która odczytuje oba pliki przy starcie.

Szybki własny certyfikat samopodpisany (dla instancji testowej lub odcinka za proxy) tworzy `openssl`:

```bash
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout data/certificates/key.pem -out data/certificates/cert.pem \
  -subj "/CN=forms.example.com" -addext "subjectAltName=DNS:forms.example.com"
```

---

## Odnawianie bez restartu

Zmiana `HTTPS_KEY` lub `HTTPS_CERT` na stronach ustawień przeładowuje klucz i certyfikat w działającym serwerze.
Nowe połączenia dostają nowy certyfikat, otwarte zachowują stary. Jeśli nowych plików nie da się odczytać lub nie tworzą prawidłowej
pary, bieżący certyfikat zostaje, a w dzienniku pojawia się ostrzeżenie.

Działa to tylko wtedy, gdy strony ustawień mogą zapisywać środowisko ([`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)
ma wartość `1`), a zmienna nie jest ustawiona w rzeczywistym środowisku. Gdy odnowienie zastępuje pliki pod tymi samymi
ścieżkami, uruchom aplikację ponownie.
