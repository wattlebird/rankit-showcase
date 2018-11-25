import numpy as np
import pandas as pd
import gc
from rankit.Table import Table
from rankit.Ranker import MasseyRanker, ColleyRanker, KeenerRanker, ODRanker, MarkovRanker
from rankit.Merge import borda_count_merge

gc.enable()

avg = pd.read_csv('pair.avg.tsv', header=None, delimiter='\t', names=['item1', 'item2', 'score1', 'score2'], dtype={
    'item1': np.uint32,
    'item2': np.uint32,
    'score1': np.float32,
    'score2': np.float32
})

cdf = pd.read_csv('pair.cdf.tsv', header=None, delimiter='\t', names=['item1', 'item2', 'score1', 'score2'], dtype={
    'item1': np.uint32,
    'item2': np.uint32,
    'score1': np.float32,
    'score2': np.float32
})

prob = pd.read_csv('pair.prob.tsv', header=None, delimiter='\t', names=['item1', 'item2', 'score1', 'score2'], dtype={
    'item1': np.uint32,
    'item2': np.uint32,
    'score1': np.float32,
    'score2': np.float32
})



data = Table(avg, ['item1', 'item2', 'score1', 'score2'])
ranker = MasseyRanker(data)
masseyRank = ranker.rank()
colley = ColleyRanker(data)
colleyRank = colley.rank()
keener = KeenerRanker(data)
keenerRank = keener.rank()
od = ODRanker(data)
odRank = od.rank()
markov = MarkovRanker(data)
markovRank = markov.rank()

data = Table(cdf, ['item1', 'item2', 'score1', 'score2'])
ranker = MasseyRanker(data)
masseyCdfRank = ranker.rank()
colley = ColleyRanker(data)
colleyCdfRank = colley.rank()
keener = KeenerRanker(data)
keenerCdfRank = keener.rank()
od = ODRanker(data)
odCdfRank = od.rank()
markov = MarkovRanker(data)
markovCdfRank = markov.rank()

data = Table(prob, ['item1', 'item2', 'score1', 'score2'])
ranker = MasseyRanker(data)
masseyProbRank = ranker.rank()
colley = ColleyRanker(data)
colleyProbRank = colley.rank()
keener = KeenerRanker(data)
keenerProbRank = keener.rank()
od = ODRanker(data)
odProbRank = od.rank()
markov = MarkovRanker(data)
markovProbRank = markov.rank()


mergedRank = borda_count_merge([masseyRank, colleyRank, keenerRank, odRank, markovRank, masseyCdfRank, colleyCdfRank, 
keenerCdfRank, odCdfRank, markovCdfRank, masseyProbRank, colleyProbRank, keenerProbRank, odProbRank, markovProbRank])

subject = pd.read_csv("subject.tsv", delimiter='\t', dtype={
    'iid': 'uint32'
}, header=None, names=['iid', 'subjectname', 'rank'], engine='c')

table = mergedRank.merge(subject, left_on='name', right_on='iid', suffixes=('_custom', '_bangumi'))
table['rank_bangumi'] = table.rank_bangumi.astype('uint32')
table.to_csv("customrank.csv", columns=['name', 'rank_custom', 'rank_bangumi', 'subjectname'], index=False, header=True)