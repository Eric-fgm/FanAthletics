import sys
import requests
import time
from bs4 import BeautifulSoup
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

from datetime import timedelta
from copy import deepcopy
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_athletes_from_domtel_results_site(url):

    response = requests.get(url, verify=False)
    response.encoding = "utf-8"
    soup = BeautifulSoup(response.text, 'html.parser')

    list = soup.find('table', class_='Listy')
    trows = list.find_all('tr')

    final_data = {}

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(athlete_worker, str(trow).strip(), final_data) for trow in trows[1:]]

        for future in as_completed(futures):
            future.result()

    return json.dumps(final_data)

def athlete_worker(trow, final_data):
    soup = BeautifulSoup(trow, "html.parser")
    tds = soup.find_all('td')
    # Numer startowy
    number = tds[2].text.strip()

    # Zdjęcie
    photo = None
    img = tds[3].find('img')
    if img:
        photo = img['src']

    # Data urodzenia
    birthdate = tds[5].text.strip()
    a_s = tds[4].find_all('a')
    data = {}
    if len(a_s) > 1:
        # Jeśli jest sztafeta, to pobieramy tylko dane z domtela
        for idx, a in enumerate(a_s):
            if a is not None:
                # Pobieramy dane z domtela (życiówki i rekordy sezonu)
                profile_data = get_data_from_domtel_profile(a['href'])
                data[a.text.strip()] = {"profile_data": profile_data}
    elif a_s:
        # Jeśli nie-sztafeta to jeszcze zdjęcie i data urodzenia
        profile_data = get_data_from_domtel_profile(a_s[0]['href'])
        data = {"photo": photo, "birthdate": birthdate, "profile_data": profile_data}
    final_data[number] = data

def get_data_from_domtel_profile(url):
    
    #driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    response = requests.get(url, verify=False)
    soup = BeautifulSoup(response.text, 'html.parser')

    data = {}

    data['pbs'] = {}

    # Życiówki
    pbs_table = None
    fonts = soup.find_all('font')
    for font in fonts:
        if 'OUTDOOR' in font.text.strip():
            pbs_table = font.parent.parent.parent.parent.parent.parent.parent
            break
    trs = pbs_table.find_all('tr')
    for tr in trs[3:]:
        tds = tr.find_all('td')
        data['pbs'][tds[0].text.strip()] = {"result": tds[1].text.strip(), "date": tds[2].text.strip(), "location": tds[3].text.strip()}

    data['sbs'] = get_season_bests(change_url(url, "sb"))
    return data

def get_season_bests(url):
    response = requests.get(url, verify=False)
    soup = BeautifulSoup(response.text, 'html.parser')

    fonts = soup.find_all('font')
    f = None
    for font in fonts:
        if 'Wyniki sezonu' in font.text.strip():
            f = font
            break
    table = f.parent.parent.parent.parent
    sbs = {}
    trows = table.find_all('tr', recursive=False)
    for trow in trows[3:]:
        tds = trow.find_all('td')
        if len(tds) < 4:
            continue
        font = tds[0].find('font')
        discipline = font.text.strip()
        result = tds[1].find('font').text.strip()
        date = tds[3].text.strip()
        location = tds[4].find('font')
        location = ''.join(location.find_all(string=True, recursive=False)).strip()

        # Sprawdzamy czy legalny wiatr i jeśli nie to dodajemy po prostu * do nazwy konkurencji
        if "(" in result:
            wind = result.split("(")[1].split(")")[0]
            if wind[0] == "+" and float(wind[1:4]) > 2.0:
                discipline += "*"

        if all(x not in discipline for x in ["Oszczep", "Kula", "Dysk", "Młot", "Tyczka", "Wzwyż", "W dal", "Trójskok", "bój"]):
            # Biegi
            if all(x not in result for x in {"DQ", "DNF", "DNS", "NM"}):
                if sbs.get(discipline) is None:
                    sbs[discipline] = {"result": result, "date": date, "location": location}
                else:
                    res = compare_times(result.split(" ")[0], sbs[discipline]["result"].split(" ")[0])
                    if res == result.split(" ")[0]:
                        sbs[discipline] = {"result": result, "date": date, "location": location}
        else:
            # Konkurencje techniczne
            if all(x not in result for x in {"DQ", "DNF", "DNS", "NM"}):
                if sbs.get(discipline) is None:
                    sbs[discipline] = {"result": result, "date": date, "location": location}
                else:
                    r1 = float(result.split(" ")[0])
                    r2 = float(sbs[discipline]["result"].split(" ")[0])
                    if r1 > r2:
                        sbs[discipline] = {"result": result, "date": date, "location": location}

    # Usuwanie gorszych życiówek przy dużym wietrze
    sbs2 = deepcopy(sbs)
    for key in sbs2:
        if sbs.get(key + "*") is not None:
            # Porównujemy, czy życiówka z wiatrem jest gorsza od tej normalnej - jeśli tak to usuwamy ją
            t1 = float(sbs[key]["result"].split("(")[0])
            t2 = float(sbs[key + "*"]["result"].split("(")[0])
            if key in {"W dal", "Trójskok"}:
                if t1 > t2:
                    del sbs[key + "*"]
            else:
                res = compare_times(str(t1), str(t2))
                if res == str(t1):
                    del sbs[key + "*"]

    return sbs

def change_url(url, change):
    return url.replace("profile", change)

def parse_duration(t):
    t = t.strip().replace(",", ".")
    parts = t.split(":")

    if len(parts) == 3:
        h, m, s = parts
        return timedelta(hours=float(h), minutes=float(m), seconds=float(s))
    elif len(parts) == 2:
        m, s = parts
        return timedelta(minutes=float(m), seconds=float(s))
    elif len(parts) == 1:
        return timedelta(seconds=float(parts[0]))
    else:
        raise ValueError(f"Zły format {t}")

def compare_times(t1, t2):
    t1_p = parse_duration(t1)
    t2_p = parse_duration(t2)
    if t1_p < t2_p:
        return t1
    return t2

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(get_athletes_from_domtel_results_site(url))
    else:
        print("Brak argumentu!")