from sim_module import *
import stochpy

m1 = sim_module("two_component") 
m2 = sim_module("protein_burst")

c1 = sim_connection(m1, "TF1", m2, "TF")
c2 = sim_connection(m1, "k1", m2, "k1")

s = combine_modules([m1, m2], [c1,c2])

f = open('temp.pyc','w')
f.write(s)
f.close()

smod = stochpy.SSA()
smod.Model('temp.psc','.')
smod.DoStochSim(end = 100,mode = 'time',trajectories = 1)
smod.SSA.species_names
smod.data_stochsim.time
smod.data_stochsim.species[200,:]