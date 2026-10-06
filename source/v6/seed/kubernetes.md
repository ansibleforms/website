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
  # AnsibleForms is single-instance. See the warning below.
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels: { app: ansibleforms }
  template:
    metadata:
      labels: { app: ansibleforms }
    spec:
      # long enough for the longest playbook run to finish at shutdown
      terminationGracePeriodSeconds: 120
      containers:
        - name: ansibleforms
          image: ghcr.io/ansibleforms/ansibleforms:6
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
            httpGet: { path: /api/v2/version, port: 8000 }
          readinessProbe:
            # queries the database, so it also covers "the schema is there"
            httpGet: { path: /api/v2/schema, port: 8000 }
      volumes:
        - name: seed
          configMap:
            name: ansibleforms-seed
        - name: persistent
          persistentVolumeClaim:
            claimName: ansibleforms-persistent
```

{: .warning }
> **AnsibleForms is single-instance.** Scheduled tasks run in-process, the designer lock is
> a file, and playbooks run as child processes of the pod. Two overlapping pods mean two
> nightly backups, a lock file on a volume the second pod may not be able to mount, and
> running jobs killed at cutover. Use `replicas: 1` with the `Recreate` strategy — a
> rolling update is not safe here.

`ENCRYPTION_SECRET` must be set before any credential is entered. Once credentials come
from the seed, the database is effectively a cache, so rotating it means re-applying the
seed rather than re-entering everything by hand.
