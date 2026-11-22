---
layout: default
title: Kubernetes
parent: Llavor de configuració
nav_order: 4
translated_from: faae2b35e3b483f560c320f8999ed5b6d1029aea
---

# Kubernetes
{: .no_toc }

Aprovisionar AnsibleForms des d'un ConfigMap i Secrets
{: .fs-6 .fw-300 }

---

Munta la llavor des d'un `ConfigMap` i els seus secrets des d'un `Secret`:

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
> **Un sol pod, amb `AF_ROLE` sense definir.** Aquest pod executa l'aplicació web i el worker en un sol procés. Les programacions, la còpia de seguretat
> nocturna i l'altra feina en segon pla només s'executen al procés que té el bloqueig del worker a la base de dades, el bloqueig del dissenyador
> és una taula de la base de dades, i els playbooks s'executen en un RTE, no en aquest pod. Tot i així, mantén `replicas: 1` amb l'estratègia `Recreate`:
> en una actualització el pod nou espera que el worker apliqui els pedaços a l'esquema, i el pod antic conserva el
> bloqueig del worker fins que s'atura. Per executar diversos nodes web, divideix-los en nodes `AF_ROLE=app` i un worker, tal com
> descriu [Escalat](../production/scaling.html).

`ENCRYPTION_SECRET` s'ha de definir abans d'introduir cap credencial. Un cop les credencials vénen
de la llavor, la base de dades és de fet una memòria cau, de manera que rotar-la vol dir tornar a aplicar la
llavor en lloc de tornar a introduir-ho tot a mà.

Les dues sondes no necessiten iniciar sessió. Sota un [`BASE_URL`](../customization/server.html#env_BASE_URL) els seus camins comencen per aquest valor, i
[Supervisió](../production/monitoring.html) descriu què comprova cadascuna.

