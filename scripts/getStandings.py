import pandas as pd
import os

os.chdir(os.path.dirname(__file__))

pd.read_html("https://www.womenseliterugby.us/standings")[0].to_json("../src/assets/standings.json")
pd.read_html("https://www.womenseliterugby.us/2025-schedule")[0].to_json("../src/assets/schedule.json")
