module.service('cssNestedIndenter', ['CSSSelectors', function (CSSSelectors) {

    /**
     * Modify indent on CSSSelector instances to reflect parent child relationships.
     *
     * @param  {Array}  entityArray     An array of CSS entities. (Only CSSSelector instances are modified).
     * @param  {number} [indentSpaces]  The number of spaces in an indent. Default is 4.
     */
    this.indent = function (entityArray, indentSpaces) {

        var indentMap = {};

        for (var i= 0, entity; entity = entityArray[i]; i++) {

            if (!(entity instanceof CSSSelectors)) {
                continue;
            }

            var selector = entity.selectors[0],
                selectorNames = parseSelectorNames(selector.name),
                indent = undefined,
                parentSelNames = selectorNames.slice(0);

            while (typeof indent === 'undefined' && parentSelNames.length) {
                parentSelNames.pop();
                indent = indentMap[parentSelNames.join()];
            }

            indent = (indent || 0) + 1;
            var key = selectorNames.join();

            indentMap[key] = indent;
            entity.indent = (indent - 1) * (indentSpaces || 4);
        }
    };

    /**
     * Parse a selector string for individual selector components excluding combinators.
     *
     * @param  {string}  selector  The selector string.
     *
     * @returns {Array}  Array of string.
     */
    function parseSelectorNames(selector) {

        var result = [],
            currentName = '';

        function pushName() {
            if (currentName === ':')
                return;

            currentName && result.push(currentName);
            currentName = '';
        }

        for (var i = 0; i < selector.length; i++) {
            var ch = selector[i];

            switch (ch) {
                case '.':
                case '[':
                case ':':
                    pushName();
                    break;
                case ' ':
                case '>':
                case '~':
                case '+':
                    if (selector[i - 1] === '\\') {
                        currentName = currentName.substr(currentName.length - 1);
                        break;
                    }
                    pushName();
                    continue;
            }

            currentName += ch;
        }

        pushName();
        return result;
    }

}]);