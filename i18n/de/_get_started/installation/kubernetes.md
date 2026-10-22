---
layout: default
title: Kubernetes
parent: Installation
nav_order: 6
translated_from: 57f229acf691cee68f7a5d61b28cc7e879b903a8
---

# Kubernetes
{: .no_toc }

AnsibleForms und seine MySQL-Datenbank mit dem Helm-Chart installieren
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Das Helm-Chart deployt AnsibleForms mit MySQL und der RTE, die die Playbooks ausführt (siehe die [Values-Referenz](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md)).
Der [Installer](installer.html) installiert das Chart ebenfalls, anhand weniger Fragen, und aktualisiert auch ein Release, das er nicht installiert hat. Dasselbe
Chart installiert auch einen einzelnen Runner, für ein AnsibleForms, das anderswo läuft (siehe [Ein Runner auf Kubernetes](#a-runner-on-kubernetes)).

---

## Voraussetzungen

Bevor Sie beginnen, benötigen Sie:

* **Kubernetes-Cluster** : mit einem `kubectl`, das so konfiguriert ist, dass es ihn erreicht
* **Helm 3** : um das Chart zu installieren und zu aktualisieren
* **Speicher** : eine StorageClass für dynamische Bereitstellung oder vorab angelegte PersistentVolumes
* **Ingress-Controller** : nur, wenn Sie AnsibleForms über einen Ingress veröffentlichen wollen

---

## 1. Die Chart-Values holen

Holen Sie die Standard-Values des Charts in eine eigene Datei, aus dem Chart-Repository oder aus der OCI-Registry:

<div class="af-tabs" data-tab-group="helmsource">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="repo" aria-selected="true">Chart-Repository</button>
<button type="button" role="tab" class="af-tab" data-tab="oci" aria-selected="false">OCI-Registry</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="repo" markdown="1">

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm show values ansibleforms/ansibleforms > my_values.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="oci" markdown="1" hidden>

Kein Repository hinzuzufügen: das Chart wird aus der GitHub Container Registry gezogen.

```bash
helm show values oci://ghcr.io/ansibleforms/charts/ansibleforms > my_values.yaml
```

</div>
</div>

---

## 2. Den Speicher konfigurieren

Sowohl AnsibleForms als auch MySQL speichern ihre Daten auf einem persistenten Volume. Setzen Sie für jedes die StorageClass und die Größe:

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

Ein leerer `className` verwendet die Standard-StorageClass des Clusters. Der Zugriffsmodus ist standardmäßig `ReadWriteMany`, den viele Storage-Klassen
nicht anbieten; `ReadWriteOnce` reicht bei einer einzelnen Replika. Für vorab angelegte PersistentVolumes siehe das
[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) des Charts.

---

## 3. Die Anmeldedaten setzen

AnsibleForms braucht ein Admin-Konto, ein Datenbankpasswort und ein `ENCRYPTION_SECRET`, den Schlüssel, der die in AnsibleForms gespeicherten
Anmeldedaten verschlüsselt. Um diesen Schlüssel später zu ändern, setzen Sie [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS)
für einen Start auf den alten: jedes gespeicherte Secret wird dann mit dem neuen Schlüssel neu verschlüsselt. Sie können sie auf eine von drei Arten angeben:

<div class="af-tabs" data-tab-group="helmcreds">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="values" aria-selected="true">In der Values-Datei</button>
<button type="button" role="tab" class="af-tab" data-tab="generate" aria-selected="false">Vom Chart erzeugt</button>
<button type="button" role="tab" class="af-tab" data-tab="existing" aria-selected="false">Bestehendes Secret</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="values" markdown="1">

Setzen Sie sie in `my_values.yaml`. Das Chart speichert sie in einem Secret namens `<release>-secrets`:

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

Lassen Sie das Chart bei der ersten Installation alles erzeugen, was Sie nicht angeben. Es behält danach bei jeder
Aktualisierung dieselben Werte:

```bash
--set secrets.generate=true
```

Das funktioniert nicht mit Argo CD oder Flux, die das Chart ohne Zugriff auf den Cluster rendern. Das erzeugte Secret
überlebt `helm uninstall`; sichern Sie es, denn `ENCRYPTION_SECRET` lässt sich nicht wiederherstellen.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="existing" markdown="1" hidden>

Lassen Sie das Chart auf ein Secret zeigen, das Sie selbst verwalten, zum Beispiel mit External Secrets, Sealed Secrets oder SOPS. Das Chart
legt dann keines an:

```yaml
secrets:
  existingSecret: ansibleforms-credentials
```

Das Secret muss `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET`, `ADMIN_USERNAME` und `ADMIN_PASSWORD` enthalten.

</div>
</div>

---

## 4. Das RTE-Image wählen

AnsibleForms 7 führt selbst kein Playbook aus: das tut die RTE (Laufzeitumgebung). Das Chart betreibt sie als zweiten Container im
Server-Pod, auf demselben Volume, und registriert sie als Standard-Runner `rte`, sodass Playbook-Formulare ohne jede Einrichtung funktionieren. Seit 7.3.0
verbindet sich die App mit ihr auf `127.0.0.1` und hält einen WebSocket offen (`RTE_MODE=inbound`, siehe [Modi](../rte/modes.html)): die RTE bekommt keine
Datenbankeinstellungen und keinen Verschlüsselungsschlüssel. Der Konfigurations-Seed des Charts deklariert RTE-Anmeldedaten mit dem Token und dieser Adresse sowie
den Runner, Modus inbound, der sich damit anmeldet.

Das Standard-Image, `ghcr.io/ansibleforms/ansibleforms-rte-full`, enthält ansible mit seinen Collections und die Python-Bibliotheken, die das 6.5-Image hatte.
Für mehr oder weniger bauen Sie ein eigenes auf einer der drei RTE-Schichten (`ansibleforms-rte-base`, `-rte-core` oder `-rte-full`, siehe
[Die RTE-Images](../rte/images.html)) und lassen das Chart darauf zeigen:

```yaml
containers:
  rte:
    image: registry.example.com/my-rte:7.0.0
applications:
  rte:
    env:
      ANSIBLE_PATH: /app/dist/persistent/playbooks
```

Das Token zwischen App und RTE und der Schlüssel, der die Sitzungen signiert, werden bei der ersten Installation im
Secret `<release>-keys` erzeugt und bei jeder Aktualisierung beibehalten. Mit einem eigenen Konfigurations-Seed fügen Sie diese Anmeldedaten und diesen Runner dort hinzu: die Hinweise, die Helm nach der Installation ausgibt, zeigen wie
(siehe das [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) des Charts).

---

## 5. Das Chart installieren

Installieren Sie das Chart mit Ihren Values in einen eigenen Namespace:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms --create-namespace \
  --values my_values.yaml
```

Mit der OCI-Registry verwenden Sie `oci://ghcr.io/ansibleforms/charts/ansibleforms` als Chart. In allem, was unbeaufsichtigt läuft,
fixieren Sie die Chart-Version mit `--version`, damit nie von selbst ein neues Release installiert wird.

---

## 6. Die Installation prüfen

Das Chart enthält einen Test, der sowohl den Webserver als auch die Datenbankverbindung prüft:

```bash
helm test ansibleforms --namespace ansibleforms --logs
```

Der Test endet mit `OK`, wenn AnsibleForms antwortet und seine Datenbank Verbindungen annimmt.

---

## 7. AnsibleForms öffnen

Wie Sie AnsibleForms erreichen, hängt davon ab, wie der Server veröffentlicht ist:

<div class="af-tabs" data-tab-group="helmaccess">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="portforward" aria-selected="true">Port-Forward</button>
<button type="button" role="tab" class="af-tab" data-tab="loadbalancer" aria-selected="false">LoadBalancer</button>
<button type="button" role="tab" class="af-tab" data-tab="ingress" aria-selected="false">Ingress</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="portforward" markdown="1">

Mit dem Standarddienst `ClusterIP` und ohne Ingress ist nichts außerhalb des Clusters erreichbar. Leiten Sie einen lokalen Port weiter,
um einen Blick darauf zu werfen:

```bash
kubectl -n ansibleforms port-forward svc/ansibleforms-server 8080:80
```

Öffnen Sie dann `http://127.0.0.1:8080/`.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="loadbalancer" markdown="1" hidden>

Setzen Sie `services.server.type: LoadBalancer` (optional mit einer festen Adresse in `services.server.loadbalancer.ip`)
und warten Sie, bis der Dienst seine Adresse erhält:

```bash
kubectl -n ansibleforms get svc ansibleforms-server -w
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ingress" markdown="1" hidden>

Aktivieren Sie den Ingress und setzen Sie den Hostnamen, der zu Ihrem Ingress-Controller führt:

```yaml
ingress:
  enabled: true
  className: nginx
  hostname: ansibleforms.example.com
  tls:
    enabled: true
```

Das [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) des Charts behandelt TLS hinter einem Ingress, einschließlich der Backend-Einstellung, die HTTPS auf dem
Server braucht.

</div>
</div>

---

## 8. Anmelden

Melden Sie sich als Admin-Benutzer an, standardmäßig `admin`. So lesen Sie das Passwort aus dem Secret:

```bash
kubectl -n ansibleforms get secret ansibleforms-secrets \
  -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

Mit `secrets.existingSecret` lesen Sie es stattdessen aus Ihrem eigenen Secret.

---

## Ein Runner auf Kubernetes

Mit `runner.enabled` installiert das Chart nur eine RTE: einen Runner für ein AnsibleForms, das anderswo installiert ist, in einem anderen Namespace, einem anderen
Cluster oder auf einer VM. Er verbindet sich mit der App und hält einen WebSocket offen (`RTE_MODE=outbound`, siehe [Modi](../rte/modes.html)), daher braucht er
keine Datenbank, keinen Verschlüsselungsschlüssel und keinen eingehenden Port. Er rendert keine App, kein MySQL, keinen Service und keinen Ingress:

```bash
helm install runner1 ansibleforms/ansibleforms \
  --namespace runners --create-namespace \
  --set runner.enabled=true \
  --set runner.appUrl=https://forms.example.com \
  --set runner.name=zone-a \
  --set runner.joinToken=afj_...
```

| Value | Was er bewirkt |
|---|---|
| `runner.enabled` | Installiert nur den Runner: keine App, kein MySQL, kein Service, kein Ingress |
| `runner.appUrl` | Die Adresse der App, wie man sie öffnet, gegebenenfalls mit ihrer `BASE_URL`. Pflichtangabe |
| `runner.name` | Der Runner-Name, unter dem er beitritt (`RTE_NAME`). Leer: der Name des Release |
| `runner.joinToken` | Ein in der App erstelltes [Beitritts-Token](../runners/registration.html#join-tokens), das beim ersten Start gelesen wird, um den Runner sofort freizugeben |
| `runner.appTlsVerify` | `false` akzeptiert das selbstsignierte Zertifikat der App (`APP_TLS_VERIFY=0`), nur innerhalb eines vertrauenswürdigen Netzwerks |

Ohne Beitritts-Token bittet der Runner um Beitritt und wartet, bis ein Admin ihn unter **Verbindungen > Runner** freigibt. Nach der Freigabe
meldet er sich mit seinem eigenen `RTE_TOKEN` an, das im Secret `<release>-keys` aufbewahrt wird: behalten Sie dieses Secret zusammen mit dem Release. Der
[Installer](installer.html#kubernetes) installiert diesen Runner-Modus ebenfalls, wenn Sie die Rolle Runner und Kubernetes wählen.

---

## Nächste Schritte

Das [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) des Charts behandelt den Rest der Konfiguration:

* **Ihre eigene Datenbank** : setzen Sie `mysql.enabled: false` und lassen Sie AnsibleForms auf einen bestehenden MySQL-Server zeigen
* **Formulare aus ConfigMaps** : `config.yaml` und die Formulardateien über ConfigMaps bereitstellen
* **HTTPS hinter einem Ingress**, Ressourcen, Node-Platzierung und private Registries
* **Die RTE** : ihr Token, ein eigenes RTE-Image oder gar keine RTE

Um auf ein neueres Release zu wechseln, siehe [Aktualisieren auf Kubernetes](../upgrading/kubernetes.html).
