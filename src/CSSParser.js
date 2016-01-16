module.factory('CSSParser', ['CSSComment', 'CSSParentSelector', 'CSSProperty', 'CSSSelectors', 'CSSSelector', function (CSSComment, CSSParentSelector, CSSProperty, CSSSelectors, CSSSelector) {

    /**
     * Internal class used to track the parser state.
     * 
     * @param {string} css   The original css stylesheet being formatted.
     */
    function CSSParserState(css) {
        this.css = css;
        this.i = 0;
        // selectors that can have child selectors (embedded)
        this.parentSelectors = [
            '@media'
        ];
    }

    /**
     * Parses stylesheet string into an object model.
     * 
     * @param {string|CSSParserState} css   The stylesheet to parse.
     */
    function CSSParser(css) {

        var state = typeof css === 'string' ? new CSSParserState(css) : css,
            selectors = this._selectors = [],
            mode = 'none', // parse-selector, parse-property, parse-value
            currSelectors = null,
            currProperty = null,
            prevProperty = null,
            selectorComments = [];


        if (!state.css)
            return;

        // push current selectors into array and reset
        function pushSelectors() {
            if (currSelectors) {
                selectors.push(currSelectors);

                if (selectorComments.length) {
                    currSelectors.comments = selectorComments;
                    selectorComments = [];
                }
            }
            currSelectors = null;
            mode = 'none';
        }

        // put current property into current selectors and reset.
        function nextProperty() {
            if (currProperty && currSelectors) {
                currSelectors.properties.push(currProperty);
                prevProperty = currProperty;
                currProperty = null;
            }
        }

        for (var ch; state.i < state.css.length; state.i++) {

            var hasReturn = this.skipWhiteSpace(state);
            ch = state.css[state.i];

            // check for comments
            if (ch === '/') {
                if (state.css[state.i + 1] !== '*')
                    throw 'Illegal character "/"';

                // selector comment
                if (mode == 'none') {
                    selectorComments.push(this.parseComment(state, 'selector'));
                }
                // property comment
                else if (hasReturn && currSelectors) {
                    currSelectors.properties.push(this.parseComment(state, 'property'));
                }
                // inline property comment
                else if (!hasReturn && prevProperty) {
                    prevProperty.comment = this.parseComment(state, 'property-inline');
                }

            }
            // parse selectors
            else if (mode === 'none') {

                // check for embeddable selectors
                if (this.matchAhead(state.parentSelectors, state)) {
                    var result = this.parseTill('{', state);
                    state.i++;

                    var parent = new CSSParentSelector(result.trim());
                    var parser = new CSSParser(state);
                    for (var j = 0, item; item = parser.getSelectors()[j]; j++) {
                        parent.children.push(item);
                    }
                    selectors.push(parent);
                }
                else {

                    if (ch === '}')
                        break;

                    currSelectors = this.parseSelectors(state);
                    if (!currSelectors) {
                        pushSelectors();
                        continue;
                    }

                    mode = 'parse-property';
                }
            }
            // parse property name
            else if (mode === 'parse-property') {

                currProperty = this.parseProperty(state);

                if (currProperty.isEnd) {
                    pushSelectors();
                    continue;
                }

                mode = 'parse-value';

            }
            // parse property value
            else if (mode === 'parse-value') {

                var result = this.parseValue(state, currProperty);

                nextProperty();

                if (result.isEnd) {
                    pushSelectors();
                } else {
                    mode = 'parse-property';
                }
            }
        }
    }

    /**
     * Get parsed CSSSelector objects.
     * 
     * @returns {Array} Array of CSSSelectors, CSSComment and CSSParentSelectors
     */
    CSSParser.prototype.getSelectors = function () {
        return this._selectors;
    };

    /**
     * Skip ahead until a non-white-space character is found.
     * 
     * @param   {CSSParserState}  state  The parser state.
     *                              
     * @returns {boolean}  true if return/new-line characters were found during
     *                     skip, otherwise false.
     */
    CSSParser.prototype.skipWhiteSpace = function (state) {
        var hasReturn = false;
        for (var ch; ch = state.css[state.i]; state.i++) {
            if (' \t\n\r'.indexOf(ch) !== -1) {

                if (!hasReturn && ' \t'.indexOf(ch) === -1)
                    hasReturn = true;

                continue;
            }

            break;
        }
        return hasReturn;
    };

    /**
     * Continue parsing until a specific character is found.
     * 
     * @param   {string}    term   The character to stop at.
     * @param   {CSSParserState}  state  The parser state.
     *                             
     * @returns {string}  The characters that were parsed.
     */
    CSSParser.prototype.parseTill = function (term, state) {
        var result = '';
        for (var ch; ch = state.css[state.i]; state.i++) {
            if (ch === term)
                break;

            result += ch;
        }
        return result;
    };


    /**
     * check if the next characters in the CSS match any strings in a terms array.
     *
     * @param {Array}     terms  An array of strings to match against.
     * @param {CSSParserState}  state  The parser state.
     *
     * @returns {string|null}  The matching string or null if no matches.
     */
    CSSParser.prototype.matchAhead = function(terms, state) {
        for (var i= 0, isMatch = true, match; match = state.parentSelectors[i]; i++) {

            for (var j= state.i, ch; ch = state.css[j]; j++) {

                var letterIndex = j - state.i;
                if (letterIndex === match.length)
                    break;

                if (ch !== match[letterIndex]) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                return match;
            }
        }
        return null;
    };

    /**
     * Parse selector comment.
     * 
     * @param   {CSSParserState}  state  The parser state.
     * @param   {string}          type   The comment type.
     *
     * @returns {CSSComment}
     */
    CSSParser.prototype.parseComment = function (state, type) {
        var comment = '',
            start = state.i;

        for (var ch; ch = state.css[state.i]; state.i++) {
            
            // remove return characters to make line return handling easier
            if (ch === '\r')
                continue;

            comment += ch;
            if (ch === '/' && state.css[state.i - 1] === '*') {
                break;
            }
        }
        var com = new CSSComment(comment, type);
        com.start = start;
        com.end = state.i;
        return com;
    };

    /**
     * Parse selectors.
     * 
     * @param   {CSSParserState}   state  The parser state.
     *                              
     * @returns {CSSSelectors}
     */
    CSSParser.prototype.parseSelectors = function (state) {

        var current = '',
            selectors = [],
            result = new CSSSelectors(selectors);

        result.start = state.i;

        for (var ch; ch = state.css[state.i]; state.i++) {
            if (ch === '{') {
                current = current.trim();
                if (current)
                    selectors.push(new CSSSelector(current));

                result.end = state.i;
                return result;

            } else if (ch === ',') {
                current = current.trim();
                selectors.push(new CSSSelector(current));
                current = '';
                continue;

            } else if (ch === '}') {
                break;
            }
            current += ch;
        }

        if (current.trim()) {
            throw 'End of document reached prematurely while parsing selectors: "' + selectors + '" ending with "' + current + '"';
        }

        return null;
    };

    /**
     * Parse property name.
     * 
     * @param   {CSSParserState}  state  The parser state.
     *                               
     * @returns {CSSProperty}
     */
    CSSParser.prototype.parseProperty = function (state) {

        var property = new CSSProperty(),
            name = '';

        property.start = state.i;

        for (var ch; ch = state.css[state.i]; state.i++) {
            if (ch === ':') {
                property.name(name);
                return property;

            } else if (ch === '}') {
                if (name.trim())
                    throw 'Premature end while parsing property: ' + name;

                property.name(name);
                property.isEnd = true;
                property.end = state.i;
                return property;
            }
            name += ch;
        }
        throw 'End of document reached prematurely while parsing property: ' + name;
    };


    /**
     * Parse property value.
     * 
     * @param   {CSSParserState} state     The parser state.
     * @param   {CSSProperty}    property  The property the value is for.
     *                                   
     * @returns {CSSProperty}
     */
    CSSParser.prototype.parseValue = function (state, property) {

        var value = '',
            quote = null,
            mode = 'value',
            isEnd = false;

        for (var ch; ch = state.css[state.i]; state.i++) {
            if (ch === '\'' || ch === '"') {
                if (mode === 'literal' && quote === ch) {
                    mode = 'value';
                } else if (mode === 'value') {
                    mode = 'literal';
                    quote = ch;
                }
            } else if ((ch === ';' || ch === '}') && mode === 'value') {
                break;
            }
            value += ch;
        }

        property.value(value);
        property.isEnd = ch === '}';
        property.end = state.i;
        return property;
    };

    return CSSParser;

}]);