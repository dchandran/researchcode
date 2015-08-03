from pyaml import yaml
import re
class sim_module(object):
    """
    Generates snippets of code
    """

    modules_file = "modules.yaml"
    modules = None

    def __init__(self, name):
        if not sim_module.modules:
            sim_module.modules = yaml.load(open(sim_module.modules_file))

        module = sim_module.modules.get(name)
        self.reactions = None
        self.species = None
        self.parameters = None

        if module:
            self.name = name
            self.reactions = module['reactions']
            self.species = module['species']
            self.parameters = module['parameters']

class sim_connection(object):
    """
    """
    def __init__(self, input_module=None, input=None, output_module=None, output=None):
        self.input_module = input_module
        self.output_module = output_module

        self.input_parameter = None
        self.input_species = None

        self.output_parameter = None
        self.output_species = None

        if input_module:
            if input_module.parameters.get(input) != None:
                self.input_parameter = input
            elif input_module.species.get(input) != None:
                self.input_species = input
        if output_module:
            if output_module.parameters.get(output) != None:
                self.output_parameter = output
            elif output_module.species.get(output) != None:
                self.output_species = output

def combine_modules(modules, connections):
    """
    Generate final code from the given
    list of modules
    """

    #CHECK all species and parameter names for collisions

    existing_params = {}
    existing_species = {}

    output_species = {}
    output_params = {}

    for c in connections:
        if c.output_species and c.output_module:
            if output_species.get(c.output_species) == None:
                output_species[c.output_species] = []
            output_species[c.output_species].append(c.output_module)
        if c.output_parameter and c.output_module:
            if output_params.get(c.output_parameter) == None:
                output_params[c.output_parameter] = []
            output_params[c.output_parameter].append(c.output_module)


    collisions = []

    def replace_name(module, old, new):
        if module.parameters.get(old) != None:
            module.parameters[new] = module.parameters[old]
            del module.parameters[old]
        if module.species.get(old) != None:
            module.species[new] = module.species[old]
            del module.species[old]
        for r in module.reactions:
            module.reactions[r] = re.sub(r"([^a-zA-Z0-9_])" + old + r"([^a-zA-Z0-9_])", r"\1"+new+r"\2", module.reactions[r])
            module.reactions[r] = re.sub(r"^" + old + r"([^a-zA-Z0-9_])", new + r"\2", module.reactions[r])
            module.reactions[r] = re.sub(r"([^a-zA-Z0-9_])" + old + r"$", r"\1" + new, module.reactions[r])
            module.reactions[r] = re.sub(r"^" + old + r"$", new, module.reactions[r])

    for c in connections:
        if c.output_module:
            if c.output_species and c.input_species:
                del c.output_module.species[c.output_species]
            elif c.output_parameter and c.input_parameter:
                del c.output_module.parameters[c.output_parameter]


    for i in range(0,len(modules)):
        for p in modules[i].parameters:
            if existing_params.get(p) != None:
                if not (output_params.get(p) != None and output_params[p].count(modules[i]) > 0):
                    collisions.append( {'module': modules[i], 'name': p} )
            else:
                existing_params[p] = modules[i]

        for s in modules[i].species:
            if existing_species.get(s) != None:
                if not (output_species.get(s) != None and output_species[s].count(modules[i]) > 0):
                    collisions.append( {'module': modules[i], 'name': s} )
            else:
                existing_species[s] = modules[i]

    for collision in collisions:
        module = collision['module']
        name = collision['name']            
        replace_name(module, name, module.name + '_' + name)

        #existing species/parameters are not listed in collision because
        #they are the first items in the existing_ hashtable, but we 
        #need to replace their names as well, just to be fair
        if existing_params.get(name):
            replace_name(existing_params[name], name, existing_params[name].name + '_' + name)
            del existing_params[name]
        if existing_species.get(name):
            replace_name(existing_species[name], name, existing_species[name].name + '_' + name)
            del existing_species[name]

    for c in connections:
        if c.output_module:
            if c.output_species and c.input_species:
                replace_name(c.output_module, c.output_species, c.input_species)
            elif c.output_parameter and c.input_parameter:
                replace_name(c.output_module, c.output_parameter, c.input_parameter)

    #DONE checking for name collisions

    s = ['FIX: source sink']
    s.append('\n#Reactions')

    for m in modules:
        for r in m.reactions:
            s.append(r + ':\n    ' + m.reactions[r].replace('\n','\n    '))

    s.append('\n#Parameters')
    for m in modules:
        for p in m.parameters:
            s.append(p + ' = ' + str(m.parameters[p]))

    s.append('\n#Molecular species')
    for m in modules:
        for n in m.species:
            s.append(n + ' = ' + str(m.species[n]))

    return '\n'.join(s)
