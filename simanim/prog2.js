setupProgram(
    {
        code: "py/example2.py",

        setup: function(bounds, timeseries) {
            var comk = createModuleFromType("ComK", "transcription factor");
            var coms = createModuleFromType("ComS", "transcription factor");
            var meca = createModuleFromType("MecA", "inhibitor");
            var comk_gene = createModuleFromType("comk", "expression cassette");
            var coms_gene = createModuleFromType("coms", "expression cassette");

            var dna = createModuleFromType("dna", "DNA template");

            dna.inputs.bounds = bounds;
            comk.inputs.inactiveBounds = bounds;
            comk.inputs.activeBounds = bounds;
            coms.inputs.inactiveBounds = bounds;
            coms.inputs.activeBounds = bounds;
            comk_gene.inputs.bounds = bounds;
            coms_gene.inputs.bounds = bounds;
            meca.inputs.bounds = bounds


            coms_gene.inputs.orientation = 'forward';
            comk_gene.inputs.orientation = 'reverse';
            dna.connect('center', comk_gene, 'startPos');
            dna.connect('center', coms_gene, 'startPos');
            
            comk.connect('tfs', meca, 'comk');
            coms.connect('tfs', meca, 'coms');

            comk_gene.connect('mRNAPos', comk, 'tfStartPos');
            coms_gene.connect('mRNAPos', coms, 'tfStartPos');            

            comk_gene.inputs.parts = { p: {type:'promoter'}, comk:{type:'cds'} };
            comk_gene.inputs.state = 0;

            coms_gene.inputs.parts = { p: {type:'promoter'}, coms:{type:'cds'} };
            coms_gene.inputs.state = 0;

            coms_gene.connect('firstPart', coms, 'target');
            comk_gene.connect('firstPart', coms, 'target2');

            
            timeseries.connect('MecA+inhibit1_ab+inhibit2_ab', meca, "numMolecules");
            timeseries.connect('inhibit1_ab', meca, "comk bound");
            timeseries.connect('inhibit2_ab', meca, "coms bound");

            timeseries.connect('ComK', comk, "numTfs");
            timeseries.connect('ComS', coms, "numTfs");

            timeseries.connect('comk_gene_on', comk_gene, "state");
            timeseries.connect('coms_gene_on', coms_gene, "state");

            timeseries.connect('comk_mRNA', comk_gene, "numRNA");
            timeseries.connect('coms_mRNA', coms_gene, "numRNA");

            return [dna, comk, coms, meca, comk_gene, coms_gene];
        }
    }
);

