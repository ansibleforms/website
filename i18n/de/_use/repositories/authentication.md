---
layout: default
title: Authentifizierung
parent: Git-Repositories
nav_order: 2
translated_from: 9e2bb180b35951e97851c21f388db0d7d54d4c73
---

# Authentifizierung
{: .no_toc }

HTTPS mit einem Token, SSH mit dem erzeugten Schlüssel und eigene git-Befehle
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Authentifizierung

Wie sich AnsibleForms authentifiziert, hängt von der Form der **URI** ab.

### HTTPS mit einem Token

Für ein privates HTTPS-Remote wählen Sie **Anmeldedaten**, deren Benutzer der git-Benutzer ist und deren Passwort ein Personal Access Token
(oder das Passwort) ist.

Ab 7.3.0 meldet sich git über `GIT_ASKPASS` an: Benutzer und Token gehen an jeden git-Befehl, der mit dem Server spricht, nie in
die URL, sodass sie nicht in der `.git/config` des Clones bleiben und ein geändertes Token beim nächsten Pull oder Push verwendet wird. Das Token braucht
Lesezugriff zum Pullen und Schreibzugriff zum Pushen. Ein öffentliches Remote braucht keine Anmeldedaten.

Bis 7.2.0 wurden beide in die URL eingefügt, als `https://<user>:<token>@git.example.com/team/forms.git`. Ein damals erstellter Clone behält
diese URL bis zu seinem nächsten Pull oder Push, der sein Remote wieder auf die eigene **URI** des Repositorys setzt.

### SSH mit dem erzeugten Schlüssel

Für ein SSH-Remote authentifiziert sich AnsibleForms mit einem eigenen Schlüsselpaar, das es beim ersten Start erzeugt.

1. Öffnen Sie **Einstellungen > Verbindungen > SSH**, dort den Tab **Schlüssel**, und kopieren Sie den **Öffentlichen Schlüssel**.
2. Fügen Sie ihn auf dem git-Server hinzu, als Deploy-Key des Repositorys (mit Schreibzugriff, wenn Sie pushen) oder bei einem Benutzer mit Zugriff.
3. Fügen Sie das Repository mit einer SSH-**URI** hinzu, zum Beispiel `git@git.example.com:team/forms.git`, und wählen Sie keine Anmeldedaten.

Das Schlüsselpaar liegt in `.ssh/id_rsa` unter [`HOME_PATH`](../customization/paths.html#env_HOME_PATH); halten Sie diesen Ordner also auf
persistentem Speicher, sonst ändert sich der Schlüssel, wenn der Container neu erstellt wird.

Bei einem Clone mit einer URI der Form `user@host:path` führt AnsibleForms zuerst `ssh-keyscan` auf dem Host aus und fügt seinen Schlüssel zu den
bekannten Hosts hinzu. Für andere Remotes fügen Sie den Host vor dem ersten Clone im Tab **Bekannte Hosts** von **Einstellungen > Verbindungen > SSH**
hinzu.

### Eigene git-Befehle

Die Befehle für Clone, Pull und Push lassen sich ersetzen, etwa um git-Optionen hinzuzufügen, mit drei Einstellungen.

| Einstellung | Standard | Was AnsibleForms hinzufügt |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>`, `--verbose`, die URI und den Namen |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |

Ab 7.3.0 laufen diese Befehle ohne Shell: Anführungszeichen funktionieren, aber ein Shell-Operator wie `;`, `|`, `&&` oder `>` wird abgelehnt.
