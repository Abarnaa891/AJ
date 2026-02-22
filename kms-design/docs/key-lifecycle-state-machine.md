# Key Lifecycle State Machine

## CryptoKeyVersion States

- `PENDING_GENERATION` (for async generation/import validation)
- `ENABLED`
- `DISABLED`
- `SCHEDULED_FOR_DESTRUCTION`
- `DESTROYED`
- `IMPORT_FAILED` (terminal for failed import attempts)

## Transition Diagram

```text
               +-----------------------+
               |   PENDING_GENERATION  |
               +-----------+-----------+
                           |
                           v
                      +----+----+
         +----------->| ENABLED |<-------------+
         |            +----+----+              |
         |                 |                   |
         | disable         | scheduleDestroy   | enable
         |                 v                   |
         |            +----+----+              |
         +------------| DISABLED|--------------+
                      +----+----+
                           |
                           | scheduleDestroy
                           v
              +------------+----------------+
              | SCHEDULED_FOR_DESTRUCTION   |
              +------------+----------------+
                           |
              retention window expires
                           v
                      +----+----+
                      |DESTROYED|
                      +---------+

IMPORT_FAILED is reachable from PENDING_GENERATION on import integrity/authentication failure.
```

## Rotation Behavior

- Manual rotation: Create new primary `ENABLED` version and atomically update key's `primary_version_id`.
- Automatic rotation:
  - Per-key schedule (`rotation_period`, `next_rotation_time`).
  - Scheduler service creates new version and updates primary.
- Previous versions remain available by policy until disabled/destroyed.

## Deletion Model

- Soft delete = `SCHEDULED_FOR_DESTRUCTION` with configurable retention (default 30 days).
- During retention, restore operation can transition to `DISABLED`.
- Final destruction is irreversible and cryptographically erases key material references.
