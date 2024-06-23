SELECT 
	CONCAT(est.cnpj_basico, est.cnpj_ordem, est.cnpj_dv) AS cnpj,
	emp.razao_social,
	emp.capital_social,
	est.nome_fantasia,
	est.situacao_cadastral,
	est.cnae_fiscal_principal,
	est.uf,
	est.municipio
FROM opencnpj_abr24.estabelecimentos as est
INNER JOIN opencnpj_abr24.empresas AS emp
	ON est.cnpj_basico = emp.cnpj_basico
order by emp.cnpj_basico asc
limit 10
