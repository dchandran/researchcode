from back_translate import backtranslate
from Bio.Seq import Seq
import sys
import subprocess
import os.path

_INPUTFOLDER = "."
_OUTPUTFOLDER = "."

def build_primer3_input(forward, reverse, filename):
    primer_input_file = open(filename,'w');
    s = "SEQUENCE_PRIMER=" + forward + "\n" + \
         "SEQUENCE_PRIMER_REVCOMP=" + reverse + "\n" + \
         "PRIMER_TASK=check_primers\nPRIMER_EXPLAIN_FLAG=1\nPRIMER_PAIR_EXPLAIN=1\nPRIMER_MIN_SIZE=5\nPRIMER_MAX_SIZE=36\nPRIMER_MAX_SELF_ANY=1\n="
    primer_input_file.write(s)
    primer_input_file.close()

def check_all_reverse_primers(forward, dna_seqs):
    global _INPUTFOLDER
    global _OUTPUTFOLDER

    os.system('mkdir ' + _OUTPUTFOLDER + '/good')
    os.system('mkdir ' + _OUTPUTFOLDER + '/bad')

    n = len(dna_seqs)
    for i in range(0,n):
        forward = forward.replace('\n','')

        reverse = str(Seq(dna_seqs[i]).complement())

        inputfile = _INPUTFOLDER + '/' + forward + '.' + reverse + '.in'
        outputfile = _OUTPUTFOLDER + '/' + forward + '.' + reverse + '.out'

        build_primer3_input(forward, reverse, inputfile)
        os.system('primer3 < ' + inputfile + ' > ' + outputfile)
        out = open(outputfile)
        n = len(out.readlines())
        out.close()
        if n <= 10:
            os.system('mv ' + outputfile + ' ' + _OUTPUTFOLDER + '/good')
        else:
            os.system('mv ' + outputfile + ' ' + _OUTPUTFOLDER + '/bad')

# -------------
# MAIN PROGRAM
# -------------
if len(sys.argv) < 3:
    print ("command-line args: protein-sequence, input-folder, output-folder. std input: DNA sequence")
else:
    _INPUTFOLDER = sys.argv[2]
    _OUTPUTFOLDER = sys.argv[2]
    prot_seq = sys.argv[1]
    dna_seqs = backtranslate(prot_seq)

    for line in sys.stdin:
        forward = line.replace('\n','')
        check_all_reverse_primers(forward, dna_seqs)
