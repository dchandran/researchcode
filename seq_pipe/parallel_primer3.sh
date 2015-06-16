python run_back_translate.py > candidate_seqs.txt
rm -rf inputs
rm -rf outputs
mkdir inputs
mkdir outputs
mkdir outputs/good
mkdir outputs/bad
cat candidate_seqs.txt | parallel --progress -n0 python3 run_primer3_on_stdin.py 'IAMSYNTHETIC' 'inputs' 'outputs'
