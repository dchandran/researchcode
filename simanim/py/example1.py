from sim_module import sim_module, sim_connection, combine_modules, generate_output
import stochpy
import json
import sys
import os
from numpy import transpose

sim_module.modules_file = "py/modules.yaml"
m1 = sim_module("m1","two_component", {'tf0':'tf0', 'tf1':'tf1'})
m2 = sim_module("m2","activated_protein_production", 
    {'tf': 'tf1', 
     'k1': 'k1', 
     'protein': 'GFP'})

species = {'tf1': 0, 'tf0': 10, 'GFP': 0}
params = {'k1': 5}

s = combine_modules([m1, m2], species, params)

modelfile = "temp.psc"
if not os.path.exists(modelfile):
    fout = open(modelfile,'w')
    fout.write(s)
    fout.close()

outfile = "temp"
gridsz = 100

smod = stochpy.SSA()
smod.Model(modelfile,'.')
os.remove(modelfile)

smod.DoStochSim(end = 500,mode = 'time',trajectories = 1)
smod.GetRegularGrid(gridsz)
#smod.PlotSpeciesTimeSeries()

time = smod.data_stochsim_grid.time.ravel().tolist()
species = transpose(smod.data_stochsim_grid.species)

obj = generate_output(outfile+".csv", smod.SSA.species_names, time, species)
obj['modelstring'] = s
json.dump(obj, open(outfile+".json",'w'))
