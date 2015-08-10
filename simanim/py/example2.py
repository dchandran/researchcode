from sim_module import sim_module, sim_connection, combine_modules
import stochpy
import json
import sys
import os

m1 = sim_module("sequestration", {'a': 'MecA', 'b': 'ComK', 'k1': 'k1'}) 
m2 = sim_module("sequestration", {'b': 'MecA', 'a': 'ComS', 'k1': 'k1'}) 
m3 = sim_module("activated_protein_production", {'TF': 'ComK', 'Protein': 'ComK', 'k1': 'k2'})
m4 = sim_module("repressed_protein_production", {'TF': 'ComK', 'Protein': 'ComS', 'k1': 'k2'})

species = {'MecA': 10, 'ComK': 0, 'ComS': 0}
params =  {'k1': 10, 'k2': 5}

s = combine_modules([m1, m2], species, params)

modelfile = 'temp.psc'

if not os.path.exists(modelfile):
    fout = open(modelfile,'w')
    fout.write(s)
    fout.close()

outfile = 'temp.out'
gridsz = 100

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




















