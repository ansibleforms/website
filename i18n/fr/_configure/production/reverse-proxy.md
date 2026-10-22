---
layout: default
title: Reverse proxy
parent: Exploitation en production
nav_order: 1
translated_from: 13348b4571edb1aa56a0c0015a9691f81c1d412f
---

# Reverse proxy
{: .no_toc }

Publiez AnsibleForms derrière Nginx, Traefik ou Apache, à la racine ou sous un sous-chemin
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Quand en utiliser un

AnsibleForms sert l'interface, l'API REST et Swagger sur un seul port ; un reverse proxy placé devant vous permet de :

* le servir sur le port 443 avec un certificat géré par vos outils existants (ACME, une CA d'entreprise)
* partager un nom d'hôte avec d'autres applications, en publiant AnsibleForms sous un sous-chemin
* garder le port de l'application et la base de données hors du réseau public

Un proxy est facultatif : l'application peut servir HTTPS elle-même, voir [HTTPS](../security/https.html).

---

## Les paramètres qui comptent

Seuls quelques paramètres influent sur le comportement d'AnsibleForms derrière un proxy :

| Paramètre | Derrière un proxy |
|---------|----------------|
| [`PORT`](../customization/server.html#env_PORT) | Le port vers lequel le proxy transfère, `8000` par défaut. Le projet docker-compose le met à `443`. |
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` quand le proxy termine TLS et joint l'application via un réseau privé, `1` pour chiffrer aussi ce saut. |
| [`BASE_URL`](../customization/server.html#env_BASE_URL) | Le sous-chemin, par exemple `/ansibleforms`. Laissez-le à `/` quand l'application a son propre nom d'hôte. |
| [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY) | Quels proxies peuvent indiquer l'adresse du client dans `X-Forwarded-For`, généralement `1`. Voir [Adresses des clients](#client-addresses). |
| [`API_BODY_LIMIT_MB`](../customization/server.html#env_API_BODY_LIMIT_MB) | La plus grande requête JSON qu'accepte l'application, 50 Mo par défaut. Le proxy doit autoriser au moins cela. |
| [`UPLOAD_MAX_GB`](../customization/server.html#env_UPLOAD_MAX_GB) | Le plus gros fichier qu'accepte un champ de téléversement de formulaire, 10 Go par défaut. Le proxy doit l'autoriser aussi, sinon les téléversements y échouent. |
| [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE) | Le plus grand ensemble d'en-têtes de requête qu'accepte l'application, 16 Ko par défaut, depuis la 7.1.0. Voir [Taille des en-têtes de requête](#request-header-size). |
| **URL racine publique** | Dans **Système > Général**, onglet **Serveur** : l'adresse à laquelle accèdent les utilisateurs, sous-chemin compris. Elle construit les liens des mails de notification, des messages de canal et des demandes d'approbation. |

Pour Entra ID ou OIDC, inscrivez l'adresse publique comme URI de redirection, avec le sous-chemin de `BASE_URL` s'il est défini.

---

## Servir sous un sous-chemin

`BASE_URL` monte toute l'application sous le sous-chemin ; le proxy doit transférer le chemin **inchangé**.
Avec `BASE_URL=/ansibleforms` :

* l'interface, `/api/v2/...` et l'interface Swagger sont toutes servies sous `/ansibleforms/`
* le `<base href>` de l'interface est réécrit au démarrage, si bien que les ressources et les appels d'API se résolvent sous le sous-chemin
* une requête vers `/` ou vers `/ansibleforms` (sans barre oblique finale) est redirigée vers `/ansibleforms/`

Gardez le préfixe : pas de `StripPrefix` dans Traefik, pas d'URI sur `proxy_pass` dans Nginx, car l'application l'attend.

La page **Statut** montre l'URL de base en vigueur.

---

## Délais, téléversements et sortie en direct

La page des jobs et les compteurs de jobs apprennent les changements via un flux de server-sent events de longue durée,
[`/api/v2/events`](../api/events.html), maintenu ouvert par navigateur. Le flux envoie des en-têtes qui désactivent la mise en tampon du proxy
(`X-Accel-Buffering: no`) et une ligne keep-alive toutes les 15 secondes, si bien que le délai de lecture habituel de 60 secondes le garde ouvert ;
quand un proxy le ferme malgré tout, le navigateur se reconnecte tout seul. La sortie sous un formulaire, juste après un lancement, est
lue à la place toutes les deux secondes. Le lancement d'un job revient dès que le job est créé, si bien qu'un long playbook ne garde pas
une requête ouverte.

Les requêtes qui peuvent durer longtemps sont :

* **la sauvegarde et la restauration** depuis la page **Sauvegardes**, qui attendent la fin de la commande de dump ou de restauration, jusqu'à
  [`BACKUP_COMMAND_TIMEOUT_SECONDS`](../customization/retention.html#env_BACKUP_COMMAND_TIMEOUT_SECONDS) (3600 par défaut)
* **les gros téléversements** via un champ fichier, qui transmettent tout le fichier en une seule requête
* **les messages de chat**, quand l'[assistant de chat](../chat/) est activé, qui attendent la réponse du fournisseur du modèle

Les proxies expirent souvent au bout de 60 secondes et plafonnent les corps de requête (Nginx accepte 1 Mo par défaut). Augmentez les deux pour
les routes d'AnsibleForms, comme dans les exemples ci-dessous.

---

## WebSockets des runners

Depuis la 7.3.0, un [Runner sortant](../rte/modes.html#outbound) contacte l'application et garde un WebSocket ouvert sur
`<BASE_URL>/api/v2/rte/socket`. Le proxy doit transmettre l'upgrade, sinon le Runner ne se connecte jamais et continue de rappeler :

| Proxy | Ce dont le WebSocket a besoin |
|-------|--------------------------|
| Nginx | `proxy_http_version 1.1` et les en-têtes `Upgrade` et `Connection`, que Nginx ne transmet pas par défaut |
| Traefik | Rien : les WebSockets passent tels quels |
| Apache | `upgrade=websocket` sur la ligne `ProxyPass` (2.4.47 et ultérieures), ou `mod_proxy_wstunnel` avant |

Les deux extrémités envoient un ping toutes les 20 secondes, si bien que le délai de lecture habituel de 60 secondes garde ouvert un socket inactif.

---

## Taille des en-têtes de requête

Chaque requête porte le jeton de connexion dans son en-tête `Authorization`, à côté des cookies et des en-têtes qu'ajoute le proxy.
Le proxy comme l'application plafonnent la taille des en-têtes de requête, et refusent une requête au-delà du plafond avant
qu'AnsibleForms ne la voie, si bien que rien n'atteint le journal du serveur. Les valeurs par défaut :

| Composant | Limite | Défaut | Refusée avec |
|-----------|-------|---------|--------------|
| AnsibleForms (Node.js) | [`MAX_HTTP_HEADER_SIZE`](../customization/server.html#env_MAX_HTTP_HEADER_SIZE), tous les en-têtes ensemble | 16384 octets | 431 |
| Nginx | `large_client_header_buffers`, par champ d'en-tête | `4 8k` : 8 Ko par champ | 400 |
| Traefik | `http.maxHeaderBytes` du point d'entrée, tous les en-têtes ensemble | 1 Mo | 431 |
| HAProxy | `tune.bufsize` dans la section `global`, tout le bloc d'en-têtes, moins la réserve `tune.maxrewrite` (1024 octets) | 16384 octets : 15360 octets d'en-têtes | 400 |
| Apache | `LimitRequestFieldSize`, par champ d'en-tête | 8190 octets | 400 |

Jusqu'à la 7.0.3, le jeton de connexion portait tous les groupes d'un utilisateur en authentification unique, et pouvait dépasser ces limites, voir
[Formulaires et jobs vides après une authentification unique](../troubleshooting.html#empty-forms-and-jobs-after-a-single-sign-on-http-431).
Depuis la 7.1.0, le jeton reste petit, et les valeurs par défaut suffisent. Quand autre chose fait grossir les en-têtes, comme
les cookies d'autres applications sur le même domaine ou une passerelle d'authentification unique placée devant, augmentez les limites ensemble :

* AnsibleForms : `MAX_HTTP_HEADER_SIZE=65536`, ou avant la 7.1.0 `NODE_OPTIONS=--max-http-header-size=65536` ; les deux sont
  lues au démarrage, redémarrez donc l'application après une modification
* Nginx : `large_client_header_buffers 4 32k;` dans le bloc `http` ou `server`
* HAProxy : `tune.bufsize 65536` dans la section `global` ; chaque flux reçoit un tampon de cette taille, HAProxy conseille donc
  de diminuer le `maxconn` global du même facteur, et HTTP/2 nécessite au moins la valeur par défaut de 16384
* Apache : `LimitRequestFieldSize 32768` dans la configuration du serveur ou dans l'hôte virtuel

---

## Adresses des clients

Derrière un proxy, chaque connexion vient du proxy. Sans [`TRUST_PROXY`](../customization/server.html#env_TRUST_PROXY),
la piste d'audit enregistre l'adresse du proxy pour chaque action, et les
[limites de connexion](../security/hardening.html#sign-in-limits-and-passwords) par adresse comptent tous les clients comme une seule adresse.
`TRUST_PROXY` indique quels proxies l'application peut croire quand ils indiquent le client dans `X-Forwarded-For` :

| Valeur | Adresse du client |
|-------|----------------|
| `0` (par défaut) | L'adresse de la connexion. `X-Forwarded-For` est ignoré ; vide, `false`, `off` et `no` signifient la même chose. |
| Un nombre, par ex. `1` | Fait confiance à autant de proxies devant l'application : `1` pour un seul reverse proxy, `2` pour un répartiteur de charge devant un ingress. |
| Une liste, par ex. `10.0.0.5,172.16.0.0/12` | Fait confiance aux proxies situés à ces adresses et plages CIDR. Les préréglages `loopback`, `linklocal` et `uniquelocal` sont aussi acceptés. |
| `true` | Fait confiance à chaque saut : l'adresse la plus à gauche de `X-Forwarded-For` est utilisée. |

L'application parcourt `X-Forwarded-For` depuis la droite, saute les proxies de confiance, et prend la première adresse qui n'en
fait pas partie. Utilisez le nombre exact de proxies, ou leurs adresses :

* `X-Forwarded-For` est un simple en-tête de requête que n'importe quel client peut envoyer. Un nombre trop élevé, ou `true`, permet à un
  client de choisir l'adresse qu'enregistre la piste d'audit. `true` n'est sûr que lorsque l'application n'est joignable qu'à travers
  le proxy, et le serveur journalise un avertissement `[SECURITY]` au démarrage quand il est défini.
* Le proxy doit ajouter l'adresse depuis laquelle il a reçu la connexion, comme le font les exemples ci-dessous
  (`$proxy_add_x_forwarded_for` dans Nginx ; Traefik et Apache `mod_proxy` l'ajoutent par défaut).
* Une valeur invalide est refusée sur la page de paramètres ; définie dans l'environnement, elle est journalisée comme une erreur au démarrage et
  aucun proxy n'est considéré de confiance. Une modification enregistrée sur la page de paramètres s'applique sans redémarrage.

---

## Exemples

Chaque exemple publie AnsibleForms à `https://forms.example.com/ansibleforms/`, avec TLS terminé par le proxy et
l'application tournant avec `HTTPS=0`, `PORT=8000`, `BASE_URL=/ansibleforms` et `TRUST_PROXY=1` :

<div class="af-tabs" data-tab-group="proxy">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="nginx" aria-selected="true">Nginx</button>
<button type="button" role="tab" class="af-tab" data-tab="traefik" aria-selected="false">Traefik</button>
<button type="button" role="tab" class="af-tab" data-tab="apache" aria-selected="false">Apache</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="nginx" markdown="1">

`proxy_pass` ne nomme aucune URI, Nginx transfère donc le chemin tel qu'il est arrivé, préfixe compris. Le bloc `map` se place dans le
contexte `http` (un fichier sous `conf.d/` y est inclus), et transmet l'upgrade WebSocket des Runners :

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name forms.example.com;

    ssl_certificate     /etc/nginx/certs/forms.example.com.crt;
    ssl_certificate_key /etc/nginx/certs/forms.example.com.key;

    location /ansibleforms/ {
        proxy_pass         http://10.0.0.20:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;                         # the Runners' WebSocket
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection $connection_upgrade;

        client_max_body_size    10g;    # UPLOAD_MAX_GB
        proxy_request_buffering off;    # stream uploads instead of spooling them first
        proxy_read_timeout      3600s;  # BACKUP_COMMAND_TIMEOUT_SECONDS
        proxy_send_timeout      3600s;
    }
}
```

Sans sous-chemin, utilisez `location /` et laissez `BASE_URL` non défini.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="traefik" markdown="1" hidden>

Des labels sur le service `app` du projet docker-compose, avec Traefik sur le même réseau Docker. Le service
ne publie aucun port propre, Traefik le joint sur le réseau :

```yaml
  app:
    image: ghcr.io/ansibleforms/ansibleforms:7
    environment:
      - HTTPS=0
      - PORT=8000
      - BASE_URL=/ansibleforms
      - TRUST_PROXY=1                 # Traefik is the one proxy in front
    labels:
      - traefik.enable=true
      - traefik.http.routers.ansibleforms.rule=Host(`forms.example.com`) && PathPrefix(`/ansibleforms`)
      - traefik.http.routers.ansibleforms.entrypoints=websecure
      - traefik.http.routers.ansibleforms.tls=true
      - traefik.http.routers.ansibleforms.tls.certresolver=letsencrypt
      - traefik.http.services.ansibleforms.loadbalancer.server.port=8000
```

Il n'y a volontairement pas de middleware `StripPrefix`. Traefik définit lui-même les en-têtes `X-Forwarded-*` et ne plafonne pas
la taille du corps, mais vérifiez les `respondingTimeouts` du point d'entrée quand les sauvegardes ou les téléversements durent plus longtemps que son
délai de lecture. Sans sous-chemin, ne gardez que la partie `Host(...)` de la règle.

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="apache" markdown="1" hidden>

Nécessite `mod_proxy`, `mod_proxy_http`, `mod_headers`, `mod_ssl`, et Apache 2.4.47 ou ultérieur pour le `upgrade=websocket` des Runners.
Les deux côtés de `ProxyPass` portent le préfixe :

```apache
<VirtualHost *:443>
    ServerName forms.example.com

    SSLEngine on
    SSLCertificateFile    /etc/pki/tls/certs/forms.example.com.crt
    SSLCertificateKeyFile /etc/pki/tls/private/forms.example.com.key

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"

    ProxyPass        /ansibleforms/ http://10.0.0.20:8000/ansibleforms/ timeout=3600 upgrade=websocket
    ProxyPassReverse /ansibleforms/ http://10.0.0.20:8000/ansibleforms/

    # no body cap here : UPLOAD_MAX_GB and API_BODY_LIMIT_MB apply in the application
    LimitRequestBody 0
</VirtualHost>
```

Sans sous-chemin, faites pointer `/` vers `http://10.0.0.20:8000/` et laissez `BASE_URL` non défini.

</div>
</div>

Pour garder chiffré le saut entre le proxy et l'application, exécutez l'application avec `HTTPS=1`, pointez le proxy vers
`https://`, et donnez à l'application un certificat auquel le proxy fait confiance, voir [HTTPS](../security/https.html).
