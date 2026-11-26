---
layout: default
title: Der Aufbau von Ansible
parent: Git-Repositories
nav_order: 6
translated_from: ea915eac819df2b716a2a5bdb21e4884d44c6ca4
---

# Ein Repository im Aufbau von Ansible
{: .no_toc }

Das Playbook eines Formulars aus dem Stamm seines Repositorys, wie in AWX
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Für Admins und Formularautoren, deren Playbooks in einem Repository liegen, das so aufgebaut ist, wie Ansible es beschreibt, seit 7.8.0.

---

## Der Aufbau

Der Aufbau von Ansible legt die Konfiguration, die Inventare, die Playbooks und die Rollen nebeneinander ins Stammverzeichnis des Repositorys.

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

Die Playbooks liegen in `playbooks/` und die Rollen in `roles/`, also findet Ansible die Rollen über die `ansible.cfg` im
Stammverzeichnis, die es nur liest, wenn `ansible-playbook` in diesem Ordner startet:

```ini
[defaults]
roles_path = ./roles
```

Relative Pfade in der `ansible.cfg` werden ab dem Ordner gelesen, der sie enthält, also funktioniert `collections_path = ./collections`
genauso. AWX führt die Playbooks eines Projekts aus dessen Stammverzeichnis aus, und seit 7.8.0 kann ein Formular dasselbe.

---

## Das Repository in einem Formular nennen

Ein Formular nennt das Repository, aus dem sein Playbook läuft, mit `playbookRepository`, auf einem Formular `ansible`.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: infra
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
roles:
  - admin
