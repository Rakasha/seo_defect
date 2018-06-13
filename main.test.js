const main = require('./main.js');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

test('all <img> must have alt value', () => {
  const dom = new JSDOM(
    `<p>Hello
      <img src="foo.jpg">
      <img alt="">
      <img alt="mypic">
      <a rel="aaa"></a>
      <a rel="bbb"></a>
    </p>`,
    { includeNodeLocations: true }
  );
  var client = new main.Client();
  client.setDocumentSourceByDOM(dom.window.document);
  client.rules_to_apply = ["all images have alt text",
    "all anchors have rel value"];
  const [success, failed] = client.run();
  expect(success).toEqual(["all anchors have rel value"]);
  expect(failed).toEqual(["all images have alt text"]);
});

test('all <a> must have rel value', () => { 
  const dom = new JSDOM(
    `<p>Hello
      <a></a>
      <a rel="bbb"></a>
     </p>`,
    { includeNodeLocations: true }
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

// test('Document has less than 10 <strong> tags in HTML', () => { });
// test('Document must contains at least one <H1> tag', () => { });
