rm -rf inputs
rm -rf outputs
mkdir inputs
mkdir outputs
mkdir outputs/good
mkdir outputs/bad
cat candidate_seqs.txt | parallel --jobs 4 --pipe python3 run_primer3_on_stdin.py 'IAMSYNTHETIC' 'inputs' 'outputs' 
