import json
import re
import sys
from datetime import timedelta

runs = ["60 m", "100 m", "200 m", "300 m", "400 m", "600 m", "800 m", "1000 m", "1500 m", "Mila", "2000 m", "3000 m",
        "5000 m", "10000 m", "110 m pł M", "400 m pł", "2000 m prz", "3000 m prz", "Chód 3 km", "Chód 5 km",
        "Chód 10 km", "Chód 15 km", "Chód 20 km", "Chód 30 km", "Chód 35 km", "Chód 50 km"]

short_racewalking = ["Chód 3 km", "Chód 5 km"]
long_racewalking = ["Chód 20 km", "Chód 30 km", "Chód 35 km", "Chód 50 km"]

outdoor_discipline_names = {
    # MĘŻCZYZNI
    # Biegi
    "M60": "60 m",
    "M100": "100 m",
    "M200": "200 m",
    "M300": "300 m",
    "M400": "400 m",
    "M600": "600 m",
    "M800": "800 m",
    "M1000": "1000 m",
    "M1500": "1500 m",
    "Mmila": "Mila",
    "M2000": "2000 m",
    "M3000": "3000 m",
    "M5000": "5000 m",
    "M10000": "10000 m",
    "M60pł": "60 m pł M",
    "M110": "110 m pł",
    "M400pł": "400 m pł",
    "M2000p": "2000 m prz",
    "M3000p": "3000 m prz",
    # Chód
    "M3ch": "Chód 3 km",
    "M5ch": "Chód 5 km",
    "M10ch": "Chód 10 km",
    "M15ch": "Chód 15 km",
    "M20ch": "Chód 20 km",
    "M30ch": "Chód 30 km",
    "M35ch": "Chód 35 km",
    "M50ch": "Chód 50 km",
    # Skoki
    "Mw": "Wzwyż",
    "Mwd": "W dal",
    "Mtrójs": "Trójskok",
    "Mt": "Tyczka",
    # Rzuty
    "Mkula": "Kula (7.26)",
    "Mdysk": "Dysk (2)",
    "Mmłot": "Młot (7.26)",
    "Mo": "Oszczep (800)",
    # Wielobój
    "WM10": "10-bój",

    # KOBIETY
    # Biegi
    "K60": "60 m",
    "K100": "100 m",
    "K200": "200 m",
    "K300": "300 m",
    "K400": "400 m",
    "K600": "600 m",
    "K800": "800 m",
    "K1000": "1000 m",
    "K1500": "1500 m",
    "Kmila": "Mila",
    "K2000": "2000 m",
    "K3000": "3000 m",
    "K5000": "5000 m",
    "K10000": "10000 m",
    "K60pł": "60 m pł K",
    "K100pł": "100 m pł",
    "K400pł": "400 m pł K",
    "K2000p": "2000 m prz",
    "K3000p": "3000 m prz",
    # Chód
    "K3ch": "Chód 3 km",
    "K5ch": "Chód 5 km",
    "K10ch": "Chód 10 km",
    "K15ch": "Chód 15 km",
    "K20ch": "Chód 20 km",
    "K30ch": "Chód 30 km",
    "K35ch": "Chód 35 km",
    "K50ch": "Chód 50 km",
    # Skoki
    "Kw": "Wzwyż",
    "Kwd": "W dal",
    "Ktrójs": "Trójskok",
    "Kt": "Tyczka",
    # Rzuty
    "Kkula": "Kula (4)",
    "Kdysk": "Dysk (1)",
    "Kmłot": "Młot (4)",
    "Ko": "Oszczep (600)",
    # Wielobój
    "WK7": "7-bój",
}

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

def assign_points(result, discipline, sex):
    """
    Assign points to a specific result in discipline.
    :param result: athlete result in a discipline
    :param discipline: name of the discipline
    :param sex: gender of an athlete
    :return: points value
    """
    if sex == "M":
        with open("all_points_men.json", 'r', encoding="utf-8") as f:
            data = json.load(f)
    else:
        with open("all_points_women.json", 'r', encoding="utf-8") as f:
            data = json.load(f)
    
    discipline = outdoor_discipline_names[discipline]
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

        return data["Points"][ind]

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

        return data["Points"][ind]

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
    if len(sys.argv) > 3:
        result = sys.argv[1]
        discipline = sys.argv[2]
        sex = sys.argv[3]
        print(assign_points(result, discipline, sex))
    else:
        print("Zbyt mało argumentów!")