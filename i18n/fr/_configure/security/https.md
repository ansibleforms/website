---
layout: default
title: HTTPS
parent: Sécurité
nav_order: 2
redirect_from:
  - /production/https.html
translated_from: 2d8601a66c8f664c1cf762e7829e2c1251248a19
---

# HTTPS
{: .no_toc }

Servez HTTPS depuis l'application elle-même, et remplacez le certificat d'exemple
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## Où se termine TLS

TLS peut se terminer à l'un de trois endroits, et seul le premier fait intervenir les paramètres de cette page :

* **dans AnsibleForms**, avec `HTTPS=1` : HTTPS sur [`PORT`](../customization/server.html#env_PORT) avec les fichiers ci-dessous, comme le fait docker-compose sur le 443.
* **dans un reverse proxy**, avec `HTTPS=0` derrière lui : voir [Reverse proxy](../production/reverse-proxy.html).
* **dans un ingress Kubernetes** : voir l'onglet Ingress de [Kubernetes](../installation/kubernetes.html#7-open-ansibleforms) et le README du chart.

Vous pouvez combiner le premier avec les deux autres pour chiffrer aussi le saut entre le proxy et l'application.

---

## Les paramètres

Trois variables pilotent HTTPS dans l'application :

| Variable | Défaut | Signification |
|----------|---------|---------|
| [`HTTPS`](../customization/server.html#env_HTTPS) | `0` | `1` sert HTTPS, `0` du HTTP simple |
| [`HTTPS_KEY`](../customization/server.html#env_HTTPS_KEY) | `%PERSISTENT_FOLDER%/certificates/key.pem` | La clé privée, en PEM |
| [`HTTPS_CERT`](../customization/server.html#env_HTTPS_CERT) | `%PERSISTENT_FOLDER%/certificates/cert.pem` | Le certificat du serveur, en PEM |

Dans l'image du conteneur, le dossier persistant est `/app/dist/persistent`, les fichiers par défaut sont donc
`/app/dist/persistent/certificates/key.pem` et `cert.pem`. Avec le projet docker-compose, c'est `data/certificates/`
sur l'hôte.

---

## Le certificat d'exemple

Quand `HTTPS=1` et que l'un des fichiers manque au démarrage, AnsibleForms journalise `httpsKey or httpsCert not found, copying from
templates` et copie une clé et un certificat d'exemple depuis l'image vers les chemins configurés. Si cette copie échoue,
l'application s'arrête.

Ce certificat est auto-signé pour `CN=ansibleforms`, et il est **identique sur chaque installation** : sa clé privée
est livrée dans l'image publique. Il convient pour un premier aperçu, mais les navigateurs le signalent et n'importe qui peut déchiffrer le trafic
qu'il protège. Remplacez-le avant que l'instance ne contienne de vrais identifiants.

---

## Remplacer le certificat

Utilisez un certificat émis pour le nom d'hôte que saisissent les utilisateurs, par votre CA ou un client ACME, au format PEM.
Le fichier du certificat peut contenir la chaîne complète : le certificat du serveur d'abord, puis les intermédiaires.

1. Copiez les fichiers dans le dossier persistant, ou à tout endroit que l'application peut lire :

   ```bash
   sudo cp forms.example.com.key data/certificates/key.pem
   sudo cp forms.example.com.fullchain.crt data/certificates/cert.pem
   sudo chmod 600 data/certificates/key.pem
   ```

2. S'ils se trouvent ailleurs, mettez dans `HTTPS_KEY` et `HTTPS_CERT` leurs chemins **à l'intérieur du conteneur**.

3. Redémarrez l'application, qui lit les deux fichiers au démarrage.

Pour un certificat auto-signé rapide à vous (une instance de test, ou le saut derrière un proxy), `openssl` en crée un :

```bash
openssl req -x509 -newkey rsa:4096 -nodes -days 825 \
  -keyout data/certificates/key.pem -out data/certificates/cert.pem \
  -subj "/CN=forms.example.com" -addext "subjectAltName=DNS:forms.example.com"
```

---

## Renouveler sans redémarrage

Modifier `HTTPS_KEY` ou `HTTPS_CERT` sur les pages de paramètres recharge la clé et le certificat dans le serveur en cours d'exécution.
Les nouvelles connexions reçoivent le nouveau certificat, celles déjà ouvertes gardent l'ancien. Si les nouveaux fichiers ne peuvent pas être lus ou ne forment pas une
paire valide, le certificat actuel reste en place et un avertissement est journalisé.

Cela ne fonctionne que lorsque les pages de paramètres peuvent écrire l'environnement ([`ALLOW_ENV_EDIT`](../customization/configuration.html#env_ALLOW_ENV_EDIT)
vaut `1`) et que la variable n'est pas définie dans l'environnement réel. Quand un renouvellement remplace les fichiers aux mêmes
chemins, redémarrez l'application.
