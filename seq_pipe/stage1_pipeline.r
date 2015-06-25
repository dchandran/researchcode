library("seqinr");
library("cluster");
library("fpc");

fas <- read.fasta(file = "~/researchcode/seq_pipe/third-party/water_ps_g4002_minimetagenomics_1b_reads.fasta");
n = length(fas);
k = 2;
kmers = matrix(0, n, 4^k)
for (i in 1:n) {
  kmers[i,] = count(fas[[i]], k);
}

pamk.best <- pamk(kmers);
clusters = kmeans( kmers,  pamk.best$nc );