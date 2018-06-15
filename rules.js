const selectors = require('./selectors.js');
const validators = require('./validators.js');

let DEFINED_RULES = {
  "all images have alt value": [selectors.Meta.querySelectorAll('img'), validators.Meta.allHaveAttributes(['alt'])],
  "all anchors have rel value": [selectors.Meta.querySelectorAll('a'), validators.Meta.allHaveAttributes(['rel'])],
  "<head> have <title>": [selectors.Meta.querySelector('head'), validators.Meta.hasTags(['title'])],
  "has less than 2 <strong> tags": [selectors.Meta.querySelectorAll('strong'), doms => doms.length < 2]
};

var exports = module.exports = {};
exports.DEFINED_RULES = DEFINED_RULES;
