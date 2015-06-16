from back_translate import backtranslate
from Bio.Seq import Seq
from Bio.SeqUtils import GC
import sys
import subprocess
import os.path

_INPUTFOLDER = "."
_OUTPUTFOLDER = "."

#create the primer3 input file from the given forward and reverse primers
def build_primer3_input(forward, reverse, filename):
    primer_input_file = open(filename,'w');
    s = "SEQUENCE_PRIMER=" + forward + "\n" + \
         "SEQUENCE_PRIMER_REVCOMP=" + reverse + "\n" + \
         "PRIMER_TASK=check_primers\nPRIMER_EXPLAIN_FLAG=1\nPRIMER_PAIR_EXPLAIN=1\nPRIMER_MIN_SIZE=5\nPRIMER_MAX_SIZE=36\nPRIMER_THERMODYNAMIC_PARAMETERS_PATH=/usr/share/primer3-2.3.6/src/primer3_config/\n="
    primer_input_file.write(s)
    primer_input_file.close()

#checks the given forward sequence argument against all of the dna sequences provided as the second argument
def check_all_reverse_primers(forward, dna_seqs):
    global _INPUTFOLDER
    global _OUTPUTFOLDER

    os.system('mkdir ' + _OUTPUTFOLDER + '/good')
    os.system('mkdir ' + _OUTPUTFOLDER + '/bad')

    n = len(dna_seqs)
    for i in range(0,n):


        forward = forward.replace('\n','')
        reverse = str(Seq(dna_seqs[i]).complement())

        gc1 = GC(forward)
        gc2 = GC(reverse)

        #first, screen using GC content before running primer3
        if gc1 > 0.4 and gc1 < 0.6 and gc2 > 0.4 and gc2 < 0.6:

            #input and output file locations for primer 3
            inputfile = _INPUTFOLDER + '/' + forward + '.' + reverse + '.in'
            outputfile = _OUTPUTFOLDER + '/' + forward + '.' + reverse + '.out'

            #create primer3 input file
            build_primer3_input(forward, reverse, inputfile)

            #RUN PRIMER3
            os.system('primer3 < ' + inputfile + ' > ' + outputfile)

            #parse the output file and check for errors
            out = open(outputfile)
            n = len(out.readlines())
            out.close()
            #if more lines then input file, then there must be errors -- not sure if this is too strict!
            if n <= 10:  
                os.system('mv ' + outputfile + ' ' + _OUTPUTFOLDER + '/good')
            else:
                os.system('rm ' + outputfile)
                #os.system('mv ' + outputfile + ' ' + _OUTPUTFOLDER + '/bad')

# -------------
# MAIN PROGRAM
# -------------
if len(sys.argv) < 3:
    print ("command-line args: protein-sequence, input-folder, output-folder. std input: DNA sequence")
else:
    _INPUTFOLDER = sys.argv[2]
    _OUTPUTFOLDER = sys.argv[3]
    prot_seq = sys.argv[1]
    dna_seqs = backtranslate(prot_seq)

    for line in sys.stdin:
        forward = line.replace('\n','')
        check_all_reverse_primers(forward, dna_seqs)
