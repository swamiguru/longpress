---
slug: why-sqlite-in-production-is-winning
title: "Why SQLite in production is winning the backend"
description: "Modern SSDs, WAL mode, and edge replication have made in-process databases faster and simpler than multi-tenant Postgres clusters."
published: 2026-09-02
category: explainer
topics: ["databases", "architecture", "platforms"]
draft: false
---

For two decades, backend orthodoxy dictated that production databases had to live on dedicated virtual machines separated from the application server by a network hop.

Today, high-throughput NVMe drives and tools like Litestream have turned that assumption on its head.

### The sub-millisecond query

When your database lives in the same process memory as your web server, the latency of every SQL query drops from 4ms over TCP down to 15 microseconds. You can execute thirty queries during a single HTTP request without any perceived rendering delay.

### The replication breakthrough

Write-ahead log (WAL) streaming allows continuous backups to S3 in near real-time with zero locking. Combined with distributed read replicas, in-process SQLite delivers resilience and speed with virtually zero maintenance burden.
