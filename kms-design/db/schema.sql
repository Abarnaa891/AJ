-- KMS metadata schema (PostgreSQL)

CREATE TYPE protection_level AS ENUM ('SOFTWARE', 'HSM', 'EXTERNAL');
CREATE TYPE crypto_key_purpose AS ENUM ('ENCRYPT_DECRYPT', 'ASYMMETRIC_SIGN', 'ASYMMETRIC_DECRYPT', 'MAC');
CREATE TYPE algorithm AS ENUM (
  'AES_256_GCM',
  'RSA_SIGN_PKCS1_2048_SHA256',
  'RSA_SIGN_PKCS1_3072_SHA256',
  'RSA_SIGN_PKCS1_4096_SHA512',
  'RSA_DECRYPT_OAEP_2048_SHA256',
  'RSA_DECRYPT_OAEP_3072_SHA256',
  'RSA_DECRYPT_OAEP_4096_SHA512',
  'EC_SIGN_P256_SHA256',
  'EC_SIGN_P384_SHA384',
  'HMAC_SHA256',
  'HMAC_SHA384',
  'HMAC_SHA512'
);
CREATE TYPE key_version_state AS ENUM (
  'PENDING_GENERATION',
  'ENABLED',
  'DISABLED',
  'SCHEDULED_FOR_DESTRUCTION',
  'DESTROYED',
  'IMPORT_FAILED'
);

CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  project_id VARCHAR(128) UNIQUE NOT NULL,
  display_name VARCHAR(256) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE locations (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  location_id VARCHAR(64) NOT NULL,
  is_multi_region BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, location_id)
);

CREATE TABLE key_rings (
  id BIGSERIAL PRIMARY KEY,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  key_ring_id VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(location_id, key_ring_id)
);

CREATE TABLE crypto_keys (
  id BIGSERIAL PRIMARY KEY,
  key_ring_id BIGINT NOT NULL REFERENCES key_rings(id) ON DELETE CASCADE,
  crypto_key_id VARCHAR(128) NOT NULL,
  purpose crypto_key_purpose NOT NULL,
  protection protection_level NOT NULL,
  rotation_period_seconds BIGINT,
  next_rotation_at TIMESTAMPTZ,
  destroy_scheduled_duration_seconds BIGINT NOT NULL DEFAULT 2592000,
  primary_version_id BIGINT,
  labels JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(key_ring_id, crypto_key_id)
);

CREATE TABLE crypto_key_versions (
  id BIGSERIAL PRIMARY KEY,
  crypto_key_id BIGINT NOT NULL REFERENCES crypto_keys(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  state key_version_state NOT NULL,
  algorithm algorithm NOT NULL,
  protection protection_level NOT NULL,
  import_job_ref VARCHAR(256),
  external_key_uri VARCHAR(512),
  hsm_slot_ref VARCHAR(256),
  generation_time TIMESTAMPTZ,
  destroy_time TIMESTAMPTZ,
  destroyed_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(crypto_key_id, version_number)
);

ALTER TABLE crypto_keys
  ADD CONSTRAINT fk_primary_version
  FOREIGN KEY (primary_version_id) REFERENCES crypto_key_versions(id);

CREATE TABLE iam_policies (
  id BIGSERIAL PRIMARY KEY,
  resource_type VARCHAR(32) NOT NULL CHECK (resource_type IN ('project', 'key_ring', 'crypto_key')),
  resource_id BIGINT NOT NULL,
  etag VARCHAR(64) NOT NULL,
  policy_doc JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(resource_type, resource_id)
);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor VARCHAR(256) NOT NULL,
  action VARCHAR(128) NOT NULL,
  resource_name VARCHAR(512) NOT NULL,
  request_id VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL,
  metadata JSONB,
  prev_hash CHAR(64),
  event_hash CHAR(64) NOT NULL
);

CREATE INDEX idx_ckv_state ON crypto_key_versions(state);
CREATE INDEX idx_audit_event_time ON audit_logs(event_time);
CREATE INDEX idx_audit_resource ON audit_logs(resource_name);
