setupProgram(
    {
        code: "py/example1.py",

        setup: function(timeseries) {
            var source_molecule = createModuleFromType("m1", "source");
            var two_component = createModuleFromType("m2", "two component");
            var expression_cassette = createModuleFromType("m3", "expression cassette");
            var lipid_bilayer = createModuleFromType("m4", "lipid bilayer");
            var protein_bursts = createModuleFromType("m5", "protein bursts");
            var dna_template = createModuleFromType("m6", "DNA template");   
            var inhibitor = createModuleFromType("m7", "inhibitor");

            source_molecule.inputs.numMolecules = 100;
            two_component.inputs.numReceptors = 5;
            two_component.inputs.numTfs = 10;
            two_component.inputs.percentActiveTFs = 0.0;
            two_component.inputs.percentActiveMembranes = 0.0;

            lipid_bilayer.inputs.bounds = {left:canvas.left, top:canvas.top, width: canvas.width, height: canvas.height};
            expression_cassette.inputs.parts = { p: {type:'promoter'}, gfp:{type:'cds'} };
            expression_cassette.inputs.state = 0;

            lipid_bilayer.connect('outerCellBounds', source_molecule, 'bounds');
            lipid_bilayer.connect('innerCellBounds',dna_template, 'bounds');
            lipid_bilayer.connect('innerCellBounds',two_component, 'inactiveBounds');
            lipid_bilayer.connect('innerCellBounds', protein_bursts, 'bounds');

            dna_template.connect('bounds',expression_cassette, 'bounds');
            
            expression_cassette.connect('lastPart', protein_bursts, 'cds');
            lipid_bilayer.connect('innerCellBounds', two_component, 'activeBounds');
            expression_cassette.connect('firstPart', two_component, 'target');

            lipid_bilayer.connect('innerCellBounds', inhibitor, 'bounds');
            two_component.connect('tfs', inhibitor, 'tfs');

            timeseries.connect('(r1+r0)/2', two_component, "numReceptors");
            timeseries.connect('(tf1+tf0)/2', two_component, "numTfs");    
            timeseries.connect('tf1/(r1+r0)', two_component, "percentActiveMembranes");
            timeseries.connect('tf1/(tf1+tf0)', two_component, "percentActiveTFs");
            timeseries.connect('gene_on', expression_cassette, "state");
            timeseries.connect('mRNA', protein_bursts, "numRNA");
            timeseries.connect('GFP', protein_bursts, "numProteins");

            return [source_molecule,two_component,expression_cassette,lipid_bilayer,protein_bursts,dna_template,inhibitor];
        }
    }
);
