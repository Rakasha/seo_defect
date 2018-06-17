let DEFINED_SELECTORS = {
};


/**
 * High-order functions for building selector functions.
 * The selector
 */
class Meta {
    /**
     * Build a querySelector() function with the given string
     * @param  {String} text - querySelector
     * @return {Function} - A selector function
     */
    static querySelector(text) {
        let selectorFunc = function(dom) {
            return dom.querySelector(text);
        };
        return selectorFunc;
    }
    /**
     * Build a querySelectorAll function with the given string
     * @param  {String} text - querySelector
     * @return {Function} - A selector function
     */
    static querySelectorAll(text) {
        let selectorFunc = function(dom) {
            return dom.querySelectorAll(text);
        };
        return selectorFunc;
    }
}

module.exports = {
    Meta: Meta,
    DEFINED_SELECTORS: DEFINED_SELECTORS,
};
