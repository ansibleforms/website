---
layout: default
title: Kubernetes
parent: Actualització
nav_order: 4
translated_from: 656ff7668e57ae8b6183a2654c4943f046caba6a
---

# Kubernetes
{: .no_toc }

Actualitza una instal·lació feta amb el chart de Helm
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Cada versió del chart desplega una versió d'AnsibleForms. Una actualització instal·la una versió més nova del chart amb els teus valors existents;
les dades dels volums persistents es conserven. Una actualització que no canvia res deixa els pods intactes.

---

## Abans d'actualitzar

Prepara l'actualització de manera que puguis tornar enrere si alguna cosa va malament:

* **Fes una còpia de seguretat** a **Configuració → Còpies de seguretat**. La versió nova actualitza l'esquema de la base de dades en el primer inici.
* **Llegeix el [registre de canvis](../changelog)** de les versions entre la teva i la nova.
* **Passes a una versió major nova?** Segueix primer [Actualitzar a la v7](../upgrade-7.html).
* **Llegeix el [registre de canvis](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md) del chart** per veure els canvis en els valors.
* **Amb credencials generades** (`secrets.generate`), fes una còpia de seguretat del Secret `<release>-secrets`: `ENCRYPTION_SECRET` no es pot recuperar.
* **Véns de la 7.2?** L'RTE del pod del servidor canvia de mode: consulta [De la 7.2 a la 7.3](#from-72-to-73).

---

## De la 7.2 a la 7.3

El chart 7.3.0 treu l'RTE que hi ha al costat de l'aplicació del mode database, obsolet a la 7.3.0 i eliminat a la 8.0.0. L'aplicació el truca a
`127.0.0.1` i hi manté un WebSocket obert (`RTE_MODE=inbound`, consulta [Modes](../rte/modes.html)):

* El contenidor de l'RTE ja no rep `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET` ni `RTE_URL`, i agafa els fitxers de la tasca del
  volum compartit (`RTE_FILES=local`)
* El config seed del chart declara una credencial d'RTE amb el token i l'adreça, i el runner, `rte_mode: inbound`, que s'hi
  autentica. Amb el seed del chart, no cal fer res
* Amb `containers.rte.seedRunner: false`, o un config seed propi (`CONFIG_SEED_PATH`), l'RTE ja no s'afegeix ell mateix com a runner.
  Declara'l tu mateix, al teu seed o a **Connexions → Runners**: una credencial d'RTE amb `http://127.0.0.1:<port>` i el token,
  i un runner de tipus RTE amb `rte_mode: inbound` que l'anomeni. Les notes que mostra Helm després de l'actualització expliquen com fer-ho

Des de la 7.3.0 el chart també instal·la un Runner independent, amb `runner.enabled` (consulta
[Un Runner a Kubernetes](../installation/kubernetes.html#a-runner-on-kubernetes)).

---

## 1. Troba la versió nova del chart

Actualitza el repositori del chart i llista les versions disponibles del chart:

```bash
helm repo update
helm search repo ansibleforms/ansibleforms --versions
```

---

## 2. Actualitza la release

Executa la mateixa ordre `helm upgrade` que en la instal·lació, amb el teu fitxer de valors i la versió nova del chart:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml \
  --version 7.0.0
```

Amb el registre OCI, fes servir `oci://ghcr.io/ansibleforms/charts/ansibleforms` com a chart.

---

## 3. Comprova l'actualització

Espera els pods nous i després executa la prova del chart, que comprova tant el servidor web com la connexió a la base de dades:

```bash
kubectl -n ansibleforms get pods -w
helm test ansibleforms --namespace ansibleforms --logs
```

A AnsibleForms, **Ajuda → Quant a** mostra la versió que s'està executant, i **Configuració → Estat** mostra la salut de la
base de dades, de l'esquema i dels altres sistemes dels quals depèn AnsibleForms.

---

## Tornar enrere

Helm conserva l'historial de la release. Per tornar a la revisió anterior:

```bash
helm history ansibleforms --namespace ansibleforms
helm rollback ansibleforms --namespace ansibleforms
```

Si no s'inicia amb la base de dades actualitzada, restaura la teva còpia de seguretat (consulta el [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) del chart).
