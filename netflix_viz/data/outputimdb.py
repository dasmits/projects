import pandas as pd
from pdb import set_trace as st


movies = pd.read_csv('imdb.csv')
movies = movies.groupby('startYear').apply(lambda g: g.sort_values('averageRating', ascending=False)[:100].mean())
movies = movies[['startYear', 'runtimeMinutes']]
movies.to_csv('imdb_100.csv', index=False)
st()

