---
layout: default
title: Reverse proxy
parent: Środowisko produkcyjne
nav_order: 1
translated_from: 13348b4571edb1aa56a0c0015a9691f81c1d412f
---

# Reverse proxy
{: .no_toc }

Publikuj AnsibleForms za Nginx, Traefik lub Apache, w katalogu głównym lub pod podścieżką
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Kiedy go używać

AnsibleForms udostępnia interfejs, REST API i Swagger na jednym porcie; reverse proxy przed nim pozwala:

* udostępniać go na porcie 443 z certyfikatem zarządzanym przez istniejące narzędzia (ACME, firmowe CA)
* dzielić jedną nazwę hosta z innymi aplikacjami, publikując AnsibleForms pod podścieżką
* trzymać port aplikacji i bazę danych poza siecią publiczną

Proxy jest opcjonalne: aplikacja może sama obsługiwać HTTPS, zobacz [HTTPS](../security/https.html).

---

## Ustawienia, które mają znaczenie

Tylko kilka ustawień wpływa na zachowanie AnsibleForms za proxy:

| Ustawienie | Za proxy |
|---------|----------------|
| [`PORT`](../customization/server.html#env_PORT) | Port, na który przekazuje proxy, domyślnie `8000`. Projekt docker-compose ustawia go na `443`. |
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0`, gdy proxy terminuje TLS i łączy się z aplikacją przez sieć prywatną, `1`, aby szyfrować także ten odcinek. |
| [`BASE_URL`](../customization/server.html#env_BASE_URL) | Podścieżka, np. `/ansibleforms`. Zostaw `/`, gdy aplikacja ma własną nazwę hosta. |
| [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) | Które proxy mogą podawać adres klienta w `X-Forwarded-For`, zwykle `1`. Zobacz [Adresy klientów](#client-addresses). |
| [`API_BODY_LIMIT_MB`](../customization/server.html#env_API_BODY_LIMIT_MB) | Największe żądanie JSON, jakie przyjmuje aplikacja, domyślnie 50 MB. Proxy musi dopuszczać co najmniej tyle. |
| [`UPLOAD_MAX_GB`](../customization/server.html#env_UPLOAD_MAX_GB) | Największy plik, jaki przyjmuje pole przesyłania formularza, domyślnie 10 GB. Proxy też musi na to pozwalać, inaczej przesyłanie zawiedzie na nim. |
| [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) | Największy zestaw nagłówków żądania, jaki przyjmuje aplikacja, domyślnie 16 KB, od wersji 7.1.0. Zobacz [Rozmiar nagłówków żądania](#request-header-size). |
| **Publiczny główny adres URL** | W **System > Ogólne**, na karcie **Serwer**: adres, pod którym wchodzą użytkownicy, łącznie z podścieżką. Z niego budowane są linki w wiadomościach z powiadomieniami, komunikatach kanałów i prośbach o zatwierdzenie. |

Dla Entra ID lub OIDC zarejestruj publiczny adres jako identyfikator URI przekierowania, z podścieżką `BASE_URL`, jeśli jest ustawiona.

---

## Udostępnianie pod podścieżką

`BASE_URL` montuje całą aplikację pod podścieżką; proxy musi przekazywać ścieżkę **bez zmian**.
Przy `BASE_URL=/ansibleforms`:

* interfejs, `/api/v2/...` i interfejs Swagger są udostępniane pod `/ansibleforms/`
* `<base href>` interfejsu jest przepisywany przy starcie, więc zasoby i wywołania API rozwiązują się pod podścieżką
* żądanie `/` lub `/ansibleforms` (bez końcowego ukośnika) jest przekierowywane na `/ansibleforms/`

Zachowaj prefiks: bez `StripPrefix` w Traefik, bez URI w `proxy_pass` w Nginx, bo aplikacja go oczekuje.

Strona **Stan** pokazuje obowiązujący bazowy URL.

---

## Limity czasu, przesyłanie plików i wynik na żywo

Strona zadań i liczniki zadań dowiadują się o zmianach przez jeden długotrwały strumień server-sent events,
[`/api/v2/events`](../api/events.html), otwarty dla każdej przeglądarki. Strumień wysyła nagłówki, które wyłączają buforowanie w proxy
(`X-Accel-Buffering: no`), i wiersz keep-alive co 15 sekund, więc typowy 60-sekundowy limit czasu odczytu utrzymuje go otwartym;
gdy proxy mimo to go zamknie, przeglądarka sama łączy się ponownie. Wynik pod formularzem, tuż po uruchomieniu, jest
natomiast odczytywany co dwie sekundy. Uruchomienie zadania wraca, gdy tylko zadanie zostanie utworzone, więc długi playbook nie trzyma
otwartego żądania.

Żądania, które mogą trwać długo, to:

* **tworzenie i przywracanie kopii zapasowych** ze strony **Kopie zapasowe**, które czekają na zakończenie polecenia zrzutu lub przywracania, do
  [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) (domyślnie 3600)
* **duże przesyłane pliki** przez pole pliku, które przesyłają cały plik w jednym żądaniu
* **wiadomości czatu**, gdy [asystent czatu](../chat/) jest włączony, które czekają na odpowiedź dostawcy modelu

Proxy często mają limit czasu 60 sekund i ograniczają rozmiar ciała żądania (Nginx domyślnie przyjmuje 1 MB). Zwiększ oba dla
tras AnsibleForms, jak w poniższych przykładach.

---

## WebSockety runnerów

Od wersji 7.3.0 [runner w trybie wychodzącym](../rte/modes.html#outbound) łączy się z aplikacją i utrzymuje jeden otwarty WebSocket na
`<BASE_URL>/api/v2/rte/socket`. Proxy musi przekazywać upgrade, inaczej runner nigdy się nie połączy i będzie ciągle próbował:

| Proxy | Czego potrzebuje WebSocket |
|-------|--------------------------|
| Nginx | `proxy_http_version 1.1` i nagłówków `Upgrade` i `Connection`, których Nginx domyślnie nie przekazuje |
| Traefik | Niczego: WebSockety przechodzą bez zmian |
| Apache | `upgrade=websocket` w wierszu `ProxyPass` (2.4.47 i nowsze) lub `mod_proxy_wstunnel` we wcześniejszych wersjach |

Obie strony wysyłają ping co 20 sekund, więc typowy 60-sekundowy limit czasu odczytu utrzymuje bezczynne gniazdo otwarte.

---

## Rozmiar nagłówków żądania

Każde żądanie niesie token logowania w nagłówku `Authorization`, obok ciasteczek i nagłówków dodawanych przez proxy.
Zarówno proxy, jak i aplikacja ograniczają rozmiar nagłówków żądania i odrzucają żądanie powyżej limitu, zanim
AnsibleForms je zobaczy, więc nic nie trafia do dziennika serwera. Wartości domyślne:

| Komponent | Limit | Domyślnie | Odrzucane z |
|-----------|-------|---------|--------------|
| AnsibleForms (Node.js) | [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE), wszystkie nagłówki razem | 16384 bajty | 431 |
| Nginx | `large_client_header_buffers`, na pole nagłówka | `4 8k`: 8 KB na pole | 400 |
| Traefik | `http.maxHeaderBytes` punktu wejścia, wszystkie nagłówki razem | 1 MB | 431 |
| HAProxy | `tune.bufsize` w sekcji `global`, cały blok nagłówków, minus rezerwa `tune.maxrewrite` (1024 bajty) | 16384 bajty: 15360 bajtów nagłówków | 400 |
| Apache | `LimitRequestFieldSize`, na pole nagłówka | 8190 bajtów | 400 |

Do wersji 7.0.3 token logowania zawierał wszystkie grupy użytkownika logowania jednokrotnego i mógł przekroczyć te limity, zobacz
[Puste formularze i zadania po logowaniu jednokrotnym](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
Od wersji 7.1.0 token pozostaje mały, a wartości domyślne wystarczają. Gdy nagłówki powiększa coś innego, np.
ciasteczka innych aplikacji w tej samej domenie albo bramka logowania jednokrotnego przed aplikacją, zwiększ limity razem:

* AnsibleForms: `MAX_HTTP_HEADER_SIZE=65536`, a przed 7.1.0 `NODE_OPTIONS=--max-http-header-size=65536`; oba są
  odczytywane przy starcie, więc po zmianie uruchom aplikację ponownie
* Nginx: `large_client_header_buffers 4 32k;` w bloku `http` lub `server`
* HAProxy: `tune.bufsize 65536` w sekcji `global`; każdy strumień dostaje bufor tej wielkości, więc HAProxy zaleca
  obniżenie globalnego `maxconn` o ten sam współczynnik, a HTTP/2 wymaga co najmniej domyślnych 16384
* Apache: `LimitRequestFieldSize 32768` w konfiguracji serwera lub w wirtualnym hoście

---

## Adresy klientów

Za proxy każde połączenie pochodzi od proxy. Bez [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY)
ślad audytu zapisuje adres proxy przy każdej akcji, a
[limity logowania](../security/hardening.html#sign-in-limits-and-passwords) na adres liczą wszystkich klientów jako jeden adres.
`TRUST_PROXY` mówi, którym proxy aplikacja może wierzyć, gdy podają klienta w `X-Forwarded-For`:

| Wartość | Adres klienta |
|-------|----------------|
| `0` (domyślnie) | Adres połączenia. `X-Forwarded-For` jest ignorowany; puste, `false`, `off` i `no` znaczą to samo. |
| Liczba, np. `1` | Ufa tylu proxy przed aplikacją: `1` dla pojedynczego reverse proxy, `2` dla load balancera przed ingressem. |
| Lista, np. `10.0.0.5,172.16.0.0/12` | Ufa proxy pod tymi adresami i w tych zakresach CIDR. Akceptowane są też predefiniowane `loopback`, `linklocal` i `uniquelocal`. |
| `true` | Ufa każdemu przeskokowi: używany jest skrajnie lewy adres z `X-Forwarded-For`. |

Aplikacja przechodzi `X-Forwarded-For` od prawej, pomija zaufane proxy i bierze pierwszy adres, który
nie jest jednym z nich. Używaj dokładnej liczby proxy lub ich adresów:

* `X-Forwarded-For` to zwykły nagłówek żądania, który może wysłać każdy klient. Zbyt duża liczba albo `true` pozwala
  klientowi wybrać adres, który zapisuje ślad audytu. `true` jest bezpieczne tylko wtedy, gdy aplikacja jest osiągalna wyłącznie
  przez proxy, a serwer zapisuje przy starcie ostrzeżenie `[SECURITY]`, gdy jest ustawione.
* Proxy musi dodawać adres, z którego otrzymało połączenie, tak jak w poniższych przykładach
  (`$proxy_add_x_forwarded_for` w Nginx; Traefik i Apache `mod_proxy` dodają go domyślnie).
* Nieprawidłowa wartość jest odrzucana na stronie ustawień; ustawiona w środowisku jest zapisywana przy starcie jako błąd i
  żadne proxy nie jest zaufane. Zmiana zapisana na stronie ustawień działa bez restartu.

---

## Przykłady

Każdy przykład publikuje AnsibleForms pod `https://forms.example.com/ansibleforms/`, z TLS terminowanym przez proxy i
aplikacją działającą z `HTTPS=0`, `PORT=8000`, `BASE_URL=/ansibleforms` i `TRUST_PROXY=1`:

<div class="af-tabs" data-tab-group="proxy">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="nginx" aria-selected="true">Nginx</button>
<button type="button" role="tab" class="af-tab" data-tab="traefik" aria-selected="false">Traefik</button>
<button type="button" role="tab" class="af-tab" data-tab="apache" aria-selected="false">Apache</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="nginx" markdown="1">

`proxy_pass` nie podaje URI, więc Nginx przekazuje ścieżkę tak, jak przyszła, łącznie z prefiksem. Blok `map` trafia do
kontekstu `http` (plik w `conf.d/` jest tam włączany) i przekazuje upgrade WebSocket runnerów:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name forms.example.com;

    ssl_certificate     /etc/nginx/certs/forms.example.com.crt;
    ssl_certificate_key /etc/nginx/certs/forms.example.com.key;

    location /ansibleforms/ {
        proxy_pass         http://10.0.0.20:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;                         # the Runners' WebSocket
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection $connection_upgrade;

        client_max_body_size    10g;    # UPLOAD_MAX_GB
        proxy_request_buffering off;    # stream uploads instead of spooling them first
        proxy_read_timeout      3600s;  # BACKUP_COMMAND_TIMEOUT_SECONDS
        proxy_send_timeout      3600s;
    }
}
```

Bez podścieżki użyj `location /` i nie ustawiaj `BASE_URL`.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="traefik" markdown="1" hidden>

Etykiety na usłudze `app` projektu docker-compose, z Traefik w tej samej sieci Docker. Usługa
nie publikuje własnego portu, Traefik łączy się z nią przez sieć:

```yaml
  app:
    image: ghcr.io/ansibleforms/ansibleforms:7
    environment:
      - HTTPS=0
      - PORT=8000
      - BASE_URL=/ansibleforms
      - TRUST_PROXY=1                 # Traefik is the one proxy in front
    labels:
      - traefik.enable=true
      - traefik.http.routers.ansibleforms.rule=Host(`forms.example.com`) && PathPrefix(`/ansibleforms`)
      - traefik.http.routers.ansibleforms.entrypoints=websecure
      - traefik.http.routers.ansibleforms.tls=true
      - traefik.http.routers.ansibleforms.tls.certresolver=letsencrypt
      - traefik.http.services.ansibleforms.loadbalancer.server.port=8000
