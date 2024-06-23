import os
import csv
import psycopg2
from dotenv import load_dotenv

# Define o caminho relativo para o arquivo .env
env_path = os.path.join(os.path.dirname(__file__), '..', 'generators/.env')

# Carrega variáveis de ambiente do arquivo .env especificado
load_dotenv(dotenv_path=env_path)

# SQL query que você quer executar
sql_query_base = """
    SET work_mem = '4GB';
    SET temp_buffers = '64MB';
    SET max_parallel_workers_per_gather = 4;
    
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
"""

# Caminho onde o arquivo CSV será salvo
output_csv_path = './output.csv'

# Extrai as informações de conexão do banco de dados do arquivo .env
db_host = os.getenv('APP_EXTRAS_HOST')
db_user = os.getenv('APP_EXTRAS_USER')
db_password = os.getenv('APP_EXTRAS_PW')
db_name = os.getenv('APP_EXTRAS_DB')

# Tamanho do lote
batch_size = 200000
offset = 0

print("Conectando ao banco de dados...")
# Conectar ao banco de dados
conn = psycopg2.connect(
    host=db_host,
    user=db_user,
    password=db_password,
    database=db_name
)
cur = conn.cursor()

try:
    # Abre o arquivo CSV para escrita
    with open(output_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        while True:
            # Adiciona LIMIT e OFFSET à query base
            sql_query = f"{sql_query_base} LIMIT {batch_size} OFFSET {offset}"
            
            # Execute the query
            print(f"Executando a consulta SQL com OFFSET {offset}...")
            cur.execute(sql_query)
            
            # Verifica se o cursor tem descrição
            if cur.description:
                if offset == 0:
                    # Escreve os nomes das colunas como cabeçalho do CSV na primeira iteração
                    col_names = [desc[0] for desc in cur.description]
                    writer.writerow(col_names)
                
                # Fetch e escreve as linhas do lote atual
                rows = cur.fetchall()
                if not rows:
                    break
                writer.writerows(rows)
                
                # Incrementa o offset para a próxima iteração
                offset += batch_size
            else:
                print("Nenhum dado foi retornado pela consulta.")
                break

    print("Dados exportados com sucesso!")

finally:
    # Fechar conexões
    cur.close()
    conn.close()