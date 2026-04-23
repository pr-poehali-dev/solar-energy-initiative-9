CREATE TABLE IF NOT EXISTS t_p32278697_solar_energy_initiat.support_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES t_p32278697_solar_energy_initiat.support_tickets(id),
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO t_p32278697_solar_energy_initiat.support_messages (ticket_id, sender, text, created_at)
SELECT id, 'user', message, created_at
FROM t_p32278697_solar_energy_initiat.support_tickets;

INSERT INTO t_p32278697_solar_energy_initiat.support_messages (ticket_id, sender, text, created_at)
SELECT id, 'admin', admin_reply, replied_at
FROM t_p32278697_solar_energy_initiat.support_tickets
WHERE admin_reply IS NOT NULL;