```

Brak middleware `StripPrefix` jest celowy. Traefik sam ustawia nagłówki `X-Forwarded-*` i nie ogranicza
rozmiaru ciała żądania, ale sprawdź `respondingTimeouts` punktu wejścia, gdy kopie zapasowe lub przesyłanie plików trwają dłużej niż jego
limit czasu odczytu. Bez podścieżki zostaw tylko część `Host(...)` reguły.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="apache" markdown="1" hidden>

Wymaga `mod_proxy`, `mod_proxy_http`, `mod_headers`, `mod_ssl` oraz Apache 2.4.47 lub nowszego dla `upgrade=websocket` runnerów.
Obie strony `ProxyPass` zawierają prefiks:

```apache
<VirtualHost *:443>
    ServerName forms.example.com

    SSLEngine on
    SSLCertificateFile    /etc/pki/tls/certs/forms.example.com.crt
    SSLCertificateKeyFile /etc/pki/tls/private/forms.example.com.key

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"

    ProxyPass        /ansibleforms/ http://10.0.0.20:8000/ansibleforms/ timeout=3600 upgrade=websocket
    ProxyPassReverse /ansibleforms/ http://10.0.0.20:8000/ansibleforms/

    # no body cap here : UPLOAD_MAX_GB and API_BODY_LIMIT_MB apply in the application
    LimitRequestBody 0
</VirtualHost>
```

Bez podścieżki przekazuj `/` do `http://10.0.0.20:8000/` i nie ustawiaj `BASE_URL`.

</div>
</div>

Aby szyfrować odcinek między proxy a aplikacją, uruchom aplikację z `HTTPS=1`, skieruj proxy na
`https://` i daj aplikacji certyfikat, któremu proxy ufa, zobacz [HTTPS](../security/https.html).
