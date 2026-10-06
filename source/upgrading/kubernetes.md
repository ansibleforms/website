---
layout: default
title: Kubernetes
parent: Upgrading
nav_order: 4
---

# Kubernetes
{: .no_toc }

Upgrade an installation made with the Helm chart
{: .fs-6 .fw-300 }

---

Refresh the chart repository and run the same `helm upgrade` you installed with, with your values file:

```bash
helm repo update
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms \
  --values my_values.yaml
```

An upgrade that changes nothing leaves the pods alone. What changes between chart versions is in the chart's
[changelog](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md), and upgrades in its
[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms).
