const selectors = require('./selectors.js');
const validators = require('./validators.js');


let DEFINED_RULES = {
  'all images have alt value': [selectors.Meta.querySelectorAll('img'),
                                validators.Meta.allHaveAttributes(['alt'])],
  'all anchors have rel value': [selectors.Meta.querySelectorAll('a'),
                                 validators.Meta.allHaveAttributes(['rel'])],
  '<head> have <title>': [selectors.Meta.querySelector('head'),
                          validators.Meta.hasTags(['title'])],
  'has less than 2 <strong> tags': [selectors.Meta.querySelectorAll('strong'),
                                    validators.Meta.checkAmount('<', 2)],
  'must have input box': [selectors.Meta.querySelector('input'),
                          validators.Def.mustExist],
};

module.exports = {
  DEFINED_RULES: DEFINED_RULES,
};