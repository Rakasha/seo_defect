const _ = require('lodash');
const logger = require('debug')('seo_defect:');

let DEFINED_VALIDATORS = {  
};

class Meta {
  static allHaveAttributes(attributes) {
    var validator = function (doms) {
      var checkDomAttribute = Meta.hasAttributes(attributes);
      var results = _.map(doms, checkDomAttribute);
      logger('results:', results)
      return _.every(results);
    };
    return validator;
  }

  static allHaveTags(tags) {
    var validator = function (doms) {
      var verifyDOM = Meta.hasTags(tags);
      var results = _.map(doms, verifyDOM);
      return _.every(results);
    };
    return validator;
  }

  static hasAttributes(attributes) {
    var validator = function (dom) {
      var results = attributes.map( function (attr) {
        if(dom.hasAttribute(attr)) {
          logger('has attribute:', attr, '=', dom.getAttribute(attr));
          return true;
        } else {
          logger('missing attribute:', attr);
          return false;
        }
      });
      return _.every(results);
    }
    return validator
  }

  static hasTags(tags) {
    var validator = function (dom) {
      var results = tags.map(tag => dom.getElementsByTagName(tag).length > 0);
      return _.every(results);
    }
    return validator
  }
}

var exports = module.exports = {};
exports.Meta = Meta;
exports.DEFINED_VALIDATORS = DEFINED_VALIDATORS;