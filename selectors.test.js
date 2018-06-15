const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const selectors = require('./selectors.js');

test('querySelectorAll', () => {
  let frag = JSDOM.fragment(
    `<div>
      <img id="a">
      <img id="b">
     </div>
     <img>`
  );
  let doms = selectors.Meta.querySelectorAll('div img')(frag);
  console.log('doms=', doms);
  expect(doms.length).toBe(2);
  console.log(doms[0].nodeType)
  expect(doms[0].id).toEqual('a');
  expect(doms[1].id).toEqual('b');
});

test('querySelector', () => {
  let frag = JSDOM.fragment(
    `<div>
      <img id="a">
      <img id="b">
     </div>
     <img>`
  );
  let dom = selectors.Meta.querySelector('img')(frag);
  expect(dom.id).toEqual('a');
});
