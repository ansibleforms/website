---
layout: default
title: Ihr erstes Formular
nav_order: 2
translated_from: 26f445060b68070d02251e1c756c6253e5cf85fb
---

# Ihr erstes Formular
{: .no_toc }

Schreiben Sie ein Playbook, bauen Sie im Designer ein Formular dafür, starten Sie es und finden Sie den Job
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

Dieses Tutorial geht von einer frischen Installation aus, siehe [Installation](installation/). Es dauert etwa fünfzehn Minuten.

---

## 1. Anmelden

Öffnen Sie AnsibleForms im Browser und melden Sie sich als Administrator an.

Das Standardkonto ist `admin` / `AnsibleForms!123` (oder Ihre [`ADMIN_*`](customization/server.html#env_ADMIN_USERNAME)-Werte); die Seite **Formulare** öffnet sich:

![Die Seite Formulare mit Beispielformularen](assets/screenshots/dashboard.jpg)

---

## 2. Das Playbook schreiben

Ein `ansible`-Formular führt ein Playbook aus dem Playbook-Ordner aus, daher kommt das Playbook zuerst. Speichern Sie dies als `hello.yaml`:

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

Das Playbook liest vier Variablen. Das Formular, das Sie als Nächstes bauen, sendet sie als Extravars, eine pro Feld.

Legen Sie die Datei in den Ordner `playbooks` des persistenten Ordners
([`ANSIBLE_PATH`](customization/paths.html#env_ANSIBLE_PATH)); legen Sie den Ordner an, falls er noch nicht existiert:

<div class="af-tabs" data-tab-group="install">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="docker" aria-selected="true">Docker</button>
<button type="button" role="tab" class="af-tab" data-tab="compose" aria-selected="false">Docker Compose</button>
<button type="button" role="tab" class="af-tab" data-tab="kubernetes" aria-selected="false">Kubernetes</button>
<button type="button" role="tab" class="af-tab" data-tab="source" aria-selected="false">Aus dem Quellcode</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="docker" markdown="1">

Der Ordner, den Sie unter `/app/dist/persistent` eingehängt haben, im Installationsbeispiel `/srv/apps/ansibleforms/persistent`:

```bash
mkdir -p /srv/apps/ansibleforms/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/persistent/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="compose" markdown="1" hidden>

Der Ordner `data/playbooks` des docker-compose-Projekts:

```bash
cp hello.yaml data/playbooks/
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="kubernetes" markdown="1" hidden>

Das persistente Volume, im AnsibleForms-Pod unter `/app/dist/persistent` eingehängt. Ermitteln Sie den Namen des Pods und kopieren Sie die Datei hinein:

```bash
kubectl -n ansibleforms get pods
kubectl -n ansibleforms exec <pod> -- mkdir -p /app/dist/persistent/playbooks
kubectl -n ansibleforms cp hello.yaml <pod>:/app/dist/persistent/playbooks/hello.yaml
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="source" markdown="1" hidden>

Der Ordner `persistent/playbooks` des Servers, im Installationsbeispiel `/srv/apps/ansibleforms/server`:

```bash
mkdir -p /srv/apps/ansibleforms/server/persistent/playbooks
cp hello.yaml /srv/apps/ansibleforms/server/persistent/playbooks/
```

</div>
</div>

{: .note }
> Wenn bei einem Git-Repository **Für Playbooks verwenden?** eingeschaltet ist, werden die Playbooks stattdessen aus diesem Repository ausgeführt:
> committen Sie `hello.yaml` dort. Siehe [Designer und Git](gui/designer-and-git.html).

---

## 3. Das Formular erstellen

Formulare sind YAML-Dateien im Formularordner. Der Designer bearbeitet sie im Browser und prüft sie vor dem Speichern.

1. Klicken Sie im oberen Menü auf **Designer** und dann im linken Menü auf **Formulare**.
2. Klicken Sie auf den Schalter oben rechts (**Designer starten**). Er sperrt die Konfiguration, damit niemand anderes sie gleichzeitig
   bearbeitet, und zeigt danach **Von mir gesperrt**.
3. Klicken Sie auf **Neue Datei**, die erste Schaltfläche der Werkzeugleiste, und geben Sie den Dateinamen `hello-world.yaml` ein. Der Designer fügt
   ihr ein Formular namens `New Form` hinzu.
4. Ersetzen Sie das YAML im Editor durch dieses Formular:

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
5. Klicken Sie auf **Validieren** (das Häkchen) und dann auf **Speichern**. Beim Speichern wird `hello-world.yaml` in den Formularordner geschrieben.
6. Klicken Sie erneut auf den Schalter, um die Sperre freizugeben.

![Der Designer beim Bearbeiten eines Formulars](assets/screenshots/designer.jpg)

Das Formular verwendet vier Feldtypen:

| Feld | Typ | Was es tut |
|---|---|---|
| `your_name` | [`text`](formfields/text.html) | Ein Pflicht-Textfeld |
| `target_env` | [`enum`](formfields/enum.html) | Eine Auswahlliste mit einer festen Liste von `values` |
| `vm_size` | [`enum`](formfields/enum.html) | Eine Auswahlliste, gefüllt von einem lokalen [Ausdruck](expressions/local.html); `__auto__` wählt den ersten Eintrag |
| `dry_run` | [`checkbox`](formfields/checkbox.html) | Ein Kontrollkästchen, gesendet als `true` oder `false` |

`vm_size` zeigt beide Spalten, `size` und `cpus`, und sendet `size`, die erste; `valueColumn` wählt eine andere.

`roles: [default]` erlaubt jedem angemeldeten Benutzer, das Formular auszuführen, und `categories: [Default]` legt es in die Kategorie, die die Standard-`config.yaml`
definiert.

{: .note }
> Sie können `hello-world.yaml` auch nach [`FORMS_FOLDER_PATH`](customization/paths.html#env_FORMS_FOLDER_PATH) kopieren und [in VS Code validieren](faq.html#vs-code-validation-for-form-files).

---

## 4. Starten

Öffnen Sie das Formular über die Seite **Formulare**: klicken Sie im oberen Menü auf **Formulare** und wählen Sie **Hello world** in der Kategorie **Default**.

Geben Sie Ihren Namen ein und ändern Sie die anderen Felder nach Belieben. Klicken Sie auf **Extra-Variablen anzeigen**, um zu sehen, was das Playbook
erhält, und dann auf **Senden**:

![Ein Formular](assets/screenshots/form.jpg)

---

## 5. Die Ausgabe verfolgen

Der Job startet sofort, und seine Ausgabe erscheint während der Ausführung unter dem Formular und endet mit einem Balken **Abgeschlossen**:

![Die Ausgabe eines Jobs](assets/screenshots/run.jpg)

Der Debug-Task gibt Ihre Werte aus, zum Beispiel `Hello Alice: a small machine in development (dry run: True)`.

Die Warnung zum impliziten localhost ist ohne Inventar zu erwarten; ein echtes Formular setzt [`inventory`](forms/ansible.html).

---

## 6. In der Job-Historie finden

Jeder Start wird als Job aufbewahrt. Klicken Sie im oberen Menü auf **Jobs**: der neue Job steht ganz oben unter **Alle Jobs**.

Klicken Sie auf den Job, um seine Ausgabe erneut zu sehen, und auf **Extra-Variablen anzeigen**, um zu sehen, was gesendet wurde. Die Symbole vor jedem Job
starten ihn erneut oder löschen ihn:

![Die Job-Historie](assets/screenshots/job-output.jpg)

---

## Nächste Schritte

Bauen Sie mit den Referenzseiten auf diesem Formular auf:

* **[Formulare](forms/)** : alle Formulareigenschaften, Vorlagen auf Runnern, Workflow-Formulare, Genehmigungspunkte und Benachrichtigungen
* **[Formularfelder](formfields/)** : alle Feldtypen, mit Validierung, Abhängigkeiten und Layout
* **[Ausdrücke](expressions/)** : Felder aus REST-APIs, Datenbanken und Dateien füllen
* **[Rollen](config/roles.html)** und **[Kategorien](config/categories.html)** in `config.yaml` : festlegen, wer welches Formular sieht
* **[Wie es funktioniert](how-it-works.html)** : was hinter einem Start passiert und wo alles gespeichert wird
