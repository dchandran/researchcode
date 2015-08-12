from sim_module import sim_module, sim_connection, combine_modules
import stochpy
import json
import sys
import os
import csv
from numpy import transpose

sim_module.modules_file = "modules.yaml"

m1 = sim_module("m1","sequestration", {'a': 'MecA', 'b': 'ComK', 'k1': 'k1', 'k2': 'k2'}) 
m2 = sim_module("m2","sequestration", {'b': 'MecA', 'a': 'ComS', 'k1': 'k1', 'k2': 'k2'}) 
m3 = sim_module("m3","activated_protein_production", {'tf': 'ComK', 'protein': 'ComK', 'k1': 'k3'})
m4 = sim_module("m4","repressed_protein_production", {'tf': 'ComK', 'protein': 'ComS', 'k1': 'k3'})

species = {'MecA': 10, 'ComK': 0, 'ComS': 0}
params =  {'k1': 10, 'k2': 1, 'k3': 5}

s = combine_modules([m1, m2, m3, m4], species, params)

modelfile = 'temp.psc'

fout = open(modelfile,'w')
fout.write(s)
fout.close()

outfile = 'temp.out'
gridsz = 100

smod = stochpy.SSA()
smod.Model(modelfile,'.')
#os.remove(modelfile)

smod.DoStochSim(end = 100,mode = 'time',trajectories = 1)
smod.GetRegularGrid(gridsz)
#smod.PlotSpeciesTimeSeries()

with open('temp.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile, delimiter='\t', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    headers = ['time']+smod.SSA.species_names
    writer.writerow(headers)

    time = smod.data_stochsim_grid.time.ravel().tolist()
    data = transpose(smod.data_stochsim_grid.species)
    for i in range(0,len(data)):
        writer.writerow([ time[i] ] + data[i][0].tolist())
