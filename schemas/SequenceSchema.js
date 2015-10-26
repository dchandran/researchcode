import * as types from './validators';

/*
@description A sequence, typically of a part and a large string. Sequences are references because they are not usually loaded in the applicaiton, and may be very large, so can be loaded with their own API for defining desired regions
@sbol Sequence (mostly)

*/

const SequenceSchema = {
  id      : types.id().isRequired,
  metadata: types.shape({
    authors    : types.arrayOf(types.id()).isRequired,
    version    : types.version().isRequired,
    tags       : types.object().isRequired,
    name       : types.string(),
    description: types.string()
  }).isRequired,

  type: types.oneOf([
    'dna',        //IUPAC DNA
    'protein', 		//IUPAC Protein
    'molecule' 		//SMILES
  ]).isRequired,

  sequence     : types.sequence().isRequired,     //todo - define. placeholders? rules? how to pass type?
  orientForward: types.bool()                //default is forward
};

export default SequenceSchema;