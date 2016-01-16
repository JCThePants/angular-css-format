(function () {

    module.directive('cssLines', CSSLinesDirective);
    CSSLinesDirective.$inject = ['CSSComment', 'CSSParentSelector', 'CSSSelector', 'CSSPropertyName', 'CSSPropertyValue', 'CSSUtils'];

    function CSSLinesDirective(CSSComment, CSSParentSelector, CSSSelector, CSSPropertyName, CSSPropertyValue, CSSUtils) {

        var ae = angular.element;

        return {
            restrict: 'A',
            scope: {
                lines: '=cssLines'
            },
            link: cssLinesLink
        };

        function cssLinesLink(scope, elem) {

            scope.$watch('lines', function () {

                elem.html('');

                if (!scope.lines)
                    return;

                for (var i = 0, line; line = scope.lines[i]; i++) {
                    var div = ae('<div class="css-line"></div>');
                    elem.append(div);

                    if (line.text().length === 0) {
                        div.append('<span>&nbsp;</span>');
                        continue;
                    }

                    if (line.indent)
                        div.append('<span class="indent">' + CSSUtils.spaces(line.indent) + '</span>');

                    for (var j = 0, item; item = line.text()[j]; j++) {

                        var className = getCssClass(item);
                        if (className)
                            div.append('<span class="' + className + '">' + item + '</span>');
                        else {
                            div.append('<span>' + item + '</span>');
                        }
                    }
                }
            });
        }

        function getCssClass(item) {
            if (item instanceof CSSComment) {
                return 'css-comment ' + item.type;
            } else if (item instanceof CSSParentSelector) {
                return 'css-selector';
            } else if (item instanceof CSSSelector) {
                return 'css-selector';
            } else if (item instanceof CSSPropertyName) {
                return 'css-property-name';
            } else if (item instanceof CSSPropertyValue) {
                return 'css-property-value';
            } else {
                return 'css-text';
            }
        }

        function nbsp(str) {
            return str.toString().replace(/ /g, '&nbsp;');
        }
    }
}());