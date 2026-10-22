---
layout: default
title: Kubernetes
parent: Instal·lació
nav_order: 6
translated_from: 57f229acf691cee68f7a5d61b28cc7e879b903a8
---

# Kubernetes
{: .no_toc }

Instal·la AnsibleForms i la seva base de dades MySQL amb el chart de Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

El chart de Helm desplega AnsibleForms amb MySQL i l'RTE que executa els playbooks (consulta la [referència de values](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md)).
L'[instal·lador](installer.html) també instal·la el chart, a partir d'unes quantes preguntes, i actualitza una release que no ha instal·lat ell. El mateix
chart també instal·la un Runner independent, per a un AnsibleForms que s'executa en un altre lloc (consulta [Un Runner a Kubernetes](#a-runner-on-kubernetes)).

---

## Requisits previs

Abans de començar, necessites:

* **Un clúster de Kubernetes** : amb `kubectl` configurat per arribar-hi
* **Helm 3** : per instal·lar i actualitzar el chart
* **Emmagatzematge** : una StorageClass per a l'aprovisionament dinàmic, o PersistentVolumes creats prèviament
* **Un controlador d'ingress** : només si vols exposar AnsibleForms a través d'un ingress

---

## 1. Obtén els values del chart

Obtén els values predeterminats del chart en un fitxer propi, des del repositori del chart o des del registre OCI:

<div class="af-tabs" data-tab-group="helmsource">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="repo" aria-selected="true">Repositori de charts</button>
<button type="button" role="tab" class="af-tab" data-tab="oci" aria-selected="false">Registre OCI</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="repo" markdown="1">

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm show values ansibleforms/ansibleforms > my_values.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="oci" markdown="1" hidden>

No cal afegir cap repositori: el chart es baixa del GitHub Container Registry.

```bash
helm show values oci://ghcr.io/ansibleforms/charts/ansibleforms > my_values.yaml
```

</div>
</div>

---

## 2. Configura l'emmagatzematge

Tant AnsibleForms com MySQL desen les seves dades en un volum persistent. Defineix la StorageClass i la mida de cadascun:

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

Un `className` buit fa servir la StorageClass predeterminada del clúster. El mode d'accés per defecte és `ReadWriteMany`, que moltes classes
d'emmagatzematge no ofereixen; `ReadWriteOnce` va bé amb una sola rèplica. Per a PersistentVolumes creats prèviament, consulta el
[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart.

---

## 3. Defineix les credencials

AnsibleForms necessita un compte d'administrador, una contrasenya de la base de dades i un `ENCRYPTION_SECRET`, la clau que xifra les credencials
desades a AnsibleForms. Per canviar aquesta clau més endavant, posa a [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS)
l'antiga durant un inici: aleshores cada secret desat es torna a xifrar amb la clau nova. Proporciona-les d'una d'aquestes tres maneres:

<div class="af-tabs" data-tab-group="helmcreds">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="values" aria-selected="true">Al fitxer de values</button>
<button type="button" role="tab" class="af-tab" data-tab="generate" aria-selected="false">Generades pel chart</button>
<button type="button" role="tab" class="af-tab" data-tab="existing" aria-selected="false">Secret existent</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="values" markdown="1">

Defineix-les a `my_values.yaml`. El chart les desa en un Secret anomenat `<release>-secrets`:

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

Deixa que el chart generi el que no proporcionis, en la primera instal·lació. Després conserva els mateixos valors a cada
actualització:

```bash
--set secrets.generate=true
```

Això no funciona amb Argo CD ni amb Flux, que renderitzen el chart sense accés al clúster. El Secret generat
sobreviu a `helm uninstall`; fes-ne una còpia de seguretat, perquè `ENCRYPTION_SECRET` no es pot recuperar.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="existing" markdown="1" hidden>

Fes que el chart apunti a un Secret que gestiones tu, per exemple amb External Secrets, Sealed Secrets o SOPS. Aleshores el chart
no en crea cap:

```yaml
secrets:
  existingSecret: ansibleforms-credentials
```

El Secret ha de contenir `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET`, `ADMIN_USERNAME` i `ADMIN_PASSWORD`.

</div>
</div>

---

## 4. Tria la imatge de l'RTE

AnsibleForms 7 no executa cap playbook per si mateix: ho fa l'RTE (runtime environment, entorn d'execució). El chart l'executa com un segon contenidor al
pod del servidor, sobre el mateix volum, i el registra com a runner predeterminat `rte`, així que els formularis de playbook funcionen sense cap configuració. Des de la 7.3.0
l'aplicació el truca a `127.0.0.1` i hi manté un WebSocket obert (`RTE_MODE=inbound`, consulta [Modes](../rte/modes.html)): l'RTE no rep cap
configuració de la base de dades ni cap clau de xifratge. El config seed del chart declara una credencial d'RTE amb el token i aquesta adreça, i
el runner, en mode inbound, que s'hi autentica.

