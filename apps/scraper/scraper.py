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

import re

runs = ["60 m", "100 m", "200 m", "300 m", "400 m", "600 m", "800 m", "1000 m", "1500 m", "Mila", "2000 m", "3000 m",
        "5000 m", "10000 m", "110 m pł M", "100 m pł", "400 m pł", "400 m pł K", "2000 m prz", "3000 m prz", "Chód 3 km", "Chód 5 km",
        "Chód 10 km", "Chód 15 km", "Chód 20 km", "Chód 30 km", "Chód 35 km", "Chód 50 km"]

short_racewalking = ["Chód 3 km", "Chód 5 km"]
long_racewalking = ["Chód 20 km", "Chód 30 km", "Chód 35 km", "Chód 50 km"]

discipline_codes_dict_men = {
    "60 m": "M60",
    "100 m": "M100",
    "200 m": "M200",
    "300 m": "M300",
    "400 m": "M400",
    "600 m": "M600",
    "800 m": "M800",
    "1000 m": "M1000",
    "1500 m": "M1500",
    "Mila": "Mmila",
    "2000 m": "M2000",
    "3000 m": "M3000",
    "5000 m": "M5000",
    "10000 m": "M10000",
    "60 m pł M": "M60pł",
    "110 m pł": "M110",
    "400 m pł": "M400pł",
    "2000 m prz": "M2000p",
    "3000 m prz": "M3000p",
    # Chód
    "Chód 3 km": "M3ch",
    "Chód 5 km": "M5ch",
    "Chód 10 km": "M10ch",
    "Chód 15 km": "M15ch",
    "Chód 20 km": "M20ch",
    "Chód 30 km": "M30ch",
    "Chód 35 km": "M35ch",
    "Chód 50 km": "M50ch",
    # Skoki
    "Wzwyż": "Mw",
    "W dal": "Mwd",
    "Trójskok": "Mtrójs",
    "Tyczka": "Mt",
    # Rzuty
    "Kula (7.26)": "Mkula",
    "Dysk (2)": "Mdysk",
    "Młot (7.26)": "Mmłot",
    "Oszczep (800)": "Mo",
    # Wielobój
    "10-bój": "WM10",
}
discipline_codes_dict_women = {
    "60 m": "K60",
    "100 m": "K100",
    "200 m": "K200",
    "300 m": "K300",
    "400 m": "K400",
    "600 m": "K600",
    "800 m": "K800",
    "1000 m": "K1000",
    "1500 m": "K1500",
    "Mila": "Kmila",
    "2000 m": "K2000",
    "3000 m": "K3000",
    "5000 m": "K5000",
    "10000 m": "K10000",
    "60 m pł K": "K60pł",
    "100 m pł": "K100pł",
    "400 m pł K": "K400pł",
    "2000 m prz": "K2000p",
    "3000 m prz": "K3000p",
    # Chód
    "Chód 3 km": "K3ch",
    "Chód 5 km": "K5ch",
    "Chód 10 km": "K10ch",
    "Chód 15 km": "K15ch",
    "Chód 20 km": "K20ch",
    "Chód 30 km": "K30ch",
    "Chód 35 km": "K35ch",
    "Chód 50 km": "K50ch",
    # Skoki
    "Wzwyż": "Kw",
    "W dal": "Kwd",
    "Trójskok": "Ktrójs",
    "Tyczka": "Kt",
    # Rzuty
    "Kula (4)": "Kkula",
    "Dysk (1)": "Kdysk",
    "Młot (4)": "Kmłot",
    "Oszczep (600)": "Ko",
    # Wielobój
    "7-bój": "WK7",
}

def get_athletes_from_domtel_results_site(url, sex):

    if sex == "M":
        with open("all_points_men.json", 'r', encoding="utf-8") as f:
            points_data = json.load(f)
    else:
        with open("all_points_women.json", 'r', encoding="utf-8") as f:
            points_data = json.load(f)
    
    response = requests.get(url, verify=False)
    response.encoding = "utf-8"
    soup = BeautifulSoup(response.text, 'html.parser')

    list = soup.find('table', class_='Listy')
    trows = list.find_all('tr')

    final_data = {}

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(athlete_worker, str(trow).strip(), final_data, points_data, sex) for trow in trows[1:]]

        for future in as_completed(futures):
            future.result()

    return json.dumps(final_data)

