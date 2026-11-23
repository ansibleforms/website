---
layout: default
title: De eigen indeling van Ansible
parent: Git-repositories
nav_order: 6
translated_from: ea915eac819df2b716a2a5bdb21e4884d44c6ca4
---

# Een repository in de eigen indeling van Ansible
{: .no_toc }

Draai het playbook van een formulier vanuit de root, zoals AWX doet
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Voor beheerders en formulierauteurs van wie de playbooks in een repository staan die is ingedeeld zoals Ansible het beschrijft, sinds 7.8.0.

---

## De indeling

De eigen indeling van Ansible zet de configuratie, de inventarissen, de playbooks en de rollen naast elkaar in de root van de repository.

```
infra/
├── ansible.cfg              # roles_path = ./roles
├── inventories/
│   ├── development/
│   │   ├── hosts.yaml
│   │   └── group_vars/
│   └── production/
│       ├── hosts.yaml
│       └── group_vars/
├── playbooks/
│   └── site.yml
└── roles/
    └── webserver/
```

De playbooks staan in `playbooks/` en de rollen in `roles/`, dus Ansible vindt de rollen via de `ansible.cfg` in de root,
die het alleen leest wanneer `ansible-playbook` in die map start:

```ini
[defaults]
roles_path = ./roles
```

Relatieve paden in `ansible.cfg` worden gelezen vanaf de map die het bestand bevat, dus `collections_path = ./collections` werkt
op dezelfde manier. AWX voert de playbooks van een project uit vanuit de root van het project, en sinds 7.8.0 kan een formulier dat ook.

---

## De repository noemen in een formulier

Een formulier noemt de repository waaruit zijn playbook draait met `playbookRepository`, op een formulier `ansible`.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
roles:
  - admin
```

De job draait dan vanuit de root van `infra`, in welke map de playbooks ook staan:

| Wat | Gelezen uit |
|---|---|
| `ansible.cfg` | De root van de repository, met zijn `roles_path`, `collections_path` en elke andere instelling |
| `playbook` | De root: `playbooks/site.yml`, niet `site.yml` |
| Een relatieve `inventory` of `__inventory__` | De root: `inventories/production/hosts.yaml` |
| `playbookSubPath` | Verplaatst de uitvoeringsmap nog steeds, nu vanaf de root |

Een inventaris die bij zijn naam genoemd wordt (`inventory: production`) is zoals voorheen een van de
[inventarissen](../designer/) van de ontwerper. De repository moet het gebruikstype **Playbooks** hebben: een naam die geen
repository is die voor playbooks wordt gebruikt, laat de job mislukken met `playbookRepository '<name>' is not a repository used for playbooks`.

Een stap `ansible` van een [multistep-formulier](../forms/multistep.html) noemt zijn eigen `playbookRepository`, en een
playbookknooppunt van een [workflow](../workflows/file.html#ansibleforms-own-keys) noemt haar als `playbook_repository`.

---

## De repository waarin het formulier staat

Sinds 7.8.0 noemt een formulier dat in dezelfde repository als zijn playbook staat, die `__self__`, in plaats van haar naam te herhalen.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: __self__
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
```

`__self__` is de repository waaruit het formulier wordt gelezen, en die moet het gebruikstype **Playbooks** hebben, zoals elke
repository die een formulier noemt. Op een playbookknooppunt van een workflow is `playbook_repository: __self__` de repository
waarin het workflowbestand staat.

Een formulier in de lokale formulierenmap staat in geen enkele repository, dus noemt zijn `__self__` er geen. Het formulier
krijgt dan een laadfout die het noemt, `Form '<name>': playbookRepository __self__ names the repository the form is in, and the form is in none`, en zijn
start wordt geweigerd, met de reden. De `__self__` van een knooppunt in een bestand van de lokale workflowmap laat de job van
het knooppunt mislukken.

---

## Meerdere playbookrepositories

Sinds 7.8.0 kunnen meerdere repositories het gebruikstype **Playbooks** hebben; voorheen werd alleen de eerste gebruikt, met een waarschuwing.

| Het formulier | Waaruit zijn playbook draait |
|---|---|
| Zonder `playbookRepository` | De eerste repository die voor playbooks wordt gebruikt, in de volgorde waarin ze zijn toegevoegd: de map `playbooks` daarvan, anders de root, precies zoals vóór 7.8.0 |
| Met `playbookRepository: <name>` | De root van die repository, de eerste inbegrepen |

