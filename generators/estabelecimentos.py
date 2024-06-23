import os
from dotenv import load_dotenv
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType
from pyspark.sql.functions import to_date, col, regexp_replace

load_dotenv()

print(">> Process estabelecimentos")
print("Start Spark")

# Create session Spark
spark = SparkSession.builder \
    .appName("ProcessEstabelecimentos") \
    .config("spark.sql.decimalOperations.showTrailingZeroes", "false") \
    .config("spark.jars", os.getenv("SPARK_JARS")) \
    .config("spark.sql.legacy.timeParserPolicy", "legacy") \
    .getOrCreate()

# set the path of csv files
caminho_arquivo = "../downloads/estabelecimentos"

# Definir o schema com base no dicionário
schema = StructType([
    StructField("cnpj_basico", StringType(), True),
    StructField("cnpj_ordem", StringType(), True),
    StructField("cnpj_dv", StringType(), True),
    StructField("identificador_matriz_filial", IntegerType(), True),
    StructField("nome_fantasia", StringType(), True),
    StructField("situacao_cadastral", IntegerType(), True),
    StructField("data_situacao_cadastral", StringType(), True),
    StructField("motivo_situacao_cadastral", StringType(), True),
    StructField("nome_cidade_exterior", StringType(), True),
    StructField("pais", StringType(), True),
    StructField("data_inicio_atividade", StringType(), True),
    StructField("cnae_fiscal_principal", StringType(), True),
    StructField("cnae_fiscal_secundaria", StringType(), True),
    StructField("tipo_logradouro", StringType(), True),
    StructField("logradouro", StringType(), True),
    StructField("numero", StringType(), True),
    StructField("complemento", StringType(), True),
    StructField("bairro", StringType(), True),
    StructField("cep", StringType(), True),
    StructField("uf", StringType(), True),
    StructField("municipio", StringType(), True),
    StructField("ddd_1", StringType(), True),
    StructField("telefone_1", StringType(), True),
    StructField("ddd_2", StringType(), True),
    StructField("telefone_2", StringType(), True),
    StructField("ddd_fax", StringType(), True),
    StructField("fax", StringType(), True),
    StructField("correio_eletronico", StringType(), True),
    StructField("situacao_especial", StringType(), True),
    StructField("data_situacao_especial", StringType(), True)
])

print("Read CSVs")

# Read CSV file into a DataFrame with custom header
df = spark.read.option("header", "false").option("encoding", "ISO-8859-1").option("delimiter", ";").option("quote", '"').option("escape", "").schema(schema).csv(caminho_arquivo)

print("Transform data")

# Adjust data formatting
df = df.withColumn("data_situacao_cadastral", to_date(df["data_situacao_cadastral"], "yyyyMMdd"))
df = df.withColumn("data_inicio_atividade", to_date(df["data_inicio_atividade"], "yyyyMMdd"))

for column_name in df.columns:
    df = df.withColumn(column_name, regexp_replace(col(column_name), "\x00", " "))

print('Start export')

df.write.format("jdbc")\
    .option("url", os.getenv("DB_URL")) \
    .option("driver", "org.postgresql.Driver").option("dbtable", "estabelecimentos") \
    .option("user", os.getenv("DB_USER")).option("password", os.getenv("DB_PW")).save()

print('Table exported')

spark.stop()