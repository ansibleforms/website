---
layout: default
title: Enregistrement
parent: Runners
nav_order: 3
translated_from: 79dc369b64c0e733cc0dc8d4d863289fc64c75ab
---

# Enregistrement
{: .no_toc }

Comment un RTE demande à rejoindre et est approuvé, les jetons d'adhésion pour les installations sans intervention, et le mode base de données
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Demander à rejoindre

Depuis la 7.3.0, un RTE en mode socket (`outbound` ou `inbound`) que l'application ne connaît pas encore demande à rejoindre, et un admin l'approuve.
Il se présente avec son propre `RTE_TOKEN` et son `RTE_NAME` : un RTE sortant lors de son premier contact avec l'application, un RTE entrant lors de son unique
appel d'enregistrement. Sans jeton d'adhésion, l'application alors :

1. Stocke le `RTE_TOKEN` du RTE dans un nouvel identifiant de type RTE nommé `<name>-rte` (avec un numéro ajouté quand ce nom est pris), et
   pour un RTE entrant son adresse, `RTE_URL`
2. Ajoute un runner nommé d'après `RTE_NAME`, de type RTE, dans le mode du RTE, qui se connecte avec cet identifiant, marqué **En attente d'approbation**
   et désactivé. Sa description indique l'hôte depuis lequel il a fait la demande

Un RTE sortant reste connecté pendant qu'il attend, mais ne reçoit aucun job. L'application ne contacte pas un RTE entrant tant qu'il n'est pas approuvé. Les deux journalisent
qu'ils attendent qu'un admin les approuve dans **Connexions > Runners**, avec l'empreinte de leur jeton.

Un RTE entrant avec un `RTE_URL` en `https://` envoie aussi son certificat quand il demande à rejoindre, et l'application l'épingle : à partir de là,
l'application ne contacte ce RTE que s'il présente le même certificat, si bien qu'un certificat auto-signé fonctionne sans CA (voir [Entrant](../rte/modes.html#inbound)).

Au plus 20 RTE attendent l'approbation en même temps : les suivants sont refusés jusqu'à ce que certains soient approuvés ou refusés. Une demande que personne ne traite dans les
24 heures est supprimée par le worker, avec son identifiant.

