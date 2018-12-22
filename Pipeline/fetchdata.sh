#!/bin/bash
# fetch record and subject file from azure storage service

echo "Begining fetching filename..."

recordfile=$(az storage blob list -c bangumi --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT -o table --prefix record | sed 1,2d | tr -s '\040' '\011' | cut -f1,5 | sort -t$'\t' -k2,2r | sed 1q | sed 's/\t.*//g')
echo "Record file read as ${recordfile}."

subjectfile=$(az storage blob list -c bangumi --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT -o table --prefix subject | sed 1,2d | grep 'subject\-api\-[0-9]\+' | tr -s '\040' '\011' | cut -f1,5 | sort -t$'\t' -k2,2r | sed 1q | sed 's/\t.*//g')
echo "API scraped subject file read as ${subjectfile}."


[ -e "$HOME"/"$recordfile" ] && echo "Record file already exists under ${HOME}." || (az storage blob download -c bangumi --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT -n "$recordfile" -f "$HOME"/"$recordfile" && echo "Record file downloaded under ${HOME}.")
[ -e "$HOME"/"$subjectfile" ] && echo "Subject file already exists under ${HOME}." || (az storage blob download -c bangumi --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT -n "$subjectfile" -f "$HOME"/"$subjectfile" && echo "Subject file downloaded under ${HOME}.")
recordfile="$HOME"/"$recordfile"
subjectfile="$HOME"/"$subjectfile"

aujourdhui=$(date +"%Y_%m_%d")

# Preprocess files to remove scrapy error
echo "Preprocessing record and subject files."
sed 's/\r//g' $recordfile > /tmp/record.raw
sed 's/\r//g' $subjectfile > /tmp/subject.raw

echo "Sorting files."
sed 1d /tmp/subject.raw | sort -t$'\t' -k2,2n > /tmp/subject.sorted
sed 1d /tmp/record.raw | sort -t$'\t' -k1,1n -k7,7 > /tmp/record.sorted
# Get user.tsv
echo "Generating user.tsv."
tac /tmp/record.sorted | awk -F "\t" 'BEGIN {pre=0} pre!=$1 { printf("%d\t%s\t%s\t%s\n", $1, $2, $3, $7); pre=$1}' | tac > "$HOME"/user_"$aujourdhui".tsv
# Join correct subject id
cut -f1,2 /tmp/subject.sorted > "$HOME"/subject.lut.tsv
echo "Solving redirected subjects..."
cut -f2,3 --complement /tmp/record.sorted | sort -t$'\t' -k2,2 > /tmp/record.right
cut -f1,2 /tmp/subject.sorted | sort -t$'\t' -k2,2 > /tmp/subject.left
join -12 -22 -t$'\t' -o 2.1,1.1,2.3,2.4,2.5,2.6,2.7,2.8 /tmp/subject.left /tmp/record.right | sort -t$'\t' -k1,1n -k5,5 > "$HOME"/record_"$aujourdhui".tsv
# Remove duplicated subject in subject.tsv
awk -F "\t" '$1==$2 {print $0;}' < /tmp/subject.sorted | cut -f2 --complement | sort -t$'\t' -k1,1 > "$HOME"/subject_"$aujourdhui".tsv

# publish?
echo "Publish data."
az storage file upload --share-name bangumi-publish/user --source "$HOME"/user_"$aujourdhui".tsv --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT
az storage file upload --share-name bangumi-publish/subject --source "$HOME"/subject_"$aujourdhui".tsv --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT
az storage file upload --share-name bangumi-publish/record --source "$HOME"/record_"$aujourdhui".tsv --account-key $AZURE_STORAGE_IKELY_KEY --account-name $AZURE_STORAGE_IKELY_ACCOUNT
