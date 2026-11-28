---
layout: default
title: Kubernetes
parent: RTE Runner
grand_parent: RTE
nav_order: 2
---

# The RTE Runner on Kubernetes
{: .no_toc }

Run the Runner in a cluster, each job in a pod of its own
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

## How it runs

On Kubernetes each job is a pod in the Runner's namespace, or in the one `RTE_NAMESPACE` names.

The Runner makes the job's pod through the Kubernetes API, writes the job on the pod's stdin, and reads the job's lines from its log.
An init container copies the Runner's binary from its own image (`RTE_RUNNER_IMAGE`, by default the Runner's image of its own version),
and the job's container, of `RTE_IMAGE`, runs it. In a pod the Runner picks the `kubernetes` engine without `RTE_ENGINE`.

The Helm chart does not run the RTE Runner yet: apply its Role with `kubectl` and run its pod yourself, as below.

---

## The Role

The Runner's service account needs a Role on the pods of its jobs' namespace.

| Resource | Verbs | What for |
|---|---|---|
| `pods` | create, get, list, patch, delete | Make a job's pod, follow it, stop it (its deadline lowered), remove it |
| `pods/log` | get | Read the job's lines |
| `pods/attach` | create, get | Write the job on the pod's stdin |

[deploy/kubernetes-rbac.yaml](https://github.com/ansibleforms/runner/blob/main/deploy/kubernetes-rbac.yaml) makes the service
account `af-runner`, that Role and its binding. Apply it in the namespace of the Runner and its jobs' pods:

```bash
kubectl apply -n <namespace> \
  -f https://raw.githubusercontent.com/ansibleforms/runner/main/deploy/kubernetes-rbac.yaml
```

---

## The Runner's pod

Run the Runner's pod with `serviceAccountName: af-runner`, its token in a secret and its state on a volume.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: af-runner
spec:
  replicas: 1
  selector:
    matchLabels: { app: af-runner }
  template:
    metadata:
      labels: { app: af-runner }
    spec:
      serviceAccountName: af-runner
      securityContext: { fsGroup: 1000 }   # the Runner's user, uid 1000, writes the volume
      containers:
        - name: runner
          image: ghcr.io/ansibleforms/ansibleforms-rte-runner:7
          env:
            - { name: RTE_MODE, value: outbound }
            - { name: CONTROLLER_URL, value: https://forms.example.com }
            - { name: RTE_NAME, value: runner-1 }
            - name: RTE_TOKEN
              valueFrom: { secretKeyRef: { name: af-runner, key: token } }
          ports:
            - containerPort: 8000
          livenessProbe:
            httpGet: { path: /live, port: 8000 }
          readinessProbe:
            httpGet: { path: /ready, port: 8000 }
          volumeMounts:
            - { name: state, mountPath: /app/dist/persistent }
      volumes:
        - name: state
          persistentVolumeClaim: { claimName: af-runner }
```

The claim `af-runner` is yours to make. The volume holds its spool and its files cache, so a restarted Runner finds its jobs' pods and reads on where it stopped.
Private images take `RTE_IMAGE_PULL_SECRETS`, the names of the jobs' image pull secrets separated by commas.
