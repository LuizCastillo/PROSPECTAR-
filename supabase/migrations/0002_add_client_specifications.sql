-- Campo de personalização/requisitos que o cliente pediu para o site,
-- preenchido manualmente no formulário de cadastro de empresa (não vem de
-- nenhuma API — é texto livre digitado por quem está prospectando).
alter table companies add column client_specifications text;
comment on column companies.client_specifications is 'Personalização/requisitos que o cliente pediu para o site, preenchido manualmente.';
