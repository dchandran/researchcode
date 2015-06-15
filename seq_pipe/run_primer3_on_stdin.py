from back_translate import backtranslate
from Bio.Seq import Seq
import sys
import subprocess
import os.path

if len(sys.argv) < 3:
    print ("command-line args: protein-sequence, input-folder, output-folder. std input: DNA sequence")
    sys.exit()

inputsfolder = sys.argv[2]
outputsfolder = sys.argv[2]
prot_seq = sys.argv[1]
dna_seqs = backtranslate(prot_seq)

def build_primer3_input(forward, reverse, filename):
    primer_input_file = open(filename,'w');
    s = "SEQUENCE_PRIMER=" + forward + "\n" + \
         "SEQUENCE_PRIMER_REVCOMP=" + reverse + "\n" + \
         "PRIMER_TASK=check_primers\nPRIMER_EXPLAIN_FLAG=1\nPRIMER_PAIR_EXPLAIN=1\nPRIMER_MIN_SIZE=5\nPRIMER_MAX_SIZE=36\nPRIMER_MAX_SELF_ANY=1\n="
    primer_input_file.write(s)
    primer_input_file.close()

def check_all_reverse_primers(forward):
    global dna_seqs

    n = len(dna_seqs)
    for i in range(0,n):
        forward = forward.replace('\n','')

        if not dna_seqs[i] == forward:
            reverse = str(Seq(dna_seqs[i]).complement())

            inputfile = inputsfolder + '/' + forward + '.' + reverse + '.txt'
            outputfile = outputsfolder + '/' + forward + '.' + reverse + '.txt'

            build_primer3_input(forward, reverse, inputfile)
            os.system('primer3 < ' + inputfile + ' > ' + outputfile)
            out = open(outputfile)
            n = len(out.readlines())
            out.close()
            if n <= 10:
                os.system('mv ' + outputfile + ' outputs/good')
            else:
                os.system('mv ' + outputfile + ' outputs/bad')
            


for line in sys.stdin:
    forward = line.replace('\n','')
    check_all_reverse_primers(forward)

    
    reverse = str(Seq(forward))

    inputfile = 'inputs/' + forward + '.txt'
    outputfile = 'outputs/' + forward + '.txt'

    build_primer3_input(forward, reverse, inputfile)
    os.system('primer3 < ' + inputfile + ' > ' + outputfile)
    out = open(outputfile)
    if len(out.readlines()) <= 10:
        os.system('rm ' + outputfile)
    out.close()
