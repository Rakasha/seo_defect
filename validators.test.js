const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const validators = require('./validators.js');

test('Positive: allHaveAttributes', () => {
  let frag = JSDOM.fragment(
    `<img id="123" class="myclass">
         <input id="456" class="myclass">`
  );
  let nodeList = frag.children;
  console.log(nodeList);
  expect(validators.Meta.allHaveAttributes(['id', 'class'])(nodeList))
                        .toBe(true);
});

test('Negative: allHaveAttributes', () => {
  let frag = JSDOM.fragment(
    `<img id="123" class="class1">
         <input id="456">`
  );
  let nodeList = frag.children;
  console.log(nodeList);
  expect(validators.Meta.allHaveAttributes(['id', 'class'])(nodeList))
                        .toBe(false);
});