```

Der Job läuft dann aus dem Stammverzeichnis von `infra`, in welchem Ordner die Playbooks auch liegen:

| Was | Gelesen aus |
|---|---|
| `ansible.cfg` | Dem Stammverzeichnis des Repositorys, mit seinem `roles_path`, `collections_path` und jeder anderen Einstellung |
| `playbook` | Dem Stammverzeichnis: `playbooks/site.yml`, nicht `site.yml` |
| Ein relatives `inventory` oder `__inventory__` | Dem Stammverzeichnis: `inventories/production/hosts.yaml` |
| `playbookSubPath` | Verschiebt den Ausführungsordner weiterhin, jetzt ab dem Stammverzeichnis |

Ein Inventar, das mit seinem Namen genannt wird (`inventory: production`), ist wie bisher eines der
[Inventare](../designer/) des Designers. Das Repository muss den Verwendungstyp **Playbooks** haben: ein Name, der kein für
Playbooks verwendetes Repository ist, lässt den Job mit `playbookRepository '<name>' is not a repository used for playbooks` fehlschlagen.

Ein Schritt `ansible` eines [mehrstufigen Formulars](../forms/multistep.html) nennt sein eigenes `playbookRepository`, und ein
Playbook-Knoten eines [Workflows](../workflows/file.html#ansibleforms-own-keys) nennt es als `playbook_repository`.

---

## Das Repository, in dem das Formular liegt

Seit 7.8.0 nennt ein Formular, das im selben Repository wie sein Playbook liegt, dieses `__self__`, statt seinen Namen zu wiederholen.

```yaml
name: Deploy the web servers
type: ansible
playbookRepository: __self__
playbook: playbooks/site.yml
inventory: inventories/production/hosts.yaml
```

`__self__` ist das Repository, aus dem das Formular gelesen wird, und es muss den Verwendungstyp **Playbooks** haben, wie
jedes Repository, das ein Formular nennt. Auf einem Playbook-Knoten eines Workflows ist `playbook_repository: __self__` das
Repository, in dem die Workflow-Datei liegt.

Ein Formular im lokalen Formularordner liegt in keinem Repository, also nennt sein `__self__` keines. Das Formular bekommt
dann einen Ladefehler, der es nennt, `Form '<name>': playbookRepository __self__ names the repository the form is in, and the form is in none`, und sein
Start wird mit Begründung abgelehnt. Das `__self__` eines Knotens in einer Datei des lokalen Workflow-Ordners lässt den Job
des Knotens fehlschlagen.

---

## Mehrere Playbook-Repositories

Seit 7.8.0 können mehrere Repositories den Verwendungstyp **Playbooks** haben; vorher wurde nur das erste verwendet, mit einer Warnung.

| Das Formular | Woraus sein Playbook läuft |
|---|---|
| Ohne `playbookRepository` | Aus dem ersten für Playbooks verwendeten Repository, in der Reihenfolge, in der sie hinzugefügt wurden: aus dessen Ordner `playbooks`, sonst aus dessen Stammverzeichnis, genau wie vor 7.8.0 |
| Mit `playbookRepository: <name>` | Aus dem Stammverzeichnis dieses Repositorys, das erste eingeschlossen |

Ein Formular, das das erste Repository nennt, läuft also aus dessen Stammverzeichnis und gibt sein `playbook` ab dort an
(`playbooks/site.yml`). Die Formulare, die keines nennen, laufen weiter wie bisher.

---

## Im Designer

Der Designer bietet das Repository und die dazugehörigen Playbooks an, auf einem Formular und auf einem Workflow-Knoten.

| Wo | Was er zeigt |
|---|---|
| Der Tab **Visuell** eines Formulars | **Repository**, über **Playbook**, wenn es mehrere Playbook-Repositories gibt oder das Formular eines nennt. Seine erste Option, **Erstes Playbook-Repository**, entfernt den Schlüssel; die zweite, **Repository dieses Formulars (name)**, schreibt `__self__` |
| **Playbook** | Die Playbooks des gewählten Repositorys, ab seinem Stammverzeichnis benannt; mit **Erstes Playbook-Repository** die des ersten, so wie es sie ausführt |
| Ein Playbook-Knoten eines Workflows | Dasselbe Feld **Repository**, auf seinem Tab **Wie er läuft**, mit **Repository dieses Workflows (name)** für `__self__`, und die Playbooks dieses Repositorys auf **Was er ausführt** |
| Der Bereich **Playbooks** | Die Playbooks des ersten Repositorys, aus dessen Ordner `playbooks` (sonst aus dessen Stammverzeichnis), dann jedes weitere Repository vollständig, in einem Ordner mit seinem Namen |

Die Rollenoption [**Alle Playbooks bearbeiten**](../designer/#limited-designers) zählt ein Playbook nach seinem Repository und
seinem Pfad: ein Formular, das `playbooks/site.yml` von `infra` ausführt, verwendet diese Datei, nicht eine `site.yml` des ersten Repositorys.

---

## Auf einem RTE-Runner

Ein [RTE](../rte/) erhält das Repository, das der Job nennt, in beiden seiner [Dateimodi](../rte/modes.html).

- Mit `RTE_FILES=transfer`, dem Standard, sendet die App das ganze Repository, das das Formular nennt, gepackt, statt des
  Ordners `playbooks` des ersten Repositorys.
- Mit `RTE_FILES=local` läuft das RTE aus seinem eigenen Klon dieses Repositorys, unter `REPO_PATH`.

Das RTE muss 7.8.0 oder neuer sein, um ein Formular auszuführen, das sein Repository nennt. AWX-, Semaphore-, Rundeck- und
Jenkins-Runner führen ihre eigenen Vorlagen und Jobs aus: `playbookRepository` ist kein Schlüssel ihrer Formulare, und ein
Workflow-Knoten auf einem solchen Runner hat keinen.

---

## Beispiel: ein Formular für jede Umgebung

Das Formular unten führt `playbooks/site.yml` von `infra` gegen das Inventar der Umgebung aus, die der Benutzer wählt.

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

Das Feld `__inventory__` ergibt für **production** das Inventar `inventories/production/hosts.yaml`, gelesen aus dem
Stammverzeichnis von `infra`, mit den `group_vars` daneben. Die Rollen von `site.yml` kommen aus `roles/`, über `roles_path` in der `ansible.cfg`.

---

## Dasselbe vor 7.8.0

Vor 7.8.0 konnte ein Formular nur mit `playbookSubPath: ../` aus dem Ordner `playbooks` des einen Playbook-Repositorys heraustreten.

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

Es läuft ebenfalls aus dem Stammverzeichnis, mit diesen Grenzen, die `playbookRepository` aufhebt:

- Nur das erste für Playbooks verwendete Repository war erreichbar, also musste der Ansible-Aufbau dieses sein.
- Die Playbook-Liste des Designers zeigte `site.yml`, aus dem Ordner `playbooks`, also wurde `playbooks/site.yml` von Hand eingetippt.
- Mit `RTE_FILES=transfer`, dem Standard, erhielt das RTE nur den Ordner `playbooks`, also erreichte `../` weder die
  `ansible.cfg` noch die Rollen und die Inventare: es funktionierte nur mit `RTE_FILES=local`.

Ein solches Formular auf 7.8.0 umzustellen heißt, `playbookSubPath: ../` durch `playbookRepository: <name>` zu ersetzen;
`playbook` und `__inventory__` bleiben, wie sie sind.
