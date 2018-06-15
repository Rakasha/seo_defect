let DEFINED_SELECTORS = {
};


// High-order functions for building selectors
class Meta {
    static querySelector(text) {
        var selectorFunc = function (dom) {
            return dom.querySelector(text);
        };
        return selectorFunc
    }
    static querySelectorAll(text) {
        var selectorFunc = function (dom) {
            return dom.querySelectorAll(text);
        };
        return selectorFunc
    }
}

var exports = module.exports = {};
exports.Meta = Meta;
exports.DEFINED_SELECTORS = DEFINED_SELECTORS;