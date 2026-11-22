---
layout: default
title: Kubernetes
parent: Semilla de configuración
nav_order: 4
translated_from: faae2b35e3b483f560c320f8999ed5b6d1029aea
---

# Kubernetes
{: .no_toc }

Aprovisiona AnsibleForms desde un ConfigMap y Secrets
{: .fs-6 .fw-300 }

---

Monta la semilla desde un `ConfigMap` y sus secretos desde un `Secret`:

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
> **Un pod, sin `AF_ROLE`.** Este pod ejecuta la aplicación web y el worker en un solo proceso. Las programaciones, la copia de seguridad
> nocturna y el resto del trabajo en segundo plano se ejecutan solo en el proceso que tiene el bloqueo del worker en la base de datos, el bloqueo
> del diseñador es una tabla de la base de datos, y los playbooks se ejecutan en un RTE, no en este pod. Aun así, mantén `replicas: 1` con la estrategia
> `Recreate`: en una actualización el pod nuevo espera a que el worker parchee el esquema, y el pod antiguo conserva el
> bloqueo del worker hasta que se detiene. Para ejecutar varios nodos web, sepáralos en nodos `AF_ROLE=app` y un worker, como
> describe [Escalado](../production/scaling.html).

`ENCRYPTION_SECRET` debe estar definido antes de introducir ninguna credencial. Una vez que las credenciales vienen
de la semilla, la base de datos es en la práctica una caché, así que rotarla significa volver a aplicar la
semilla en lugar de volver a introducirlo todo a mano.

Las dos sondas no necesitan inicio de sesión. Con un [`BASE_URL`](../customization/server.html#env_BASE_URL) sus rutas empiezan por él, y
[Monitorización](../production/monitoring.html) describe qué comprueba cada una.
