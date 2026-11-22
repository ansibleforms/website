---
layout: default
title: Kubernetes
parent: Config seed
nav_order: 4
translated_from: faae2b35e3b483f560c320f8999ed5b6d1029aea
---

# Kubernetes
{: .no_toc }

Wdrażanie AnsibleForms z ConfigMap i Secrets
{: .fs-6 .fw-300 }

---

Zamontuj seed z `ConfigMap`, a jego sekrety z `Secret`:

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
> **Jeden pod, z nieustawionym `AF_ROLE`.** Ten pod uruchamia aplikację WWW i worker w jednym procesie. Harmonogramy, nocna
> kopia zapasowa i pozostała praca w tle działają tylko w procesie, który trzyma blokadę workera w bazie danych, blokada
> projektanta to tabela w bazie danych, a playbooki działają na RTE, nie w tym podzie. Mimo to zachowaj `replicas: 1` ze strategią
> `Recreate`: przy aktualizacji nowy pod czeka, aż worker załata schemat, a stary pod trzyma
> blokadę workera, dopóki się nie zatrzyma. Aby uruchomić kilka węzłów WWW, podziel je na węzły `AF_ROLE=app` i worker, jak
> opisuje strona [Skalowanie](../production/scaling.html).

`ENCRYPTION_SECRET` musi być ustawiony, zanim zostanie wprowadzone jakiekolwiek poświadczenie. Gdy poświadczenia pochodzą
z seeda, baza danych staje się w praktyce pamięcią podręczną, więc jej odtworzenie oznacza ponowne zastosowanie
seeda zamiast ręcznego wprowadzania wszystkiego od nowa.

Obie sondy nie wymagają logowania. Przy [`BASE_URL`](../customization/server.html#env_BASE_URL) ich ścieżki zaczynają się od niego, a
strona [Monitorowanie](../production/monitoring.html) opisuje, co sprawdza każda z nich.
