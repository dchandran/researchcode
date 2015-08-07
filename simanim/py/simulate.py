from sim_module import sim_module, sim_connection, combine_modules
import stochpy
import json
import sys

m1 = sim_module("two_component") 
m2 = sim_module("protein_production")

c1 = sim_connection("TF1", m1, "TF1")
c2 = sim_connection("TF1", m2, "TF")
c3 = sim_connection("k1", m2, "k1")

s = combine_modules([m1, m2], [c1,c2,c3])

modelfile = sys.argv[1]
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




















