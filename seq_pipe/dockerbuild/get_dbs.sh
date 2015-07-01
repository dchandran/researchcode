#!/bin/bash
for i in {0..9}
do
   cmd="wget ftp://ftp.ncbi.nlm.nih.gov/blast/db/env_nr.0$i.tar.gz"
   eval $cmd
   cmd="tar xzf env_nr.0$i.tar.gz"
   eval $cmd
done
wget ftp://ftp.ncbi.nlm.nih.gov/blast/db/env_nr.10.tar.gz
tar xzf env_nr.10.tar.gz

for i in {0..3}
do
    for j in {0..9}
    do
       cmd="wget ftp://ftp.ncbi.nlm.nih.gov/blast/db/nr.$i$j.tar.gz"
       eval $cmd
       cmd="tar xzf nt.$i$j.tar.gz"
       eval $cmd
    done
done
