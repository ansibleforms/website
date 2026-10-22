---
layout: default
title: Je eerste formulier
nav_order: 2
translated_from: 26f445060b68070d02251e1c756c6253e5cf85fb
---

# Je eerste formulier
{: .no_toc }

Schrijf een playbook, bouw er in de Designer een formulier voor, start het en zoek de job terug
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Deze tutorial gaat uit van een verse installatie, zie [Installatie](installation/). Reken op ongeveer een kwartier.

---

## 1. Meld je aan

Open AnsibleForms in een browser en meld je aan als beheerder.

Het standaardaccount is `admin` / `AnsibleForms!123` (of je eigen [`ADMIN_*`](customization/server.html#env_ADMIN_USERNAME)-waarden); de pagina **Formulieren** gaat open:

![De pagina Formulieren, met voorbeeldformulieren](assets/screenshots/dashboard.jpg)

---

## 2. Schrijf het playbook

Een `ansible`-formulier voert een playbook uit de map met playbooks uit, dus het playbook komt eerst. Sla dit op als `hello.yaml`:

{% raw %}
```yaml
- name: Hello world
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Show the values from the form
      ansible.builtin.debug:
        msg: "Hello {{ your_name }}: a {{ vm_size }} machine in {{ target_env }} (dry run: {{ dry_run }})"
```
{% endraw %}

Het playbook leest vier variabelen. Het formulier dat je hierna bouwt stuurt ze mee als extravars, één per veld.

Zet het bestand in de map `playbooks` van de persistente map
([`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH)); maak de map aan als die nog niet bestaat:

<div class="af-tabs" data-tab-group="install">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="compose" aria-selected="false">Docker Compose</button>
<button type="button" role="tab" class="af-tab" data-tab="kubernetes" aria-selected="false">Kubernetes</button>
<button type="button" role="tab" class="af-tab" data-tab="source" aria-selected="false">Vanuit de broncode</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

De map die je op `/app/dist/persistent` hebt gekoppeld, `/srv/apps/ansibleforms/persistent` in het installatievoorbeeld:

```bash
mkdir -p /srv/apps/ansibleforms/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/persistent/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="compose" markdown="1" hidden>

De map `data/playbooks` van het docker-compose-project:

```bash
cp hello.yaml data/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="kubernetes" markdown="1" hidden>

Het persistente volume, gekoppeld op `/app/dist/persistent` in de AnsibleForms-pod. Zoek de naam van de pod op en kopieer het bestand erin:

```bash
kubectl -n ansibleforms get pods
kubectl -n ansibleforms exec <pod> -- mkdir -p /app/dist/persistent/playbooks
kubectl -n ansibleforms cp hello.yaml <pod>:/app/dist/persistent/playbooks/hello.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="source" markdown="1" hidden>

De map `persistent/playbooks` van de server, `/srv/apps/ansibleforms/server` in het installatievoorbeeld:

```bash
mkdir -p /srv/apps/ansibleforms/server/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/server/persistent/playbooks/
```

</div>
</div>

{: .note }
> Als bij een git-repository **Gebruiken voor playbooks** aan staat, worden playbooks in plaats daarvan uit die repository uitgevoerd:
> commit `hello.yaml` daar. Zie [Designer en git](gui/designer-and-git.html).

---

## 3. Maak het formulier

Formulieren zijn YAML-bestanden in de map met formulieren. De Designer bewerkt ze in de browser en controleert ze voordat hij ze opslaat.

1. Klik op **Ontwerper** in het bovenste menu en daarna op **Formulieren** in het linkermenu.
2. Klik op de schakelaar rechtsboven (**Start designer**). Die vergrendelt de configuratie zodat niemand anders haar tegelijk
   bewerkt, en toont daarna **Vergrendeld door mij**.
3. Klik op **Nieuw bestand**, de eerste knop van de werkbalk, en geef de bestandsnaam `hello-world.yaml` op. De Designer voegt er
   een formulier met de naam `New Form` aan toe.
4. Vervang de YAML in de editor door dit formulier:

```yaml
name: Hello world
type: ansible
playbook: hello.yaml
description: Greets you with the values you picked
icon: play
roles:
  - default
categories:
  - Default
fields:
  - name: your_name
    type: text
    label: Your name
    required: true
  - name: target_env
    type: enum
    label: Environment
    values:
      - development
      - test
      - production
    default: development
    required: true
  - name: vm_size
    type: enum
    label: Size
    expression: "[{size:'small',cpus:1},{size:'medium',cpus:2},{size:'large',cpus:4}]"
    runLocal: true
    default: __auto__
    required: true
  - name: dry_run
    type: checkbox
    label: Dry run
    default: true
```

{:start="5"}
5. Klik op **Valideren** (het vinkje) en daarna op **Opslaan**. Bij het opslaan wordt `hello-world.yaml` in de map met formulieren geschreven.
6. Klik opnieuw op de schakelaar om de vergrendeling vrij te geven.

![De Designer, tijdens het bewerken van een formulier](assets/screenshots/designer.jpg)

Het formulier gebruikt vier veldtypen:

| Veld | Type | Wat het doet |
|---|---|---|
| `your_name` | [`text`](formfields/text.html) | Een verplicht tekstvak |
| `target_env` | [`enum`](formfields/enum.html) | Een keuzelijst met een vaste lijst `values` |
| `vm_size` | [`enum`](formfields/enum.html) | Een keuzelijst gevuld door een lokale [expressie](expressions/local.html); `__auto__` selecteert het eerste item |
| `dry_run` | [`checkbox`](formfields/checkbox.html) | Een selectievakje, verstuurd als `true` of `false` |

`vm_size` toont beide kolommen, `size` en `cpus`, en verstuurt `size`, de eerste; met `valueColumn` kies je een andere.

Met `roles: [default]` mag elke aangemelde gebruiker het formulier uitvoeren, en `categories: [Default]` zet het in de categorie die de standaard-
`config.yaml` definieert.

{: .note }
> Je kunt `hello-world.yaml` ook naar [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) kopiëren en [het in VS Code valideren](faq.html#vs-code-validation-for-form-files).

---

## 4. Start het

Open het formulier vanaf de pagina **Formulieren**: klik op **Formulieren** in het bovenste menu en kies **Hello world** in de categorie **Default**.

Vul je naam in en pas de andere velden aan als je wilt. Klik op **Toon extravars** om te zien wat het playbook
ontvangt, en klik daarna op **Verzenden**:

![Een formulier](assets/screenshots/form.jpg)

---

## 5. Bekijk de uitvoer

De job start meteen, en de uitvoer verschijnt onder het formulier terwijl hij loopt, met aan het eind een balk **Voltooid**:

![De uitvoer van een job](assets/screenshots/run.jpg)

De debug-taak toont je waarden, bijvoorbeeld `Hello Alice: a small machine in development (dry run: True)`.

De waarschuwing over de impliciete localhost is normaal zonder inventory; een echt formulier stelt [`inventory`](forms/ansible.html) in.

---

## 6. Vind het terug in de jobgeschiedenis

Elke start wordt bewaard als job. Klik op **Taken** in het bovenste menu: de nieuwe job staat bovenaan in **Alle jobs**.

Klik op de job om de uitvoer opnieuw te zien, en op **Toon extravars** om te zien wat er verstuurd is. Met de pictogrammen vóór elke job
start je hem opnieuw of verwijder je hem:

![De jobgeschiedenis](assets/screenshots/job-output.jpg)

---

## Volgende stappen

Bouw verder op dit formulier met de referentiepagina's:

* **[Formulieren](forms/)** : elke eigenschap van een formulier, templates op runners, workflowformulieren, goedkeuringspunten en meldingen
* **[Formuliervelden](formfields/)** : alle veldtypen, met validatie, afhankelijkheden en opmaak
* **[Expressies](expressions/)** : vul velden vanuit REST API's, databases en bestanden
* **[Rollen](config/roles.html)** en **[categorieën](config/categories.html)** in `config.yaml` : bepaal wie welk formulier ziet
* **[Hoe het werkt](how-it-works.html)** : wat er achter een start gebeurt, en waar alles wordt opgeslagen
