---
layout: default
title: Kubernetes
parent: 構成シード
nav_order: 4
translated_from: faae2b35e3b483f560c320f8999ed5b6d1029aea
---

# Kubernetes
{: .no_toc }

ConfigMap と Secret から AnsibleForms を構築します
{: .fs-6 .fw-300 }

---

シードを `ConfigMap` から、そのシークレットを `Secret` からマウントします。

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
> **`AF_ROLE` を設定しない一つの Pod。** この Pod は、Web アプリとワーカーを一つのプロセスで実行します。スケジュール、夜間
> バックアップ、その他のバックグラウンドの処理は、データベースでワーカーのロックを持つプロセスだけで実行され、デザイナーの
> ロックはデータベースのテーブルで、プレイブックはこの Pod ではなく RTE で実行されます。それでも `replicas: 1` と `Recreate`
> 戦略はそのままにしてください。アップグレード時、新しい Pod はワーカーがスキーマにパッチを当てるのを待ち、古い Pod は停止するまで
> ワーカーのロックを保持します。複数の Web ノードを実行するには、 [スケーリング](../production/scaling.html) で説明しているように、
> `AF_ROLE=app` のノードとワーカーに分割してください。

`ENCRYPTION_SECRET` は、認証情報を入力する前に設定する必要があります。認証情報がシードから
来るようになると、データベースは実質的にキャッシュになるので、ローテーションは手作業ですべてを再入力するのではなく、シードを
再適用することになります。

二つのプローブにはログインは不要です。 [`BASE_URL`](../customization/server.html#env_BASE_URL) の下では、そのパスはその値で始まります。
それぞれが何を確認するかは [監視](../production/monitoring.html) で説明しています。
