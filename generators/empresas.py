import os
from dotenv import load_dotenv
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType
from pyspark.sql.functions import regexp_replace, col

load_dotenv()

print(">> Process empresas")
print("Start Spark")

# Create session Spark
spark = SparkSession.builder \
    .appName("ProcessCNPJ") \
    .config("spark.sql.decimalOperations.showTrailingZeroes", "false") \
    .config("spark.jars", os.getenv("SPARK_JARS")) \
    .getOrCreate()

# set the path of csv files
caminho_arquivo = "../downloads/empresas"

# Define the schema based on the dictionary
schema = StructType([
    StructField("cnpj_basico", StringType(), True),
    StructField("razao_social", StringType(), True),
    StructField("natureza_juridica", StringType(), True),
    StructField("qualificacao_responsavel", StringType(), True),
    StructField("capital_social", StringType(), True),
    StructField("porte_empresa", IntegerType(), True),
    StructField("ente_federativo_responsavel", StringType(), True)
])

print("Read CSVs")

# Read CSV file into a DataFrame with custom header
df = spark.read.option("header", "false").option("encoding", "ISO-8859-1").option("delimiter", ";").option("quote", '"').option("escape", "").schema(schema).csv(caminho_arquivo)

print("Transform data")

# Adjust data formatting
df = df.withColumn("capital_social", regexp_replace(col("capital_social"), ",", "."))
df = df.withColumn("capital_social", col("capital_social").cast("double"))

print('Start export')

df.write.format("jdbc")\
    .option("url", os.getenv("DB_URL")) \
    .option("driver", "org.postgresql.Driver").option("dbtable", "empresas") \
    .option("user", os.getenv("DB_USER")).option("password", os.getenv("DB_PW")).save()

print('Table exported')

spark.stop()