import os
import subprocess
from bs4 import BeautifulSoup
import requests

# URL of the HTML page
url = "https://dadosabertos.rfb.gov.br/CNPJ/"

# Function to download a file using wget
def download_with_wget(url, save_path):
    subprocess.run(["wget", url, "-O", save_path])

# Send a GET request to the URL and parse the HTML
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

# Find all the links in the HTML page
links = soup.find_all("a")

# Create a directory to save the downloaded files (if it doesn't exist)
if not os.path.exists("downloads"):
    os.makedirs("downloads")

# Loop through the links and download the .zip files
for link in links:
    href = link.get("href")
    if href.endswith(".zip"):
        file_url = url + href
        file_name = os.path.join("downloads", href)
        print(f"Downloading {href}...")
        download_with_wget(file_url, file_name)

print("Download completed!")