#!/usr/bin/env python

# 1. define codon table
codon_table = {
    'A': ('GCT', 'GCC', 'GCA', 'GCG'),
    'C': ('TGT', 'TGC'),
    'D': ('GAT', 'GAC'),
    'E': ('GAA', 'GAG'),
    'F': ('TTT', 'TTC'),
    'G': ('GGT', 'GGC', 'GGA', 'GGG'),
    'I': ('ATT', 'ATC', 'ATA'),
    'H': ('CAT', 'CAC'),
    'K': ('AAA', 'AAG'),
    'L': ('TTA', 'TTG', 'CTT', 'CTC', 'CTA', 'CTG'),
    'M': ('ATG',),
    'N': ('AAT', 'AAC'),
    'P': ('CCT', 'CCC', 'CCA', 'CCG'),
    'Q': ('CAA', 'CAG'),
    'R': ('CGT', 'CGC', 'CGA', 'CGG', 'AGA', 'AGG'),
    'S': ('TCT', 'TCC', 'TCA', 'TCG', 'AGT', 'AGC'),
    'T': ('ACT', 'ACC', 'ACA', 'ACG'),
    'V': ('GTT', 'GTC', 'GTA', 'GTG'),
    'W': ('TGG',),
    'Y': ('TAT', 'TAC'),
    '*': ('TAA', 'TAG', 'TGA'),
}

# 2. create dictionary of base possibilities mapped to ambiguous bases 
ambiguous_bases = {
    frozenset(['A']): 'A',
    frozenset(['C']): 'C',
    frozenset(['G']): 'G',
    frozenset(['T']): 'T',
    frozenset(['U']): 'T',
    frozenset(['A', 'G']): 'R',
    frozenset(['C', 'T']): 'Y',
    frozenset(['G', 'C']): 'S',
    frozenset(['A', 'T']): 'W',
    frozenset(['G', 'T']): 'K',
    frozenset(['A', 'C']): 'M',
    frozenset(['C', 'G', 'T']): 'B',
    frozenset(['A', 'G', 'T']): 'D',
    frozenset(['A', 'C', 'T']): 'H',
    frozenset(['A', 'C', 'G']): 'V',
    frozenset(['A', 'C', 'G', 'T']): 'N',
}

# 3. naively determine ambiguous codons from ambiguous bases
ambiguous_codon_table = {}
for amino_acid, codons in codon_table.items():
    ambiguous_codon = ''
    for i in range(3): # len(codon)
        bases = frozenset([codon[i] for codon in codons])
        ambiguous_codon += ambiguous_bases[bases]
    ambiguous_codon_table[amino_acid] = (ambiguous_codon,)

# 4. correct the incorrectly determined codons from 2 
ambiguous_codon_table['L'] = ('TTR', 'CTN')
ambiguous_codon_table['R'] = ('CGN', 'AGR')
ambiguous_codon_table['S'] = ('TCN', 'AGY')
ambiguous_codon_table['*'] = ('TAR', 'TGA')

# backtranslation functions that work for any string with a codon_table that is
# a dict mapping characters to a sequence of strings.

def backtranslate_permutations(protein, codon_table=codon_table):
    '''Returns the number of back-translated nucleotide sequences for a protein
    and codon table combination.

    >>> protein = 'ACDEFGHIKLMNPQRSTVWY*'
    >>> backtranslate_permutations(protein)
    1019215872
    >>> backtranslate_permutations(protein, codon_table=ambiguous_codon_table)
    16
    '''
    permutations = 1
    for amino_acid in protein:
        permutations *= len(codon_table[amino_acid])
    return permutations

def backtranslate(protein, codon_table=codon_table):
    '''Returns the back-translated nucleotide sequences for a protein and codon 
    table combination.

    >>> protein = 'FVC'
    >>> len(backtranslate(protein))
    16
    '''
    # create initial sequences == list of codons for the first amino acid
    sequences = [codon for codon in codon_table[protein[0]]]
    for amino_acid in protein[1:]:
        # add each codon to each existing sequence replacing sequences
        # leaves (num_codons * num_sequences) for next amino acid 
        to_extend = sequences
        sequences = []
        for codon in codon_table[amino_acid]:
            for sequence in to_extend:
                sequence += codon
                sequences.append(sequence)
    return sequences

# 5. reverse ambiguous_bases to get a kind of codon table 
ambiguous_bases_reversed = dict((value, sorted(list(key))) for (key, value) in ambiguous_bases.items())

# 6. Reuse the backtranslation functions with ambiguous nucleotides instead
def disambiguate(ambiguous_dna):
    '''Call backtranslate with ambiguous DNA and reversed ambiguous bases.

    >>> ambiguous_dna = 'ACGTRYSWKMBDHVN'
    >>> backtranslate_permutations(ambiguous_dna, ambiguous_bases_reversed)
    20736
    >>> len(disambiguate(ambiguous_dna))
    20736
    '''
    return backtranslate(ambiguous_dna, ambiguous_bases_reversed)

if __name__ == '__main__':
    import doctest
    doctest.testmod()