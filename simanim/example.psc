FIX: source sink

# Reactions
Receptor_Activation:
    R0 > R1
    k1*light*R0/(1 + R0)

Receptor_Inactivation:
    R1 > R0
    k2*R1/(1 + R1)

TF_Activation:
    TF0 > TF1
    k3*R1*TF0/(1 + TF0)

TF_Inactivation:
    TF1 > TF0
    k4*TF1/(1 + TF1)

gfp_on:
    gfp_off > gfp_on
    k3*gfp_off*TF1/(Kd + TF1)

gfp_off:
    gfp_on > gfp_off
    k4*gfp_on

gfp_mRNA_prod:
    source > gfp_mRNA
    k5*gfp_on

gfp_mRNA_degr:
    gfp_mRNA > sink
    k5*gfp_mRNA

GFP_prod:
    source > GFP
    k6*gfp_mRNA

GFP_degr:
    GFP > source
    k7*GFP

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
