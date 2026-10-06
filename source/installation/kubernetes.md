---
layout: default
title: Kubernetes
parent: Installation
nav_order: 3
---

# Kubernetes
{: .no_toc }

Install AnsibleForms and its MySQL database with the Helm chart
{: .fs-6 .fw-300 }

---

AnsibleForms has a Helm chart that deploys AnsibleForms and its MySQL database. Add the chart repository, write your values and install:

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm show values ansibleforms/ansibleforms > my_values.yaml
# edit my_values.yaml, then
helm upgrade --install ansibleforms ansibleforms/ansibleforms \
  --namespace ansibleforms --create-namespace \
  --values my_values.yaml
```

The same chart is in the OCI registry as `oci://ghcr.io/ansibleforms/charts/ansibleforms`. Every value is described in the chart's
[values reference](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md), and storage, ingress,
credentials and upgrades in its [README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms).
