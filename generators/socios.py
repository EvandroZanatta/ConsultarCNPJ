import os
from dotenv import load_dotenv
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType
from pyspark.sql.functions import to_date

load_dotenv()

print(">> Process socios")
print("Start Spark")

# Create session Spark
spark = SparkSession.builder \
    .appName("ProcessSocios") \
    .config("spark.sql.decimalOperations.showTrailingZeroes", "false") \
    .config("spark.jars", os.getenv("SPARK_JARS")) \
    .getOrCreate()

# set the path of csv files
caminho_arquivo = "../downloads/socios"

# Definir o schema com base no dicionário
schema = StructType([
    StructField("cnpj_basico", StringType(), nullable=True),
    StructField("identificador_socio", IntegerType(), nullable=True),
    StructField("nome_socio_razao_social", StringType(), nullable=True),
    StructField("cpf_cnpj_socio", StringType(), nullable=True),
    StructField("qualificacao_socio", StringType(), nullable=True),
    StructField("data_entrada_sociedade", StringType(), nullable=True),
    StructField("pais", StringType(), nullable=True),
    StructField("representante_legal", StringType(), nullable=True),
    StructField("nome_do_representante", StringType(), nullable=True),
    StructField("qualificacao_representante_legal", StringType(), nullable=True),
    StructField("faixa_etaria", IntegerType(), nullable=True)
])

print("Read CSVs")

# Read CSV file into a DataFrame with custom header
df = spark.read.option("header", "false").option("encoding", "ISO-8859-1").option("delimiter", ";").option("quote", '"').option("escape", "").schema(schema).csv(caminho_arquivo)

print("Transform data")

# Adjust data formatting
df = df.withColumn("data_entrada_sociedade", to_date(df["data_entrada_sociedade"], "yyyyMMdd"))

print('Start export')

df.write.format("jdbc")\
    .option("url", os.getenv("DB_URL")) \
    .option("driver", "org.postgresql.Driver").option("dbtable", "socios") \
    .option("user", os.getenv("DB_USER")).option("password", os.getenv("DB_PW")).save()

print('Table exported')

spark.stop()