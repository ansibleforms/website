---
layout: default
title: Kubernetes
parent: Installation
nav_order: 6
translated_from: 57f229acf691cee68f7a5d61b28cc7e879b903a8
---

# Kubernetes
{: .no_toc }

Installer AnsibleForms et sa base de données MySQL avec le chart Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Le chart Helm déploie AnsibleForms avec MySQL et le RTE qui exécute les playbooks (voir la [référence des valeurs](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md)).
L'[installateur](installer.html) installe aussi le chart, à partir de quelques questions, et met à niveau une release qu'il n'a pas installée. Le même
chart installe aussi un Runner seul, pour un AnsibleForms qui tourne ailleurs (voir [Un Runner sur Kubernetes](#a-runner-on-kubernetes)).

---

## Prérequis

Avant de commencer, il vous faut :

* **Un cluster Kubernetes** : avec `kubectl` configuré pour le joindre
* **Helm 3** : pour installer et mettre à niveau le chart
* **Du stockage** : une StorageClass pour le provisionnement dynamique, ou des PersistentVolumes créés à l'avance
* **Un contrôleur d'ingress** : seulement si vous voulez exposer AnsibleForms via un ingress

---

## 1. Récupérer les valeurs du chart

Récupérez les valeurs par défaut du chart dans un fichier à vous, depuis le dépôt du chart ou depuis le registre OCI :

<div class="af-tabs" data-tab-group="helmsource">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="repo" aria-selected="true">Dépôt du chart</button>
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

Aucun dépôt à ajouter : le chart est récupéré depuis le GitHub Container Registry.

```bash
helm show values oci://ghcr.io/ansibleforms/charts/ansibleforms > my_values.yaml
```

</div>
</div>

---

## 2. Configurer le stockage

AnsibleForms et MySQL stockent tous deux leurs données sur un volume persistant. Définissez la StorageClass et la taille de chacun :

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

Un `className` vide utilise la StorageClass par défaut du cluster. Le mode d'accès vaut `ReadWriteMany` par défaut, ce que beaucoup de classes de stockage
ne proposent pas ; `ReadWriteOnce` convient avec un seul réplica. Pour des PersistentVolumes créés à l'avance, voir le
[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) du chart.

---

## 3. Définir les identifiants

AnsibleForms a besoin d'un compte admin, d'un mot de passe de base de données et d'un `ENCRYPTION_SECRET`, la clé qui chiffre les identifiants
stockés dans AnsibleForms. Pour changer cette clé plus tard, mettez l'ancienne dans [`ENCRYPTION_SECRET_PREVIOUS`](../customization/security.html#env_ENCRYPTION_SECRET_PREVIOUS)
le temps d'un démarrage : chaque secret stocké est alors rechiffré avec la nouvelle clé. Fournissez-les de l'une de ces trois façons :

<div class="af-tabs" data-tab-group="helmcreds">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="values" aria-selected="true">Dans le fichier de valeurs</button>
<button type="button" role="tab" class="af-tab" data-tab="generate" aria-selected="false">Générés par le chart</button>
<button type="button" role="tab" class="af-tab" data-tab="existing" aria-selected="false">Secret existant</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="values" markdown="1">

Définissez-les dans `my_values.yaml`. Le chart les stocke dans un Secret nommé `<release>-secrets` :

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

Laissez le chart générer ce que vous ne fournissez pas, à la première installation. Il garde ensuite les mêmes valeurs à chaque
mise à niveau :

```bash
--set secrets.generate=true
```

Cela ne fonctionne pas avec Argo CD ou Flux, qui génèrent le rendu du chart sans accès au cluster. Le Secret généré
survit à `helm uninstall` ; sauvegardez-le, car `ENCRYPTION_SECRET` ne peut pas être récupéré.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="existing" markdown="1" hidden>

Faites pointer le chart vers un Secret que vous gérez, par exemple avec External Secrets, Sealed Secrets ou SOPS. Le chart
n'en crée alors aucun :

```yaml
secrets:
  existingSecret: ansibleforms-credentials
```

Le Secret doit contenir `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET`, `ADMIN_USERNAME` et `ADMIN_PASSWORD`.

</div>
</div>

---

## 4. Choisir l'image RTE

AnsibleForms 7 n'exécute lui-même aucun playbook : c'est le RTE (runtime environment) qui le fait. Le chart le fait tourner comme second conteneur dans le
pod du serveur, sur le même volume, et l'enregistre comme runner par défaut `rte`, les formulaires de playbook fonctionnent donc sans aucune configuration. Depuis la 7.3.0,
l'application l'appelle sur `127.0.0.1` et garde un WebSocket ouvert (`RTE_MODE=inbound`, voir [Modes](../rte/modes.html)) : le RTE ne reçoit aucun
paramètre de base de données ni aucune clé de chiffrement. Le seed de configuration du chart déclare un identifiant RTE avec le jeton et cette adresse, et
le runner, en mode entrant, qui s'authentifie avec.

L'image par défaut, `ghcr.io/ansibleforms/ansibleforms-rte-full`, contient ansible avec ses collections et les bibliothèques Python qu'avait l'image 6.5.
Pour plus, ou moins, construisez la vôtre sur l'une des trois couches RTE (`ansibleforms-rte-base`, `-rte-core` ou `-rte-full`, voir
[Les images RTE](../rte/images.html)) et faites pointer le chart dessus :

```yaml
containers:
  rte:
    image: registry.example.com/my-rte:7.0.0
applications:
  rte:
    env:
      ANSIBLE_PATH: /app/dist/persistent/playbooks
```

Le jeton entre l'application et le RTE, et la clé qui signe les sessions, sont générés à la première installation dans
le Secret `<release>-keys` et conservés à chaque mise à niveau. Avec un seed de configuration à vous, ajoutez-y cet identifiant et ce runner : les notes que Helm affiche après l'installation montrent comment faire
(voir le [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) du chart).

---

## 5. Installer le chart

Installez le chart dans son propre namespace avec vos valeurs :

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms --create-namespace \
  --values my_values.yaml
```

Avec le registre OCI, utilisez `oci://ghcr.io/ansibleforms/charts/ansibleforms` comme chart. Dans tout ce qui tourne sans surveillance,
fixez la version du chart avec `--version`, pour qu'une nouvelle version ne soit jamais installée d'elle-même.

---

## 6. Vérifier l'installation

Le chart inclut un test qui vérifie à la fois le serveur web et la connexion à la base de données :

```bash
helm test ansibleforms --namespace ansibleforms --logs
```

Le test se termine par `OK` quand AnsibleForms répond et que sa base de données accepte les connexions.

---

## 7. Ouvrir AnsibleForms

La façon d'atteindre AnsibleForms dépend de la manière dont le serveur est exposé :

<div class="af-tabs" data-tab-group="helmaccess">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="portforward" aria-selected="true">Port forward</button>
<button type="button" role="tab" class="af-tab" data-tab="loadbalancer" aria-selected="false">LoadBalancer</button>
<button type="button" role="tab" class="af-tab" data-tab="ingress" aria-selected="false">Ingress</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="portforward" markdown="1">

Avec le service `ClusterIP` par défaut et sans ingress, rien n'est exposé hors du cluster. Redirigez un port local pour
y jeter un œil :

```bash
kubectl -n ansibleforms port-forward svc/ansibleforms-server 8080:80
```

Ouvrez ensuite `http://127.0.0.1:8080/`.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="loadbalancer" markdown="1" hidden>

Définissez `services.server.type: LoadBalancer` (éventuellement avec une adresse fixe dans `services.server.loadbalancer.ip`),
puis attendez que le service obtienne son adresse :

```bash
kubectl -n ansibleforms get svc ansibleforms-server -w
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="ingress" markdown="1" hidden>

Activez l'ingress et définissez le nom d'hôte qui mène à votre contrôleur d'ingress :

```yaml
ingress:
  enabled: true
  className: nginx
  hostname: ansibleforms.example.com
  tls:
    enabled: true
```

Le [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) du chart couvre le TLS derrière un ingress, y compris le paramètre de backend dont le HTTPS sur le
serveur a besoin.

</div>
</div>

---

## 8. Se connecter

Connectez-vous avec l'utilisateur admin, `admin` par défaut. Pour lire le mot de passe dans le Secret :

```bash
kubectl -n ansibleforms get secret ansibleforms-secrets \
  -o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

Avec `secrets.existingSecret`, lisez-le plutôt dans votre propre Secret.

---

## Un Runner sur Kubernetes

Avec `runner.enabled`, le chart n'installe qu'un RTE : un Runner pour un AnsibleForms installé ailleurs, dans un autre namespace, un autre
cluster ou sur une VM. Il appelle l'application et garde un WebSocket ouvert (`RTE_MODE=outbound`, voir [Modes](../rte/modes.html)), il n'a donc besoin
d'aucune base de données, d'aucune clé de chiffrement ni d'aucun port entrant. Il ne génère ni application, ni MySQL, ni Service, ni Ingress :

```bash
helm install runner1 ansibleforms/ansibleforms \
  --namespace runners --create-namespace \
  --set runner.enabled=true \
  --set runner.appUrl=https://forms.example.com \
  --set runner.name=zone-a \
  --set runner.joinToken=afj_...
```

| Valeur | Ce qu'elle fait |
|---|---|
| `runner.enabled` | N'installe que le Runner : ni application, ni MySQL, ni Service, ni Ingress |
| `runner.appUrl` | L'adresse de l'application telle que les gens l'ouvrent, avec son `BASE_URL` s'il y en a un. Obligatoire |
| `runner.name` | Le nom de runner sous lequel il rejoint (`RTE_NAME`). Vide : le nom de la release |
| `runner.joinToken` | Un [jeton d'adhésion](../runners/registration.html#join-tokens) créé dans l'application, lu au premier démarrage pour approuver le Runner tout de suite |
| `runner.appTlsVerify` | `false` accepte le certificat auto-signé de l'application (`APP_TLS_VERIFY=0`), à l'intérieur d'un réseau de confiance uniquement |

Sans jeton d'adhésion, le Runner demande à rejoindre et attend qu'un admin l'approuve sous **Connexions > Runners**. Une fois approuvé, il
s'authentifie avec son propre `RTE_TOKEN`, conservé dans le Secret `<release>-keys` : gardez ce Secret avec la release.
L'[installateur](installer.html#kubernetes) installe aussi ce mode runner, quand vous choisissez le rôle Runner et Kubernetes.

---

## Étapes suivantes

Le [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) du chart couvre le reste de la configuration :

* **Votre propre base de données** : définissez `mysql.enabled: false` et faites pointer AnsibleForms vers un serveur MySQL existant
* **Des formulaires depuis des ConfigMaps** : fournissez `config.yaml` et les fichiers de formulaires via des ConfigMaps
* **Le HTTPS derrière un ingress**, les ressources, le placement sur les nœuds et les registres privés
* **Le RTE** : son jeton, votre propre image RTE, ou pas de RTE du tout

Pour passer à une version plus récente, voir [Mise à niveau sur Kubernetes](../upgrading/kubernetes.html).
