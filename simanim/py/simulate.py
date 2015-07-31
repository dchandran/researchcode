m1 = sim_module("protein_burst")
m2 = sim_module("two_component") 

c1 = sim_connection()

s = combine_modules([m1, m2], [c1,c2,c3,c4])

f = open('temp.out','w')
f.write(s)
f.close()