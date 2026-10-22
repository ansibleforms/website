---
layout: default
title: Kubernetes
parent: Instalacja
nav_order: 6
translated_from: 57f229acf691cee68f7a5d61b28cc7e879b903a8
---

# Kubernetes
{: .no_toc }

Zainstaluj AnsibleForms i jego bazę danych MySQL za pomocą chartu Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Chart Helm wdraża AnsibleForms z MySQL i RTE, które uruchamia playbooki (zobacz [opis wartości](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md)).
[Instalator](installer.html) również instaluje chart, na podstawie kilku pytań, i aktualizuje wydanie, którego sam nie zainstalował. Ten sam
chart instaluje też samodzielny Runner, dla AnsibleForms działającego gdzie indziej (zobacz [Runner na Kubernetes](#a-runner-on-kubernetes)).

---

## Wymagania wstępne

Zanim zaczniesz, potrzebujesz:

* **Klastra Kubernetes** : ze skonfigurowanym `kubectl`, który ma do niego dostęp
* **Helm 3** : do instalowania i aktualizowania chartu
* **Pamięci masowej** : StorageClass do dynamicznego przydzielania lub wcześniej utworzonych PersistentVolumes
* **Kontrolera ingress** : tylko jeśli chcesz udostępnić AnsibleForms przez ingress

---

## 1. Pobranie wartości chartu

Pobierz domyślne wartości chartu do własnego pliku, z repozytorium chartów lub z rejestru OCI:

<div class="af-tabs" data-tab-group="helmsource">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="repo" aria-selected="true">Repozytorium chartów</button>
<button type="button" role="tab" class="af-tab" data-tab="oci" aria-selected="false">Rejestr OCI</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="repo" markdown="1">

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm show values ansibleforms/ansibleforms > my_values.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="oci" markdown="1" hidden>

Nie trzeba dodawać repozytorium: chart jest pobierany z GitHub Container Registry.

```bash
helm show values oci://ghcr.io/ansibleforms/charts/ansibleforms > my_values.yaml
```

</div>
</div>

---

## 2. Konfiguracja pamięci masowej

Zarówno AnsibleForms, jak i MySQL przechowują dane na wolumenie trwałym. Ustaw StorageClass i rozmiar każdego z nich:

```yaml
storages:
  server:
    className: longhorn
    size: 5Gi
    accessMode: ReadWriteOnce
  mysql:
    className: longhorn
    size: 5Gi
    accessMode: ReadWriteOnce
```

Pusty `className` używa domyślnej StorageClass klastra. Tryb dostępu ma domyślnie wartość `ReadWriteMany`, której wiele klas
pamięci masowej nie oferuje; `ReadWriteOnce` wystarcza przy jednej replice. W przypadku wcześniej utworzonych PersistentVolumes zobacz
[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) chartu.

---

## 3. Ustawienie poświadczeń

AnsibleForms potrzebuje konta administratora, hasła do bazy danych i `ENCRYPTION_SECRET`, klucza, który szyfruje poświadczenia
przechowywane w AnsibleForms. Aby później zmienić ten klucz, ustaw [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS)
na stary klucz na czas jednego uruchomienia: każdy zapisany sekret zostanie wtedy ponownie zaszyfrowany nowym kluczem. Podaj je na jeden z trzech sposobów:

<div class="af-tabs" data-tab-group="helmcreds">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="values" aria-selected="true">W pliku wartości</button>
<button type="button" role="tab" class="af-tab" data-tab="generate" aria-selected="false">Generowane przez chart</button>
<button type="button" role="tab" class="af-tab" data-tab="existing" aria-selected="false">Istniejący Secret</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="values" markdown="1">

Ustaw je w `my_values.yaml`. Chart przechowuje je w Secrecie o nazwie `<release>-secrets`:

```yaml
applications:
  server:
    env:
      ADMIN_USERNAME: admin
      ADMIN_PASSWORD: a-strong-password
      ENCRYPTION_SECRET: a-random-string-of-32-characters
  mysql:
    password: a-strong-database-password
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="generate" markdown="1" hidden>

Pozwól chartowi wygenerować przy pierwszej instalacji wszystko, czego nie podasz. Zachowuje te same wartości przy każdej
kolejnej aktualizacji:

```bash
--set secrets.generate=true
```

Nie działa to z Argo CD ani Flux, które renderują chart bez dostępu do klastra. Wygenerowany Secret
przetrwa `helm uninstall`; zrób jego kopię zapasową, bo `ENCRYPTION_SECRET` nie da się odzyskać.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="existing" markdown="1" hidden>

Wskaż chartowi Secret, którym zarządzasz, na przykład za pomocą External Secrets, Sealed Secrets lub SOPS. Chart
nie tworzy wtedy żadnego:

```yaml
secrets:
  existingSecret: ansibleforms-credentials
```

Secret musi zawierać `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET`, `ADMIN_USERNAME` i `ADMIN_PASSWORD`.

</div>
</div>

---

## 4. Wybór obrazu RTE

AnsibleForms 7 sam nie uruchamia żadnego playbooka: robi to RTE (runtime environment). Chart uruchamia je jako drugi kontener w
podzie serwera, na tym samym wolumenie, i rejestruje je jako domyślny runner `rte`, więc formularze playbooków działają bez żadnej konfiguracji. Od wersji 7.3.0
aplikacja łączy się z nim pod `127.0.0.1` i utrzymuje otwarty jeden WebSocket (`RTE_MODE=inbound`, zobacz [Tryby](../rte/modes.html)): RTE nie dostaje
ustawień bazy danych ani klucza szyfrowania. Config seed chartu deklaruje poświadczenie RTE z tokenem i tym adresem oraz
runner, w trybie inbound, który się nim loguje.

Domyślny obraz, `ghcr.io/ansibleforms/ansibleforms-rte-full`, zawiera ansible z jego kolekcjami i biblioteki Pythona, które miał obraz 6.5.
Jeśli potrzebujesz więcej lub mniej, zbuduj własny na jednej z trzech warstw RTE (`ansibleforms-rte-base`, `-rte-core` lub `-rte-full`, zobacz
[Obrazy RTE](../rte/images.html)) i wskaż go chartowi:

```yaml
containers:
  rte:
    image: registry.example.com/my-rte:7.0.0
applications:
  rte:
    env:
      ANSIBLE_PATH: /app/dist/persistent/playbooks
```

Token między aplikacją a RTE oraz klucz podpisujący sesje są generowane przy pierwszej instalacji do
Secretu `<release>-keys` i zachowywane przy każdej aktualizacji. Przy własnym config seed dodaj do niego to poświadczenie i runner: uwagi, które Helm wypisuje po instalacji, pokazują, jak to zrobić
(zobacz [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) chartu).

---

## 5. Instalacja chartu

Zainstaluj chart we własnej przestrzeni nazw ze swoimi wartościami:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms --create-namespace \
  --values my_values.yaml
```

W przypadku rejestru OCI użyj `oci://ghcr.io/ansibleforms/charts/ansibleforms` jako chartu. We wszystkim, co działa bez nadzoru,
przypnij wersję chartu przez `--version`, aby nowe wydanie nigdy nie zainstalowało się samo.

---

## 6. Sprawdzenie instalacji

Chart zawiera test, który sprawdza zarówno serwer webowy, jak i połączenie z bazą danych:

```bash
helm test ansibleforms --namespace ansibleforms --logs
```

Test kończy się wynikiem `OK`, gdy AnsibleForms odpowiada, a jego baza danych przyjmuje połączenia.

---

## 7. Otwarcie AnsibleForms

Sposób dostępu do AnsibleForms zależy od tego, jak udostępniony jest serwer:

<div class="af-tabs" data-tab-group="helmaccess">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="portforward" aria-selected="true">Port forward</button>
<button type="button" role="tab" class="af-tab" data-tab="loadbalancer" aria-selected="false">LoadBalancer</button>
<button type="button" role="tab" class="af-tab" data-tab="ingress" aria-selected="false">Ingress</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="portforward" markdown="1">

Przy domyślnej usłudze `ClusterIP` i bez ingress nic nie jest udostępniane poza klastrem. Przekieruj lokalny port, aby
się rozejrzeć:

```bash
kubectl -n ansibleforms port-forward svc/ansibleforms-server 8080:80
```

Następnie otwórz `http://127.0.0.1:8080/`.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="loadbalancer" markdown="1" hidden>

Ustaw `services.server.type: LoadBalancer` (opcjonalnie ze stałym adresem w `services.server.loadbalancer.ip`),
a potem poczekaj, aż usługa otrzyma adres:

```bash
kubectl -n ansibleforms get svc ansibleforms-server -w
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ingress" markdown="1" hidden>

Włącz ingress i ustaw nazwę hosta, która kieruje do Twojego kontrolera ingress:

```yaml
ingress:
  enabled: true
  className: nginx
  hostname: ansibleforms.example.com
  tls:
    enabled: true
```

[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) chartu opisuje TLS za ingress, łącznie z ustawieniem backendu, którego wymaga HTTPS na
serwerze.

</div>
</div>

---

## 8. Logowanie

Zaloguj się jako użytkownik administrator, domyślnie `admin`. Aby odczytać hasło z Secretu:

```bash
kubectl -n ansibleforms get secret ansibleforms-secrets \
  -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

Przy `secrets.existingSecret` odczytaj je zamiast tego z własnego Secretu.

---

## Runner na Kubernetes

Przy `runner.enabled` chart instaluje tylko RTE: Runner dla AnsibleForms zainstalowanego gdzie indziej, w innej przestrzeni nazw, innym
klastrze lub na maszynie wirtualnej. Łączy się on z aplikacją i utrzymuje otwarty jeden WebSocket (`RTE_MODE=outbound`, zobacz [Tryby](../rte/modes.html)), więc nie potrzebuje
bazy danych, klucza szyfrowania ani portu przychodzącego. Nie renderuje aplikacji, MySQL, Service ani Ingress:

```bash
helm install runner1 ansibleforms/ansibleforms \
  --namespace runners --create-namespace \
  --set runner.enabled=true \
  --set runner.appUrl=https://forms.example.com \
  --set runner.name=zone-a \
  --set runner.joinToken=afj_...
```

| Wartość | Co robi |
|---|---|
| `runner.enabled` | Instaluje tylko Runner: bez aplikacji, MySQL, Service i Ingress |
| `runner.appUrl` | Adres aplikacji, pod którym otwierają ją ludzie, z jej `BASE_URL`, jeśli jest. Wymagane |
| `runner.name` | Nazwa runnera, pod którą dołącza (`RTE_NAME`). Puste: nazwa wydania |
| `runner.joinToken` | [Token dołączenia](../runners/registration.html#join-tokens) utworzony w aplikacji, odczytywany przy pierwszym uruchomieniu, aby od razu zatwierdzić Runner |
| `runner.appTlsVerify` | `false` akceptuje certyfikat samopodpisany aplikacji (`APP_TLS_VERIFY=0`), tylko wewnątrz jednej zaufanej sieci |

Bez tokenu dołączenia Runner prosi o dołączenie i czeka, aż administrator go zatwierdzi w **Połączenia > Runnery**. Po zatwierdzeniu
loguje się własnym `RTE_TOKEN`, przechowywanym w Secrecie `<release>-keys`: zachowaj ten Secret razem z wydaniem.
[Instalator](installer.html#kubernetes) również instaluje ten tryb runnera, gdy wybierzesz rolę Runner i Kubernetes.

---

## Następne kroki

[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) chartu opisuje resztę konfiguracji:

* **Własna baza danych** : ustaw `mysql.enabled: false` i wskaż AnsibleForms istniejący serwer MySQL
* **Formularze z ConfigMap** : dostarcz `config.yaml` i pliki formularzy przez ConfigMap
* **HTTPS za ingress**, zasoby, rozmieszczenie na węzłach i prywatne rejestry
* **RTE** : jego token, własny obraz RTE lub całkowity brak RTE

Aby przejść na nowsze wydanie, zobacz [Aktualizacja na Kubernetes](../upgrading/kubernetes.html).
