[![Build Status](https://travis-ci.org/Rakasha/seo_defect.svg?branch=master)](https://travis-ci.org/Rakasha/seo_defect)
[![Coverage Status](https://coveralls.io/repos/github/Rakasha/seo_defect/badge.svg?branch=master)](https://coveralls.io/github/Rakasha/seo_defect?branch=master)

dom-defect 
=================
Detect defections from HTML DOM-Elements

## Installation

```bash
npm install domdefect
```

## Usage

Initialize the client

```javascript
const domdefect = require('domdefect');
let detector = new domdefect.Detector();
```
Set the rules for the detector

```javascript
// Using pre-defined rule
const {rules} = domdefect;
detector.rules_to_apply = [rules.PREDEFINED[0], rules.PREDEFINED[1]]
// Or customize your rule from Meta rules
let myRule = rules.Meta.checkNumberOfSelected('strong', '<', 2);
let myRule2 = rules.Meta.checkElementAttributes('input', ['value', 'id', 'yo']);
detector.rules_to_apply.push(myRule);
detector.rules_to_apply.push(myRule2);
```

Load the HTML from source (URL or file path).
Then run the detector to get the report.

```javascript
// Load HTML then run validations
// You can also load HTML from file by passing file path
// like: setDocumentSource('index.html')
detector.setDocumentSource('http://www.example.com')
 .then( () => {
    detector.run();
    
    // Aftter running , the results is stored 
    // in the `report` object in JSON format:
    detector.report.detail()
    
    // You can pretty-print the data
    detector.report.print();
    
    // Output the report into file
    detector.report.toFile('myreport.txt').then(...);
    
    // Or write into a writable stream
    detector.report.writeToStream(stream).then(...);
    
 });

```
## How to cusomize rules for the detector
Using the high order functions inside `lib/rules.js`.

For exmaple, calling

```javascript
const {rules} = require('domdefect');
let myRule = rules.Meta.checkNumberOfSelected('strong', '<', 2);
```
Generates a rule which checks if the number of `<strong>` tags is less than 2

## API
(TBD)





```
                       _oo0oo_
                      o8888888o
                      88" . "88
                      (| -_- |)
                      0\  =  /0
                    ___/`---'\___
                  .' \\|     |// '.
                 / \\|||  :  |||// \
                / _||||| -:- |||||- \
               |   | \\\  -  /// |   |
               | \_|  ''\---/''  |_/ |
               \  .-\__  '-'  ___/-. /
             ___'. .'  /--.--\  `. .'___
          ."" '<  `.___\_<|>_/___.' >' "".
         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
         \  \ `_.   \_ __\ /__ _/   .-` /  /
     =====`-.____`.___ \_____/___.-`___.-'=====
                       `=---='


     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

                       佛系開發
```
