#! /bin/bash
RECORD_RAW="/home/ike/Data/Bangumi/record_2018_07_08.tsv"
SUBJECT_RAW="/home/ike/Data/Bangumi/subject_2018_07_08.tsv"

# 1. filter out ranked anime in record
sed 1d $RECORD_RAW | gawk -F "\t" '$3=="anime" && length($6)!=0 {printf("%d\t%d\t%d\n", $1, $2, $6)}' > record.tsv
# 2. calculate cdf for each user
sort -t$'\t' -k1,1n -k3,3n record.tsv > record.sorted.tsv
gawk -f record_processing.awk -F "\t" record.sorted.tsv | sort -t$'\t' -k1,1n -k2,2n > record.anime.tsv
sed 1d $SUBJECT_RAW | awk -F "\t" '$3=="anime" && length($4)!=0 {printf("%d\t%s\t%d\n", $1, $2, $4)}' > subject.tsv
# 3. generate averaged score pair on avg, cdf and prob normalization methods.
cut -f1,2,3 record.anime.tsv | awk -F "\t" -f record_pair.awk > pair.avg.tsv
cut -f1,2,4 record.anime.tsv | awk -F "\t" -f record_pair.awk > pair.cdf.tsv
cut -f1,2,3 record.anime.tsv | awk -F "\t" -f record_pair_prob.spec.awk > pair.prob.tsv
# 4. calculate custom rank using rankit.
python customrank.py
# 5. upload the custom rank to Azure Blob