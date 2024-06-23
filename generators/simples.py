import os
from dotenv import load_dotenv
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType
from pyspark.sql.functions import to_date

load_dotenv()

print(">> Process simples")
print("Start Spark")

# Create session Spark
spark = SparkSession.builder \
    .appName("ProcessSocios") \
    .config("spark.sql.decimalOperations.showTrailingZeroes", "false") \
    .config("spark.jars", os.getenv("SPARK_JARS")) \
    .getOrCreate()

# set the path of csv files
caminho_arquivo = "../downloads/simples"

# Definir o schema com base no dicionário
schema = StructType([
    StructField("cnpj_basico", StringType(), True),
    StructField("opcao_pelo_simples", StringType(), True),
    StructField("data_opcao_simples", StringType(), True),
    StructField("data_exclusao_simples", StringType(), True),
    StructField("opcao_mei", StringType(), True),
    StructField("data_opcao_mei", StringType(), True),
    StructField("data_exclusao_mei", StringType(), True),
])

print("Read CSVs")

# Read CSV file into a DataFrame with custom header
df = spark.read.option("header", "false").option("encoding", "ISO-8859-1").option("delimiter", ";").option("quote", '"').option("escape", "").schema(schema).csv(caminho_arquivo)

print("Transform data")

# Adjust data formatting
df = df.withColumn("data_opcao_simples", to_date(df["data_opcao_simples"], "yyyyMMdd"))
df = df.withColumn("data_exclusao_simples", to_date(df["data_exclusao_simples"], "yyyyMMdd"))
df = df.withColumn("data_opcao_mei", to_date(df["data_opcao_mei"], "yyyyMMdd"))
df = df.withColumn("data_exclusao_mei", to_date(df["data_exclusao_mei"], "yyyyMMdd"))

print('Start export')

df.write.format("jdbc")\
    .option("url", os.getenv("DB_URL")) \
    .option("driver", "org.postgresql.Driver").option("dbtable", "simples") \
    .option("user", os.getenv("DB_USER")).option("password", os.getenv("DB_PW")).save()

print('Table exported')

spark.stop()