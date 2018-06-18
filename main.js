const fs = require('fs');
const {Readable} = require('stream');
const _ = require('lodash');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const rules = require('./rules.js');
const appName = 'seo_defect:';
const logger = require('debug')(appName);

/**
 * Client which accept HTML and validation rules and generates the reports
 * @class
 */
class Client {
  /**
   * @constructor
   */
  constructor() {
    this.rules_to_apply = [];
    this.document_dom = null;
    this.report = null;
  }

  /**
   * @param {domNode} documentDom
   */
  setDocumentSourceByDOM(documentDom) {
    this.document_dom = documentDom;
  }

  /**
   * @param  {string} filepath
   * @return {Promise}
   */
  setDocumentSourceFromFile(filepath) {
    return JSDOM.fromFile(filepath).then((dom) => {
        this.document_dom = dom.window.document;
        return this;
      }
    );
  }

  /**
   * @param  {string} url
   * @return {Promise}
   */
  setDocumentSourceFromURL(url) {
    return JSDOM.fromURL(url).then(
      (dom) => this.document_dom = dom.window.document
    );
  }

  /**
   * @param  {ReadableStream} readableStream
   * @return {Promise}
   */
  setDocumentSourceFromStream(readableStream) {
    let setDom = (dom) => this.setDocumentSourceByDOM(dom);
    return new Promise(function(resolve, reject) {
      let buffer = '';
      readableStream.on('readable', () => {
          let data;
          while (data = readableStream.read()) {
            buffer += data.toString();
          }
      });
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
  }

  /**
   * Add rules to be processed
   * @param  {Array} ruleNames - Array of Strings
   *
   */
  addRules(ruleNames) {
    this.rules_to_apply = ruleNames.slice();
  }

  /**
   * Check if the added rules is valid.
   */
  checkRules() {
    let duplicateRules = _(this.rules_to_apply)
                          .groupBy().pickBy((x) => x.length > 1).keys().value();
    if (duplicateRules.length !== 0) {
      throw new Error('found duplicate rules: ' + duplicateRules);
    }
  }

  /**
   * Start parsing
   */
  run() {
    this.checkRules();
    if (this.document_dom == null) {
      throw new Error('Please set HTML source');
    }
    this.report = null;
    let data = {
      success: [],
      failed: [],
      result: {},
    };

    this.rules_to_apply.forEach((ruleName) => {
      logger('=====  processing rule ' + ruleName + '=======');
      let [selector, validator] = rules.DEFINED_RULES[ruleName];

      logger('...using selector ' + selector);
      let selected = selector(this.document_dom);
      logger('selected: ', selected);

      logger('...using validator ' + validator);
      let result = validator(selected);
      data.result[ruleName] = result;
      if (result.passed === true) {
        data.success.push(ruleName);
      } else {
        data.failed.push(ruleName);
      }
    });

    this.report = new Report();
    this.report._data = data;
  }
}

/**
 * Class for generating reports
 * @class
 */
class Report {
  /**
   * @constructor
   */
  constructor() {
    this._data = {'success': [], 'failed': [], 'result': {}};
  }

  /**
   * Get raw data of the report
   * @return {JSON} JSON data
   */
  detail() {
    return _.cloneDeep(this._data);
  }

  /**
   * Write report data into passed writable stream
   * @param  {WritableStream} writable
   * @return {writable}
   */
  writeToStream(writable) {
    logger('Received writable stream', writable);
    this.toStream().pipe(writable);
    return writable;
  }

  /**
   * Writes report into given file location
   * @param  {string} filepath
   * @return {Promise}
   */
  toFile(filepath) {
    return new Promise((resolve, reject) => {
      let readable = this.toStream();
      let writable = fs.createWriteStream(filepath);
      readable.pipe(writable);
      writable.on('finish', () => {
        console.log('Report written to', filepath);
        resolve(filepath);
      }).on('error', reject);
    });
  }

  /**
   * Turns report data into readable stream
   * @return {ReadableStream}
   */
  toStream() {
    let readable = new Readable;
    this.toStrings().forEach((x) => readable.push(x + '\n'));
    readable.push(null);
    return readable;
  }

  /**
   * Print to Console:
   * Example output:
   * "[<PASSED/FAILED>] <rule name>" for each rule
   */
  print() {
    this.toStrings().forEach((s) => console.log(s));
  }

  /**
   * Turns report data into array of strings
   * @return {Array} - Array of strings
   */
  toStrings() {
    let data = [];
    _.forEach(this._data.result, (result, ruleName) => {
      logger('result:', result);
      let stat = 'unknown';
      if (result.passed === true) {
        stat = 'PASSED';
      } else {
        stat = 'FAILED';
      }

      data.push(`[${stat}] ${ruleName}`);
      result.msgs.forEach((msg) => {
        data.push(` - ${msg}`);
      });
    });
    return data;
  }
}
module.exports = {
  Client: Client,
  Report: Report,
};
