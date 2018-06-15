const main = require('./main.js');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

test('all <img> must have alt value', () => {
  const dom = new JSDOM(`<img src="">`);
  var client = new main.Client();
  client.setDocumentSourceByDOM(dom.window.document);
  client.rules_to_apply = ["all images have alt value"];
  const [success, failed] = client.run();
  expect(success).toEqual([]);
  expect(failed).toEqual(["all images have alt value"]);
});

test('all <a> must have rel value', () => { 
  const dom = new JSDOM(
    `<p>Hello
      <a></a>
      <a rel="bbb"></a>
     </p>`
  );
  var client = new main.Client();
  client.setDocumentSourceByDOM(dom.window.document);
  client.rules_to_apply = ["all anchors have rel value"];
  expect(client.run()).toEqual([[],["all anchors have rel value"]])
});

test('<head> must includes <title>', () => {
  const dom = new JSDOM(`<head><title></title></head>`);
  var client = new main.Client();
  client.setDocumentSourceByDOM(dom.window.document);
  client.rules_to_apply = ["<head> have <title>"];
  const [success, failed] = client.run();
  expect(success).toEqual(["<head> have <title>"])
  expect(failed).toEqual([]);
});

test('Positive: Check number of tags', () => { 
  const dom = new JSDOM(`<body><p><strong>hello</strong></p></body>`);
  var client = new main.Client();
  client.setDocumentSourceByDOM(dom.window.document);
  let ruleName = "has less than 2 <strong> tags"
  client.rules_to_apply = [ruleName]
  expect(client.run()).toEqual([[ruleName], []]);
});

test('Negative: Check number of tags', () => { 
  const dom = new JSDOM(
    `<body>
     <p><strong>hello</strong></p>
     <p><strong>hello</strong></p>
     <p><strong>hello</strong></p>
     </body>`);
  var client = new main.Client();
  client.setDocumentSourceByDOM(dom.window.document);
  let ruleName = "has less than 2 <strong> tags"
  client.rules_to_apply = [ruleName]
  expect(client.run()).toEqual([[], [ruleName]]);
});

test('Run without HTML source', () => {
  var client = new main.Client();
  var runClient = () => { client.run() };
  expect(runClient).toThrowError('Please set HTML source');
});

test('Check return format of client.run()', () => {
  const dom = new JSDOM(`<p></p>`);
  var client = new main.Client();
  client.setDocumentSourceByDOM(dom);
  let report = client.run();
  console.log('report=', report)
  // Structure of returned report should be [[rule1, rule2, ...], [rule3, rule4, ...]]
  // where first array represents the passed-rules and second is the array of rules which did not pass.
  expect(Array.isArray(report)).toBe(true);
  expect(report.length).toEqual(2);
  expect(Array.isArray(report[0])).toBe(true);
  expect(Array.isArray(report[1])).toBe(true);
});


// test('Allow setting HTML source from file', () => {
//   // TODO: find a way to fix the encoding problem
//   // https://github.com/jsdom/jsdom/issues/2060
//   let client = new main.Client();
//   expect(client.document_dom).toBeNull();

//   let filepath = './index.test.html';
//   client.setDocumentSourceFromFile(filepath);
//   expect(client.document_dom).not.toBeNull();
//   console.log(client.document_dom);

//   console.log(client.document_dom.getElementById('myimg'));
//   client.run();
// });

// test('Allow setting HTML source from URL', () => {
//   // TODO: find a way to fix the encoding problem
//   // https://github.com/jsdom/jsdom/issues/2060
//   let client = new main.Client();
//   expect(client.document_dom).toBeNull();

//   let url = 'http://www.google.com';
//   client.setDocumentSourceFromURL(url);
//   expect(client.document_dom).not.toBeNull();
//   console.log(client.document_dom);

//   console.log(client.document_dom.querySelector('img'));
//   client.run();
// });