'use strict';
const main = require('./lib/main.js');
const rules = require('./lib/rules.js');
const validators = require('./lib/validators.js');
const selectors = require('./lib/selectors.js');

module.exports = {
    Detector: main.Detector,
    Report: main.Report,
    rules: rules,
    validators: validators,
    selectors: selectors,
};

