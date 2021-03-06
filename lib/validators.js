const _ = require('lodash');
const logger = require('debug')('seo_defect:');

/**
 * Use this to obtain the blank result object which
 * will then be returned by the validator functions
 * @return {JSON}
 */
function initResultObj() {
  const defaultResultObj = {
    summary: '',
    passed: false,
    msgs: [],
  };
  return defaultResultObj;
}

 /**
  * Provide pre-defined validator functions
  * The validator functions must:
  * 1. Accept a DOM Node or a DOM NodeList as function argument
  * 2. Verify the DOM(s) inside the function body
  * 3. Returns: a results object
  *             (uses the format defined in initResultObj() )
  */
class Def {
  /**
   * Check if the selector function had returned any data
   * @param  {obj} obj - object returned from the selector function
   * @return {JSON} - the result of validation
   */
  static mustExist(obj) {
    let r = initResultObj();

    if (obj === null) {
      r.passed = false;
      r.msgs.push(`Element(s) not found. Got: ${obj}`);
    } else if (obj.constructor.name === 'NodeList' && obj.length === 0) {
      r.passed = false;
      r.msgs.push(`Element(s) not found. Got empty NodeList: ${obj}`);
    } else {
      r.passed = true;
      r.msgs.push(`Got obj: ${obj}`);
    }
    return r;
  }
}

/**
 * Helper function for merging validation results into single one
 * @param  {Array} results - array of resutls
 * @return {JSON} - merged result object
 */
function mergeResults(results) {
  let merged = initResultObj();
  merged.passed = _.chain(results).map((x) => x.passed).every().value();
  let msgs = [];
  _.map(results, (r) => {
    r.msgs.forEach( (x) => msgs.push(x));
  });
  merged.msgs = msgs;
  return merged;
}

/**
 * Class which provides high-order functions for building validator functions
 * @class
 */
class Meta {
  /**
   * Build a validator function to check
   * if all of the given SINGLE DOM have the specified attributes
   * @param  {Array} attributes - Array of attribute names
   * @return {Function}
   */
  static hasAttributes(attributes) {
    let validator = function(dom) {
      let result = initResultObj();
      let missing = [];
      attributes.map(function(attr) {
        if (dom.hasAttribute(attr)) {
          logger('has attribute:', attr, '=', dom.getAttribute(attr));
        } else {
          logger('missing attribute:', attr);
          missing.push(attr);
        }
      });
      // Prepare the results data
      if (missing.length > 0) {
        result.passed = false;
        let msg = `Missing attributes: ${missing.join(',')}`;
        result.msgs.push(msg);
      } else {
        result.passed = true;
      }
      return result;
    };
    return validator;
  }
  /**
   * Build a validator function to check the DOM's attribute value
   * @param  {String} attr
   * @param  {String|Number} value
   * @return {Function} - validation function
   */
  static hasAttributeValue(attr, value) {
    let validator = function(dom) {
      let result = initResultObj();
      if (!dom.hasAttribute(attr)) {
        result.passed = false;
        result.msgs.push(`Missing attribute: ${attr}`);
        return result;
      }
      let v = dom.getAttribute(attr);
      if (v === value) {
        result.passed = true;
        return result;
      } else {
        result.passed = false;
        result.msgs.push(`attr ${attr}: expect ${value} got ${v}`);
        return result;
      }
    };
    return validator;
  }

  /**
   * Build a validation function to check if
   * the given SINGLE DOM has the specified TAG in its children
   * @param  {Array} tags - Array of tag names
   * @return {Function}
   */
  static hasTags(tags) {
    let validator = function(dom) {
      let result = initResultObj();
      let missing = [];
      tags.map((tag) => {
        if (dom.getElementsByTagName(tag).length == 0) {
          missing.push(tag);
        }
      });

      if (missing.length > 0) {
        result.passed = false;
        results.msgs.push(`Missing Tags: ${missing.join(',')}`);
      } else {
        result.passed = true;
      }
      return result;
    };
    return validator;
  }
  /**
   * Similar with the function hasAttributes()
   * but instead of checking the single DOM it now verify multiples
   * @param  {Array} attributes - Array of attribute names
   * @return {Function}
   */
  static allHaveAttributes(attributes) {
    let validator = function(doms) {
      let checkDomAttribute = Meta.hasAttributes(attributes);
      let results = _.map(doms, checkDomAttribute);
      let r = mergeResults(results);
      logger('merged results:', r);
      return r;
    };
    return validator;
  }
  /**
   * Similar with the function hasTags()
   * but instead of checking the single DOM it now verify multiples
   * @param  {Array} tags - Array of tag names
   * @return {Function}
   */
  static allHaveTags(tags) {
    let validator = function(doms) {
      let verifyDOM = Meta.hasTags(tags);
      let results = _.map(doms, verifyDOM);
      return mergeResults(results);
    };
    return validator;
  }
  /**
   * Check if the number of DOMs matches the given equation.
   * Ther result is determined by `<num of doms> <op> <num>`
   * @example
   *   // Creates a function to check if the number of DOMs is greater than 2
   *   checkAmount('>', 2)
   * @param  {string} op - comparator (==, >, <)
   * @param  {number} num - number to compare with
   * @return {JSON} - result of verification
   */
  static checkAmount(op, num) {
    let validator = function(doms) {
      let domNum = doms.length;
      let result = initResultObj();
      switch (op) {
        case '>':
          result.passed = Boolean(domNum > num);
          break;
        case '<':
          result.passed = Boolean(domNum < num);
          break;
        case '==':
          result.passed = Boolean(domNum === num);
          break;
        default:
          throw Error(`Un-supported comparator: ${op}`);
      }
      result.msgs.push(`Got ${domNum} element(s)`);
      result.msgs.push(`Compare: domNum ${op} ${num} ? ${result.passed}`);
      return result;
    };
    return validator;
  }
}

module.exports = {
  Meta: Meta,
  Def: Def,
};
