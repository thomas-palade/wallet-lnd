CREATE SCHEMA IF NOT EXISTS wallets;

CREATE FUNCTION update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
$$;

CREATE TABLE wallets (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  transaction_id NOT NULL TEXT[],
  coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TRIGGER wallets_updated_at_modtime BEFORE UPDATE ON "wallets" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
