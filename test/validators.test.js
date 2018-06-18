const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const validators = require('../lib/validators.js');

test('Positive: allHaveAttributes', () => {
  let frag = JSDOM.fragment(
    `<img id="123" class="myclass">
         <input id="456" class="myclass">`
  );
  let nodeList = frag.children;
  console.log(nodeList);
  let result = validators.Meta.allHaveAttributes(['id', 'class'])(nodeList);
  expect(result.passed).toBe(true);
});

test('Negative: allHaveAttributes', () => {
  let frag = JSDOM.fragment(
    `<img id="123" class="class1">
         <input id="456">`
  );
  let nodeList = frag.children;
  console.log(nodeList);
  result = validators.Meta.allHaveAttributes(['id', 'class'])(nodeList);
  expect(result.passed).toBe(false);
});

test('Positive: check attribute value', () => {
  let frag = JSDOM.fragment(`<input name='aaa'>`);
  let nodeList = frag.querySelector('input');
  result = validators.Meta.hasAttributeValue('name', 'aaa')(nodeList);
  console.log(result);
  expect(result.passed).toBe(true);
});

test('Negative: check attribute value', () => {
  let frag = JSDOM.fragment(`<input name='aaa'>`);
  let nodeList = frag.querySelector('input');
  result = validators.Meta.hasAttributeValue('name', 'BBBB')(nodeList);
  console.log(result);
  expect(result.passed).toBe(false);
});

test('Negative: check attribute value on missing attributes', () => {
  let frag = JSDOM.fragment(`<input>`);
  let nodeList = frag.querySelector('input');
  result = validators.Meta.hasAttributeValue('name', 'BBBB')(nodeList);
  console.log(result);
  expect(result.passed).toBe(false);
});


describe('Check amount of DOM', () => {
  test('Use operator > ', () => {
    let frag = JSDOM.fragment(`<img><img><img>`);
    let nodeList = frag.children;
    result = validators.Meta.checkAmount('>', 2)(nodeList);
    expect(result.passed).toBe(true);
  });
  test('Use operator `==`', () => {
    let frag = JSDOM.fragment(`<img><img><img>`);
    let nodeList = frag.children;
    console.log('nodelist:', nodeList);
    console.log('size', nodeList.length);
    result = validators.Meta.checkAmount('==', 2)(nodeList);
    console.log(result);
    expect(result.passed).toBe(false);
  });
  test('Un-supported operator', () => {
    let frag = JSDOM.fragment(`<img>`);
    let nodeList = frag.children;
    let f = () => validators.Meta.checkAmount('=', 2)(nodeList);
    expect(f).toThrowError(/Un-supported comparator:/);
  });
});

describe('Test Def.mustExist()', () => {
  test('Positive: mustExist()', () => {
    let frag = JSDOM.fragment(`<img>`);
    let dom = frag.querySelector('img');
    console.log('dom', dom);
    let result = validators.Def.mustExist(dom);
    console.log(result);
    expect(result.passed).toEqual(true);
  });

  test('Negative: mustExist() with null obj', () => {
    let frag = JSDOM.fragment(`<img>`);
    let dom = frag.querySelector('input');
    console.log(dom);
    let result = validators.Def.mustExist(dom);
    expect(result.passed).toBe(false);
  });

  test('Negative: mustExist() with empty NodeList', () => {
    let frag = JSDOM.fragment(`<img>`);
    let dom = frag.querySelectorAll('input');
    console.log(dom);
    let result = validators.Def.mustExist(dom);
    expect(result.passed).toBe(false);
  });
});
