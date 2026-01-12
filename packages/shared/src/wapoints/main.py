import camelot
import pandas as pd
import json

def get_points(start_page: int, end_page: int, sex: str, package: str, name: str, drop_columns: []):

    df_all = pd.DataFrame()

    for page in range(start_page, end_page+1):
        tables = camelot.read_pdf('World Athletics Scoring Tables of Athletics.pdf', pages=str(page), flavor="stream")
        tables[0].to_csv(f"punkty/{sex}/{package}/{name}_{page}.csv")
        if page == 285:
            with open("punkty/plec/blok_konkurencji/konkurencja.csv", "r", encoding="utf-8") as f:
                lines = f.readlines()

            with open("punkty/plec/blok_konkurencji/konkurencja.csv", "w", encoding="utf-8") as f:
                f.writelines(lines)
        df = pd.read_csv(f"punkty/{sex}/{package}/{name}_{page}.csv", header=1)
        df = df.drop(columns=drop_columns)
        if pd.isna(df.iloc[-1]["Points"]) or df.iloc[-1]["Points"] == "":
            df = df.iloc[:-1]
        if df_all.empty:
            df_all = df
        else:
            df_all = pd.concat([df_all, df], axis=0, join="outer", ignore_index=True)

    df_all.to_csv(f"punkty/{sex}/{name}.csv")

def save_to_json(results, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=4)

def combine_csv(csv_files: [], filename: str):
    df_all = None

    for f in csv_files:
        df = pd.read_csv(f)

        if df.columns[0].startswith("Unnamed") or df.columns[0] == "":
            df = df.drop(columns=[df.columns[0]])

        df.columns = df.columns.str.strip()

        if "Points" not in df.columns:
            raise ValueError(f"W pliku {f} brak kolumny 'Points'")

        df["Points"] = pd.to_numeric(df["Points"], errors="coerce")

        if df_all is None:
            df_all = df
        else:
            df_all = pd.merge(df_all, df, on="Points", how="outer")

    cols = [c for c in df_all.columns if c != "Points"] + ["Points"]
    df_all = df_all[cols]

    df_all = df_all.sort_values("Points", ascending=False).reset_index(drop=True)

    df_all.to_csv(filename, index=False)