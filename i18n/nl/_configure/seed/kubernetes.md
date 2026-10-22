---
layout: default
title: Kubernetes
parent: Configuratie-seed
nav_order: 4
translated_from: faae2b35e3b483f560c320f8999ed5b6d1029aea
---

# Kubernetes
{: .no_toc }

AnsibleForms uitrollen vanuit een ConfigMap en Secrets
{: .fs-6 .fw-300 }

---

Koppel de seed vanuit een `ConfigMap` en de geheimen ervan vanuit een `Secret`:

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
> **Eén pod, met `AF_ROLE` niet ingesteld.** Deze pod draait de webapp en de worker in één proces. De planningen, de nachtelijke
> back-up en het andere achtergrondwerk draaien alleen in het proces dat de workervergrendeling in de database vasthoudt, de designer-vergrendeling
> is een databasetabel, en de playbooks draaien op een RTE, niet in deze pod. Houd toch `replicas: 1` met de strategie
> `Recreate` aan: bij een upgrade wacht de nieuwe pod tot de worker het schema heeft gepatcht, en de oude pod houdt de
> workervergrendeling vast tot hij stopt. Om meerdere webnodes te draaien, splits je ze op in `AF_ROLE=app`-nodes en een worker, zoals
> [Schalen](../production/scaling.html) beschrijft.

`ENCRYPTION_SECRET` moet zijn ingesteld voordat er een referentie wordt ingevoerd. Zodra referenties uit de seed
komen, is de database in feite een cache, dus roteren betekent de seed opnieuw toepassen
in plaats van alles met de hand opnieuw in te voeren.

De twee probes vereisen geen aanmelding. Onder een [`BASE_URL`](../customization/server.html#env_BASE_URL) beginnen hun paden daarmee, en
[Monitoring](../production/monitoring.html) beschrijft wat elke probe controleert.
