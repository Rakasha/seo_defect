const selectors = require('./selectors.js');
const validators = require('./validators.js');


/**
 * Functions for assembling rules
 */
class Meta {
  /**
   * Build a rule which checks if all the selected DOMs
   * have the attributes
   * @param  {string} tag
   * @param  {Array} attrList - Array of attibute names
   * @return {Array}
   */
  static checkElementAttributes(tag, attrList) {
    let name = `All <${tag}> must have ${attrList} attributes`;
    return [name,
            selectors.Meta.querySelectorAll(tag),
            validators.Meta.allHaveAttributes(attrList)];
  }

  /**
   * Check the number of selected DOMs
   * @param  {string} str - DOMString
   * @param  {string} comparator
   * @param  {Number} num
   * @return {Array}
   */
  static checkNumberOfSelected(str, comparator, num) {
    let name = `Check number of '${str}' ${comparator} ${num}`;
    return [name,
            selectors.Meta.querySelectorAll(str),
            validators.Meta.checkAmount(comparator, num)];
  }
}

let PREDEFINED = [
  Meta.checkElementAttributes('img', ['alt']),
  Meta.checkElementAttributes('a', ['rel']),
];

module.exports = {
  PREDEFINED: PREDEFINED,
  Meta: Meta,
};
