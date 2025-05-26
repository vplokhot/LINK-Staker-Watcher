CREATE TABLE IF NOT EXISTS Events (
    transaction_hash VARCHAR(255) PRIMARY KEY,
    block_number BIGINT NOT NULL,
    actor VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL,
    event_name VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_block_number ON Events (block_number);
CREATE INDEX IF NOT EXISTS idx_events_actor ON Events (actor);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON Events (event_name);

CREATE TABLE IF NOT EXISTS Transfers (
    transaction_hash VARCHAR(255) PRIMARY KEY,
    block_number BIGINT NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transfers_block_number ON Transfers (block_number);
CREATE INDEX IF NOT EXISTS idx_transfers_from_address ON Transfers (from_address);
CREATE INDEX IF NOT EXISTS idx_transfers_to_address ON Transfers (to_address);

CREATE TABLE IF NOT EXISTS sync_status (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    last_processed_block BIGINT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL PRIVILEGES ON DATABASE chainlink_event_store TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;