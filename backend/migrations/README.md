# SQL Migration Notes

Use `make new-migration m="add_feature"` to scaffold a new file in this directory. Each SQL file must be **idempotent**.

```sql
-- Add a column only if it does not exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Create an enum if it is missing and extend it safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin','user');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel='manager' AND enumtypid = 'user_role'::regtype
  ) THEN
    ALTER TYPE user_role ADD VALUE 'manager';
  END IF;
END$$;
```
