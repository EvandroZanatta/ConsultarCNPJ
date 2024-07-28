const { performance } = require('perf_hooks');
const dbschema = process.env.DB_SCHEMA

module.exports = class BasicCNPJ {
    async getCnpj(cnpj, req) {

        cnpj = cnpj.replace(/\D/g, '');

        if (cnpj.length != 14) {
            return false;
        }

        let nCompany = cnpj.substring(0, 8);
        let nEstabe = cnpj.substring(8, 12);
        let nDV = cnpj.substring(12, 14);

        const queryEstabe = `
        SELECT 
            e.identificador_matriz_filial,
            CASE
                WHEN e.identificador_matriz_filial = '1' THEN 'MATRIZ'
                WHEN e.identificador_matriz_filial = '2' THEN 'FILIAL'
                ELSE 'Valor não encontrado'
            END as identificador_matriz_filial_descricao,
            e.nome_fantasia,
            e.situacao_cadastral,
            CASE
                WHEN e.situacao_cadastral = '1' THEN 'NULA'
                WHEN e.situacao_cadastral = '2' THEN 'ATIVA'
                WHEN e.situacao_cadastral = '3' THEN 'SUSPENSA'
                WHEN e.situacao_cadastral = '4' THEN 'INAPTA'
                WHEN e.situacao_cadastral = '8' THEN 'BAIXADA'
                ELSE 'Valor não encontrado'
            END as situacao_cadastral_descricao,
            e.data_situacao_cadastral,
            e.motivo_situacao_cadastral,
            mot.descricao as motivo_situacao_cadastral_descricao,
            e.nome_cidade_exterior,
            e.pais,
            pai.descricao as pais_descricao,
            e.data_inicio_atividade,
            e.cnae_fiscal_principal,
            cna.descricao as cnae_fiscal_principal_descricao,
            e.cnae_fiscal_secundaria,
            '' as cnae_fiscal_secundaria_lista,
            e.tipo_logradouro,
            e.logradouro,
            e.numero,
            regexp_replace(e.complemento, ' {2,}', ' ', 'g') as complemento,
            e.bairro,
            e.cep,
            e.uf,
            e.municipio,
            mun.descricao as municipio_descricao,
            e.ddd_1,
            e.telefone_1,
            e.ddd_2,
            e.telefone_2,
            e.ddd_fax,
            e.fax,
            LOWER(e.correio_eletronico) as correio_eletronico,
            e.situacao_especial,
            REPLACE(e.data_situacao_especial, '\"', '') as data_situacao_especial

        FROM ${dbschema}.estabelecimentos as e

        JOIN ${dbschema}.cnaes as cna 
            ON e.cnae_fiscal_principal = cna.codigo

        JOIN ${dbschema}.municipios as mun 
            ON e.municipio = mun.codigo

        JOIN ${dbschema}.motivos as mot 
            ON e.motivo_situacao_cadastral = mot.codigo

        LEFT JOIN ${dbschema}.paises as pai 
            ON e.pais = pai.codigo

        WHERE 
            cnpj_basico = \$1
            AND
            cnpj_ordem = \$2
            AND
            cnpj_dv = \$3
        LIMIT 1
    `;

        const querySecCnaes = `
        WITH base AS (
            SELECT 
                distinct(unnest(string_to_array(cnae_fiscal_secundaria, ','))) AS cnae
            FROM 
                `+ dbschema + `.estabelecimentos 
            WHERE cnpj_basico = \$1
        )
                    
        SELECT 
            cna.codigo as cnae_fiscal_secundaria, 
            cna.descricao as cnae_fiscal_secundaria_descricao
        FROM base
        LEFT JOIN `+ dbschema + `.cnaes as cna
            ON base.cnae = cna.codigo
    `;

        const queryEmpresas = `
        SELECT 
            e.razao_social,
            e.natureza_juridica,
            n.descricao as natureza_descricao,
            e.qualificacao_responsavel,
            q.descricao as qualificacao_descricao,
            e.capital_social,
            e.porte_empresa,
            CASE
                WHEN e.porte_empresa = 0 THEN 'NÃO INFORMADO'
                WHEN e.porte_empresa = 1 THEN 'MICRO EMPRESA'
                WHEN e.porte_empresa = 3 THEN 'EMPRESA DE PEQUENO PORTE'
                WHEN e.porte_empresa = 5 THEN 'DEMAIS'
                ELSE 'Descrição não encontrada'
            END as porte_empresa_descricao,
            REPLACE(e.ente_federativo_responsavel, '\"', '') as ente_federativo_responsavel

        FROM `+ dbschema + `.empresas as e
        INNER JOIN `+ dbschema + `.naturezas as n
            ON e.natureza_juridica = n.codigo
        LEFT JOIN `+ dbschema + `.qualificacoes as q
            ON e.qualificacao_responsavel = q.codigo
        WHERE cnpj_basico = $1 LIMIT 1`

        const querySocios = `
        SELECT 
            s.identificador_socio,
            CASE
                WHEN s.identificador_socio = 1 THEN 'PESSOA JURÍDICA'
                WHEN s.identificador_socio = 2 THEN 'PESSOA FÍSICA'
                WHEN s.identificador_socio = 3 THEN 'ESTRANGEIRO'
                ELSE 'Erro'
            END as identificador_socio_descricao,
            s.nome_socio_razao_social,
            s.cpf_cnpj_socio,
            s.qualificacao_socio,
            q1.descricao as qualificacao_socio_descricao,
            TO_CHAR(s.data_entrada_sociedade, 'YYYY-MM-DD') as data_entrada_sociedade,
            CASE
                WHEN s.pais is null THEN null
                ELSE s.pais
            END as pais,
            CASE
                WHEN s.pais is null THEN null
                ELSE p.descricao
            END as pais_descricao,
            s.representante_legal,
            s.nome_do_representante,
            s.qualificacao_representante_legal,
            q2.descricao as qualificacao_representante_legal_descricao,
            s.faixa_etaria,
            CASE 
                WHEN s.faixa_etaria = 1 THEN '0-12 anos'
                WHEN s.faixa_etaria = 2 THEN '13-20 anos'
                WHEN s.faixa_etaria = 3 THEN '21-30 anos'
                WHEN s.faixa_etaria = 4 THEN '31-40 anos'
                WHEN s.faixa_etaria = 5 THEN '41-50 anos'
                WHEN s.faixa_etaria = 6 THEN '51-60 anos'
                WHEN s.faixa_etaria = 7 THEN '61-70 anos'
                WHEN s.faixa_etaria = 8 THEN '71-80 anos'
                WHEN s.faixa_etaria = 9 THEN 'maiores de 80 anos'
                WHEN s.faixa_etaria = 0 THEN 'Não se aplica'
                ELSE 'Outro'
            END AS faixa_etaria_descricao
        FROM `+ dbschema + `.socios as s
        INNER JOIN `+ dbschema + `.qualificacoes as q1
            ON s.qualificacao_socio = q1.codigo
        LEFT JOIN `+ dbschema + `.qualificacoes as q2
            ON s.qualificacao_representante_legal = q2.codigo
        LEFT JOIN `+ dbschema + `.paises as p
            ON s.pais = p.codigo
        WHERE cnpj_basico = $1`

        const querySimples = `
        SELECT 
            opcao_pelo_simples,
            TO_CHAR(data_opcao_simples, 'YYYY-MM-DD') as data_opcao_simples,
            TO_CHAR(data_exclusao_simples, 'YYYY-MM-DD') as data_exclusao_simples,
            opcao_mei,
            TO_CHAR(data_opcao_mei, 'YYYY-MM-DD') as data_opcao_mei,
            TO_CHAR(data_exclusao_mei, 'YYYY-MM-DD') as data_exclusao_mei
        FROM `+ dbschema + `.simples WHERE cnpj_basico = $1 LIMIT 1`

        try {
            const startTime = performance.now();
            const resultEstabe = await req.pool.query(queryEstabe, [nCompany, nEstabe, nDV]);

            let ips = (
                req.headers['cf-connecting-ip'] ||
                req.headers['x-real-ip'] ||
                req.headers['x-forwarded-for'] ||
                req.socket.remoteAddress ||
                req.connection.remoteAddress || ''
            ).split(',');

            if (resultEstabe.rows.length === 0) {
                return false;

                // const endTime = performance.now();
                // const timeQuery = endTime - startTime;

                // const query = `
                // INSERT INTO public.events (cnpj, time_ms, ip, status)
                // VALUES ($1, $2, $3, $4);
                // `;

                // req.pool.query(query, [cnpj, timeQuery.toFixed(2), ips[0], 0]);
            } else {

                const resultEmpresas = await req.pool.query(queryEmpresas, [nCompany]);
                const resultSocios = await req.pool.query(querySocios, [nCompany]);
                const resultSimples = await req.pool.query(querySimples, [nCompany]);
                const resultSecCnaes = await req.pool.query(querySecCnaes, [nCompany]);

                const endTime = performance.now();
                const timeQuery = endTime - startTime;

                let resultJson = {
                    'q_cnpj': nCompany + nEstabe + nDV,
                    'q_time_ms': timeQuery.toFixed(2),
                    'q_ip': ips[0],
                    'empresa': resultEmpresas.rows,
                    'estabelecimento': resultEstabe.rows,
                    'socios': resultSocios.rows,
                    'simples': resultSimples.rows,
                }

                resultJson['estabelecimento']['cnae_fiscal_secundaria_lista'] = {};
                resultJson['estabelecimento'][0]['cnae_fiscal_secundaria_lista'] = resultSecCnaes.rows;

                const query = `
                INSERT INTO public.events (cnpj, time_ms, ip)
                VALUES ($1, $2, $3);
                `;

                req.pool.query(query, [cnpj, timeQuery.toFixed(0), ips[0]]);

                return resultJson;
            }
        } catch (error) {
            console.error('Erro ao consultar o banco de dados', error);
            return 500;
        }
    }
}