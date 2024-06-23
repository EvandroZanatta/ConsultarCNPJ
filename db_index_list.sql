DELETE FROM opencnpj_abr24.empresas
WHERE razao_social is null;

CREATE UNIQUE INDEX empresas_cnpj_idx
ON opencnpj_abr24.empresas (cnpj_basico);

CREATE INDEX estabelecimentos_cnpj_idx
ON opencnpj_abr24.estabelecimentos (cnpj_basico);

CREATE UNIQUE INDEX simples_cnpj_idx
ON opencnpj_abr24.simples (cnpj_basico);

CREATE INDEX socios_cnpj_idx
ON opencnpj_abr24.socios (cnpj_basico);

CREATE INDEX municipios_idx
ON opencnpj_abr24.municipios (codigo);

CREATE INDEX cnaes_idx
ON opencnpj_abr24.cnaes (codigo);