const fs = require('fs');
const { Readable } = require('stream')
const _ = require('lodash');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const utils = require('./utils.js');
const rules = require('./rules.js');
const validators = require('./validators.js');
const appName = 'seo_defect:';
const logger = require('debug')(appName);


class Client {
  constructor() {
    this.rules_to_apply = [];
    this.document_dom = null;
    this.report = null;
  }

  setDocumentSourceByDOM(documentDom) {
    this.document_dom = documentDom;
  }

  // Returns a promise
  setDocumentSourceFromFile(filepath) {
    return JSDOM.fromFile(filepath).then(dom => {
        this.document_dom = dom.window.document;
        return this;
      }
    );
  }

  // Returns a promise
  setDocumentSourceFromURL(url) {
    return JSDOM.fromURL(url).then(
      dom => {this.document_dom = dom.window.document;}
    );
  }

  // Returns a promise
  setDocumentSourceFromStream(readableStream) {
    
    let setDom = (dom) => this.setDocumentSourceByDOM(dom);
    let buffer = '';

    let p = new Promise (function (resolve, reject) {
      let buffer = '';
      readableStream.on('readable', () => {
          let data;
          while (data = readableStream.read()) {
            buffer += data.toString();
          }
      })
      readableStream.on('end', () => {
        logger('Got data from stream:', buffer);
        let documentDom = (new JSDOM(buffer)).window.document;
        logger('documentDom from stream:', documentDom);
        setDom(documentDom);
        resolve();
      });
      readableStream.on('error', (err) => {
        reject(err);
      });
    });
    return p;
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
    this.report = null;
    let success = [];
    let failed = [];

    this.rules_to_apply.forEach(ruleName => {
      logger("=====  processing rule " + ruleName + "=======");
      let [selector, validator] = rules.DEFINED_RULES[ruleName];
      
      logger("...using selector " + selector);
      
      var selected = selector(this.document_dom);
      logger("selected: ", selected);

      logger("...using validator " + validator);
      var valid = validator(selected);
      logger('validate result =', valid);
      if (valid === true) {
        logger('success')
        success.push(ruleName);
      } else {
        logger('failed')
        failed.push(ruleName);
      }
    });

    this.report = new Report();
    this.report._data['success'] = _.cloneDeep(success);
    this.report._data['failed'] = _.cloneDeep(failed);

    logger("==============Summary===============");
    logger("Success: ", success);
    logger("Failed: ", failed);
    return [success, failed];
  }
}

class Report {
  constructor() {
    this._data = {'success': [], 'failed': []};
  }
  
  detail() {
    return _.cloneDeep(this._data);
  }
  
  // Write report data into passed writable stream
  writeToStream(writable) {
    logger('Received writable stream', writable);
    this.toStream().pipe(writable)
    return writable;
  }

  toFile(filepath) {
    return new Promise((resolve, reject) => {
      let readable = this.toStream();
      let writable = fs.createWriteStream(filepath);
      readable.pipe(writable);  
      writable.on('finish', () => {
        logger('Report written to', filepath);
        resolve(filepath)
      }).on('error', reject);
    });
  }

  // Turns report data into readable stream
  toStream() {
    // let readable = new Stream.Readable();
    let readable = new Readable;
    this._data['success'].map(
      ruleName => {readable.push(`[success] ${ruleName}\n`)});
    this._data['failed'].map(
      ruleName => {readable.push(`[failed] ${ruleName}\n`)});
    readable.push(null);
    return readable;
  }

  print() {    
    this._data['success'].map(
      ruleName => console.log(`[success] ${ruleName}`)
    );
    this._data['failed'].map(
      ruleName => console.error(`[failed] ${ruleName}`)
    );
  }
}

var exports = module.exports = {};
exports.Client = Client;
exports.Report = Report;

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
  logger(dom1.nodeLocation(bodyEl));   // null; it's not in the source
  logger(dom1.nodeLocation(pEl));      // { startOffset: 0, endOffset: 39, startTag: ..., endTag: ... }
  logger(dom1.nodeLocation(textNode)); // { startOffset: 3, endOffset: 13 }
  logger(dom1.nodeLocation(imgEl));    // { startOffset: 13, endOffset: 32 }
*/
