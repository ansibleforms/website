---
layout: default
title: Kubernetes
parent: Upgraden
nav_order: 4
translated_from: 656ff7668e57ae8b6183a2654c4943f046caba6a
---

# Kubernetes
{: .no_toc }

Upgrade een installatie die met de Helm-chart is gemaakt
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Elke chartversie deployt één release van AnsibleForms. Een upgrade installeert een nieuwere chartversie met je bestaande waarden;
de gegevens op de persistente volumes blijven behouden. Een upgrade die niets verandert, laat de pods ongemoeid.

---

## Voordat je upgradet

Bereid de upgrade zo voor dat je terug kunt als er iets misgaat:

* **Maak een back-up** onder **Instellingen → Back-ups**. De nieuwe release upgradet het databaseschema bij de eerste start.
* **Lees de [changelog](../changelog)** voor de releases tussen je versie en de nieuwe.
* **Ga je naar een nieuwe hoofdversie?** Volg eerst [Upgraden naar v7](../upgrade-7.html).
* **Lees de [changelog](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md) van de chart** voor wijzigingen in de values.
* **Met gegenereerde inloggegevens** (`secrets.generate`) maak je een back-up van de Secret `<release>-secrets`: `ENCRYPTION_SECRET` is niet te herstellen.
* **Kom je van 7.2?** De RTE in de serverpod verandert van modus: zie [Van 7.2 naar 7.3](#from-72-to-73).

---

## Van 7.2 naar 7.3

Chart 7.3.0 haalt de RTE naast de app uit databasemodus, verouderd in 7.3.0 en verwijderd in 8.0.0. De app belt hem aan op
`127.0.0.1` en houdt één WebSocket open (`RTE_MODE=inbound`, zie [Modi](../rte/modes.html)):

* De RTE-container krijgt geen `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `ENCRYPTION_SECRET` of `RTE_URL` meer, en haalt de bestanden van de job van
  het gedeelde volume (`RTE_FILES=local`)
* De config seed van de chart declareert een RTE-referentie met het token en het adres, en de runner, `rte_mode: inbound`, die zich
  daarmee aanmeldt. Met de seed van de chart hoef je niets te doen
* Met `containers.rte.seedRunner: false`, of een eigen config seed (`CONFIG_SEED_PATH`), voegt de RTE zichzelf niet meer toe als runner.
  Declareer hem zelf, in je seed of onder **Verbindingen → Runners**: een RTE-referentie met `http://127.0.0.1:<port>` en het token,
  en een runner van het type RTE met `rte_mode: inbound` die haar noemt. De notes die Helm na de upgrade toont laten zien hoe

Sinds 7.3.0 installeert de chart ook een losse Runner, met `runner.enabled` (zie
[Een Runner op Kubernetes](../installation/kubernetes.html#a-runner-on-kubernetes)).

---

## 1. Zoek de nieuwe chartversie

Ververs de chartrepository en toon de beschikbare chartversies:

```bash
helm repo update
helm search repo ansibleforms/ansibleforms --versions
```

---

## 2. Upgrade de release

Voer hetzelfde `helm upgrade`-commando uit als bij de installatie, met je valuesbestand en de nieuwe chartversie:

```bash
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml \
  --version 7.0.0
```

Met de OCI-registry gebruik je `oci://ghcr.io/ansibleforms/charts/ansibleforms` als chart.

---

## 3. Controleer de upgrade

Wacht op de nieuwe pods en voer daarna de test van de chart uit, die zowel de webserver als de databaseverbinding controleert:

```bash
kubectl -n ansibleforms get pods -w
helm test ansibleforms --namespace ansibleforms --logs
```

In AnsibleForms toont **Help → Over** de versie die draait, en **Instellingen → Status** de gezondheid van de
database, het schema en de andere systemen waarvan AnsibleForms afhankelijk is.

---

## Terugdraaien

Helm houdt de geschiedenis van de release bij. Om terug te gaan naar de vorige revisie:

```bash
helm history ansibleforms --namespace ansibleforms
helm rollback ansibleforms --namespace ansibleforms
```

Als die niet start op de geüpgradede database, herstel dan je back-up (zie de [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) van de chart).