Een formulier dat de eerste repository noemt, draait dus vanuit de root daarvan en geeft zijn `playbook` vanaf daar op
(`playbooks/site.yml`). De formulieren die er geen noemen, blijven draaien zoals ze altijd deden.

---

## In de ontwerper

De ontwerper biedt de repository en de bijbehorende playbooks aan, op een formulier en op een workflowknooppunt.

| Waar | Wat het toont |
|---|---|
| Het tabblad **Visueel** van een formulier | **Repository**, boven **Playbook**, wanneer er meerdere playbookrepositories zijn of het formulier er een noemt. De eerste optie, **Eerste playbook-repository**, verwijdert de sleutel; de tweede, **Repository van dit formulier (name)**, schrijft `__self__` |
| **Playbook** | De playbooks van de gekozen repository, benoemd vanaf de root; met **Eerste playbook-repository** die van de eerste, zoals die ze uitvoert |
| Een playbookknooppunt van een workflow | Hetzelfde veld **Repository**, op het tabblad **Hoe het draait**, met **Repository van deze workflow (name)** voor `__self__`, en de playbooks van die repository op **Wat het uitvoert** |
| De sectie **Playbooks** | De playbooks van de eerste repository, uit de map `playbooks` daarvan (anders de root), daarna elke andere repository in zijn geheel, in een map met haar naam |

De rolinstelling [**Alle playbooks bewerken**](../designer/#limited-designers) telt een playbook naar zijn repository en zijn
pad: een formulier dat `playbooks/site.yml` van `infra` uitvoert, gebruikt dat bestand, niet een `site.yml` van de eerste repository.

---

## Op een RTE-runner

Een [RTE](../rte/) ontvangt de repository die de job noemt, in beide [bestandsmodi](../rte/modes.html).

- Met `RTE_FILES=transfer`, de standaard, stuurt de app de hele repository die het formulier noemt, ingepakt, in plaats van
  de map `playbooks` van de eerste repository.
- Met `RTE_FILES=local` draait de RTE vanuit zijn eigen kloon van die repository, onder `REPO_PATH`.

De RTE moet 7.8.0 of nieuwer zijn om een formulier uit te voeren dat zijn repository noemt. AWX-, Semaphore-, Rundeck- en
Jenkins-runners voeren hun eigen sjablonen en jobs uit: `playbookRepository` is geen sleutel van hun formulieren, en een
workflowknooppunt op zo'n runner heeft er geen.

---

## Voorbeeld: één formulier voor elke omgeving

Het formulier hieronder voert `playbooks/site.yml` van `infra` uit tegen de inventaris van de omgeving die de gebruiker kiest.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
roles:
  - admin
categories:
  - Deploy
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

Het veld `__inventory__` geeft voor **production** de inventaris `inventories/production/hosts.yaml`, gelezen uit de root van
`infra`, met de `group_vars` ernaast. De rollen van `site.yml` komen uit `roles/`, via `roles_path` in `ansible.cfg`.

---

## Hetzelfde vóór 7.8.0

Vóór 7.8.0 kon een formulier alleen met `playbookSubPath: ../` uit de map `playbooks` van de ene playbookrepository stappen.

```yaml
name: Deploy the web servers
type: ansible
playbookSubPath: ../
playbook: playbooks/site.yml
roles:
  - admin
fields:
  - name: env
    label: Environment
    type: enum
    values:
      - development
      - production
    default: development
  - name: __inventory__
    type: expression
    expression: "'inventories/$(env)/hosts.yaml'"
    runLocal: true
    hide: true
```

Het draait ook vanuit de root, met deze beperkingen, die `playbookRepository` wegneemt:

- Alleen de eerste repository die voor playbooks wordt gebruikt was bereikbaar, dus de Ansible-indeling moest die zijn.
- De playbooklijst van de ontwerper toonde `site.yml`, uit de map `playbooks`, dus `playbooks/site.yml` werd met de hand getypt.
- Met `RTE_FILES=transfer`, de standaard, ontving de RTE alleen de map `playbooks`, dus `../` bereikte de `ansible.cfg`, de
  rollen en de inventarissen niet: het werkte alleen met `RTE_FILES=local`.

Zo'n formulier naar 7.8.0 overzetten betekent `playbookSubPath: ../` vervangen door `playbookRepository: <name>`; `playbook` en
`__inventory__` blijven zoals ze zijn.
