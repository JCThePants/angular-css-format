module.directive('cssLines', ['CSSComment', 'CSSParentSelector', 'CSSSelector', 'CSSPropertyName', 'CSSPropertyValue', 'CSSUtils', function (CSSComment, CSSParentSelector, CSSSelector, CSSPropertyName, CSSPropertyValue, CSSUtils) {

    var ae = angular.element;

    function nbsp(str) {
        return str.toString().replace(/ /g, '&nbsp;');
    }

    return {
        restrict: 'A',
        scope: {
            lines: '=cssLines'
        },
        link: function (scope, elem, attrs) {

            scope.$watch('lines', function () {

                elem.html('');

                if (!scope.lines)
                    return;

                for (var i = 0, line; line = scope.lines[i]; i++) {
                    var div = ae('<div class="css-line"></div>')
                    elem.append(div);

                    if (line.text().length === 0) {
                        div.append('<span>&nbsp;</span>');
                        continue;
                    }

                    if (line.indent)
                        div.append('<span class="indent">' + CSSUtils.spaces(line.indent) + '</span>');

                    for (var j = 0, item; item = line.text()[j]; j++) {

                        var className;
                        if (item instanceof CSSComment) {
                            className = 'css-comment ' + item.type;
                        } else if (item instanceof CSSParentSelector) {
                            className = 'css-selector';
                        } else if (item instanceof CSSSelector) {
                            className = 'css-selector';
                        } else if (item instanceof CSSPropertyName) {
                            className = 'css-property-name';
                        } else if (item instanceof CSSPropertyValue) {
                            className = 'css-property-value';
                        } else {
                            className = 'css-text';
                        }

                        if (className)
                            div.append('<span class="' + className + '">' + item + '</span>');
                        else {
                            div.append('<span>' + item + '</span>');
                        }
                    }
                }
            });

        }
    };
}]);