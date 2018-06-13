const _ = require('lodash');

// ================= Selector Functions ================
let DEFINED_SELECTORS = {
  "All <a> tags": function (document) { return document.getElementsByTagName("a"); },
  "All <img> tags": function (document) { return document.getElementsByTagName("img"); },
  "The <head> tag": selectElement("head")
};

// ================= High-order Functions ==================
function hasAttribute(attrName) {
  var validator_func = function (dom) {
    if (dom[attrName]) {
      return true;
    } else {
      console.log("dom does not have attr: " + attrName);
      return false;
    }
  }
  return validator_func
}

function selectElement(selectorString) {
  var selector_func = function (dom) {
    return dom.querySelector(selectorString);
  }
  return selector_func
}

function selectElements(querySelectorString) {
  var selector_func = function (dom) {
    return dom.querySelectorAll(querySelectorString);
  };
  return selector_func;
}

// ================= Validator Functions =================
let DEFINED_VALIDATORS = {
  "all have attributes alt": function (doms) {
    var results = _.map(doms, hasAttribute("alt"));
    console.log("results: ", results);
    return _.every(results, Boolean);
  },
  "all have attr rel": function (doms) {
    var results = _.map(doms, hasAttribute("rel"));
    console.log("results: ", results);
    return _.every(results, Boolean);
  },
  "have <title>": function (dom) { 
    console.log(dom.childNodes[0]);
    if (dom.getElementsByTagName("title").length > 0) {
      return true;
    } else {
      console.log("dom does not have tag <title>")
      return false;
    }
  }
};

// ================ Rules ===========
let DEFINED_RULES = {
  "all images have alt text": ["All <img> tags", "all have attributes alt"],
  "all anchors have rel value": ["All <a> tags", "all have attr rel"],
  "<head> have <title>": ["The <head> tag", "have <title>"]
};

var exports = module.exports = {};
exports.DEFINED_SELECTORS = DEFINED_SELECTORS;
exports.hasAttribute = hasAttribute;
exports.selectElement = selectElement;
exports.selectElements = selectElements;
exports.DEFINED_VALIDATORS = DEFINED_VALIDATORS;
exports.DEFINED_RULES = DEFINED_RULES;