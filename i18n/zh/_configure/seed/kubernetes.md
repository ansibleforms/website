---
layout: default
title: Kubernetes
parent: 配置种子
nav_order: 4
translated_from: faae2b35e3b483f560c320f8999ed5b6d1029aea
---

# Kubernetes
{: .no_toc }

从 ConfigMap 和 Secret 部署 AnsibleForms
{: .fs-6 .fw-300 }

---

从 `ConfigMap` 挂载种子，从 `Secret` 挂载其密钥：

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
> **一个 pod，不设置 `AF_ROLE`。** 这个 pod 在一个进程中运行 Web 应用和 worker。调度、每晚
> 备份和其他后台工作只在持有数据库中 worker 锁的进程里运行，设计器锁
> 是一张数据库表，playbook 则在 RTE 上运行，而不是在这个 pod 中。尽管如此，仍请保持 `replicas: 1` 并使用 `Recreate`
> 策略：升级时，新 pod 会等待 worker 修补 schema，而旧 pod 在停止之前一直持有
> worker 锁。要运行多个 Web 节点，请将它们拆分为 `AF_ROLE=app` 节点和一个 worker，如
> [扩展](../production/scaling.html) 所述。

必须在输入任何凭据之前设置 `ENCRYPTION_SECRET`。一旦凭据来自
种子，数据库实际上就成了一个缓存，因此轮换它意味着重新应用
种子，而不是手动重新输入所有内容。

这两个探针都不需要登录。在 [`BASE_URL`](../customization/server.html#env_BASE_URL) 下，它们的路径以其开头，
[监控](../production/monitoring.html) 介绍了每个探针检查的内容。
