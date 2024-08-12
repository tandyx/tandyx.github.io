import pandas as pd

df = pd.read_csv("temp.csv")
df.to_json("temp.json", orient="split")
