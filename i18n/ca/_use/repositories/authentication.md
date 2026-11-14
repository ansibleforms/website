---
layout: default
title: Autenticació
parent: Repositoris Git
nav_order: 2
translated_from: 4d7f58fd454c4caacd674b861ad5a43672910b1c
---

# Autenticació
{: .no_toc }

HTTPS amb un token, SSH amb la clau generada i ordres git personalitzades
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Autenticació

La manera com s'autentica AnsibleForms depèn de la forma de l'**URI**.

### HTTPS amb un token

Per a un remot HTTPS privat, tria una **Credencial** amb un token d'accés personal o una contrasenya, l'usuari opcional. Des de la 7.6.0 una
credencial Git que inicia la sessió amb un **Token** no té usuari: git envia llavors l'usuari `oauth2`, que GitHub, GitLab i Azure DevOps accepten.

A partir de la 7.3.0, git inicia la sessió a través de `GIT_ASKPASS`: l'usuari i el token van a cada ordre git que parla amb el servidor, mai a
l'URL, de manera que no es guarden al `.git/config` del clon i un token canviat es fa servir al següent pull o push. El token necessita
accés de lectura per fer pull, i accés d'escriptura per fer push. Un remot públic no necessita cap credencial.

Fins a la 7.2.0, tots dos s'inserien a l'URL, com a `https://<user>:<token>@git.example.com/team/forms.git`. Un clon fet llavors conserva
aquesta URL fins al seu següent pull o push, que torna a posar com a remot l'**URI** del mateix repositori.

### SSH amb la clau generada

Per a un remot SSH, AnsibleForms s'autentica amb el seu propi parell de claus, que genera en la primera arrencada.

1. Obre **Configuració > Connexions > SSH**, a la pestanya **Clau**, i copia la **Clau pública**.
2. Afegeix-la al servidor git, com a clau de desplegament del repositori (amb accés d'escriptura si fas push), o a un usuari que hi tingui accés.
3. Afegeix el repositori amb una **URI** SSH, per exemple `git@git.example.com:team/forms.git`, i no triïs cap credencial.

El parell de claus és a `.ssh/id_rsa` dins de [`HOME_PATH`](../customization/paths.html#env_HOME_PATH), així que mantén aquesta carpeta en
emmagatzematge persistent, o la clau canviarà quan es torni a crear el contenidor.

En un clon amb una URI `user@host:path`, AnsibleForms primer executa `ssh-keyscan` sobre l'amfitrió i n'afegeix la clau als
amfitrions coneguts. Per a altres remots, afegeix l'amfitrió a la pestanya **Amfitrions coneguts** de **Configuració > Connexions > SSH** abans del
primer clonatge.

### Ordres git personalitzades

Les ordres de clonatge, pull i push es poden substituir, per exemple per afegir-hi opcions de git, amb tres opcions.

| Opció | Per defecte | Què hi afegeix AnsibleForms |
|---|---|---|
| [`GIT_CLONE_COMMAND`](../customization/configuration.html#env_GIT_CLONE_COMMAND) | `git clone` | `-b <branch>`, `--verbose`, l'URI i el nom |
| [`GIT_PULL_COMMAND`](../customization/configuration.html#env_GIT_PULL_COMMAND) | `git pull` | `--verbose` |
| [`GIT_PUSH_COMMAND`](../customization/configuration.html#env_GIT_PUSH_COMMAND) | `git push` | `-u origin HEAD` |

A partir de la 7.3.0, aquestes ordres s'executen sense shell: les cometes funcionen, però un operador de shell com ara `;`, `|`, `&&` o `>` es rebutja.
