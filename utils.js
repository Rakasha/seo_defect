const _ = require('lodash');

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


var exports = module.exports = {};
exports.hasAttribute = hasAttribute;