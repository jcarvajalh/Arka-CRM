-- ============================================================
-- Arka CRM — Migración: dos canales de contacto, mensaje enviado,
-- ciudad y estados "Contactado/Respondió vía <canal>".
-- Ejecutar UNA vez en el SQL Editor de Supabase.
-- ============================================================

-- 1) Columnas nuevas
alter table clients add column if not exists city text;
alter table clients add column if not exists contact_message text;
alter table clients add column if not exists contact_channel_2 text;
alter table clients add column if not exists contact_detail_2 text;
alter table clients add column if not exists contact_message_2 text;

alter table clients drop constraint if exists clients_contact_channel_2_check;
alter table clients add constraint clients_contact_channel_2_check
  check (contact_channel_2 in ('WhatsApp', 'Instagram', 'Correo'));

-- 2) Nuevos estados
alter table clients drop constraint if exists clients_status_check;

-- Los clientes que estaban en "Contactado"/"Respondió" pasan al estado
-- "vía <su canal de contacto>" (WhatsApp si no tenían canal).
update clients
set status = 'Contactado vía ' || coalesce(contact_channel, 'WhatsApp')
where status = 'Contactado';

update clients
set status = 'Respondió vía ' || coalesce(contact_channel, 'WhatsApp')
where status = 'Respondió';

alter table clients add constraint clients_status_check check (status in (
  'Prospecto',
  'Contactado vía WhatsApp', 'Contactado vía Instagram', 'Contactado vía Correo',
  'Respondió vía WhatsApp', 'Respondió vía Instagram', 'Respondió vía Correo',
  'Reunión', 'Propuesta enviada', 'Negociación', 'Ganado', 'Finalizado', 'Perdido'
));

-- 3) Ciudad de los prospectos importados del Excel (Prioridad 1).
--    Solo afecta a los que existan y no tengan ciudad.
update clients c
set city = v.city
from (values
  ('Dental Studio by Viviana Navarro', 'Bogotá (+ Ibagué)'),
  ('Dra. Karen Pulido', 'Bogotá (2 sedes)'),
  ('Dr. Elkin Jiménez - Odontología digital', 'Bogotá'),
  ('Dra. Adriana Medina Molara', 'Bogotá (Chapinero)'),
  ('Dra. Fainory Vargas - Odontología Estética', 'Bogotá (+ Villavicencio)'),
  ('Dr. Juan Carlos Contreras', 'Bogotá'),
  ('Dr. Juan Jaramillo | Smile design', 'Medellín (El Poblado)'),
  ('Diva Sánchez Odontología', 'Barranquilla'),
  ('Dra. Vanesa Gutiérrez', 'Bucaramanga'),
  ('Dra. María Paula Correa - Especialista en Sonrisas', 'Bucaramanga')
) as v(client_name, city)
where c.client_name = v.client_name and c.city is null;
