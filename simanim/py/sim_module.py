import yaml
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
    def __init__(self):
        self.input_module = None
        self.input_parameter = None
        self.input_species = None
        self.output_module = None
        self.output_parameter = None
        self.output_species = None

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
            if not output_species.get(c.output_species):
                output_species = []
            output_species.append(c.output_module)
        if c.output_parameter and c.output_module:
            if not output_params.get(c.output_parameter):
                output_params = []
            output_params.append(c.output_parameter)


    collisions = []

    def replace_name(module, old, new):
        if module.parameters.get(old):
            module.parameters[new] = module.parameters[old]
            del module.parameters[old]
        if module.species.get(old):
            module.species[new] = module.species[old]
            del module.species[old]
        for r in module.reactions:
            module.reactions[r] = re.sub(old, new, module.reactions[r])


    for i in range(0,len(modules)):
        for p in modules[i].parameters:
            if existing_params.get(p):
                if not (output_params.get(p) and output_params[p].count(modules[i]) > 0):
                    collisions.append( {'module1': existing_params[p], 'module2': modules[i], 'name': p} )
            else:
                existing_params[p] = modules[i]

        for s in modules[i].species:
            if existing_species.get(s):
                if not (output_species.get(s) and output_species[s].count(modules[i]) > 0):
                    collisions.append( {'module1': existing_species[s], 'module2': modules[i], 'name': s} )
            else:
                existing_species[s] = modules[i]

        for collision in collisions:
            module1 = collision['module1']
            module2 = collision['module2']
            name = collision['name']

            replace_name(module1, name, module1.name + '_' + name)
            replace_name(module2, name, module2.name + '_' + name)

            for c in connections:
                if c.input_parameter == name:
                    if c.input_module == module1:
                        c.input_parameter = module1.name + '_' + name
                    if c.input_module == module2:
                        c.input_parameter = module2.name + '_' + name
                if c.input_species == name:
                    if c.input_module == module1:
                        c.input_species = module1.name + '_' + name
                    if c.input_module == module2:
                        c.input_species = module2.name + '_' + name


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
