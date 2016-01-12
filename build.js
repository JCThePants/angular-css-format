var _fs = require('fs');

var output = '../CSSFormatter/src/web/js/libs/css-format.js';

var basePath = 'src/';
var files = [
        'module.js',
        'CSSComment.js',
        'CSSFormatter.js',
        'CSSLine.js',
        'CSSParentSelector.js',
        'CSSParser.js',
        'CSSProperty.js',
        'CSSPropertyName.js',
        'CSSPropertyValue.js',
        'CSSSelector.js',
        'CSSSelectors.js',
        'CSSTableOfContents.js',
        'CSSUtils.js',
        'directive-css-output.js'
    ];


console.log('Reading source files');

var out = files.map(function (file) {
    console.log('   ' + basePath + file);
    return _fs.readFileSync(basePath + file).toString();
});

console.log('writing to ' + output);

_fs.writeFileSync(output, '(function(){\n' + out.join('\n\n\n') + '\n}());');

console.log('Build complete.');