---
layout: default
title: Authenticatie
parent: Git-repositories
nav_order: 2
translated_from: 9e2bb180b35951e97851c21f388db0d7d54d4c73
---

# Authenticatie
{: .no_toc }

HTTPS met een token, SSH met de gegenereerde sleutel, en eigen git-commando's
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Authenticatie

Hoe AnsibleForms zich authenticeert, hangt af van de vorm van de **Uri**.

### HTTPS met een token

Kies voor een private HTTPS-remote een **Referentie** waarvan de gebruiker de git-gebruiker is en het wachtwoord een personal access token
(of het wachtwoord).

Vanaf 7.3.0 meldt git zich aan via `GIT_ASKPASS`: de gebruiker en het token gaan naar elk git-commando dat met de server praat, nooit in
de URL, dus ze blijven niet in `.git/config` van de clone staan en een gewijzigd token wordt bij de volgende pull of push gebruikt. Het token heeft
leestoegang nodig om te pullen, en schrijftoegang om te pushen. Een openbare remote heeft geen referentie nodig.

Tot en met 7.2.0 werden beide in de URL gezet, als `https://<user>:<token>@git.example.com/team/forms.git`. Een clone die toen is gemaakt, houdt
die URL tot zijn volgende pull of push, die zijn remote terugzet naar de eigen **Uri** van de repository.

### SSH met de gegenereerde sleutel

Voor een SSH-remote authenticeert AnsibleForms zich met een eigen sleutelpaar, dat het bij de eerste start genereert.

1. Open **Instellingen > Verbindingen > SSH**, op het tabblad **Sleutel**, en kopieer de **Publieke sleutel**.
2. Voeg hem toe op de git-server, als deploy key van de repository (met schrijftoegang als je pusht), of bij een gebruiker met toegang.
3. Voeg de repository toe met een SSH-**Uri**, bijvoorbeeld `git@git.example.com:team/forms.git`, en kies geen referentie.

Het sleutelpaar staat in `.ssh/id_rsa` onder [`HOME_PATH`](../customization/paths.html#env_HOME_PATH), dus houd die map op
persistente opslag, anders verandert de sleutel wanneer de container opnieuw wordt aangemaakt.

Bij een clone met een Uri van de vorm `user@host:path` voert AnsibleForms eerst `ssh-keyscan` uit op de host en voegt het de sleutel toe aan de
known hosts. Voeg voor andere remotes de host toe op het tabblad **Known hosts** van **Instellingen > Verbindingen > SSH**, vóór de
eerste clone.

### Eigen git-commando's

De commando's voor clone, pull en push kunnen worden vervangen, bijvoorbeeld om git-opties toe te voegen, met drie instellingen.

| Instelling | Standaard | Wat AnsibleForms toevoegt |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>`, `--verbose`, de Uri en de naam |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |

Vanaf 7.3.0 draaien deze commando's zonder shell: aanhalingstekens werken, maar een shell-operator zoals `;`, `|`, `&&` of `>` wordt geweigerd.
