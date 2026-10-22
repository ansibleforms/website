---
layout: default
title: Images
parent: RTE
nav_order: 1
translated_from: cb917c5cb9cbca9d530398171265e91f1ba8e94b
---

# RTE-Images
{: .no_toc }

Die drei veröffentlichten RTE-Images und eine eigene RTE mit den Collections und Bibliotheken, die Ihre Playbooks verwenden
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Die RTE-Images

Die RTE wird in drei Schichten veröffentlicht, jede auf der vorherigen aufgebaut, mit denselben Tags wie die App (siehe [Image-Tags](../installation/#image-tags)):

| Image | Was es enthält | Verwendung |
|---|---|---|
| `ghcr.io/ansibleforms/ansibleforms-rte-base` | Node.js und den AnsibleForms-Server, git, ssh und sshpass. Kein Python und kein Ansible, daher führt es allein kein Playbook aus | Um eine RTE mit eigenen Python- und Ansible-Versionen zu bauen |
| `ghcr.io/ansibleforms/ansibleforms-rte-core` | Die Basis plus Python 3.14, ansible-core und einige gängige Bibliotheken (`jmespath`, `netaddr`, `requests`, `paramiko`). Keine Collections | Um eine kleinere RTE mit nur den Collections und Bibliotheken zu bauen, die Ihre Playbooks verwenden |
| `ghcr.io/ansibleforms/ansibleforms-rte-full` | Der Core plus das Paket `ansible` auf demselben ansible-core und das, was das Image von AnsibleForms 6.5 hatte: die Collections von NetApp, AWS und der Community, `pandas`, `pyvmomi`, `boto3`, den mariadb-Client, ytt und einige OS-Werkzeuge | **Der Standard.** Unverändert verwenden: Playbooks aus 6.5 finden, was sie verwendet haben |

Wie das App-Image läuft jede Schicht als Benutzer `node` (uid 1000), und auch die Playbooks laufen als dieser Benutzer.

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

Halten Sie das Image auf dem Release der App: `:7` folgt `:7` der App. Collections und Rollen lassen sich auch einhängen statt einbacken, unter
`/etc/ansible/collections` und `/etc/ansible/roles`. Dann ist pro Änderung kein Neubau nötig, aber was läuft, hängt von diesem Volume ab;
Python-Bibliotheken gehören immer ins Image. Alles einzubacken ist reproduzierbar und startet schnell, daher ist es der Weg für die Produktion.

---

## Der Vertrag

Was die App und eine RTE gemeinsam haben müssen, ist ihr Vertrag, eine Nummer, die beide melden. Eine RTE eines älteren Release funktioniert weiter mit einer neueren
App, solange beide denselben Vertrag sprechen; ändert ein Release ihn, sagen seine Release Notes, dass RTEs aktualisiert werden müssen. Jeder Modus
hat seinen eigenen:

| Modus | Vertrag | Bei einer Abweichung |
|---|---|---|
| Ausgehend, Eingehend | 3, neu in 7.3.0 | Die App schließt den Socket der RTE mit dem Code `4409` und protokolliert *RTE '&lt;name&gt;' speaks contract &lt;n&gt;, this app (&lt;release&gt;) contract 3: refused*. Eine ausgehende RTE protokolliert *the app speaks another contract (an upgrade in progress?): dialing again in 60 seconds*. Ein mit einem anderen Vertrag gesendeter Job wird abgewiesen |
| Datenbank (veraltet) | 2, seit 7.0.0 | Die RTE weist die Jobs der App ab |

**Verbindung testen** am Runner sagt, welchen Vertrag die RTE spricht und welchen die App braucht (siehe
[Verbindung testen](../runners/runner-page.html#test-connection)), und die Zeile **Runner** der Seite **Status** führt dieselbe Prüfung aus.