def athlete_worker(trow, final_data, points_data, sex):
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
                profile_data = get_data_from_domtel_profile(a['href'], points_data, sex)
                data[a.text.strip()] = {"profile_data": profile_data}
    elif a_s:
        # Jeśli nie-sztafeta to jeszcze zdjęcie i data urodzenia
        profile_data = get_data_from_domtel_profile(a_s[0]['href'], points_data, sex)
        data = {"photo": photo, "birthdate": birthdate, "profile_data": profile_data}
    final_data[number] = data

def get_data_from_domtel_profile(url, points_data, sex):
    
    #driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    response = requests.get(url, verify=False)
    soup = BeautifulSoup(response.text, 'html.parser')

    data = {}

    data['pbs'] = {}

    if sex == "M":
        discipline_codes = discipline_codes_dict_men
    else:
        discipline_codes = discipline_codes_dict_women

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
        discipline = tds[0].text.strip()
        if discipline in discipline_codes:
            code = discipline_codes[discipline]
        else:
            code = ""
        result = tds[1].text.strip()
        points = 0
        if discipline in points_data:
            points = assign_points(result.split("\n")[0], discipline, points_data)
        data['pbs'][tds[0].text.strip()] = {"code": code, "result": result, "date": tds[2].text.strip(), "location": tds[3].text.strip(), "points": points}

    data['sbs'] = get_season_bests(change_url(url, "sb"), points_data, discipline_codes)
    return data

def get_season_bests(url, points_data, discipline_codes):
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
        if discipline in discipline_codes:
            code = discipline_codes[discipline]
        else:
            code = ""
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
                points = 0
                if discipline.split("*")[0] in points_data:
                    if 'r' or 'mx' in result.split("\n")[0].strip():
                        points = assign_points(result.split("\n")[0].strip().split(" ")[0].strip(),
                                               discipline.split("*")[0], points_data)
                    else:
                        points = assign_points(result.split("\n")[0].strip(), discipline.split("*")[0], points_data)

                
                if sbs.get(discipline) is None:
                    sbs[discipline] = {"code": code, "result": result, "date": date, "location": location, "points": points}
                else:
                    res = compare_times(result.split(" ")[0], sbs[discipline]["result"].split(" ")[0])
                    if res == result.split(" ")[0]:
                        sbs[discipline] = {"code": code, "result": result, "date": date, "location": location, "points": points}
        else:
            # Konkurencje techniczne
            if all(x not in result for x in {"DQ", "DNF", "DNS", "NM"}):
                points = 0
                if discipline.split("*")[0] in points_data:
                    if 'r' or 'mx' in result.split("\n")[0].strip():
                        points = assign_points(result.split("\n")[0].strip().split(" ")[0].strip(), discipline.split("*")[0], points_data)
                    else:
                        points = assign_points(result.split("\n")[0].strip(), discipline.split("*")[0], points_data)

                if sbs.get(discipline) is None:
                    sbs[discipline] = {"code": code, "result": result, "date": date, "location": location, "points": points}
                else:
                    r1 = float(result.split(" ")[0])
                    r2 = float(sbs[discipline]["result"].split(" ")[0])
                    if r1 > r2:
                        sbs[discipline] = {"code": code, "result": result, "date": date, "location": location, "points": points}

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
    url = url.replace("profile", change)
    return url + "&sezon=2025&sezon2=L"

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

def compare_times2(t1, t2):
    # Zwraca czy t1 mniejsze od t2
    """
    Compare two time strings.
    :param t1: time to be compared
    :param t2: time to compare to
    :return: t1 < t2
    """
    t1_p = parse_duration(str(t1))
    t2_p = parse_duration(str(t2))
    if t1_p < t2_p:
        return True
    return False

