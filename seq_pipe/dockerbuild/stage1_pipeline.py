#this code picks up where the R code left off
import sys
import os

lines = sys.stdin.readlines()
#for each contig file name (stdin from pipe)
for line in lines:
    line.replace("\n","")

    filename = "prod"

    #predict genes in that file using Prodigal
    os.system("prodigal -i " + line + " -f gff -p meta -o " + filename + ".gff")

    #convert the gff output from prodigal to fasta sequences 
    os.system("bedtools getfasta -fi " + line +  " -bed prod.gff -fo " + filename + ".fa")

    #cluster all the sequences to extract unique CDS
    os.system("cd-hit -i " + filename + ".fa -o " +  filename + ".fasta")

    #print out the unique CDS - later used for Blast
    fin = open(filename + ".fasta")
    
    fin.close()