library("seqinr");
library("cluster");
library("fpc");

fas <- read.fasta(file = "reads.fasta")
n = length(fas)
k = 2
kmers = matrix(0, n, 4^k)
for (i in 1:n) {
  kmers[i,] = count(fas[[i]], k)
}

save(".RData")
#pamk.best <- pamk(kmers,krange= (1:10 * 10))
#clusters = kmeans( kmers,  pamk.best$nc )


