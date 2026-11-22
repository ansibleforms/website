---
layout: default
title: Kubernetes
parent: Config-Seed
nav_order: 4
translated_from: faae2b35e3b483f560c320f8999ed5b6d1029aea
---

# Kubernetes
{: .no_toc }

AnsibleForms aus einer ConfigMap und Secrets bereitstellen
{: .fs-6 .fw-300 }

---

Hängen Sie den Seed aus einer `ConfigMap` und seine Geheimnisse aus einem `Secret` ein:

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
> **Ein Pod, mit nicht gesetztem `AF_ROLE`.** Dieser Pod führt die Web-App und den Worker in einem Prozess aus. Die Zeitpläne, das nächtliche
> Backup und die übrige Hintergrundarbeit laufen nur in dem Prozess, der die Worker-Sperre in der Datenbank hält, die
> Designer-Sperre ist eine Datenbanktabelle, und die Playbooks laufen auf einer RTE, nicht in diesem Pod. Behalten Sie trotzdem `replicas: 1` mit der
> Strategie `Recreate`: Bei einem Upgrade wartet der neue Pod, bis der Worker das Schema gepatcht hat, und der alte Pod hält die
> Worker-Sperre, bis er anhält. Um mehrere Web-Knoten zu betreiben, teilen Sie sie in `AF_ROLE=app`-Knoten und einen Worker auf, wie
> [Skalierung](../production/scaling.html) beschreibt.

`ENCRYPTION_SECRET` muss gesetzt sein, bevor Anmeldedaten eingegeben werden. Sobald die Anmeldedaten
aus dem Seed kommen, ist die Datenbank im Grunde ein Cache, sodass ihr Austausch bedeutet, den Seed erneut
anzuwenden, statt alles von Hand neu einzugeben.

Die beiden Probes brauchen keine Anmeldung. Unter einer [`BASE_URL`](../customization/server.html#env_BASE_URL) beginnen ihre Pfade mit ihr, und
[Überwachung](../production/monitoring.html) beschreibt, was jede prüft.
