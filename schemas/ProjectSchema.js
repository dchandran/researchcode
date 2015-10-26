import * as types from './validators';

/*
Project is the container for a body of work.

*/

const ProjectSchema = {
  id      : types.id().isRequired,
  parent  : types.id(),
  metadata: types.shape({
    authors    : types.arrayOf(types.id()).isRequired,
    version    : types.version().isRequired,
    tags       : types.object().isRequired,
    name       : types.string(),
    description: types.string()
  }).isRequired,

  components: types.arrayOf(types.id()).isRequired
};

export default ProjectSchema;