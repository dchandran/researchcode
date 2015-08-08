from sim_module import sim_module, sim_connection, combine_modules
import stochpy
import json
import sys
import os

m1 = sim_module("two_component") 
m2 = sim_module("activated_protein_production")

c1 = sim_connection("TF1", m2, "TF")
c2 = sim_connection("k1", m2, "k1")
c3 = sim_connection("GFP", m2, "protein")
c4 = sim_connection("gfp_on", m2, "gene_on")
c5 = sim_connection("gfp_off", m2, "gene_off")

s = combine_modules([m1, m2], [c1,c2,c3,c4,c5])

modelfile = sys.argv[1]

if not os.path.exists(modelfile):
    fout = open(modelfile,'w')
    fout.write(s)
    fout.close()

outfile = sys.argv[2]
gridsz = int(sys.argv[3])

smod = stochpy.SSA()
smod.Model(modelfile,'.')
smod.DoStochSim(end = 100,mode = 'time',trajectories = 1)
smod.GetRegularGrid(gridsz)
smod.PlotSpeciesTimeSeries()

for i in range(0,len(smod.data_stochsim_grid.species)):
    smod.data_stochsim_grid.species[i] = smod.data_stochsim_grid.species[i][0].tolist()

obj = { 'gridsz': gridsz,
        'headers': ['time']+smod.SSA.species_names,
        'time': smod.data_stochsim_grid.time.ravel().tolist(),
        'species': smod.data_stochsim_grid.species};

json.dump(obj, open(outfile,'w'))




















