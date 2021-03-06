import os
import sqlite3
import sys
import wget
import csv
import json
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
    Entrez.email = "deepak.chandran@autodesk.com"
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

        residue_shape = ""
        residue = re.compile("\s+").split(entry.residue_type)
        if len(residue) > 1:
            residue_shape = residue[1]

        #virus['nucleic_acid_type'] = residue[0]
        virus['nucleic_acid_type'] = entry.taxonomy[1]
        virus['nucleic_acid_shape'] = residue_shape

        virus['length'] = entry.size
        virus['date'] = entry.date

        #all the code below is just to get the virus host
        #from Uniprot... kind of a hack
        protein_id = ""
        organism_url = ""
        host_url = ""
        host_name = ""

        for feature in entry.features:
            for quals in feature.qualifiers:
                if quals.key=="/protein_id=":  #get any one protein ID
                    protein_id = quals.value.replace('"','').replace("'","")
                    break

        if protein_id:

            #get the Uniprot file
            count = 0
            success = False
            while not success and count < 10:
                count += 1
                try:
                    filename = wget.download("http://www.uniprot.org/uniprot/?query="+protein_id+"&sort=score&format=rdf",out="uniprot.rdf")
                    f = open(filename)

                    #scrape the Uniprot file for organism information
                    for line in f.readlines():
                        m = orgn_pattern.match(line)
                        if m:
                            organism_url = m.group(1)
                            break

                    f.close()
                    os.remove(filename)
                    success = True
                except Exception as e:
                    print (protein_id + " url is unreachable: " + str(e) + "\ntrying again...")

            if organism_url:
                count = 0
                success = False
                while not success and count < 10:
                    count += 1
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
                        success = True
                    except Exception as e:
                        print (organism_url + " unreachable: " + str(e) + "\ntrying again...")

            if host_url:
                count = 0
                success = False
                while not success and count < 10:
                    count += 1
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
                    except Exception as e:
                        print (host_url + " is unreachable: " + str(e) + "\ntrying again...")

        virus['organism_url'] = organism_url
        virus['host_url'] = host_url
        virus['host'] = host_name

        return virus

#MAIN

dbconnection = sqlite3.connect('virus.db')
dbcursor = dbconnection.cursor()
dbcursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
results = dbcursor.fetchall()
if len(results) < 1:
    dbcursor.execute('''CREATE TABLE viruses (accession text, date text, host text, host_url text, organism text, organism_url text, nucleic_acid_type text, nucleic_acid_shape text, length real, strain text, taxonomy text)''')
    dbconnection.commit()
    print("Created viruses table")
else:
    print("viruses table exists with " + str(len(results)) + " entries")

acc_lst = get_all_virus_accession_numbers()
acc_lst.sort()
# acc = "NC_001416"  #for phage lambda
# dat = get_virus_data(acc)
table = []

for acc in acc_lst:
    dbcursor.execute("SELECT * from viruses WHERE accession='" + acc + "'")
    results = dbcursor.fetchall()
    if len(results) == 0:
        dat = get_virus_data(acc)
        #virus_table.append(dat)
        tupl = (dat['accession'],dat['date'],dat['host'],dat['host_url'],dat['organism'],dat['organism_url'],dat['nucleic_acid_type'],dat['nucleic_acid_shape'],dat['length'],dat['strain'],','.join(dat['taxonomy']))
        table.append(tupl)
        try:
            sqlcmd = "INSERT INTO viruses VALUES"+str(tupl)
            print(sqlcmd)
            dbcursor.execute(sqlcmd)
            dbconnection.commit()
        except Exception as e:
            print("Error: " + str(e))
            pass
    else:
        print (acc + " already exists in DB")

#dbcursor.executemany('INSERT INTO viruses VALUES (?,?,?,?,?,?,?,?,?,?,?)', table)    
#dbconnection.commit()

