import os
import sqllite3
import sys
import wget
import csv
#import rdflib
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
    try:
        filename = wget.download("http://www.ncbi.nlm.nih.gov/genomes/GenomesGroup.cgi?taxid=10239&cmd=download2",out="ncbi_viruses.tab")
    except Exception as e:
        print ("NCBI's virus database is unreachable: " + str(e))
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
    os.remove(filename)
    return list(acc_lst.keys())

def get_virus_data(accession):
    '''
    Gets information about a virus, given its
    NCBI accession number (NC_xxxxxx)
    '''
    virus = {}
    #Entrez.email = "deepak.chandran@autodesk.com"
    handle = Entrez.efetch(id=accession, db="nucleotide", rettype="gb")
    proteins = []
    entry = None

    orgn_pattern = re.compile("<organism rdf:resource=\"([^\"]+)\"")
    host_pattern = re.compile("<host rdf:resource=\"([^\"]+)\"")
    host_name_pattern = re.compile("<scientificName>([^<]+)")

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
        host_name = None

        for feature in entry.features:
            for quals in feature.qualifiers:
                if quals.key=="/protein_id=":  #get any one protein ID
                    protein_id = quals.value.replace('"','').replace("'","")
                    break

        if protein_id:

            #get the Uniprot file
            try:
                filename = wget.download("http://www.uniprot.org/uniprot/?query="+protein_id+"&sort=score&format=rdf",out="uniprot.rdf")
                f = open(filename)
            except Exception as e:
                print (protein_id + " url is unreachable: " + str(e))

            #scrape the Uniprot file for organism information
            for line in f.readlines():
                m = orgn_pattern.match(line)
                if m:
                    organism_url = m.group(1)
                    break

            f.close()
            os.remove(filename)

            if organism_url:
                try:
                    filename = wget.download(organism_url+".rdf",out="uniprot.taxonomy.out")
                    f = open(filename)
                    for line in f.readlines():
                        m = host_pattern.match(line)
                        if m:
                           host_url = m.group(1)
                           break
                    f.close()
                    os.remove(filename)
                except Exception as e:
                    print (organism_url + " unreachable: " + str(e))

            if host_url:
                try:
                    filename = wget.download(host_url+".rdf",out="uniprot.taxonomy.out")
                    f = open(filename)
                    for line in f.readlines():
                        m = host_name_pattern.match(line)
                        if m:
                           host_name = m.group(1)
                           break
                    f.close()
                    os.remove(filename)
                except:
                    print (host_url + " is unreachable: " + str(e))

        virus['organism_url'] = organism_url
        virus['host_url'] = host_url
        virus['host'] = host_name

        return virus

#MAIN{'accession': 'NC_027399',
 'date': '24-JUN-2015',
 'host': None,
 'host_url': None,
 'organism': 'Klebsiella phage K64-1',
 'organism_url': None,
 'residue_type': 'DNA     linear',
 'size': '346602',
 'strain': 'Klebsiella phage K64-1',
 'taxonomy': ['Viruses',
  'dsDNA viruses, no RNA stage',
  'Caudovirales',
  'Myoviridae']}

dbconnection = sqlite3.connect('virus.db')
dbcursor = dbconnection.cursor()
dbcursor.execute('''SELECT name FROM sqlite_master WHERE type='table'''')
results = cursor.fetchall()
if len(results) < 1:
    dbcursor.execute('''CREATE TABLE viruses (accession text, date text, host text, host_url text, organism text, organism_url text, residue_type text, size real, strain text, taxonomy text)''')

acc_lst = get_all_virus_accession_numbers()

# acc = "NC_001416"  #for phage lambda
# dat = get_virus_data(acc)

for acc in acc_lst:
   print ("parsing " + acc + "\n")
   dat = get_virus_data(acc)
   #virus_table.append(dat)
   tupl = (dat['accession'],dat['date'],dat['host'],dat['host_url'],dat['organism'],dat['organism_url'],dat['residue_type'],dat['size'],dat['strain'],','.join(dat['taxonomy']))
   dbcursor.execute("INSERT INTO viruses VALUES " + str(tupl))

#dbcursor.execute("SELECT name FROM viruses WHERE host=''")