FIX: source sink

# Reactions
MecARepressComK:
    MecA + ComK > MecA
    k1*MecA*ComK*(1 + ComK)

MecARepressionForward:
    MecA + ComS > ComSMecA
    k2*MecA*ComS

MecARepressionReverse:
    ComSMecA > MecA + ComS
    k3*ComSMecA

ComKGene:
    source > ComP
    

# Fixed species
sink = 1
source = 1

R0 = 10
R1 = 0
TF0 = 100
TF1 = 0
gfp_mRNA = 0
gfp_off = 1
gfp_on = 0
GFP = 0

# Parameters
k1 = 1
k2 = 0.1
k3 = 1
k4 = 1
k5 = 0.5
k6 = 1
k7 = 0.1
Kd = 0.2
light = 5 
