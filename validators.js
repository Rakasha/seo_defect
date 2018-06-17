const _ = require('lodash');
const logger = require('debug')('seo_defect:');

let DEFINED_VALIDATORS = {
};
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
      let results = attributes.map( function(attr) {
        if (dom.hasAttribute(attr)) {
          logger('has attribute:', attr, '=', dom.getAttribute(attr));
          return true;
        } else {
          logger('missing attribute:', attr);
          return false;
        }
      });
      return _.every(results);
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
      let results = tags.map((tag) => dom.getElementsByTagName(tag).length > 0);
      return _.every(results);
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
      logger('results:', results);
      return _.every(results);
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
      return _.every(results);
    };
    return validator;
  }
}

module.exports = {
  Meta: Meta,
  DEFINED_VALIDATORS: DEFINED_VALIDATORS,
};
