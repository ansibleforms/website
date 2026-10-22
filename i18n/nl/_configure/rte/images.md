---
layout: default
title: Images
parent: RTE
nav_order: 1
translated_from: cb917c5cb9cbca9d530398171265e91f1ba8e94b
---

# RTE-images
{: .no_toc }

De drie gepubliceerde RTE-images, en een eigen RTE met de collecties en bibliotheken die je playbooks gebruiken
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De RTE-images

De RTE wordt in drie lagen gepubliceerd, elk gebouwd op de vorige, met dezelfde tags als de app (zie [Image-tags](../installation/#image-tags)):

| Image | Wat erin zit | Gebruik het |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js en de AnsibleForms-server, git, ssh en sshpass. Geen python en geen ansible, dus op zichzelf draait ze geen playbook | Om een RTE te bouwen met je eigen versies van python en ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | De base, plus python 3.14, ansible-core en een paar gangbare bibliotheken (`jmespath`, `netaddr`, `requests`, `paramiko`). Geen collecties | Om een kleinere RTE te bouwen met alleen de collecties en bibliotheken die je playbooks gebruiken |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | De core, plus het pakket `ansible` op dezelfde ansible-core, en wat de image van AnsibleForms 6.5 had: de collecties van NetApp, AWS en community, `pandas`, `pyvmomi`, `boto3`, de mariadb-client, ytt en een paar os-tools | **De standaard.** Draai haar zoals ze is: playbooks van 6.5 vinden wat ze gebruikten |

Net als de app-image draait elke laag als de gebruiker `node` (uid 1000), en de playbooks draaien ook als die gebruiker.

---

## Je eigen RTE bouwen

Bouw op `ansibleforms-rte-core` en voeg de collecties en python-bibliotheken toe die je playbooks gebruiken. Dit NetApp-voorbeeld is een van
de Dockerfiles in [examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

De python-omgeving en de map met collecties zijn van `node`, dus deze installaties hebben geen root nodig. Een laag die os-pakketten
installeert, schakelt daarvoor over naar `USER root` en aan het einde terug naar `USER node`. Bouw op
`ansibleforms-rte-base` (`Dockerfile.own-ansible` in dezelfde map) om je eigen python en ansible mee te brengen.

Houd de image op de release van de app: `:7` volgt de `:7` van de app. Collecties en rollen kunnen ook worden gekoppeld in plaats van ingebakken, op
`/etc/ansible/collections` en `/etc/ansible/roles`. Dan is er per wijziging geen nieuwe build nodig, maar hangt wat er draait af van dat volume;
python-bibliotheken gaan altijd in de image. Alles inbakken is reproduceerbaar en start snel, en is daarom de manier voor productie.

---

## Het contract

Wat de app en een RTE moeten delen, is hun contract, een nummer dat beide melden. Een RTE van een oudere release blijft werken met een nieuwere
app zolang beide hetzelfde contract spreken; als een release het wijzigt, zeggen de release notes dat RTE's moeten worden bijgewerkt. Elke modus
heeft een eigen contract:

| Modus | Contract | Bij een verschil |
|---|---|---|
| Uitgaand, Inkomend | 3, nieuw in 7.3.0 | De app sluit de socket van de RTE met de code `4409` en logt *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Een uitgaande RTE logt *the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Een job die met een ander contract wordt gestuurd, wordt geweigerd |
| Database (verouderd) | 2, sinds 7.0.0 | De RTE weigert de jobs van de app |

**Verbinding testen** op de runner zegt welk contract de RTE spreekt en welk de app nodig heeft (zie
[Verbinding testen](../runners/runner-page.html#test-connection)), en de rij **Runners** van de pagina **Status** voert dezelfde controle uit.
