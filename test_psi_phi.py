# -*- coding: utf-8 -*-
'''
Nigel J. Dimmock and Andrew J. Easton. 
Defective Interfering Influenza Virus RNAs: Time To Reevaluate Their Clinical Potential as Broad-Spectrum Antivirals?
J. Virology, 2015

Important quotes:

DI viruses are virus particles that contain a heavily deleted version of the infectious genome (i.e., they are defective in one or more genes) and have the ability in vitro to interfere with, and diminish the production of, infectious progeny produced by the infectious virus from which that DI particle originated (7). DI genomes and DI particles are made by nearly all viruses and may represent an evolutionarily acceptable by-product of an inefficient replication process. Alternatively, they may be produced for evolutionary reasons, such as the stimulation of innate immunity, that could favor survival of the host species and hence perpetuation of the virus population itself. Because of its deleted genome, a DI virus is by definition noninfectious and is replicated only in a cell coinfected by an infectious “helper” virus, usually the virus from which the DI genome is derived. This provides the function(s) that the DI genome lacks and enables the DI genome to be packaged into virus particles. A high multiplicity of infection favors the propagation of DI viruses, as more cells can be infected simultaneously with DI and infectious viruses. It follows that all DI genomes retain the molecular signals that permit their replication and packaging into new DI particles and that the DI genome is packaged by proteins made by the helper virus. Hence, the progeny DI and helper viruses are antigenically identical.

It is believed that the ratio of DI genomes to infectious genomes within the cell determines the outcome of infection in the culture system as a whole. The level of DI RNA that is needed to establish protection from a particular dose of infectious virus has only been determined empirically. In one scenario, the DI genome enters some cells but others have no DI genome. Similarly, some cells will be infected and others not. Finally, some infected cells contain both a DI and an infectious genome. When the number of infectious particles is below the (unknown) threshold, the DI genome population inhibits the spread of infectious virus to a degree determined by many factors, including the ratio of DI genomes to virus genomes in the culture system as a whole and their respective rates of replication. At a low ratio of DI genomes to infectious genomes, there is replication of both genome types without interference and no reduction of specific infectivity or total particles produced. As the ratio of DI genomes to infectious genomes in the cell increases, more DI genomes than infectious genomes are produced, although the total number of virus particles produced is unaltered. However, here the majority of particles are DI virus. With an even greater increase in the ratio of DI genomes to infectious genomes, there is a reduction in replication of both DI and infectious genomes and a fall in the total number of particles (DI virus and infectious virus) produced. In essence, this is a race between the amplification of the DI RNA, which leads to the production of more DI virus and the establishment of more DI virus-protected cells, and the spread of infectious virus. When the DI RNA “wins,” clinical disease is inhibited and the animal is protected.

An important clinical consequence of 244 DI virus administration is that replication of infectious challenge virus was reduced but not completely inhibited.

Animals treated with 244 DI virus and challenged with heterologous viruses generated solid protective immunity to those challenge viruses, indicating that the DI RNA reduced but did not eliminate replication of the infectious virus, a scenario which parallels that seen with influenza A virus

If no infectious influenza A virus enters that cell, the DI RNA eventually decays.

Unlike a vaccine, which takes several weeks to stimulate full immunity, DI virus-mediated protection is effective immediately
'''


#INPUT
psi_phi_system = """
sim-time: 200

events:
  death:
    delay: 10
    description: cell death
    propensity: 0.02*cell
    consequence: |-
      cell = cell-1
    
  growth:
    delay: 1
    description: cell growth
    propensity: 1.0
    consequence: |-
      cell = cell+1

  infect1:
    delay: 0
    description: phi infects a normal cell
    propensity: ir_phi*cell*phi
    consequence: |-
      cell = cell-1 
      phi = phi-1 
      phi_cell = phi_cell+1 
      
  infect2:
    delay: 0
    description: psi infects a normal cell
    propensity: ir_psi*cell*psi
    consequence: |-
      cell = cell-1 
      psi = psi-1 
      psi_cell = psi_cell+1    
      
  infect3:
    delay: 0
    description: psi infects a phi_cell  
    propensity: ir_phi*phi_cell*psi
    consequence: |-
      phi_cell = phi_cell-1
      psi = psi-1
      psi_phi_cell = psi_phi_cell+1

  infect4:
    delay: 0
    description: phi infects a psi_cell
    propensity: ir_phi*psi_cell*phi
    consequence: |-
      psi_cell = psi_cell-1
      phi = phi-1
      psi_phi_cell = psi_phi_cell+1

  burst1:
    delay: 5
    description: phi_cell bursts and produces (n)phi    
    propensity: phi_cell
    consequence: |-
      phi_cell = phi_cell-1
      phi = phi+random.poisson(burst)

  burst2:
    delay: 5
    description: psi_phi_cell bursts and produces (n1)phi and (n2)psi
    propensity: 1.0/disruption*psi_phi_cell
    consequence: |-
      psi_phi_cell = psi_phi_cell-1
      moi = psi+phi
      if moi>0 and burst>0:
          phi = phi+random.poisson(burst * 1/(1+rel_burst_psi) * phi/moi)
          psi = psi+random.poisson(burst * rel_burst_psi/(1+rel_burst_psi) * psi/moi)    

parameters:  
  burst: 10
  ir_phi: 0.2
  ir_psi: 0.2
  rel_burst_psi: 1
  disruption: 10

participants:
  cell: 100
  phi: 10
  phi_cell: 0
  psi: 100
  psi_cell: 0
  psi_phi_cell: 0

comments: |-
  all propensity parameters are normalized to cell growth (which is 1.0).

"""
from scipy import random
from matplotlib import pyplot
from numpy import inf
from pyaml import yaml
from delay_ssa import run_delayed_ssa

#RUN the example system and plot the results
system = yaml.load(psi_phi_system)
result = run_delayed_ssa(system)
pyplot.plot(result['time'], result['participants'])
pyplot.legend(result['headers'], bbox_to_anchor=(1.05, 1), loc=2)
#pyplot.ylim([0,100])
pyplot.xlim([0,10])

#RUN for many parameters
particles = [ [1,10], [10, 50], [10,100], [20, 100], [30, 100] ]
res = []
for p in particles:
    system['participants']['phi'] = p[0]
    system['participants']['psi'] = p[1]
    result = run_delayed_ssa(system)
    final_i = len(result['time'])-1 
    res.append(result['participants'][final_i])

pyplot.figure()
pyplot.plot(res,'o')
pyplot.legend(result['headers'], bbox_to_anchor=(1.05, 1), loc=2)
pyplot.ylim([-50, max(max(res))+100])
pyplot.xlim([-1, len(particles)])

