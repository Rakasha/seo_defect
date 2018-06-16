const _ = require('lodash');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const utils = require('./utils.js');
const rules = require('./rules.js');
const validators = require('./validators.js');

class Client {
  constructor() {
    this.rules_to_apply = [];
    this.document_dom = null;
  }

  setDocumentSourceByDOM(documentDom) {
    this.document_dom = documentDom;
  }

  // Returns a promise
  setDocumentSourceFromFile(filepath) {
    return JSDOM.fromFile(filepath).then(
      dom => {this.document_dom = dom.window.document;}
    );
  }

  // Returns a promise
  setDocumentSourceFromURL(url) {
    return JSDOM.fromURL(url).then(
      dom => {this.document_dom = dom.window.document;}
    );
  }

  define_new_rule(rule_name, selector, validator) {
    if (rules.DEFINED_RULES.hasOwnProperty(rule_name)) {
      throw "Duplicate rule name: " + rule_name;
    }
    rules.DEFINED_RULES[rule_name] = [selector, validator];
  }

  add_rules(rule_names) {
    this.rules_to_apply = rule_names.slice();
  }

  check_rules() {
    var duplicate_rules = _(this.rules_to_apply).groupBy().pickBy(x => x.length > 1).keys().value();
    if (duplicate_rules.length !== 0) {
      throw "found duplicate rules: " + duplicate_rules;
    }
  }

  run() {
    this.check_rules();
    if (this.document_dom == null) {
      throw "Please set HTML source"
    }
    let success = [];
    let failed = [];

    this.rules_to_apply.forEach(ruleName => {
      console.log("=====  processing rule " + ruleName + "=======");
      let [selector, validator] = rules.DEFINED_RULES[ruleName];
      
      console.log("...using selector " + selector);
      
      var selected = selector(this.document_dom);
      console.log("selected: ", selected);

      console.log("...using validator " + validator);
      var valid = validator(selected);
      console.log('validate result =', valid);
      if (valid === true) {
        console.log('success')
        success.push(ruleName);
      } else {
        console.log('failed')
        failed.push(ruleName);
      }
    });
    console.log("==============Summary===============");
    console.log("Success: ", success);
    console.log("Failed: ", failed);
    return [success, failed];
  }
}

var exports = module.exports = {};
exports.Client = Client;

// const dom1 = new JSDOM(
//     `<p>Hello
//       <img src="foo.jpg">
//       <a></a>
//     </p>`,
//     { includeNodeLocations: true }
// );

// const dom2 = new JSDOM(
//     `<p>Hello
//       <a></a>
//       <img src="foo.jpg" alt="mypic">
//     </p>`

// );

  // const document = dom1.window.document;
  // const bodyEl = document.body; // implicitly created
  // const pEl = document.querySelector("p");
  // const textNode = pEl.firstChild;
  // const imgEl = document.querySelector("img");
/* 
  console.log(dom1.nodeLocation(bodyEl));   // null; it's not in the source
  console.log(dom1.nodeLocation(pEl));      // { startOffset: 0, endOffset: 39, startTag: ..., endTag: ... }
  console.log(dom1.nodeLocation(textNode)); // { startOffset: 3, endOffset: 13 }
  console.log(dom1.nodeLocation(imgEl));    // { startOffset: 13, endOffset: 32 }
*/
