const fs = require('fs');
const path = require('path');
const Stream = require('stream');

const tmp = require('tmp');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const main = require('../lib/main.js');
const rules = require('../lib/rules.js');

let tmpDirObj;
beforeAll(() => {
  tmpDirObj = tmp.dirSync({unsafeCleanup: true});
  console.log('Dir: ', tmpDirObj.name);
});

afterAll(() => {
  tmpDirObj.removeCallback();
  console.log('Removed tmp dir', tmpDirObj);
});

test('all <img> must have alt value', () => {
  const dom = new JSDOM(`<img src="">`);
  let detector = new main.Detector();
  detector.setDocumentSourceByDOM(dom.window.document);
  let rule = rules.PREDEFINED[0];
  let ruleName = rule[0];
  detector.rules_to_apply = [rule];
  detector.run();
  const result = detector.report.detail();
  expect(result['success']).toEqual([]);
  expect(result['failed']).toEqual([ruleName]);
});

test('all <a> must have rel value', () => {
  const dom = new JSDOM(
    `<p>Hello
      <a></a>
      <a rel="bbb"></a>
     </p>`
  );
  let detector = new main.Detector();
  detector.setDocumentSourceByDOM(dom.window.document);
  // let rule = rules.Meta.checkElementAttributes('a', ['rel']);
  let rule = rules.PREDEFINED[1];
  let ruleName = rule[0];
  detector.rules_to_apply = [rule];
  detector.run();
  const result = detector.report.detail();
  expect(result['success']).toEqual([]);
  expect(result['failed']).toEqual([ruleName]);
});

test('Positive: <head> must includes <title>', () => {
  const dom = new JSDOM(`<head><title></title></head>`);
  let detector = new main.Detector();
  detector.setDocumentSourceByDOM(dom.window.document);
  let rule = rules.Meta.checkNumberOfSelected('head title', '>', 0);
  let ruleName = rule[0];
  detector.rules_to_apply = [rule];
  detector.run();
  const result = detector.report.detail();
  expect(result['success']).toEqual([ruleName]);
  expect(result['failed']).toEqual([]);
});

test('Negative: <head> must includes <title>', () => {
  const dom = new JSDOM(`<head></head>`);
  let detector = new main.Detector();
  detector.setDocumentSourceByDOM(dom.window.document);
  let rule = rules.Meta.checkNumberOfSelected('head title', '>', 0);
  let ruleName = rule[0];
  detector.rules_to_apply = [rule];
  detector.run();
  const result = detector.report.detail();
  expect(result['success']).toEqual([]);
  expect(result['failed']).toEqual([ruleName]);
});

test('Positive: Check number of tags', () => {
  const dom = new JSDOM(`<body><p><strong>hello</strong></p></body>`);
  let detector = new main.Detector();
  detector.setDocumentSourceByDOM(dom.window.document);
  let rule = rules.Meta.checkNumberOfSelected('strong', '<', 2);
  let ruleName = rule[0];
  detector.rules_to_apply = [rule];
  detector.run();
  let result = detector.report.detail();
  console.log('result=', result);
  expect(result['success']).toEqual([ruleName]);
  expect(result['failed']).toEqual([]);
});

test('Negative: Check number of tags', () => {
  const dom = new JSDOM(
    `<body>
     <p><strong>hello</strong></p>
     <p><strong>hello</strong></p>
     <p><strong>hello</strong></p>
     </body>`);
  let detector = new main.Detector();
  detector.setDocumentSourceByDOM(dom.window.document);
  let rule = rules.Meta.checkNumberOfSelected('strong', '<', 2);
  let ruleName = rule[0];
  detector.rules_to_apply = [rule];
  detector.run();
  const result = detector.report.detail();
  expect(result['success']).toEqual([]);
  expect(result['failed']).toEqual([ruleName]);
});

test('Run without HTML source', () => {
  let detector = new main.Detector();
  let rundetector = () => detector.run();
  expect(rundetector).toThrowError('Please set HTML source');
});

