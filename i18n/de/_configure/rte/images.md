---
layout: default
title: Images
parent: RTE
nav_order: 1
translated_from: 793f1c4efa7fb085bdd4b1551161e3b57b52ff12
---

# RTE-Images
{: .no_toc }

Die drei veröffentlichten RTE-Images und eine eigene RTE mit den Collections und Bibliotheken, die Ihre Playbooks verwenden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die RTE-Images

Die RTE wird in drei Schichten veröffentlicht, jede auf der vorherigen aufgebaut, mit denselben Tags wie der Controller (siehe [Image-Tags](../installation/#image-tags)):

| Image | Was es enthält | Verwendung |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js und den AnsibleForms-Server, git, ssh und sshpass. Kein Python und kein Ansible, daher führt es allein kein Playbook aus | Um eine RTE mit eigenen Python- und Ansible-Versionen zu bauen |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | Die Basis plus Python 3.14, ansible-core und einige gängige Bibliotheken (`jmespath`, `netaddr`, `requests`, `paramiko`). Keine Collections | Um eine kleinere RTE mit nur den Collections und Bibliotheken zu bauen, die Ihre Playbooks verwenden |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | Der Core plus das Paket `ansible` auf demselben ansible-core und das, was das Image von AnsibleForms 6.5 hatte: die Collections von NetApp, AWS und der Community, `pandas`, `pyvmomi`, `boto3`, den mariadb-Client, ytt und einige OS-Werkzeuge | **Der Standard.** Unverändert verwenden: Playbooks aus 6.5 finden, was sie verwendet haben |

Wie das Controller-Image läuft jede Schicht als Benutzer `node` (uid 1000), und auch die Playbooks laufen als dieser Benutzer.

Ab 7.6.0 wird jede Schicht für `linux/amd64` und `linux/arm64` unter demselben Tag veröffentlicht. Eine selbst gebaute RTE wird für die
Architektur der Maschine gebaut, die sie baut: Für arm64-Hosts bauen Sie sie auf einem solchen oder mit `docker buildx build --platform linux/arm64`.

---

## Eine eigene RTE bauen

Bauen Sie auf `ansibleforms-rte-core` auf und fügen Sie die Collections und Python-Bibliotheken hinzu, die Ihre Playbooks verwenden. Dieses NetApp-Beispiel ist eines
der Dockerfiles in [ansibleforms/rte](https://github.com/ansibleforms/rte/tree/main/examples):

```dockerfile
FROM ghcr.io/ansibleforms/ansibleforms-rte-core:7
RUN ansible-galaxy collection install netapp.ontap -p /usr/share/ansible/collections \
 && pip install --no-cache-dir netapp-lib netapp-ontap
```

Die Python-Umgebung und der Collections-Ordner gehören `node`, daher brauchen diese Installationen kein root. Eine Schicht, die OS-Pakete installiert,
wechselt dafür zu `USER root` und am Ende zurück zu `USER node`. Um eigenes Python und Ansible mitzubringen, bauen Sie auf
`ansibleforms-rte-base` auf (`Dockerfile.own-ansible` im selben Ordner).

Halten Sie das Image auf dem Release des Controllers: `:7` folgt `:7` des Controllers. Collections und Rollen lassen sich auch einhängen statt einbacken, unter
`/etc/ansible/collections` und `/etc/ansible/roles`. Dann ist pro Änderung kein Neubau nötig, aber was läuft, hängt von diesem Volume ab;
Python-Bibliotheken gehören immer ins Image. Alles einzubacken ist reproduzierbar und startet schnell, daher ist es der Weg für die Produktion.

---

## Im Designer bauen

Ab 7.9.0 beschreiben Sie eine Laufzeitumgebung im Designer; ein [Builder](builder.html) baut ihr Image, pusht und signiert es.

1. Geben Sie einem Repository die Verwendung **Laufzeitumgebungen** (Einstellungen > Repositories); es enthält die Definitionen.
2. Öffnen Sie im Designer **Laufzeitumgebungen** und klicken Sie auf **Neu**: füllen Sie sie im Tab **Visuell** aus, oder schreiben Sie sie im Tab **YAML**.
3. **Speichern**, dann **Push**, um sie ins Repository zu committen, und **Bauen**: der Build ist ein Job auf der Seite **Jobs**, mit Live-Log.

Jede Laufzeitumgebung ist ein eigener Ordner im Repository, nach ihr benannt, der nur ihre Definition enthält:

```text
rte-netapp/
  rte.yaml
```

Das Dockerfile, `ansible.cfg` und die Requirements-Dateien werden bei jedem Build neu geschrieben, aus der Definition und dem Release der App,
und veralten im Repository daher nie. Der Tab **Dateien** zeigt sie so, wie der Builder sie erhält.

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

Jeder Schlüssel außer dem Namen kann entfallen; die Werkzeugleiste des Tabs **YAML** setzt jeden Teil in einem Dialog.

| Schlüssel | Was er ist |
|---|---|
| `name` | Der Name der Laufzeitumgebung, ihres Ordners und ihres Images: Kleinbuchstaben, Ziffern, Punkte, Bindestriche und Unterstriche |
| `arch` | `all`, ein Image für amd64 und arm64 wie die veröffentlichten, oder nur `amd64` oder `arm64`; `all`, wenn er fehlt. Eine andere Architektur als die des Builder-Hosts braucht [QEMU auf diesem Host](builder.html#amd64-and-arm64) |
| `python` | Das python des Images, von 3.11 bis 3.15; 3.15, wenn er fehlt |
| `ansible_core` | Ein ansible-core-Release (`2.22`) oder eine Version (`2.22.0`), die auf diesem python läuft; das neueste passende, wenn er fehlt |
| `ansible_collections` | Die Collections, jede mit ihrem `name` (namespace.name) und einer optionalen `version`; die neueste, wenn sie fehlt. Was jede Collection selbst braucht, ihre `requirements.txt` und `bindep.txt` (oder ihre `meta/execution-environment.yml`), wird mit ihr installiert, wie ansible-builder es tut |
| `python_packages` | Python-Pakete, als Zeilen einer `requirements.txt` |
| `os_packages` | Pakete von Debian 13 (trixie) |
| `registry` | `credential`: Anmeldedaten vom Typ **Container-Registry** mit der Adresse und dem Login der Registry; `path`: der Pfad des Images darin, sein Name, wenn er fehlt; `tag`: `app`, das Release der App (`7.9.0`), damit ein neuer Build jedem Upgrade folgt, oder ein eigener Tag |
| `sbom` | `true` hängt dem Image eine Software-Stückliste (SBOM) an |
| `sign` | `credential`: Anmeldedaten vom Typ **Signaturschlüssel**, mit denen der Builder das Image mit cosign 3 signiert; prüfen Sie es mit `cosign verify --key <öffentlicher Schlüssel>` von cosign 3 (cosign 2 liest seine Signaturen nicht) |

Jede Laufzeitumgebung wird aus `ansibleforms-rte-base` des Releases der App gebaut. Eine mit dem Tag `app`, deren Image für ein älteres Release
gebaut wurde, wird daher auf der Seite **Laufzeitumgebungen** als solche angezeigt, mit **Neu bauen**.

---

## Der Vertrag

Was der Controller und eine RTE gemeinsam haben müssen, ist ihr Vertrag, eine Nummer, die beide melden. Eine RTE eines älteren Release funktioniert weiter mit einem neueren
Controller, solange beide denselben Vertrag sprechen; ändert ein Release ihn, sagen seine Release Notes, dass RTEs aktualisiert werden müssen. Jeder Modus
hat seinen eigenen:

| Modus | Vertrag | Bei einer Abweichung |
|---|---|---|
| Ausgehend, Eingehend | 3, neu in 7.3.0 | Der Controller schließt den Socket der RTE mit dem Code `4409` und protokolliert *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Eine ausgehende RTE protokolliert *the controller speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Ein mit einem anderen Vertrag gesendeter Job wird abgewiesen |
| Datenbank (veraltet) | 2, seit 7.0.0 | Die RTE weist die Jobs des Controllers ab |

**Verbindung testen** am Runner sagt, welchen Vertrag die RTE spricht und welchen der Controller braucht (siehe
[Verbindung testen](../runners/runner-page.html#test-connection)), und die Zeile **Runner** der Seite **Status** führt dieselbe Prüfung aus.
