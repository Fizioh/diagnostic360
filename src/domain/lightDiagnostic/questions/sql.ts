import { mcq } from "./helpers";

export const sqlQuestions = [
  mcq(
    "ld-sql-01",
    "sql-postgresql",
    "SQL / PostgreSQL",
    "medium",
    {
      language: "sql",
      filename: "explain_orders.sql",
      lines: [
        "EXPLAIN (ANALYZE, BUFFERS)",
        "SELECT * FROM orders",
        "WHERE status = 'pending'",
        "  AND created_at > NOW() - INTERVAL '7 days';",
        "",
        "-- idx_orders_status_created exists",
        "-- Seq Scan on orders  (rows≈2% of table after bulk load)",
      ],
      highlightLines: [2, 3, 4, 7],
    },
    "The planner chooses a seq scan despite a usable index after a bulk load — first action?",
    [
      "Rebuild the index concurrently so the planner treats it as fresh without touching table statistics",
      "Run ANALYZE on the table and revisit whether the planner cost estimates match current data distribution",
      "Set enable_seqscan off globally so every query on that table must use the existing btree index path",
      "Raise shared_buffers and work_mem together so sequential scans become cheaper than index lookups",
    ],
    1,
    "Stale stats mislead cost estimates; ANALYZE refreshes distribution info.",
    ["query planner", "ANALYZE", "indexes"],
  ),
  mcq(
    "ld-sql-02",
    "sql-postgresql",
    "SQL / PostgreSQL",
    "hard",
    {
      language: "sql",
      filename: "book_slot.sql",
      lines: [
        "BEGIN ISOLATION LEVEL SERIALIZABLE;",
        "INSERT INTO bookings (slot_id, user_id)",
        "VALUES ($1, $2);",
        "COMMIT;",
        "",
        "-- concurrent sessions on same slot_id sometimes fail with 40001",
      ],
      highlightLines: [1, 2, 3, 6],
    },
    "Concurrent bookings on the same slot hit serialization failures — best handling?",
    [
      "Retry the transaction with bounded backoff when serialization failure occurs and keep transactions short",
      "Lower isolation to read committed and rely on application checks alone without database conflict detection",
      "Remove the unique or exclusion constraints so concurrent writers never surface serialization failures",
      "Take an exclusive lock on the entire bookings table for every insert to serialize all writers globally",
    ],
    0,
    "Serializable + retry is valid; also consider explicit exclusion constraints and shorter transactions.",
    ["isolation levels", "retries", "booking"],
  ),
];
