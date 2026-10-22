---
layout: default
title: Kubernetes
parent: Config seed
nav_order: 4
translated_from: faae2b35e3b483f560c320f8999ed5b6d1029aea
---

# Kubernetes
{: .no_toc }

Fare il provisioning di AnsibleForms da una ConfigMap e da dei Secret
{: .fs-6 .fw-300 }

---

Monta il seed da una `ConfigMap` e i suoi segreti da un `Secret`:

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
> **Un solo pod, con `AF_ROLE` non impostato.** Questo pod esegue l'app web e il worker in un solo processo. Le pianificazioni, il backup
> notturno e il resto del lavoro in background girano solo nel processo che detiene il lock del worker nel database, il blocco
> del designer è una tabella del database, e i playbook girano su un RTE, non in questo pod. Mantieni comunque `replicas: 1` con la strategia
> `Recreate`: in un aggiornamento il nuovo pod attende che il worker applichi le patch allo schema, e il vecchio pod detiene il
> lock del worker finché non si ferma. Per eseguire più nodi web, suddividili in nodi `AF_ROLE=app` e un worker, come
> descrive [Scalabilità](../production/scaling.html).

`ENCRYPTION_SECRET` deve essere impostato prima di inserire qualsiasi credenziale. Una volta che le credenziali arrivano
dal seed, il database è di fatto una cache, quindi ruotarlo significa riapplicare il
seed invece di reinserire tutto a mano.

Le due probe non richiedono accesso. Sotto un [`BASE_URL`](../customization/server.html#env_BASE_URL) i loro percorsi iniziano con esso, e
[Monitoraggio](../production/monitoring.html) descrive cosa verifica ciascuna.
