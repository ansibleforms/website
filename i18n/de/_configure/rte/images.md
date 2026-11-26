---
layout: default
title: Images
parent: RTE
nav_order: 1
translated_from: 04757faa2e6ac2488d86c0c264a1df8be93a9a38
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
der Dockerfiles in [examples/rte](https://github.com/ansibleforms/ansibleforms/tree/main/examples/rte):

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
