#this code picks up where the R code left off
import sys
import os

lines = sys.stdin.readlines()
for line in lines:
    line.replace("\n","")
    #predict genes
    filename = "prod"
    os.system("prodigal -i " + line + " -f gff -p meta -o " + filename + ".gff")
    os.system("bedtools getfasta -fi " + line +  " -bed prod.gff -fo " + filename + ".fa")
    os.system("cd-hit -i " + filename + ".fa -o " +  filename + ".fasta")