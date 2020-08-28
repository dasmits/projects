import pandas as pd
# from pdb import set_trace as st
import sys


movies = pd.read_csv('title.basics.tsv.gz', compression='gzip', sep='\t')
ratings = pd.read_csv('title.ratings.tsv.gz', compression='gzip', sep='\t')
movies = pd.merge(movies,ratings, on='tconst')
movies = movies[movies['titleType'].isin(['movie', 'tvMovie'])]
movies = movies[['startYear', 'runtimeMinutes', 'numVotes', 'averageRating']]
for column in movies.columns.values.tolist():
    movies[column] = pd.to_numeric(movies[column], errors='coerce')
movies = movies.dropna()
movies = movies[movies['runtimeMinutes'] > 40]
movies = movies[movies['numVotes'] >= 1000]
movies = movies[movies['startYear']>1941]



movies.to_csv('imdb_100.csv', index=False)

# except:
#     st()