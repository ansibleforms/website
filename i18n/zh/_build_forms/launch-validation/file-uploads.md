---
layout: default
title: 文件上传
parent: 运行验证
nav_order: 4
translated_from: 5756d90b62ddac51996f0bdb05befd6bf5589e0d
---

# 文件上传
{: .no_toc }

文件字段如何验证
{: .fs-6 .fw-300 }

1. TOC
{:toc}

---

文件字段从不相信运行请求中关于文件的描述。运行验证会检查文件本身，即服务器
磁盘上的文件。

---

## 上传的文件如何到达作业

文件在表单运行之前上传，分两步：

1. 浏览器通过 `POST /api/v2/job/upload` 上传文件。服务器把它保存在 `UPLOAD_PATH` 中。
2. 运行请求在其 `files` 部分描述这次上传。

随后运行验证会将该描述与磁盘进行核对：

* 文件必须存在于 `UPLOAD_PATH` 之内。
* 其路径和大小从磁盘读取，从不取自请求。

---

## 接受什么

文件字段只从经过核实的上传中获取值。其他一切都会被丢弃：

* 调用方写入 `rawFormData` 或 `extravars` 的路径会被忽略。
* 没有真实上传的必填文件字段会报告为 `missing` 。

---

## 文件规则

文件字段的规则会针对真实上传的文件检查，大小以字节为单位：

```yaml
- name: firmware
  type: file
  required: true
  maxSize: 104857600        # 100 MB
  regex:
    expression: '\.bin$'
    description: Upload a .bin firmware image
```

`minSize` 和 `maxSize` 比较文件的真实大小， `regex` 比较其文件名。与任何表单无关，
`UPLOAD_MAX_GB` 限制单次上传的大小（默认 10 GB）。
