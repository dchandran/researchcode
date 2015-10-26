import wrap from './wrap';
import urlRegex from 'url-regex';
import semverRegex from 'semver-regex';

/*
TODO - consistent error handling, ability to handle errors and return (esp. in loops)
*/

//validates an ID
export const id = params => wrap(input => {

  //all of our UUIDs will have a namespace
  var namespace = 'GDes'; //todo - decide on our namespace

  return (isString(input) && 
      
      //UUID v4 has length 36
      input.length === namespace.length + 36 &&     

      input.substring(0,namespace.length)=== namespace &&

      //UUID v4 has '-' at specific locations
      input.substring(namespace.length + 8,namespace.length + 9)==='-' &&
      input.substring(namespace.length + 13,namespace.length + 14)==='-' &&
      input.substring(namespace.length + 18,namespace.length + 19)==='-' &&
      input.substring(namespace.length + 23,namespace.length + 24)==='-' &&

      //no non-word chars allowed except '-'
      !(/\W+/.test(input.replace('-','')))
    );
}, 'uuid5');

export const string = params => wrap(input => {
  return isString(input) || input instanceof String;
}, 'string');

export const sequence = params => wrap(input => {
  return isString(input) && /^[acgt]*$/ig.test(input);
}, 'sequence');

export const email = params => wrap(input => {
  //todo - get a robust one, i just hacked this together
  return isString(input) === 'string' && /\w+?@\w\w+?\.\w{2,6}/.test(input);
}, 'email');

export const number = params => wrap(input => {
  var range;

  if (getPropType(input) !== 'number') {
    return false;
  }

  if (params !== undefined) {
    if (params.hasOwnProperty('min') && params.min > input) {
      return false;
    }

    if (params.hasOwnProperty('max') && params.max < input) {
      return false;
    }
  }

  return true;
}, 'number');

export const func = params => wrap(input => {
  return getPropType(input) === 'function';
}, 'function');

export const array = params => wrap(input => {
  return Array.isArray(input);
}, 'array');

export const object = params => wrap(input => {
  return input !== null && getPropType(input) === 'object';
}, 'object');

export const bool = params => wrap(input => {
  return input === true || input === false;
}, 'bool');

export const undef = params => wrap(input => {
  return input === undefined;
});

export const instanceOf = type => wrap(input => {
  return input instanceof type;
});

//reference check only. Might want another one for deep equality check
export const equal = checker => wrap(input => {
  return Object.is(checker, input);
});

//should return error?
export const shape = (fields, params, typename) => wrap(input => {
  return Object.keys(fields).every((key) => {
    return fields[key](input[key]);
  });
}, typename);

export const oneOf = possible => wrap(input => {
  if (!possible.indexOf(input) > -1) {
    //throw new Error(input + ' not found in ' + possible.join(','));
    return false;
  }
});

//can pass either function to validate, or an object to check instanceof
export const oneOfType = types => wrap(input => {
  return types.some(type => {
    return typeof type === 'function' ?
           type(input) :
           input instanceof type;
  })
});

export const arrayOf = validator => wrap(input => {
  return Array.isArray(input) && input.every(item => validator(item));
});

//remove package if you remove this test
export const version = params => wrap(input => {
  return semverRegex().test(input) ?
         true :
         new Error();
});

//remove package if you remove this test
export const url = params => wrap(input => {
  return urlRegex({exact: true}).test(input);
});

//utils

function isString (input) {
  return getPropType(input) === 'string';
}

// Equivalent of `typeof` but with special handling for array and regexp.
function getPropType (propValue) {
  var propType = typeof propValue;
  if (Array.isArray(propValue)) {
    return 'array';
  }
  if (propValue instanceof RegExp) {
    // Old webkits (at least until Android 4.0) return 'function' rather than
    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
    // passes PropTypes.object.
    return 'object';
  }
  return propType;
}

// This handles more types than `getPropType`, e.g. Date and regexp
function getPreciseType (propValue) {
  var propType = getPropType(propValue);
  if (propType === 'object') {
    if (propValue instanceof Date) {
      return 'date';
    } else if (propValue instanceof RegExp) {
      return 'regexp';
    }
  }
  return propType;
}