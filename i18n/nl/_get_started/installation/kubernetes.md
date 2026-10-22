---
layout: default
title: Kubernetes
parent: Installatie
nav_order: 6
translated_from: 57f229acf691cee68f7a5d61b28cc7e879b903a8
---

# Kubernetes
{: .no_toc }

Installeer AnsibleForms en de bijbehorende MySQL-database met de Helm-chart
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

De Helm-chart deployt AnsibleForms met MySQL en de RTE die de playbooks uitvoert (zie de [referentie van de values](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md)).
Het [installatieprogramma](installer.html) installeert de chart ook, op basis van een paar vragen, en upgradet een release die het niet zelf heeft geïnstalleerd. Dezelfde
chart installeert ook een losse Runner, voor een AnsibleForms dat elders draait (zie [Een Runner op Kubernetes](#a-runner-on-kubernetes)).

---

## Vereisten

Voordat je begint, heb je nodig:

* **Kubernetes-cluster** : met `kubectl` zo geconfigureerd dat het het cluster bereikt
* **Helm 3** : om de chart te installeren en te upgraden
* **Opslag** : een StorageClass voor dynamische provisioning, of vooraf aangemaakte PersistentVolumes
* **Ingress-controller** : alleen als je AnsibleForms via een ingress wilt aanbieden

---

## 1. Haal de chartwaarden op

Haal de standaardwaarden van de chart op in een eigen bestand, uit de chartrepository of uit de OCI-registry:

<div class="af-tabs" data-tab-group="helmsource">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="repo" aria-selected="true">Chartrepository</button>
<button type="button" role="tab" class="af-tab" data-tab="oci" aria-selected="false">OCI-registry</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="repo" markdown="1">

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm show values ansibleforms/ansibleforms > my_values.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="oci" markdown="1" hidden>

Geen repository om toe te voegen: de chart wordt uit de GitHub Container Registry gehaald.

```bash
helm show values oci://ghcr.io/ansibleforms/charts/ansibleforms > my_values.yaml
```

</div>
</div>

---

## 2. Configureer de opslag

Zowel AnsibleForms als MySQL slaan hun gegevens op een persistent volume op. Stel voor elk de StorageClass en de grootte in:

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

Een lege `className` gebruikt de standaard-StorageClass van het cluster. De toegangsmodus is standaard `ReadWriteMany`, wat veel storage-
klassen niet bieden; `ReadWriteOnce` is prima met één replica. Voor vooraf aangemaakte PersistentVolumes, zie de
[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) van de chart.

---

## 3. Stel de inloggegevens in

AnsibleForms heeft een beheerdersaccount nodig, een databasewachtwoord en een `ENCRYPTION_SECRET`, de sleutel die de referenties
versleutelt die in AnsibleForms zijn opgeslagen. Om die sleutel later te wijzigen, zet je [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS)
voor één start op de oude: elk opgeslagen secret wordt dan opnieuw versleuteld met de nieuwe sleutel. Lever ze op een van drie manieren aan:

<div class="af-tabs" data-tab-group="helmcreds">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="values" aria-selected="true">In het valuesbestand</button>
<button type="button" role="tab" class="af-tab" data-tab="generate" aria-selected="false">Gegenereerd door de chart</button>
<button type="button" role="tab" class="af-tab" data-tab="existing" aria-selected="false">Bestaande Secret</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="values" markdown="1">

Zet ze in `my_values.yaml`. De chart bewaart ze in een Secret met de naam `<release>-secrets`:

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

Laat de chart bij de eerste installatie genereren wat je niet aanlevert. Hij behoudt daarna bij elke
upgrade dezelfde waarden:

```bash
--set secrets.generate=true
```

Dit werkt niet met Argo CD of Flux, die de chart renderen zonder toegang tot het cluster. De gegenereerde Secret
overleeft `helm uninstall`; maak er een back-up van, want `ENCRYPTION_SECRET` is niet te herstellen.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="existing" markdown="1" hidden>

Laat de chart wijzen naar een Secret die je zelf beheert, bijvoorbeeld met External Secrets, Sealed Secrets of SOPS. De chart
maakt er dan geen aan:

```yaml
secrets:
  existingSecret: ansibleforms-credentials
```

De Secret moet `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET`, `ADMIN_USERNAME` en `ADMIN_PASSWORD` bevatten.

</div>
</div>

---

## 4. Kies de RTE-image

AnsibleForms 7 voert zelf geen playbook uit: dat doet de RTE (runtime-omgeving). De chart draait hem als tweede container in de
serverpod, op hetzelfde volume, en registreert hem als de standaardrunner `rte`, zodat playbookformulieren zonder enige instelling werken. Sinds 7.3.0
belt de app hem aan op `127.0.0.1` en houdt één WebSocket open (`RTE_MODE=inbound`, zie [Modi](../rte/modes.html)): de RTE krijgt geen
database-instellingen en geen versleutelingssleutel. De config seed van de chart declareert een RTE-referentie met het token en dat adres, en
de runner, modus inbound, die zich daarmee aanmeldt.

De standaardimage, `ghcr.io/ansibleforms/ansibleforms-rte-full`, bevat ansible met de bijbehorende collections en de Python-bibliotheken die de 6.5-image had.
Wil je meer, of minder, bouw dan je eigen image op een van de drie RTE-lagen (`ansibleforms-rte-base`, `-rte-core` of `-rte-full`, zie
[De RTE-images](../rte/images.html)) en laat de chart ernaar wijzen:

```yaml
containers:
  rte:
    image: registry.example.com/my-rte:7.0.0
applications:
  rte:
    env:
      ANSIBLE_PATH: /app/dist/persistent/playbooks
```

Het token tussen de app en de RTE, en de sleutel die de sessies ondertekent, worden bij de eerste installatie gegenereerd in
de Secret `<release>-keys` en bij elke upgrade behouden. Met een eigen config seed voeg je die referentie en runner daaraan toe: de notes die Helm na de installatie toont laten zien hoe
(zie de [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) van de chart).

---

## 5. Installeer de chart

Installeer de chart in een eigen namespace met je waarden:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms --create-namespace \
  --values my_values.yaml
```

Met de OCI-registry gebruik je `oci://ghcr.io/ansibleforms/charts/ansibleforms` als chart. In alles wat zonder toezicht draait,
pin je de chartversie met `--version`, zodat er nooit vanzelf een nieuwe release wordt geïnstalleerd.

---

## 6. Controleer de installatie

De chart bevat een test die zowel de webserver als de databaseverbinding controleert:

```bash
helm test ansibleforms --namespace ansibleforms --logs
```

De test eindigt met `OK` als AnsibleForms antwoordt en de database verbindingen accepteert.

---

## 7. Open AnsibleForms

Hoe je AnsibleForms bereikt, hangt af van hoe de server wordt aangeboden:

<div class="af-tabs" data-tab-group="helmaccess">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="portforward" aria-selected="true">Port forward</button>
<button type="button" role="tab" class="af-tab" data-tab="loadbalancer" aria-selected="false">LoadBalancer</button>
<button type="button" role="tab" class="af-tab" data-tab="ingress" aria-selected="false">Ingress</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="portforward" markdown="1">

Met de standaardservice `ClusterIP` en zonder ingress wordt niets buiten het cluster aangeboden. Forward een lokale poort om
even te kijken:

```bash
kubectl -n ansibleforms port-forward svc/ansibleforms-server 8080:80
```

Open daarna `http://127.0.0.1:8080/`.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="loadbalancer" markdown="1" hidden>

Zet `services.server.type: LoadBalancer` (eventueel met een vast adres in `services.server.loadbalancer.ip`),
en wacht tot de service zijn adres krijgt:

```bash
kubectl -n ansibleforms get svc ansibleforms-server -w
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ingress" markdown="1" hidden>

Schakel de ingress in en stel de hostnaam in die naar je ingress-controller routeert:

```yaml
ingress:
  enabled: true
  className: nginx
  hostname: ansibleforms.example.com
  tls:
    enabled: true
```

De [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) van de chart behandelt TLS achter een ingress, inclusief de backend-instelling die HTTPS op de
server nodig heeft.

</div>
</div>

---

## 8. Meld je aan

Meld je aan als de beheerder, standaard `admin`. Zo lees je het wachtwoord uit de Secret:

```bash
kubectl -n ansibleforms get secret ansibleforms-secrets \
  -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

Met `secrets.existingSecret` lees je het in plaats daarvan uit je eigen Secret.

---

## Een Runner op Kubernetes

Met `runner.enabled` installeert de chart alleen een RTE: een Runner voor een AnsibleForms dat elders is geïnstalleerd, in een andere namespace, een ander
cluster of op een VM. Hij belt de app aan en houdt één WebSocket open (`RTE_MODE=outbound`, zie [Modi](../rte/modes.html)), dus hij heeft
geen database, geen versleutelingssleutel en geen inkomende poort nodig. Hij rendert geen app, geen MySQL, geen Service en geen Ingress:

```bash
helm install runner1 ansibleforms/ansibleforms \
  --namespace runners --create-namespace \
  --set runner.enabled=true \
  --set runner.appUrl=https://forms.example.com \
  --set runner.name=zone-a \
  --set runner.joinToken=afj_...
```

| Waarde | Wat het doet |
|---|---|
| `runner.enabled` | Installeert alleen de Runner: geen app, geen MySQL, geen Service, geen Ingress |
| `runner.appUrl` | Het adres van de app zoals mensen het openen, met de eventuele `BASE_URL`. Verplicht |
| `runner.name` | De runnernaam waarmee hij aansluit (`RTE_NAME`). Leeg: de naam van de release |
| `runner.joinToken` | Een [jointoken](../runners/registration.html#join-tokens) gemaakt in de app, gelezen bij de eerste start om de Runner meteen goed te keuren |
| `runner.appTlsVerify` | `false` accepteert het zelfondertekende certificaat van de app (`APP_TLS_VERIFY=0`), alleen binnen één vertrouwd netwerk |

Zonder jointoken vraagt de Runner om aan te sluiten en wacht hij tot een beheerder hem goedkeurt onder **Verbindingen > Runners**. Eenmaal goedgekeurd
meldt hij zich aan met zijn eigen `RTE_TOKEN`, bewaard in de Secret `<release>-keys`: bewaar die Secret samen met de release. Het
[installatieprogramma](installer.html#kubernetes) installeert deze runnermodus ook, als je de rol Runner en Kubernetes kiest.

---

## Volgende stappen

De [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) van de chart behandelt de rest van de configuratie:

* **Je eigen database** : zet `mysql.enabled: false` en laat AnsibleForms naar een bestaande MySQL-server wijzen
* **Formulieren uit ConfigMaps** : lever `config.yaml` en de formulierbestanden aan via ConfigMaps
* **HTTPS achter een ingress**, resources, plaatsing op nodes en private registries
* **De RTE** : het token, een eigen RTE-image, of helemaal geen RTE

Om naar een nieuwere release te gaan, zie [Upgraden op Kubernetes](../upgrading/kubernetes.html).
