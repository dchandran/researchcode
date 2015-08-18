setupProgram(
    {
        code: "py/example1.py",

        setup: function(bounds,timeseries) {
            var source_molecule = createModuleFromType("m1", "source");
            var two_component = createModuleFromType("m2", "two component");
            var expression_cassette = createModuleFromType("m3", "expression cassette");
            var lipid_bilayer = createModuleFromType("m4", "lipid bilayer");
            var dna_template = createModuleFromType("m6", "DNA template");   
            var inhibitor = createModuleFromType("m7", "inhibitor");

            source_molecule.inputs.numMolecules = 100;
            two_component.inputs.numReceptors = 5;
            two_component.inputs.numTfs = 10;
            two_component.inputs.percentActiveTFs = 0.0;
            two_component.inputs.percentActiveMembranes = 0.0;

            lipid_bilayer.inputs.bounds = bounds;
            expression_cassette.inputs.parts = { p: {type:'promoter'}, gfp:{type:'cds'} };
            expression_cassette.inputs.state = 0;
            expression_cassette.inputs.orientation = 'r';

            lipid_bilayer.connect('outerCellBounds', source_molecule, 'bounds');
            lipid_bilayer.connect('innerCellBounds',dna_template, 'bounds');
            lipid_bilayer.connect('innerCellBounds',two_component, 'inactiveBounds');

            dna_template.connect('right',expression_cassette, 'startPos');
            lipid_bilayer.connect('innerCellBounds',expression_cassette, 'bounds');
            
            
            lipid_bilayer.connect('innerCellBounds', two_component, 'activeBounds');
            expression_cassette.connect('firstPart', two_component, 'target');

            lipid_bilayer.connect('innerCellBounds', inhibitor, 'bounds');
            two_component.connect('tfs', inhibitor, 'tfs');

            //protein_bursts.connect('mRNAPos', two_component, 'tfStartPos');

            timeseries.connect('(r1+r0)/2', two_component, "numReceptors");
            timeseries.connect('(tf1+tf0)/2', two_component, "numTfs");    
            timeseries.connect('tf1/(r1+r0)', two_component, "percentActiveMembranes");
            timeseries.connect('tf1/(tf1+tf0)', two_component, "percentActiveTFs");
            timeseries.connect('gene_on', expression_cassette, "state");
            timeseries.connect('mRNA', expression_cassette, "numRNA");
            timeseries.connect('GFP', expression_cassette, "numGFP");

            return [source_molecule,two_component,expression_cassette,lipid_bilayer,dna_template,inhibitor];
        }
    }
);
