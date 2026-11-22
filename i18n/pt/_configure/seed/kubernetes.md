---
layout: default
title: Kubernetes
parent: Config seed
nav_order: 4
translated_from: faae2b35e3b483f560c320f8999ed5b6d1029aea
---

# Kubernetes
{: .no_toc }

Aprovisionar o AnsibleForms a partir de um ConfigMap e de Secrets
{: .fs-6 .fw-300 }

---

Monte o seed a partir de um `ConfigMap` e os seus segredos a partir de um `Secret`:

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
> **Um pod, com `AF_ROLE` por definir.** Este pod corre a aplicação web e o worker num só processo. Os agendamentos, a cópia de segurança
> noturna e o resto do trabalho em segundo plano só correm no processo que detém o bloqueio do worker na base de dados, o bloqueio do designer
> é uma tabela da base de dados, e os playbooks correm num RTE, não neste pod. Mantenha mesmo assim `replicas: 1` com a estratégia
> `Recreate`: numa atualização, o pod novo espera que o worker atualize o esquema, e o pod antigo mantém o
> bloqueio do worker até parar. Para correr vários nós web, divida-os em nós `AF_ROLE=app` e um worker, como descreve
> [Escalabilidade](../production/scaling.html).

`ENCRYPTION_SECRET` tem de estar definida antes de qualquer credencial ser introduzida. Quando as credenciais vêm
do seed, a base de dados passa na prática a ser uma cache, por isso rodá-la significa voltar a aplicar o
seed em vez de voltar a introduzir tudo à mão.

As duas sondas não precisam de início de sessão. Com um [`BASE_URL`](../customization/server.html#env_BASE_URL), os seus caminhos começam por ele, e
[Monitorização](../production/monitoring.html) descreve o que cada uma verifica.
