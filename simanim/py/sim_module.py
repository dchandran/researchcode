from pyaml import yaml
import re
class sim_module(object):
    """
    Generates snippets of code
    """

    modules_file = "py/modules.yaml"
    modules = None

    def __init__(self, name, subs = None):
        if not sim_module.modules:
            sim_module.modules = yaml.load(open(sim_module.modules_file))

        module = sim_module.modules.get(name)
        
        if module != None:
            self.name = name
            self.reactions = module['reactions']
            self.species = module['species']
            self.parameters = module['parameters']
        else:
            self.name = "unknown"
            self.reactions = {}
            self.species = {}
            self.parameters = {}

        if subs != None:
            for key in subs:
                self.__replace_name(key, subs[key])

    def __replace_name(old, new):
        if new == old:
            return

        module = self

        if module.parameters.get(old) != None:
            del module.parameters[old]
        elif module.species.get(old) != None:
            del module.species[old]
        for r in module.reactions:
            module.reactions[r] = re.sub(r"([^a-zA-Z0-9_])" + old + r"([^a-zA-Z0-9_])", r"\1"+new+r"\2", module.reactions[r])
            module.reactions[r] = re.sub(r"^" + old + r"([^a-zA-Z0-9_])", new + r"\1", module.reactions[r])
            module.reactions[r] = re.sub(r"([^a-zA-Z0-9_])" + old + r"$", r"\1" + new, module.reactions[r])
            module.reactions[r] = re.sub(r"^" + old + r"$", new, module.reactions[r])

class sim_connection(object):
    """
    """
    def __init__(self, input=None, output_module=None, output=None):
        self.output_module = output_module

        self.input = input

        self.output_parameter = None
        self.output_species = None

        if output_module:
            if output_module.parameters.get(output) != None:
                self.output_parameter = output
            elif output_module.species.get(output) != None:
                self.output_species = output

def combine_modules(modules, input_species=None, input_params=None, connections=None):
    """
    Generate final code from the given
    list of modules
    """

    #CHECK all species and parameter names for collisions

    existing_params = {}
    existing_species = {}

    output_species = {}
    output_params = {}

    if not input_species:
        input_species = {}
    if not input_params:
        input_params = {}

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
        if new == old:
            return

        if module.parameters.get(old) != None:
            input_params[new] = module.parameters[old]
            del module.parameters[old]
        elif module.species.get(old) != None:            
            input_species[new] = module.species[old]
            del module.species[old]
        for r in module.reactions:
            module.reactions[r] = re.sub(r"([^a-zA-Z0-9_])" + old + r"([^a-zA-Z0-9_])", r"\1"+new+r"\2", module.reactions[r])
            module.reactions[r] = re.sub(r"^" + old + r"([^a-zA-Z0-9_])", new + r"\1", module.reactions[r])
            module.reactions[r] = re.sub(r"([^a-zA-Z0-9_])" + old + r"$", r"\1" + new, module.reactions[r])
            module.reactions[r] = re.sub(r"^" + old + r"$", new, module.reactions[r])


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
        if existing_params.get(name) != None:
            replace_name(existing_params[name], name, existing_params[name].name + '_' + name)
            del existing_params[name]
        if existing_species.get(name) != None:
            replace_name(existing_species[name], name, existing_species[name].name + '_' + name)
            del existing_species[name]

    for c in connections:
        if c.output_module and c.input and :
            if c.output_species:
                replace_name(c.output_module, c.output_species, c.input)
            elif c.output_parameter:
                replace_name(c.output_module, c.output_parameter, c.input)

    #DONE checking for name collisions
    s = ['FIX: source sink']
    s.append('\n#Reactions')

    for m in modules:
        for r in m.reactions:
            s.append(r + ':\n    ' + m.reactions[r].replace('\n','\n    '))

    s.append('\n#Parameters')
    for p in input_params:
        s.append(p + ' = ' + str(input_params[p]))

    for m in modules:
        for p in m.parameters:
            if input_params.get(p) == None:
                s.append(p + ' = ' + str(m.parameters[p]))


    s.append('\n#Molecular species')
    s.append('source = 1')
    s.append('sink = 1')
    for p in input_species:
        s.append(p + ' = ' + str(input_species[p]))

    for m in modules:
        for n in m.species:
            if input_species.get(n) == None:
                s.append(n + ' = ' + str(m.species[n]))

    return '\n'.join(s)
