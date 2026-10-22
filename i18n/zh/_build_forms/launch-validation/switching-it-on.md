---
layout: default
title: 启用
parent: 运行验证
nav_order: 1
translated_from: 2e5de5654a03389c7c8a7c05179e9dd79456b50b
---

# 启用
{: .no_toc }

为整个实例启用，或为单个表单启用
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

运行验证有两个设置。**以二者中更严格的为准。**

---

## 针对整个实例： `LAUNCH_VALIDATION`

环境变量 [`LAUNCH_VALIDATION`](../customization/features.html#env_LAUNCH_VALIDATION) 适用于所有表单：

- `off` ：不在服务器端检查：作业使用浏览器或调用方发送的 extravars。
- `log` ：检查每次运行；本应拒绝的内容会以警告写入日志，
  运行仍照常进行。
- `enforce` （默认）：拒绝无效的运行，有效的运行则使用
  服务器构建的 extravars。

值为空或无法识别时同样视为 `enforce` 。修改无需重启即可生效。

{: .warning }
> **升级会改变行为。** 没有设置 `LAUNCH_VALIDATION` 的实例在升级后会对
> 每次运行进行强制验证。调用 `POST /api/v2/job` 时不带 `rawFormData` ，
> 或者所带的值违反表单规则的脚本，会以 `422` 被拒绝。请在升级前设置
> `LAUNCH_VALIDATION=log` 以查看哪些会被拒绝，或者设置 `off` 保留
> 旧的行为（参见[推广上线](rolling-it-out.html)）。

---

## 针对单个表单： `launchValidation`

表单可以设置自己的级别：

```yaml
- name: Create VM
  type: ansible
  roles:
    - default
  playbook: vm.yml
  launchValidation: enforce   # off | log | enforce
  fields:
    - name: vm_name
      type: text
      required: true
```

在以 `off` 或 `log` 运行的实例上，对于您知道会通过 REST 运行的表单，请使用此设置：
该表单会被强制验证，而实例的其余部分则不会。也可以在设计器的
表单设置中设置它。

**表单只能比实例更严格，永远不能更宽松。** 当 `LAUNCH_VALIDATION`
为 `enforce` 时，表单的 `launchValidation: off` 不起作用：表单不能推翻
运维人员的决定。

向导表单也使用它：向导的运行会逐个步骤检查，每个步骤都根据其自己的
子表单检查（参见[向导表单](rolling-it-out.html#wizard-forms)）。
