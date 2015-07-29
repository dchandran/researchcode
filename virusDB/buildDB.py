import wget
import csv
import rdflib
from Bio import GenBank
from Bio import Entrez

filename = wget.download("http://www.ncbi.nlm.nih.gov/genomes/GenomesGroup.cgi?taxid=10239&cmd=download2",out="ncbi_viruses.tab")


acc_lst = {} #hashtable to avoid redundancy
f = open(filename,'r')
if f:
    next(f) # skip headings ... not working!
    reader = csv.reader(f,delimiter='\t')
    for row in reader:
        acc = row[0].split(',')[0]  #just in case there are multiple acc num
        if acc[0:2]=='NC':
            acc_lst[acc] = True


for acc in acc_lst:
    handle = Entrez.efetch(id=acc, db="nucleotide", rettype="gb")
    proteins = []
    entry = None
    print ("parsing " + acc)
    for entry in GenBank.parse(handle):
        break
    if entry:
        for feature in entry.features:
            for quals in feature.qualifiers:
                if quals.key=="/protein_id=":
                    val = quals.value.replace('"','').replace("'","")
                    filename = wget.download("http://www.uniprot.org/uniprot/?query="+val+"&sort=score&format=rdf",out="uniprot.rdf")
                    g = rdflib.Graph()
                    result = g.parse(filename)

                    break
        break
    
