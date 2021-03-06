from sim_module import sim_module, sim_connection, combine_modules, generate_output
import stochpy
import json
import sys
import os
import csv
from numpy import transpose

sim_module.modules_file = "py/modules.yaml"

m1 = sim_module("inhibit1","sequestration", {'a': 'MecA', 'b': 'ComK', 'k1': 'k1', 'k2': 'k2', 'ab': 'MecAComK'})
m2 = sim_module("inhibit2","sequestration", {'b': 'MecA', 'a': 'ComS', 'k1': 'k1', 'k2': 'k2', 'ab': 'MecAComS'})
m3 = sim_module("comk","activated_protein_production", {'tf': 'ComK', 'protein': 'ComK', 'k1': 'k3'})
m4 = sim_module("coms","repressed_protein_production", {'tf': 'ComK', 'protein': 'ComS', 'k1': 'k3'})

species = {'MecA': 10, 'ComK': 0, 'ComS': 0, 'MecAComK':0, 'MecAComS':0}
params =  {'k1': 10, 'k2': 1, 'k3': 5}

s = combine_modules([m1, m2, m3, m4], species, params)

modelfile = 'temp.psc'

fout = open(modelfile,'w')
fout.write(s)
fout.close()

outfile = 'temp'
gridsz = 100

smod = stochpy.SSA()
smod.Model(modelfile,'.')
os.remove(modelfile)

smod.DoStochSim(end = 500,mode = 'time',trajectories = 1)
smod.GetRegularGrid(gridsz)

time = smod.data_stochsim_grid.time.ravel().tolist()
species = transpose(smod.data_stochsim_grid.species)

obj = generate_output(outfile, smod.SSA.species_names, time, species)
obj['modelstring'] = s
json.dump(obj, open(outfile+".json",'w'))
