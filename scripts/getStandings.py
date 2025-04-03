import pandas as pd

tables = pd.read_html("https://www.womenseliterugby.us/standings")[0]
tables.to_json("../src/assets/standings.json")
