from sim_module import sim_module, sim_connection, combine_modules
import stochpy
import json
import sys
import os

sim_module.modules_file = "py/modules.yaml"

m1 = sim_module("two_component") 
m2 = sim_module("gfp_production", 
    {'tf': 'tf1', 
     'k1': 'k1', 
     'protein': 'GFP'})

species = {'tf': 10, 'GFP': 0}
params = {'k1': 1}

s = combine_modules([m1, m2], species, params)

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




















