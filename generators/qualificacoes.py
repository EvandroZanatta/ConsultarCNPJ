import os
from dotenv import load_dotenv
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType
from pyspark.sql.functions import to_date

load_dotenv()

print(">> Process qualificacoes")
print("Start Spark")

# Create session Spark
spark = SparkSession.builder \
    .appName("ProcessSocios") \
    .config("spark.sql.decimalOperations.showTrailingZeroes", "false") \
    .config("spark.jars", os.getenv("SPARK_JARS")) \
    .getOrCreate()

# Definir o caminho do arquivo
caminho_arquivo = "../downloads/qualificacoes"

# Definir o schema com base no dicionário
schema = StructType([
    StructField("codigo", StringType(), True),
    StructField("descricao", StringType(), True),
])

print("Read CSVs")

# Read CSV file into a DataFrame with custom header
df = spark.read.option("header", "false").option("encoding", "ISO-8859-1").option("delimiter", ";").option("quote", '"').option("escape", "").schema(schema).csv(caminho_arquivo)

print('Start export')

df.write.format("jdbc")\
    .option("url", os.getenv("DB_URL")) \
    .option("driver", "org.postgresql.Driver").option("dbtable", "qualificacoes") \
    .option("user", os.getenv("DB_USER")).option("password", os.getenv("DB_PW")).save()

print('Table exported')

spark.stop()