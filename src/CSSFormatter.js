 module.factory('CSSFormatter', ['CSSLine', 'CSSComment', 'CSSParentSelector', 'CSSProperty', 'CSSSelectors', 'CSSUtils', 
                                    function (CSSLine, CSSComment, CSSParentSelector, CSSProperty, CSSSelectors, CSSUtils) {

        /**
         * Generates formatted CSS in objects each representing a single
         * line in the output stylesheet.
         * 
         * @param {CSSParser} parser        The CSS Parser to use.
         * @param {object}    [options={}]  Optional configuration. See defaultOptions function source for documentation.
         */
        function CSSFormatter(parser, options) {
            options = options || {};

            this._parser = parser;
            this._options = angular.merge(this.defaultOptions(), options);
            this._lines = this.generateLines();
        }

        /**
         * Get a new object filled with default options.
         * 
         * @returns {object}
         */
        CSSFormatter.defaultOptions = function () {
            return {
                indent: 4,                      // the number of spaces in a single indent.
                selectors: {
                    newLine: true,              // true to start selectors on a new line
                    linesBefore: 0,             // the number of lines to put before the selector
                    linesBeforeComment: 0,      // If the selector is after a comment, the number of lines before the selector and after the comment.
                    maxLength: 90,              // Max length of multiple selectors on a line in characters.
                    forcePerLine: false,        // if true, always writes multi selectors each on a new line
                    combinatedPerLine: true,    // if true, combined selectors in multi selectors are each on their own line
                    linesBeforeMulti: 0,        // extra lines to before multi selectors, if less than linesBefore, linesBefore is used.
                    multispace: 1               // spaces between individual selectors in multi selectors,
                },
                braces: {
                    openNewLine: false,         // If true, the opening brace is placed on a new line,
                    openIndent: 1,              // The number of spaces before an opening brace.
                    openIndentAfter: 0,         // The number of spaces after an opening brace.
                    closeNewLine: true,         // If true, the closing brace is placed on a new line
                    closeIndent: 0,             // The number of spaces before a closing brace.
                    closeIndentAfter: 0,        // The number of spaces after a clsoing brace.
                },
                property: {
                    newLine: true,              // True to place properties each on its own line
                    spaceBetween: 1,            // the number of spaces between the property and its value;
                    closeLast: true,            // if true, adds a semicolon at the end of the last property
                    indentAfter: 0,             // the number of spaces after a property
                },
                comments: {
                    render: true,               // true to render comments
                    renderProperty: true,       // true to render comments between properties
                    renderPropertyInline: true, // true to render comments that are inline with properties
                    linesBefore: 2,             // the number of lines before a selector comment
                    linesAfter: 0,              // the number of lines after a selector comment
                    inlineSpace: 1              // the number of spaces between property and inline comment
                }
            };
        };

        /**
         * Get a new object filled with default options.
         * 
         * @returns {object}
         */
        CSSFormatter.prototype.defaultOptions = function () {
            return CSSFormatter.defaultOptions();
        };

        /**
         * Get generated lines.
         * 
         * @returns {Array} Array of CSSLine
         */
        CSSFormatter.prototype.getLines = function () {
            return this._lines;
        };

        /**
         * Generate formatted stylesheet as line objects and optionally output
         * directly into a specified array.
         * 
         * @param   {Array} [outputArray] Array to output line objects into.
         * 
         * @returns {Array} An array of generated line objects.
         */
        CSSFormatter.prototype.generateLines = function () {
            var parser = this._parser,
                entities = parser.getSelectors(),
                state = new CSSFormatState();

            for (var i = 0, prev, entity; entity = entities[i]; i++) {

                if (entity instanceof CSSComment) {
                    this.generateComment(entity, 0, state);
                } else if (entity instanceof CSSParentSelector) {
                    this.generateParentSelectors(entity, prev && prev instanceof CSSComment, 0, state);
                } else if (entity instanceof CSSSelectors) {
                    this.generateSelectors(entity, prev && prev instanceof CSSComment, 0, state);
                    this.generateProperties(entity, 0, state);
                }

                prev = entity;
            }

            state.newLine(0);
            return state.lines;
        };

        /**
         * Format and output comment line object.
         * 
         * @param   {CSSComment}      comment  The comment object to format.
         * @param   {number}          indent   The indent depth of the comment.
         * @param   {CSSFormatState}  state    The formatter state.
         */
        CSSFormatter.prototype.generateComment = function (comment, indent, state) {
            var copts = this._options.comments;

            if (!copts.render)
                return;

            if (state.hasLines()) {
                state.newLine(indent);
                this.addEmptyLines(copts.linesBefore, indent, state);
            }

            var commentLines = comment.toString().split('\n');
            for (var i = 0, last = commentLines.length - 1, line; line = commentLines[i]; i++) {
                state.current.push(new CSSComment(line));
                if (i !== last)
                    state.newLine(indent);
            }

            this.addEmptyLines(copts.linesAfter, indent, state);
        };

        /**
         * Format and output parent selector line object.
         * 
         * @param {object}           parent          The parent CSS element.
         * @param {boolean}          isAfterComment  True if the selector is after a comment.
         * @param {number}           indent          The indent depth of the selector.
         * @param {CSSFormatState}   state           The formatter state.
         */
        CSSFormatter.prototype.generateParentSelectors = function (parent, isAfterComment, indent, state) {

            var parser = this._parser,
                options = this._options;

            options.selectors.newLine && state.hasLines() && state.newLine(indent);

            this.generateLinesBeforeSelector(state, indent, null, isAfterComment);

            state.current.push(parent);

            this.generateOpeningBrace(state, indent);

            for (var i = 0, prev, child; child = parent.children[i]; i++) {

                if (child instanceof CSSComment) {
                    this.generateComment(child, indent + options.indent, state);
                } 
                else if (child instanceof CSSParentSelector) {
                    this.generateParentSelectors(child, prev && prev instanceof CSSComment, indent + options.indent, state);
                } 
                else if (child instanceof CSSSelectors) {
                    this.generateSelectors(child, prev && prev instanceof CSSComment, indent + options.indent, state);
                    this.generateProperties(child, indent + options.indent, state);
                }

                prev = child;
            }

            this.generateClosingBrace(state, indent);
        };

        /**
         * Format and output selectors and opening brace.
         * 
         * @param   {CSSSelectors}    selectors       The selectors object to format.
         * @param   {true|false}      isAfterComment  True if the comment proceeds a comment, otherwise false.
         * @param   {number}          indent          The number of indents to add before the selector.
         * @param   {CSSFormatState}  state           The formatter state.
         */
        CSSFormatter.prototype.generateSelectors = function (selectors, isAfterComment, indent, state) {
            var options = this._options,
                sopts = options.selectors;

            options.selectors.newLine && state.hasLines() && state.newLine(indent);

            this.generateLinesBeforeSelector(state, indent, selectors, isAfterComment);

            // get and add comma if the current context calls for one
            function comma(index, output) {
                var isLast = index === selectors.selectors.length - 1;
                if (!isLast) {
                    output.push(',' + CSSUtils.spaces(sopts.multispace));
                }
            }

            for (var i = 0, last = selectors.selectors.length - 1, sel; sel = selectors.selectors[i]; i++) {

                var text = [sel];
                comma(i, text);

                var newLine = (function () {
                    if (!sopts.maxLength)
                        return false;

                    if (sopts.forcePerLine)
                        return i !== last;

                    if (sopts.combinatedPerLine && sel.hasCombinator()) {
                        
                        if (state.current.text().length !== 0 && i !== 0) {
                            // put on own line if not on new line from previous selector
                            state.newLine(indent);
                        }
                        
                        return i !== last;
                    }

                    var newLen = state.current.length() + text.toString().length;
                    return i !== last && newLen > sopts.maxLength;
                }());

                state.current.push(text);
                newLine && state.newLine(indent);

            }

            // add opening brace
            if (options.braces.openNewLine) {
                state.newLine(indent);
            }

            this.generateOpeningBrace(state);
        };

        /**
         * Format and output properties and closing brace.
         * 
         * @param {CSSSelectors}    selectors    The selectors whose properties are to be formatted.
         * @param {number}          indent       The indent depth of the comment.
         * @param {CSSFormatState}  state        The formatter state.
         */
        CSSFormatter.prototype.generateProperties = function (selectors, indent, state) {
            var options = this._options,
                popts = options.property,
                copts = options.comments,
                properties = selectors.properties;

            for (var i = 0, last = properties.length - 1, prop; prop = properties[i]; i++) {

                // add comment line
                if (prop instanceof CSSComment) {
                    if (copts.renderProperty) {

                        popts.newLine && state.newLine(indent);

                        state.current.push([CSSUtils.spaceChar, prop]);
                    }
                    continue;
                } else if (prop instanceof CSSProperty) {

                    popts.newLine && state.newLine(indent + options.indent);

                    state.current.push([prop.name(), ':']);

                    popts.spaceBetween && state.current.push(CSSUtils.spaces(popts.spaceBetween));

                    state.current.push(prop.value());

                    if (last !== i || (popts.closeLast && last === i))
                        state.current.push(';');

                    // add inline comment
                    if (prop.comment) {
                        if (copts.inlineSpace)
                            state.current.push(CSSUtils.spaces(copts.inlineSpace));

                        state.current.push(prop.comment);
                    }

                    popts.indentAfter && state.current.push(CSSUtils.spaces(popts.indentAfter));
                }
            }

            this.generateClosingBrace(state, indent);
        };

        /**
         * Generate opening brace.
         * 
         * @param {CSSFormatState}   state   The formatter state.
         * @param {number}           indent  The current indent.
         */
        CSSFormatter.prototype.generateOpeningBrace = function (state, indent) {
            var current = state.current,
                braces = this._options.braces;

            braces.openNewLine && state.newLine(indent);
            braces.openIndent && current.push(CSSUtils.spaces(braces.openIndent));
            current.push('{');
            braces.openIndentAfter && current.push(CSSUtils.spaces(braces.openIndentAfter));
        };

        /**
         * Generate closing brace.
         * 
         * @param {CSSFormatState}   state   The formatter state.
         * @param {number}           indent  The current indent.
         */
        CSSFormatter.prototype.generateClosingBrace = function (state, indent) {
            var current = state.current,
                braces = this._options.braces;

            braces.closeNewLine && state.newLine(indent);
            braces.closeIndent && current.push(CSSUtils.spaces(braces.closeIndent));
            state.current.push('}');
            braces.closeIndentAfter && current.push(CSSUtils.spaces(braces.closeIndentAfter));
        };

        /**
         * Generate empty lines before selector.
         * 
         * @param   {CSSFormatState}  state           The formatter state.
         * @param   {number}          indent          The current indent.
         * @param   {CSSSelectors}    selectors       The selectors the lines are before.
         * @param   {boolean}         isAfterComment  True if the selectors are after a comment.
         */
        CSSFormatter.prototype.generateLinesBeforeSelector = function (state, indent, selectors, isAfterComment) {
            var sopts = this._options.selectors;

            var linesBefore = (function () {

                if (!state.hasLines())
                    return 0;

                var result = sopts.linesBefore;

                if (isAfterComment) {
                    result = sopts.linesBeforeComment;
                } else if (sopts.linesBeforeMulti && (!selectors || selectors.selectors.length > 1)) {
                    result = Math.max(result, sopts.linesBeforeMulti);
                }

                return result;
            }());

            // add empty lines before selector
            this.addEmptyLines(linesBefore, indent, state);
        };

        /**
         * Add empty lines
         * 
         * @param   {number}          total   The number of lines.
         * @param   {number}          indent  The current indent.
         * @param   {CSSFormatState}  state   The generator state.
         */
        CSSFormatter.prototype.addEmptyLines = function (total, indent, state) {
            for (var i = 0; i < total; i++) {
                state.newLine(indent);
            }
            return total;
        };

        /**
         * Get generated stylesheet as a string.
         * 
         * @returns {string}
         */
        CSSFormatter.prototype.toString = function () {
            var output = '';
            for (var i = 0, line; line = this._lines[i]; i++) {
                output += String.spaces(line.indent) + line + '\n';
            }
            return output;
        };


        /**
         * Used to pass formatter state to functions.
         */
        function CSSFormatState() {
            this.lines = [];
            this.current = new CSSLine();
            this.hasLines = function () {
                return this.lines.length ||
                    this.current.text().length;
            }
        }

        /**
         * Create a new line using the specified indent.
         * 
         * @param {number} indent  The number of spaces to indent the new line with.
         */
        CSSFormatState.prototype.newLine = function (indent) {
            this.lines.push(this.current);
            this.current = new CSSLine();
            this.current.indent = indent || 0;
        }

        return CSSFormatter;

}]);