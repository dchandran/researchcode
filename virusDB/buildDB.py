import wget
import csv
import rdflib
import re
from Bio import GenBank
from Bio import Entrez

def get_all_virus_accession_numbers():
    '''
    Downloads the virus accenssion numbers table from 
    NCBI and extracts the NC_ numbers in the first column
    For cases with multiple accenssion numbers, gets 
    only the first one
    '''
    filename = wget.download("http://www.ncbi.nlm.nih.gov/genomes/GenomesGroup.cgi?taxid=10239&cmd=download2",out="ncbi_viruses.tab")
    #get all virus accession numbers
    acc_lst = {} #hashtable to avoid redundancy
    f = open(filename,'r')
    if f:
        next(f) # skip headings ... not working!
        reader = csv.reader(f,delimiter='\t')
        for row in reader:
            acc = row[0].split(',')[0]  #just in case there are multiple acc num
            if acc[0:2]=='NC':
                acc_lst[acc] = True
    return list(acc_lst.keys())

def get_virus_data(accession):
    '''
    Gets information about a virus, given its
    NCBI accession number (NC_xxxxxx)
    '''
    virus = {}
    handle = Entrez.efetch(id=accession, db="nucleotide", rettype="gb")
    proteins = []
    entry = None

    orgn_pattern = re.compile("<organism rdf:resource=\"([^\"]+)\"\\s")
    host_pattern = re.compile("<host rdf:resource=\"([^\"]+)\"\\s")

    for entry in GenBank.parse(handle):
        break

    if entry:

        #populate the output with basic information
        virus['accession'] = acc
        virus['organism'] = entry.organism
        virus['strain'] = entry.source
        virus['taxonomy'] = entry.taxonomy
        virus['residue_type'] = entry.residue_type
        virus['size'] = entry.size
        virus['date'] = entry.date

        #all the code below is just to get the virus host
        #from Uniprot... kind of a hack
        protein_id = None
        organism_url = None
        host_url = None

        for feature in entry.features:
            for quals in feature.qualifiers:
                if quals.key=="/protein_id=":  #get any one protein ID
                    protein_id = quals.value.replace('"','').replace("'","")
                    break

        if protein_id:

            #get the Uniprot file
            filename = wget.download("http://www.uniprot.org/uniprot/?query="+protein_id+"&sort=score&format=rdf",out="uniprot.rdf")
            f = open(filename)

            #scrape the Uniprot file for organism information
            for line in f.readlines():
                m = orgn_pattern.match(line)
                if m:
                    organism_url = m.group(1)
                    break

            f.close()

            if organism_url:
                filename = wget.download(organism_url+".rdf",out="uniprot.taxonomy.out")
                f = open(filename)
                for line in f.readlines():
                    m = host_pattern.match(line)
                    if m:
                       host_url = m.group(1)
                       break
                f.close()

        virus['organism_url'] = organism_url
        virus['host_url'] = host_url
        return virus

acc_lst = get_all_virus_accession_numbers()
virus_table = []

for acc in acc_lst:
    print ("parsing " + acc + "\n")
    dat = get_virus_data(acc)
    virus_table.append(dat)
    if dat and dat['host_url']:
        break

