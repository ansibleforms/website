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

From Runner 7.9.0 on, the jobs' pods meet the restricted Pod Security Standard: they run as uid and gid 1000, as non-root, with the
`RuntimeDefault` seccomp profile, no privilege escalation and every capability dropped. A namespace that enforces it takes them.

---

## With Helm

The AnsibleForms chart runs the Runner in its [runner mode](../../installation/kubernetes.html#a-runner-on-kubernetes), with `runner.podPerJob.enabled`.

```bash
helm install runner1 ansibleforms/ansibleforms \
  --namespace runners --create-namespace \
  --set runner.enabled=true \
  --set runner.appUrl=https://forms.example.com \
  --set runner.joinToken=afj_... \
  --set runner.podPerJob.enabled=true
```

| Value | What it does |
|---|---|
| `runner.podPerJob.enabled` | Runs the RTE Runner instead of the Node RTE, each job in a pod of its own |
| `runner.podPerJob.image` | The Runner's image, `ghcr.io/ansibleforms/ansibleforms-rte-runner` by default, at the app's version |
| `containers.rte.image` | The image the jobs' pods run, the Runner's `RTE_IMAGE` |

The chart adds a ServiceAccount, `<release>-rte`, unless `containers.server.serviceAccountName` names one, with the Role and
RoleBinding below. The jobs' pods take the release's `imagePullSecrets`. The chart's
[README](https://github.com/ansibleforms/helm-charts/tree/main/charts/ansibleforms#installing-a-runner-on-its-own) has the rest.

---

## The Role

Without Helm, apply the Role yourself: the Runner's service account needs it on the pods of its jobs' namespace.

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

Without Helm, run the Runner's pod with `serviceAccountName: af-runner`, its token in a secret and its state on a volume.

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
