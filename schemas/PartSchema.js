import * as types from './validators';
import AnnotationSchema from './AnnotationSchema';

/*
A physical sequence.

*/

const PartSchema = {
  id      : types.id().isRequired,
  parent  : types.id(),
  metadata: types.shape({
    authors    : types.arrayOf(types.id()).isRequired,
    version    : types.version().isRequired,
    tags       : types.object().isRequired,
    name       : types.string(),
    description: types.string()
  }, null, 'metadata').isRequired,

  sequence  : types.id().isRequired,
  source    : types.id(),
  annoations: types.arrayOf(types.shape(AnnotationSchema).isRequired)
};

var GraphQLLookupTable = {
  'uuid': () => 'GraphQLString'
};

function convertSchemaToGraphQL(json) {
  var newJson = {};
  var val;

  for (var key in json) {
    val = json[key];
    if (typeof(val)==='object') { //recursive case
      newJson[key] = convertSchemaToGraphQL(val);
    } else {  //base case
      if (key==='type') {
        
        if (GraphQLLookupTable.hasOwnProperty(val)) {
        
          val = GraphQLLookupTable[val].call();
        
        } else { //if key not in GraphQLLookupTable
       
          var m = arrayRegexp.exec(val); //check for array type
          if (m && m.length > 1) {
            val = m[1];
            if (GraphQLLookupTable.hasOwnProperty(val)) {
              val = GraphQLLookupTable[val].call();            
            }
            val = new GraphQLList(val);
          }

        }
      }

      newJson[key] = val;
    }
  }

  return newJson;
}

console.log(PartSchema.metadata.typename);

export default PartSchema;