Un RTE nommé d'après un runner que l'application connaît déjà, mais avec un autre jeton, est refusé et ne demande pas à rejoindre. Donnez-lui le jeton de ce runner,
ou supprimez le runner pour qu'il demande à rejoindre. Un [jeton d'adhésion](#join-tokens) n'aide que tant que ce runner attend encore l'approbation.

---

## Approuver un RTE

Les runners en attente d'approbation quittent la liste de **Connexions > Runners** pour un avis orange au-dessus d'elle, comme
**2 Runners attendent l'approbation**, avec une ligne par runner : son nom, son hôte, son adresse IP, son mode, son adresse et son empreinte.
La cloche de l'en-tête les compte, pour les utilisateurs qui peuvent voir les runners (voir [la cloche](../jobs/#the-jobs-page)).

Un clic sur l'avis ouvre la boîte de dialogue **Examiner l'approbation** pour chaque runner tour à tour ; un clic sur un nom n'ouvre que celui-là.
Sa page montre les mêmes informations dans un encadré jaune, **Ce RTE demande à rejoindre**. Vérifiez que c'est bien un RTE que vous avez démarré avant de l'approuver :

| Champ | Ce qu'il montre |
|---|---|
| Empreinte | Les 8 premiers chiffres hexadécimaux du SHA-256 de son `RTE_TOKEN`, sous la forme `abcd-ef12`. Le RTE la journalise à son démarrage, et l'[installeur](../installation/installer.html#a-runner) l'affiche à la fin. Elle doit être identique |
| Empreinte du certificat | Dans la boîte de dialogue, pour un RTE entrant en HTTPS : les 8 premiers chiffres hexadécimaux du SHA-256 du certificat qu'épingle l'application (ses octets DER), sous la forme `abcd-ef12`. Le RTE la journalise à son démarrage et l'[installeur](../installation/installer.html#a-runner) l'affiche à la fin. Elle doit être identique |
| Hôte | L'hôte sur lequel il tourne |
| Adresse IP | L'adresse depuis laquelle il a appelé l'application |
| Mode | Sortant ou Entrant |
| URI | L'adresse d'un RTE entrant, là où l'application le contacte |
| Version | Sa version |
| Demandé le | Quand il a demandé à rejoindre |

**Approuver** et **Refuser**, dans la boîte de dialogue ou dans l'encadré de sa page, décident :

| Action | Ce qui se passe |
|---|---|
| Approuver | Le runner est activé et reçoit des jobs dès maintenant. Il devient le runner par défaut de son type quand il n'y en a aucun |
| Refuser | Le runner est supprimé avec son identifiant, et son socket est fermé. Le RTE peut redemander à rejoindre ; il attend alors à nouveau l'approbation |

Seul un admin approuve ou refuse un RTE.

---

## Jetons d'adhésion

Un jeton d'adhésion approuve un RTE immédiatement, pour les installations sans intervention : un RTE démarré avec
[`RTE_JOIN_TOKEN`](../customization/server.html#env_RTE_JOIN_TOKEN), ou un Runner installé avec le `--join` de l'installeur, le présente une fois
et son runner est ajouté activé, sans attente. Les jetons d'adhésion n'ont pas de page dans l'interface : un admin les crée via
l'[API REST](../api/), sous `/api/v2/runner` :

| Appel | Ce qu'il fait |
|---|---|
| `POST /api/v2/runner/jointoken` | Crée un jeton d'adhésion. Le corps contient son `name`, et en option `expiresInHours` (absent : il n'expire jamais) et `maxUses` (absent : un nombre quelconque de RTE) |
| `GET /api/v2/runner/jointoken` | Liste les jetons d'adhésion, du plus récent au plus ancien, avec leurs utilisations et s'ils sont encore utilisables ; jamais les jetons eux-mêmes |
| `POST /api/v2/runner/jointoken/<id>/revoke` | Le révoque : il n'ajoute plus aucun runner, et reste dans la liste |
| `DELETE /api/v2/runner/jointoken/<id>` | Le supprime |

```bash
curl -X POST https://forms.example.com/api/v2/runner/jointoken \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{ "name": "dmz-runners", "expiresInHours": 24, "maxUses": 5 }'
```

La réponse contient le jeton, qui commence par `afj_`, cette seule fois : seul son SHA-256 est stocké. Un RTE qui le présente reçoit le même
identifiant et le même runner qu'un RTE qui [demande à rejoindre](#asking-to-join), activé, et sa description nomme le jeton d'adhésion. À partir de là, le
RTE se connecte avec son propre jeton, si bien que le jeton d'adhésion peut expirer ou être révoqué sans l'affecter. Révoquer ou supprimer un jeton d'adhésion
laisse les runners qu'il a ajoutés.

Un jeton d'adhésion ne donne jamais un nouveau jeton à un runner approuvé. Quand un runner RTE de ce nom existe déjà :

| Le runner | Ce qui se passe |
|---|---|
| Attend l'approbation | Il reçoit le nouveau jeton dans son identifiant, et attend toujours l'approbation d'un admin |
| Est approuvé | Refusé avec `409` : *runner '&lt;name&gt;' exists and is approved: a join token cannot give it a new token. Use its current RTE_TOKEN, or have an admin change the token in its credential (or remove the runner) under Connections*. Le jeton d'adhésion n'est pas consommé |
| Provient du [seed de configuration](../seed/) | Refusé : *runner '&lt;name&gt;' is managed by the config seed: its token is set there* |

Un RTE réinstallé avec un nouveau jeton se connecte donc avec le jeton de l'identifiant de son runner, ou un admin change ce jeton
dans **Connexions > Identifiants**, ou supprime le runner pour que le RTE rejoigne comme nouveau.

---

## Enregistrement en mode base de données

Un RTE en mode base de données, déprécié depuis la 7.3.0, s'enregistre lui-même par défaut, à son `RTE_URL` ou sinon à sa propre adresse et son propre port. Le
worker supprime un tel runner dès que son RTE n'a écrit aucun heartbeat pendant 10 minutes. Un runner ajouté à la main, par le seed de configuration ou par un
RTE en mode socket n'est jamais supprimé de cette façon.

[`RTE_REGISTER`](../customization/server.html#env_RTE_REGISTER), qui active ou désactive cet enregistrement, est dépréciée dans la 7.3.0 avec
le mode base de données : un RTE en mode socket demande à rejoindre, ou rejoint avec un jeton d'adhésion. Pour gérer vous-même de tels runners en attendant, démarrez le
RTE avec `RTE_REGISTER=0` et ajoutez-le ici avec le type RTE, le mode **Base de données (obsolète)**, et un identifiant RTE avec son adresse et le
même jeton. Pour le passer à un mode socket, voir [Modes](../rte/modes.html#database-deprecated).
