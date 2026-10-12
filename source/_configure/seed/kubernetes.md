---
layout: default
title: Kubernetes
parent: Config seed
nav_order: 4
---

# Kubernetes
{: .no_toc }

Provision AnsibleForms from a ConfigMap and Secrets
{: .fs-6 .fw-300 }

---

Mount the seed from a `ConfigMap` and its secrets from a `Secret`:

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
> **One pod, with `AF_ROLE` unset.** This pod runs the web app and the worker in one process. The schedules, the nightly
> backup and the other background work run only in the process that holds the worker lock in the database, the designer
> lock is a database table, and the playbooks run on an RTE, not in this pod. Keep `replicas: 1` with the `Recreate`
> strategy all the same: on an upgrade the new pod waits for the worker to patch the schema, and the old pod holds the
> worker lock until it stops. To run several web nodes, split them into `AF_ROLE=app` nodes and a worker, as
> [Scaling](../production/scaling.html) describes.

`ENCRYPTION_SECRET` must be set before any credential is entered. Once credentials come
from the seed, the database is effectively a cache, so rotating it means re-applying the
seed rather than re-entering everything by hand.

The two probes need no login. Under a [`BASE_URL`](../customization/server.html#env_BASE_URL) their paths start with it, and
[Monitoring](../production/monitoring.html) describes what each one checks.
