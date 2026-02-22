# IAM Model Design

## Resource Hierarchy and Inheritance

```text
Project
 └── Location
      └── KeyRing
           └── CryptoKey
                └── CryptoKeyVersion
```

Policies can be bound at:
- Project
- KeyRing
- CryptoKey

Effective permission resolution for a request to `CryptoKeyVersion`:
1. Collect bindings from Project, KeyRing, and CryptoKey.
2. Apply condition filters (time, source IP, principal attributes, workload identity).
3. Evaluate explicit deny rules first.
4. Evaluate allow rules.
5. Default deny.

## Predefined Roles

- `roles/kms.admin`
  - Full lifecycle (create/import/rotate/disable/enable/scheduleDestroy/restore)
  - IAM policy management for KMS resources
- `roles/kms.cryptoKeyEncrypter`
  - `kms.cryptoKeys.encrypt`
  - `kms.cryptoKeyVersions.useToEncrypt`
- `roles/kms.cryptoKeyDecrypter`
  - `kms.cryptoKeys.decrypt`
  - `kms.cryptoKeyVersions.useToDecrypt`
- `roles/kms.cryptoKeySigner`
  - `kms.cryptoKeys.sign`
  - `kms.cryptoKeys.verify`
  - `kms.cryptoKeys.macSign`
  - `kms.cryptoKeys.macVerify`
- `roles/kms.viewer`
  - Read-only metadata, key states, audit visibility

## Permission Catalog (Representative)

- `kms.projects.get`
- `kms.locations.list`
- `kms.keyRings.create|get|list|setIamPolicy|getIamPolicy`
- `kms.cryptoKeys.create|get|list|update|setIamPolicy|getIamPolicy|encrypt|decrypt|sign|verify|macSign|macVerify|getPublicKey`
- `kms.cryptoKeyVersions.create|get|list|destroy|restore|enable|disable|useToEncrypt|useToDecrypt`
- `kms.random.generate`
- `kms.auditLogs.export`

## Policy Document Example

```json
{
  "resource": "projects/p1/locations/us-central1/keyRings/ring-a/cryptoKeys/key-payments",
  "bindings": [
    {
      "role": "roles/kms.cryptoKeyEncrypter",
      "members": ["serviceAccount:payments-api@p1.iam"],
      "condition": {
        "title": "only-prod",
        "expression": "resource.name.startsWith('projects/p1') && request.time < timestamp('2030-01-01T00:00:00Z')"
      }
    }
  ],
  "deny": [
    {
      "permissions": ["kms.cryptoKeys.decrypt"],
      "members": ["principalSet://iam/external-contractors"]
    }
  ],
  "etag": "BwWWja0YfJA="
}
```
