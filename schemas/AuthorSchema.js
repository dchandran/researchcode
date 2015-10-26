import * as types from './validators';

/*
@description A user account

*/

const AuthorSchema = {
  id         : types.id().isRequired,
  email      : types.email().isRequired,
  firstName  : types.string(),
  lastName   : types.string(),
  description: types.string(),
  homepage   : types.url(),
  social     : types.arrayOf(types.shape({
    provider: types.string().isRequired, //e.g. facebook
    username: types.string().isRequired
  }))
};

export default AuthorSchema;