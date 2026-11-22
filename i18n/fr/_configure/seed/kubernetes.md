---
layout: default
title: Kubernetes
parent: Seed de configuration
nav_order: 4
translated_from: faae2b35e3b483f560c320f8999ed5b6d1029aea
---

# Kubernetes
{: .no_toc }

Provisionnez AnsibleForms depuis une ConfigMap et des Secrets
{: .fs-6 .fw-300 }

---

Montez le seed depuis une `ConfigMap` et ses secrets depuis un `Secret` :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ansibleforms
spec:
  # AF_ROLE unset : the web app and the worker in one pod. See the note below.
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels: { app: ansibleforms }
  template:
    metadata:
      labels: { app: ansibleforms }
    spec:
      terminationGracePeriodSeconds: 120
      containers:
        - name: ansibleforms
          image: ghcr.io/ansibleforms/ansibleforms:7
          env:
            - name: CONFIG_SEED_PATH
              value: /seed/seed.yaml
            # a ConfigMap edited in git is remounted here within about a minute and
            # applied from there, so changing the seed does not roll the pod
            - name: CONFIG_SEED_RELOAD_SECONDS
              value: "60"
            # the environment is declared here, so the settings pages must not
            # write persistent/.env behind this manifest's back
            - name: ALLOW_ENV_EDIT
              value: "0"
          envFrom:
            - secretRef:
                name: ansibleforms-seed-secrets   # SEED_AWX_TOKEN, SEED_LDAP_PW, SEED_CHAT_API_KEY, ...
            - secretRef:
                name: ansibleforms-secrets        # DB_PASSWORD, ENCRYPTION_SECRET, ...
          volumeMounts:
            - name: seed
              mountPath: /seed
              readOnly: true
            - name: persistent
              mountPath: /app/dist/persistent
          livenessProbe:
            # answers as long as the process runs, without asking the database
            httpGet: { path: /api/v2/live, port: 8000 }
          readinessProbe:
            # 503 until the database answers and the schema is complete, and while stopping
            httpGet: { path: /api/v2/ready, port: 8000 }
      volumes:
        - name: seed
          configMap:
            name: ansibleforms-seed
        - name: persistent
          persistentVolumeClaim:
            claimName: ansibleforms-persistent
```

{: .note }
> **Un seul pod, avec `AF_ROLE` non défini.** Ce pod exécute l'application web et le worker dans un seul processus. Les planifications, la sauvegarde
> nocturne et les autres travaux en arrière-plan ne s'exécutent que dans le processus qui détient le verrou du worker dans la base de données, le verrou du
> concepteur est une table de la base de données, et les playbooks s'exécutent sur un RTE, pas dans ce pod. Gardez malgré tout `replicas: 1` avec la stratégie
> `Recreate` : lors d'une mise à jour, le nouveau pod attend que le worker patche le schéma, et l'ancien pod détient le
> verrou du worker jusqu'à son arrêt. Pour exécuter plusieurs nœuds web, répartissez-les en nœuds `AF_ROLE=app` et un worker, comme
> le décrit [Mise à l'échelle](../production/scaling.html).

`ENCRYPTION_SECRET` doit être défini avant la saisie du moindre identifiant. Une fois que les identifiants viennent
du seed, la base de données n'est en pratique qu'un cache, si bien que la renouveler revient à réappliquer le
seed plutôt qu'à tout ressaisir à la main.

Les deux sondes ne nécessitent aucune connexion. Sous un [`BASE_URL`](../customization/server.html#env_BASE_URL), leurs chemins commencent par lui, et
[Supervision](../production/monitoring.html) décrit ce que vérifie chacune.
