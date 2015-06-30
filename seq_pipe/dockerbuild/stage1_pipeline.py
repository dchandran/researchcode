#this code picks up where the R code left off
import sys
import os

file_prefix = "prod"
if len(sys.argv) > 1:
    file_prefix = sys.argv[1]

lines = sys.stdin.readlines()
#for each contig file name (stdin from pipe)
for line in lines:
    contig_file = line.replace("\n","")

    if os.path.isfile(contig_file):

        #predict genes in that file using Prodigal
        os.system("prodigal -i " + contig_file + " -f gff -p meta -o " + file_prefix + ".gff")

        #convert the gff output from prodigal to fasta sequences 
        os.system("bedtools getfasta -fi " + contig_file +  " -bed " + file_prefix + ".gff -fo " + file_prefix + ".fa")

        #cluster all the sequences to extract unique CDS
        os.system("cd-hit -i " + file_prefix + ".fa -o " +  file_prefix + ".fasta")
    