La imatge predeterminada, `ghcr.io/ansibleforms/ansibleforms-rte-full`, conté ansible amb les seves col·leccions i les biblioteques de Python que tenia la imatge de la 6.5.
Per tenir-ne més, o menys, construeix-ne una de pròpia sobre una de les tres capes de l'RTE (`ansibleforms-rte-base`, `-rte-core` o `-rte-full`, consulta
[Les imatges de l'RTE](../rte/images.html)) i fes que el chart hi apunti:

```yaml
containers:
  rte:
    image: registry.example.com/my-rte:7.0.0
applications:
  rte:
    env:
      ANSIBLE_PATH: /app/dist/persistent/playbooks
```

El token entre l'aplicació i l'RTE, i la clau que signa les sessions, es generen en la primera instal·lació al
Secret `<release>-keys` i es conserven a cada actualització. Amb un config seed propi, afegeix-hi aquesta credencial i aquest runner: les notes que mostra Helm després de la instal·lació expliquen com fer-ho
(consulta el [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart).

---

## 5. Instal·la el chart

Instal·la el chart al seu propi namespace amb els teus values:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms --create-namespace \
  --values my_values.yaml
```

Amb el registre OCI, fes servir `oci://ghcr.io/ansibleforms/charts/ansibleforms` com a chart. En qualsevol cosa que s'executi de manera desatesa,
fixa la versió del chart amb `--version`, perquè mai no s'instal·li una versió nova tota sola.

---

## 6. Comprova la instal·lació

El chart inclou una prova que comprova tant el servidor web com la connexió a la base de dades:

```bash
helm test ansibleforms --namespace ansibleforms --logs
```

La prova acaba amb `OK` quan AnsibleForms respon i la seva base de dades accepta connexions.

---

## 7. Obre AnsibleForms

Com arribes a AnsibleForms depèn de com s'exposa el servidor:

<div class="af-tabs" data-tab-group="helmaccess">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="portforward" aria-selected="true">Port forward</button>
<button type="button" role="tab" class="af-tab" data-tab="loadbalancer" aria-selected="false">LoadBalancer</button>
<button type="button" role="tab" class="af-tab" data-tab="ingress" aria-selected="false">Ingress</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="portforward" markdown="1">

Amb el servei `ClusterIP` predeterminat i sense ingress, no s'exposa res fora del clúster. Redirigeix un port local per
fer-hi un cop d'ull:

```bash
kubectl -n ansibleforms port-forward svc/ansibleforms-server 8080:80
```

Després obre `http://127.0.0.1:8080/`.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="loadbalancer" markdown="1" hidden>

Defineix `services.server.type: LoadBalancer` (opcionalment amb una adreça fixa a `services.server.loadbalancer.ip`),
i després espera que el servei obtingui la seva adreça:

```bash
kubectl -n ansibleforms get svc ansibleforms-server -w
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ingress" markdown="1" hidden>

Activa l'ingress i defineix el nom d'amfitrió que encamina cap al teu controlador d'ingress:

```yaml
ingress:
  enabled: true
  className: nginx
  hostname: ansibleforms.example.com
  tls:
    enabled: true
```

El [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart explica el TLS darrere d'un ingress, inclòs el paràmetre del backend que necessita HTTPS al
servidor.

</div>
</div>

---

## 8. Inicia sessió

Inicia sessió amb l'usuari administrador, `admin` per defecte. Per llegir la contrasenya del Secret:

```bash
kubectl -n ansibleforms get secret ansibleforms-secrets \
  -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

Amb `secrets.existingSecret`, llegeix-la del teu propi Secret.

---

## Un Runner a Kubernetes

Amb `runner.enabled`, el chart només instal·la un RTE: un Runner per a un AnsibleForms instal·lat en un altre lloc, en un altre namespace, un altre
clúster o en una VM. Truca a l'aplicació i hi manté un WebSocket obert (`RTE_MODE=outbound`, consulta [Modes](../rte/modes.html)), així que no necessita
cap base de dades, cap clau de xifratge ni cap port entrant. No renderitza ni aplicació, ni MySQL, ni Service, ni Ingress:

```bash
helm install runner1 ansibleforms/ansibleforms \
  --namespace runners --create-namespace \
  --set runner.enabled=true \
  --set runner.appUrl=https://forms.example.com \
  --set runner.name=zone-a \
  --set runner.joinToken=afj_...
```

| Valor | Què fa |
|---|---|
| `runner.enabled` | Instal·la només el Runner: sense aplicació, sense MySQL, sense Service, sense Ingress |
| `runner.appUrl` | L'adreça de l'aplicació tal com l'obre la gent, amb el seu `BASE_URL` si n'hi ha. Obligatori |
| `runner.name` | El nom de runner amb què s'uneix (`RTE_NAME`). Buit: el nom de la release |
| `runner.joinToken` | Un [token d'unió](../runners/registration.html#join-tokens) creat a l'aplicació, que es llegeix en el primer inici per aprovar el Runner a l'instant |
| `runner.appTlsVerify` | `false` accepta el certificat autosignat de l'aplicació (`APP_TLS_VERIFY=0`), només dins d'una xarxa de confiança |

Sense token d'unió, el Runner demana unir-se i espera fins que un administrador l'aprova a **Connexions > Runners**. Un cop aprovat,
s'autentica amb el seu propi `RTE_TOKEN`, desat al Secret `<release>-keys`: conserva aquest Secret amb la release. L'
[instal·lador](installer.html#kubernetes) també instal·la aquest mode runner, quan tries el rol Runner i Kubernetes.

---

## Passos següents

El [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart explica la resta de la configuració:

* **La teva pròpia base de dades** : defineix `mysql.enabled: false` i fes que AnsibleForms apunti a un servidor MySQL existent
* **Formularis des de ConfigMaps** : proporciona `config.yaml` i els fitxers de formularis mitjançant ConfigMaps
* **HTTPS darrere d'un ingress**, recursos, ubicació als nodes i registres privats
* **L'RTE** : el seu token, una imatge d'RTE pròpia, o cap RTE

Per passar a una versió més nova, consulta [Actualitzar a Kubernetes](../upgrading/kubernetes.html).
