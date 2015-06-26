library("seqinr")
library("cluster")
library("fpc")

#load fasta and count k-mers
fas <- read.fasta(file = "reads.fasta")
n = length(fas)
k = 2
kmers = matrix(0, n, 4^k)
for (i in 1:n) {
  kmers[i,] = count(fas[[i]], k)
}

#Identify the best cluster size
koptions = c(5,10,20,30,50,80,100,200)
n = length(koptions)
explainedVar = matrix(0,n,2)
for (i in 1:n) {
  clusters = kmeans( kmers, koptions[i] , 100);
  explainedVar[i,1] = koptions[i]
  explainedVar[i,2] = clusters$betweenss/clusters$totss
}
plot(explainedVar)

#Final clustering
numClusters = 50
finalClusters = kmeans( kmers, numClusters , 100);

#Group FASTA sequences
fastaGroups = list()
for (i in 1:numClusters) {
  fastaGroups[[i]] = list()
}

n = length(fas)
for (i in 1:n) {
  cluster = finalClusters$cluster[i]
  m = length(fastaGroups[[cluster]])
  fastaGroups[[cluster]][[m+1]] = fas[[i]]
}


save.image(".RData")

