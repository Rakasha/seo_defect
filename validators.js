const _ = require('lodash');
const logger = require('debug')('seo_defect:');

/**
 * The validator functions must:
 * 1. Accept a DOM Node or a DOM NodeList as function argument
 * 2. Verify the DOM(s) inside the function body
 * 3. Returns: a results object
 */
const DEFAULT_RESULTS_OBJ = {
  summary: '',
  passed: false,
  msgs: [],
};

let DEFINED_VALIDATORS = {
};

/**
 * Helper function for merging validation results into single one
 * @param  {Array} results - array of resutls
 * @return {JSON} - merged result object
 */
function mergeResults(results) {
  let merged = _.cloneDeep(DEFAULT_RESULTS_OBJ);
  merged.passed = _.chain(results).map((x) => x.passed).every().value();
  let msgs = [];
  _.map(results, (r) => {
    r.msgs.forEach( (x) => msgs.push(x));
  })
  merged.msgs = msgs;
  console.log('merged=', merged);
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
      let result = _.clone(DEFAULT_RESULTS_OBJ);
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
   * Build a validation function to check if
   * the given SINGLE DOM has the specified TAG in its children
   * @param  {Array} tags - Array of tag names
   * @return {Function}
   */
  static hasTags(tags) {
    let validator = function(dom) {
      let result = _.clone(DEFAULT_RESULTS_OBJ);
      let missing = [];
      tags.map((tag) => {
        if (dom.getElementsByTagName(tag).length == 0) {
          missing.push(tag);
        }
      });

      if (missing.length > 0) {
        result.passed = false;
        results.msgs.push(`Missing Tags ${missing.join(',')}`);
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
      return r
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
      console.log('domNum=', domNum);
      let passed;
      switch (op) {
        case '>':
          passed = Boolean(domNum > num);
          break;
        case '<':
          passed = Boolean(domNum < num);
          break;
        case '==':
          passed = Boolean(domNum === num);
          break;
        default:
          throw Error(`Un-supported comparator: ${op}`);
      }
      let result = _.clone(DEFAULT_RESULTS_OBJ);
      result.passed = passed;
      result.msgs.push(`Got ${domNum} element(s)`);
      return result;
    };
    return validator;
  }
}

module.exports = {
  Meta: Meta,
  DEFINED_VALIDATORS: DEFINED_VALIDATORS,
};
