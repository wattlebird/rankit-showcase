#! /bin/bash
source activate rankit
MY_PATH="`dirname \"$0\"`"              # relative
MY_PATH="`( cd \"$MY_PATH\" && pwd )`"  # absolutized and normalized
if [ -z "$MY_PATH" ] ; then
  # error; for some reason, the path is not accessible
  # to the script (e.g. permissions re-evaled after suid)
  exit 1  # fail
fi
echo "$MY_PATH"
cd $MY_PATH
echo "Begin fetching record file..."

RECORD_RAW=$(az storage file list --share-name bangumi-publish/record --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT --output tsv | cut -f2 | tac | head -n 1)
echo "Record file read as ${RECORD_RAW}."
SUBJECT_RAW=$(az storage file list --share-name bangumi-publish/subject --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT --output tsv | cut -f2 | tac | head -n 1)
echo "Subject file read as ${SUBJECT_RAW}."

[ -e "$HOME"/"$RECORD_RAW" ] && echo "Record file already exists under ${HOME}." || (az storage file download -s bangumi-publish/record -p $RECORD_RAW --dest $HOME/$RECORD_RAW --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT && echo "Record file downloaded under ${HOME}.")
[ -e "$HOME"/"$SUBJECT_RAW" ] && echo "Subject file already exists under ${HOME}." || (az storage file download -s bangumi-publish/subject -p $SUBJECT_RAW --dest $HOME/$SUBJECT_RAW --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT && echo "Subject file downloaded under ${HOME}.")

RECORD_RAW=$HOME/$RECORD_RAW
SUBJECT_RAW=$HOME/$SUBJECT_RAW

# 1. filter out ranked anime in record
echo "Make sure only anime is considered."
sed 1d $RECORD_RAW | gawk -F "\t" '$3=="anime" && length($6)!=0 {printf("%d\t%d\t%d\n", $1, $2, $6)}' > $MY_PATH/record.tsv
# 2. calculate cdf for each user
echo "Doing some preprocessing tasks, like normalizing"
sort -t$'\t' -k1,1n -k3,3n $MY_PATH/record.tsv > $MY_PATH/record.sorted.tsv
gawk -f $MY_PATH/record_processing.awk -F "\t" $MY_PATH/record.sorted.tsv | sort -t$'\t' -k1,1n -k2,2n > $MY_PATH/record.anime.tsv
sed 1d $SUBJECT_RAW | awk -F "\t" '$3=="anime" && length($4)!=0 {printf("%d\t%s\t%d\n", $1, $2, $4)}' > $MY_PATH/subject.tsv
# 3. generate averaged score pair on avg, cdf and prob normalization methods.
echo "Generating paired scores."
cut -f1,2,3 $MY_PATH/record.anime.tsv | awk -F "\t" -f $MY_PATH/record_pair.awk > $MY_PATH/pair.avg.tsv
cut -f1,2,4 $MY_PATH/record.anime.tsv | awk -F "\t" -f $MY_PATH/record_pair.awk > $MY_PATH/pair.cdf.tsv
cut -f1,2,3 $MY_PATH/record.anime.tsv | awk -F "\t" -f $MY_PATH/record_pair_prob.spec.awk > $MY_PATH/pair.prob.tsv
# 4. calculate custom rank using rankit.
echo "Calculating rank."
python customrank.py
# 5. upload the custom rank to Azure Blob
echo "Upload ranking result."
az storage file upload --share-name bangumi-publish/ranking --source $MY_PATH/customrank.csv -p customrank_$(date +"%Y_%m_%d").csv --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT
source deactivate