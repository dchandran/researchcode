import * as types from './validators';

/*
@description Container defining placeholders, rules etc. within a block
@sbol ComponentDefinition

*/

const TemplateSchema = {
  id      : types.id().isRequired,
  parent  : types.id(),
  metadata: types.shape({
    name       : types.string(),
    authors    : types.arrayOf(types.id).isRequired,
    version    : types.version().isRequired,
    tags       : types.object().isRequired,
    description: types.string()
  }).isRequired,

  grammar: types.object().isRequired             //todo - define. placeholders? rules?
};

export default TemplateSchema;