def assign_points(result, discipline, data):
    """
    Assign points to a specific result in discipline.
    :param result: athlete result in a discipline
    :param discipline: name of the discipline
    :param data: points data
    :return: points value
    """

    #print("TU", result)
    # Jeśli dokładnie tyle co jakaś liczba punktów
    for i, res in enumerate(data[discipline]):
        if (res != "-" and res is not None):
            #print(parse_duration(res), parse_duration(result))
            #print(compare_times2(parse_duration(res), parse_duration(result)))
            if res == result:
                return data["Points"][i]
            elif discipline not in runs and float(res) == float(result):
                return data["Points"][i]

    if discipline in runs:

        #TODO nie wiem czy to wgl potrzebne
        if discipline in short_racewalking:
            if len(re.split("[:.]", result)) < 3:
                result = result.replace(".", ":") + ".00"
                #TODO trzeba tu zaokrąglić w górę
        elif discipline in long_racewalking:
            #print("LALA:", re.split("[:.]", result), len(re.split("[:.]", result)))
            if len(re.split("[:.]", result)) < 4:
                #print("tutututututu:", result)
                result = result.replace(".", ":") + ".00"
                #print(result)
        elif discipline == "Chód 10 km":
            if len(re.split("[:.]", result)) < 3:
                result = result.replace(".", ":") + ".00"
                #print(result)

        # Jeśli wolniej niż 600 pkt.
        slow_ind = next((i for i in range(len(data[discipline]) - 1, -1, -1) if data[discipline][i] is not None and data[discipline][i] != "-"), None)
        if not compare_times2(result, data[discipline][slow_ind]):
            return 0

        # Jeśli szybciej niż max pkt.
        fast_ind = next((i for i, x in enumerate(data[discipline]) if x is not None and x != "-"), None)
        if compare_times2(result, data[discipline][fast_ind]):
            return data["Points"][fast_ind]

        # Jeśli >600 pkt., ale nie dokładnie ileś
        ind = len(data[discipline]) // 2
        ind = binary_search_times(data[discipline], result, ind, 0, len(data[discipline])-1)

        return data["Points"][ind] if ind is not None else 1

    else:
        # Jeśli słabiej niż 600 pkt.
        slow_ind = next((i for i in range(len(data[discipline]) - 1, -1, -1) if data[discipline][i] is not None and data[discipline][i] != "-"), None)
        if float(result) < float(data[discipline][slow_ind]):
            return 0

        # Jeśli lepiej niż max pkt.
        fast_ind = next((i for i, x in enumerate(data[discipline]) if x is not None and x != "-"), None)
        if float(result) > float(data[discipline][fast_ind]):
            return data["Points"][fast_ind]

        # Jeśli >600 pkt., ale nie dokładnie ileś
        ind = len(data[discipline]) // 2
        ind = binary_search_tech(data[discipline], result, ind, 0, len(data[discipline])-1)

        return data["Points"][ind] if ind is not None else 1

def binary_search_times(discipline_data, result, ind, start, end):
    """
    Binary search for points within a running discipline.
    :param discipline_data: discipline results in json
    :param result: athlete result
    :param ind: binary search index
    :param start: 0
    :param end: len(data[discipline])-1
    :return: index of the nearest slower time
    """
    if (discipline_data[ind] is not None and compare_times2(result, discipline_data[ind]) and ind > 0
            and discipline_data[ind-1] is not None and not compare_times2(result, discipline_data[ind-1])):
        # Jeśli jest szybszy od danego indeksu i wolniejszy od indeks-1
        return ind
    if discipline_data[ind] is not None and compare_times2(result, discipline_data[ind]):
        mid = (start+ind) // 2
        #print("Binary:", discipline_data[ind], result)
        #print(discipline_data[mid])
        return binary_search_times(discipline_data, result, mid, start, ind)
    if discipline_data[ind] is not None and not compare_times2(result, discipline_data[ind]):
        mid = (end+ind) // 2
        #print("2Binary:", discipline_data[ind], result)
        #print(discipline_data[mid])
        return binary_search_times(discipline_data, result, mid, ind, end)

def binary_search_tech(discipline_data, result, ind, start, end):
    """
    Binary search for points within a technical discipline.
    :param discipline_data: discipline results in json
    :param result: athlete result
    :param ind: binary search index
    :param start: 0
    :param end: len(data[discipline])-1
    :return: index of the nearest slower time
    """
    if (discipline_data[ind] is not None and float(result) > float(discipline_data[ind]) and ind > 0
            and discipline_data[ind-1] is not None and float(result) < float(discipline_data[ind-1])):
        return ind
    if discipline_data[ind] is not None and float(result) > float(discipline_data[ind]):
        mid = (start+ind) // 2
        return binary_search_tech(discipline_data, result, mid, start, ind)
    if discipline_data[ind] is not None and float(result) < float(discipline_data[ind]):
        mid = (end+ind) // 2
        return binary_search_tech(discipline_data, result, mid, ind, end)


if __name__ == "__main__":
    if len(sys.argv) > 2:
        url = sys.argv[1]
        sex = sys.argv[2]
        print(get_athletes_from_domtel_results_site(url, sex))
    else:
        print("Zbyt mało argumentów!")