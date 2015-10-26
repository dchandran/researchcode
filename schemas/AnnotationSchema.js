import * as types from './validators';

/*
@description An annotation on a sequence.
@parent Part
@sbol Annotation (kinda)

*/

const MetadataScheme = {
};

const AnnotationSchema = {
  metadata: types.shape({
    version    : types.version().isRequired,
    authors    : types.arrayOf(types.id()).isRequired,
    tags       : types.object().isRequired,
    name       : types.string(),
    description: types.string()
  }).isRequired,

  optimizability: types.oneOf([ //todo - rename
    'none', //todo - define enum. allow sequence? capture as sequence e.g. ACNRYGT
    'codon-optimize',
    'any'
  ]),

  //either a sequence or a range is required, or potentially both? Perhaps dependent on type? Is this just more of an interface?

  sequence: types.sequence(),
  start   : types.number(),
  end     : types.number()
};

export default AnnotationSchema;