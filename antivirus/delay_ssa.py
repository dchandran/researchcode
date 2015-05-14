# -*- coding: utf-8 -*-
from scipy import random
from matplotlib import pyplot
from numpy import inf
from pyaml import yaml

def run_delayed_ssa(system):
    """
    SSA with delays and custom event functions
    """
    
    #vars used in the simulation
    time = 0 #unitless
    end_time = system['sim-time']
    species = system['participants']
    parameters = system['parameters']
    events = system['events']
    prop_funcs = {}
    exec_funcs = {}
    props = {}
    delays = {}
    last_exec_time = {}
    
    #return values
    time_array = []
    species_array = []
    
    #populate results array
    time_array = [time]
    row = [0]*len(species)
    species_names = [''] * len(species)
    
    #create species vars so that rate code can be executed
    i = 0
    for name in species:
        species_names[i] = name
        exec( name + '=' + str(species[name]) )
        row[i] = species[name]
        i += 1
    species_array.append(row)
    
    #create parameter vars so that rate code can be executed
    for name in parameters:
        exec( name + '=' + str(parameters[name]) )

    #create (compile) functions from input strings for rates and events
    for name in events:
        delays[name] = events[name]['delay']
        last_exec_time[name] = -1
        props[name] = 0.0
        prop_funcs[name] = compile("props['" + name + "'] = " + str(events[name]['propensity']), 'prop_funcs_'+name, 'exec')
        exec_funcs[name] = compile(events[name]['consequence'], 'exec_funcs_'+name, 'exec')
    
    #MAIN LOOP
    while time < end_time:
    
        #calculate propensities
        for name in props:
            exec(prop_funcs[name])
            if delays[name] > 0 and delays[name] + last_exec_time[name] < time:
                props[name] = 0.0
        
        #calculate total of all propensities
        total_prop = 0
        for name in props:
            total_prop += props[name]
    
        
        u = random.uniform(total_prop)
        usum = 0
        lucky = None
        for name in props:
            usum += props[name]
            if usum > u:
                lucky = name
                break
        
        #fire that reaction
        if lucky:
            last_exec_time[lucky] = time
            exec(exec_funcs[lucky])
    
    
        row = [0]*len(species)
        i = 0
        for name in species:
            row[i] = eval(name)
            i += 1
        time_array.append(time)
        species_array.append(row)
        
        #update next time using exp distrib
        if total_prop == 0.0:  #jump to next delay
            lowest_delay = inf
            for name in props:
                if delays[name] > 0 and delays[name] < lowest_delay:
                    lowest_delay = delays[name]
            time += lowest_delay
        else:
            dt = random.exponential(1.0/total_prop)
            time += dt

    #END MAIN LOOP

    result = {'time':time_array, 'participants':species_array, 'headers': species_names}
    return result

