---
layout: default
title: Helm charts
permalink: /helm-charts/
nav_exclude: true
search_exclude: true
gh_edit_link: false
---

# Helm charts
{: .no_toc }

The Helm repository of AnsibleForms
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

This repository holds the chart that runs AnsibleForms and its MySQL database on Kubernetes. Each chart version
deploys one AnsibleForms release, and the same charts are pushed to the GitHub Container Registry as OCI artifacts.

---

## Add the repository

Add the chart repository and list its charts, or pull the chart straight from the OCI registry:

<div class="af-tabs" data-tab-group="helmsource">
<div class="af-tab-list" role="tablist">
<button type="button" role="tab" class="af-tab" data-tab="repo" aria-selected="true">Chart repository</button>
<button type="button" role="tab" class="af-tab" data-tab="oci" aria-selected="false">OCI registry</button>
</div>
<div class="af-tab-panel" role="tabpanel" data-tab="repo" markdown="1">

```bash
helm repo add ansibleforms https://ansibleforms.com/helm-charts/
helm repo update
helm search repo ansibleforms --versions
```

</div>
<div class="af-tab-panel" role="tabpanel" data-tab="oci" markdown="1" hidden>

No repository to add: the chart is pulled from the GitHub Container Registry.

```bash
helm pull oci://ghcr.io/ansibleforms/charts/ansibleforms
```

</div>
</div>

---

## Charts

The repository publishes one chart, with a version line for each AnsibleForms major:

| Chart          | Description                         | Source |
|----------------|-------------------------------------|--------|
| `ansibleforms` | AnsibleForms and its MySQL database | [charts/ansibleforms](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms) |

---

## Next steps

Install the chart with the Kubernetes guide, then tune it with the chart's own reference:

* **[Install on Kubernetes](../installation/kubernetes.html)** : values, storage, ingress and the first install
* **[Upgrade on Kubernetes](../upgrading/kubernetes.html)** : move to a newer chart version with your values
* **[VALUES.md](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/VALUES.md)** : every value of the chart with its default
* **[Changelog](https://github.com/ansibleforms/helm-charts/blob/main/charts/ansibleforms/CHANGELOG.md)** : what changed in each chart version
* **[index.yaml](index.yaml)** : the repository index that Helm reads