test('Check format of report', () => {
  const dom = new JSDOM(`<p></p>`);
  let detector = new main.Detector();
  detector.setDocumentSourceByDOM(dom);
  detector.run();
  let report = detector.report.detail();
  console.log('report=', report);
  // Structure of returned report should be
  // { 'success':[rule1, rule2, ...], 'failed': [rule3, rule4, ...] }
  // where first array represents the passed-rules
  // and second is the array of rules which did not pass.
  const expectedData = {'success': [], 'failed': [], 'result': {}};
  expect(report).toEqual(expectedData);
});

describe('Testing writing into files', () => {
  test('Write the report data into file', () => {
    const filecontent = 'hi';
    const mockedToStream = jest.fn().mockImplementation(
      () => {
        let s = new Stream.Readable();
        s.push(filecontent);
        s.push(null);
        return s;
      }
    );
    let filepath = path.join(tmpDirObj.name, 'report.txt');
    let report = new main.Report();
    report.toStream = mockedToStream;
    let promise = report.toFile(filepath);
    return promise.then(() => {
      let text = fs.readFileSync(filepath, 'utf8');
      console.log('content of report.txt:', text);
      expect(text).toEqual(filecontent);
    });
  });
});


test('Get readable stream from Report', () => {
  let report = new main.Report();
  const reportData = {
    success: [],
    failed: [],
    result: {
      'rule A': {passed: true, msgs: ['msg1', 'msg2']},
      'rule B': {passed: false, msgs: ['msg3', 'msg4']},
    },
  };
  report._data = reportData;
  let reader = report.toStream();
  let reportText = '';
  const expectedText = [
    '[PASSED] rule A',
    ' - msg1',
    ' - msg2',
    '[FAILED] rule B',
    ' - msg3',
    ' - msg4',
  ].join('\n') + '\n';
  reader.on('readable', () => {
    let data;
    while (data = reader.read()) {
      reportText += data.toString();
    }
  }).on('end', () => {
    expect(reportText).toEqual(expectedText);
  });
});

test('Check default report data', () => {
  const defaultData = {
    success: [],
    failed: [],
    result: {},
  };
  let report = new main.Report();
  expect(report._data).toEqual(defaultData);
});

test('Test Report.toStrings()', () => {
  const reportData = {
    success: [],
    failed: [],
    result: {
      'rule A': {passed: true, msgs: ['msg1', 'msg2']},
      'rule B': {passed: false, msgs: ['msg3', 'msg4']},
    },
  };
  let report = new main.Report();
  report._data = reportData;
  const expectedData = [
    '[PASSED] rule A',
    ' - msg1',
    ' - msg2',
    '[FAILED] rule B',
    ' - msg3',
    ' - msg4',
  ];
  expect(report.toStrings()).toEqual(expectedData);
});

// test('Allow setting HTML source from file', () => {
//   // TODO: find a way to fix the encoding problem
//   // https://github.com/jsdom/jsdom/issues/2060
//   let detector = new main.Detector();
//   expect(detector.document_dom).toBeNull();

//   let filepath = './index.test.html';
//   detector.setDocumentSourceFromFile(filepath);
//   expect(detector.document_dom).not.toBeNull();
//   console.log(detector.document_dom);

//   console.log(detector.document_dom.getElementById('myimg'));
//   detector.run();
// });

// test('Allow setting HTML source from URL', () => {
//   // TODO: find a way to fix the encoding problem
//   // https://github.com/jsdom/jsdom/issues/2060
//   let detector = new main.Detector();
//   expect(detector.document_dom).toBeNull();

//   let url = 'http://www.google.com';
//   detector.setDocumentSourceFromURL(url);
//   expect(detector.document_dom).not.toBeNull();
//   console.log(detector.document_dom);

//   console.log(detector.document_dom.querySelector('img'));
//   detector.run();
// });

test('Allow setting HTML source from readable stream', () => {
  let s = new Stream.Readable();
  s.push('<div><img></div>');
  s.push(null);
  let detector = new main.Detector();
  let promise = detector.setDocumentSourceFromStream(s);
  console.log('detector.document_dom =', detector.document_dom);
  console.log('returned data:', promise);
  promise.then(() => expect(detector.document_dom).not.toBeNull());
});
