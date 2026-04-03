import requests
from bs4 import BeautifulSoup
import re

url = f"https://natboard.edu.in/dnb_old_qp.php?page=110&s="
headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}
resp = requests.get(url, headers=headers)
soup = BeautifulSoup(resp.text, 'lxml')
links = soup.find_all('a', href=True)
pdf_links = [a for a in links if a['href'].lower().endswith('.pdf') and 'pdoof' in a['href'].lower()]
for a in pdf_links:
    print(a.get_text(strip=True), "->", a['href'])
