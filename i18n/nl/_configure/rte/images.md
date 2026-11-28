---
layout: default
title: Images
parent: RTE
nav_order: 1
translated_from: 793f1c4efa7fb085bdd4b1551161e3b57b52ff12
---

# RTE-images
{: .no_toc }

De drie gepubliceerde RTE-images, en een eigen RTE met de collecties en bibliotheken die je playbooks gebruiken
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## De RTE-images

De RTE wordt in drie lagen gepubliceerd, elk gebouwd op de vorige, met dezelfde tags als de controller (zie [Image-tags](../installation/#image-tags)):

| Image | Wat erin zit | Gebruik het |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js en de AnsibleForms-server, git, ssh en sshpass. Geen python en geen ansible, dus op zichzelf draait ze geen playbook | Om een RTE te bouwen met je eigen versies van python en ansible |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | De base, plus python 3.14, ansible-core en een paar gangbare bibliotheken (`jmespath`, `netaddr`, `requests`, `paramiko`). Geen collecties | Om een kleinere RTE te bouwen met alleen de collecties en bibliotheken die je playbooks gebruiken |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | De core, plus het pakket `ansible` op dezelfde ansible-core, en wat de image van AnsibleForms 6.5 had: de collecties van NetApp, AWS en community, `pandas`, `pyvmomi`, `boto3`, de mariadb-client, ytt en een paar os-tools | **De standaard.** Draai haar zoals ze is: playbooks van 6.5 vinden wat ze gebruikten |

Net als de controller-image draait elke laag als de gebruiker `node` (uid 1000), en de playbooks draaien ook als die gebruiker.

Vanaf 7.6.0 wordt elke laag onder dezelfde tag gepubliceerd voor `linux/amd64` en `linux/arm64`. Een RTE die je zelf bouwt, is gebouwd voor de
architectuur van de machine die hem bouwt: voor arm64-hosts bouw je hem dus op zo'n arm64-host zelf, of op een andere machine
met `docker buildx build --platform linux/arm64`.

---

## Je eigen RTE bouwen

Bouw op `ansibleforms-rte-core` en voeg de collecties en python-bibliotheken toe die je playbooks gebruiken. Dit NetApp-voorbeeld is een van
de Dockerfiles in [ansibleforms/rte](https://github.com/ansibleforms/rte/tree/main/examples):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

De python-omgeving en de map met collecties zijn van `node`, dus deze installaties hebben geen root nodig. Een laag die os-pakketten
installeert, schakelt daarvoor over naar `USER root` en aan het einde terug naar `USER node`. Bouw op
`ansibleforms-rte-base` (`Dockerfile.own-ansible` in dezelfde map) om je eigen python en ansible mee te brengen.

Houd de image op de release van de controller: `:7` volgt de `:7` van de controller. Collecties en rollen kunnen ook worden gekoppeld in plaats van ingebakken, op
`/etc/ansible/collections` en `/etc/ansible/roles`. Dan is er per wijziging geen nieuwe build nodig, maar hangt wat er draait af van dat volume;
python-bibliotheken gaan altijd in de image. Alles inbakken is reproduceerbaar en start snel, en is daarom de manier voor productie.

---

## Bouw het in de Designer

Vanaf 7.9.0 beschrijf je een runtime-omgeving in de Designer; een [builder](builder.html) bouwt het image, pusht en ondertekent het.

1. Geef een repository het gebruik **Runtime-omgevingen** (Instellingen > Repositories); het bevat de definities.
2. Open in de Designer **Runtime-omgevingen** en klik op **Nieuw**: vul het in op het tabblad **Visueel**, of schrijf het op het tabblad **YAML**.
3. **Opslaan**, dan **Push** om het in de repository te committen, en **Bouwen**: de build is een job op de pagina **Taken**, met zijn log live.

Elke runtime-omgeving is een eigen map in de repository, naar haar genoemd, die alleen haar definitie bevat:

```text
rte-netapp/
  rte.yaml
```

Het Dockerfile, `ansible.cfg` en de requirements-bestanden worden bij elke build opnieuw geschreven, uit de definitie en de release van de app,
dus ze raken in de repository nooit verouderd. Het tabblad **Bestanden** toont ze zoals de builder ze krijgt.

```yaml
runner_rte:
  - name: rte-netapp
    description: NetApp playbooks of the storage team
    arch: all
    python: "3.15"
    ansible_core: "2.22"
    ansible_collections:
      - name: netapp.ontap
        version: 23.1.0
    python_packages:
      - netapp-lib
    os_packages:
      - sshpass
    registry:
      credential: ghcr
      path: af/rte-netapp
      tag: app
    sbom: true
    sign:
      credential: cosign-key
```

Elke sleutel behalve de naam mag ontbreken; de werkbalk van het tabblad **YAML** stelt elk deel in een dialoog in.

| Sleutel | Wat het is |
|---|---|
| `name` | De naam van de runtime-omgeving, van haar map en van haar image: kleine letters, cijfers, punten, streepjes en underscores |
| `arch` | `all`, één image voor amd64 en arm64 zoals de gepubliceerde, of alleen `amd64` of `arm64`; `all` als hij ontbreekt. Een andere architectuur dan die van de host van de builder vraagt [QEMU op die host](builder.html#amd64-and-arm64) |
| `python` | De python van het image, van 3.11 tot 3.15; 3.15 als hij ontbreekt |
| `ansible_core` | Een ansible-core-release (`2.22`) of -versie (`2.22.0`) die op die python draait; de nieuwste die dat doet als hij ontbreekt |
| `ansible_collections` | De collections, elk met zijn `name` (namespace.name) en een optionele `version`; de nieuwste als die ontbreekt. Wat elke collection zelf nodig heeft, zijn `requirements.txt` en `bindep.txt` (of zijn `meta/execution-environment.yml`), wordt ermee geïnstalleerd, zoals ansible-builder doet |
| `python_packages` | Python-pakketten, als regels van een `requirements.txt` |
| `os_packages` | Pakketten van Debian 13 (trixie) |
| `registry` | `credential`: inloggegevens van het type **Container-registry**, met het adres en de login van de registry; `path`: het pad van het image daarin, zijn naam als het ontbreekt; `tag`: `app`, de release van de app (`7.9.0`), zodat een nieuwe build elke upgrade volgt, of een eigen tag |
| `sbom` | `true` voegt een software-stuklijst (SBOM) aan het image toe |
| `sign` | `credential`: inloggegevens van het type **Ondertekeningssleutel**, waarmee de builder het image ondertekent met cosign 3; controleer het met `cosign verify --key <publieke sleutel>` van cosign 3 (cosign 2 leest zijn handtekeningen niet) |

Elke runtime-omgeving wordt gebouwd op `ansibleforms-rte-base` van de release van de app, dus een met de tag `app` waarvan het image voor een oudere
release is gebouwd, wordt als zodanig getoond op de pagina **Runtime-omgevingen**, met **Opnieuw bouwen**.

---

## Het contract

Wat de controller en een RTE moeten delen, is hun contract, een nummer dat beide melden. Een RTE van een oudere release blijft werken met een nieuwere
controller zolang beide hetzelfde contract spreken; als een release het wijzigt, zeggen de release notes dat RTE's moeten worden bijgewerkt. Elke modus
heeft een eigen contract:

| Modus | Contract | Bij een verschil |
|---|---|---|
| Uitgaand, Inkomend | 3, nieuw in 7.3.0 | De controller sluit de socket van de RTE met de code `4409` en logt *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Een uitgaande RTE logt *the controller speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Een job die met een ander contract wordt gestuurd, wordt geweigerd |
| Database (verouderd) | 2, sinds 7.0.0 | De RTE weigert de jobs van de controller |

**Verbinding testen** op de runner zegt welk contract de RTE spreekt en welk de controller nodig heeft (zie
[Verbinding testen](../runners/runner-page.html#test-connection)), en de rij **Runners** van de pagina **Status** voert dezelfde controle uit.
