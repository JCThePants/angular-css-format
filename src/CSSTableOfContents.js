module.factory('CSSTableOfContents', ['CSSComment', 'CSSFormatter', 'CSSLine', 'CSSUtils', function (CSSComment, CSSFormatter, CSSLine, CSSUtils) {

    /**
     * Table Of Contents formatter class.
     * 
     * Formats stylesheet and adds table of contents. Indentation of formatting reflects
     * depth of entries in table of contents.
     * 
     * Table of contents is generated using comments. The depth of an entry is determined by
     * the number of astericks at the beginning of the comment. The more astericks, the higher the
     * level and the lower the depth. Comments with only a single asterick are ignored.
     * 
     * @param {CSSParser}  parser        The Css parser to use.
     * @param {object}     [options={}]  Options for tables and CSS formatter.
     */
    function CSSTableOfContents(parser, options) {

        this._options = options = options || {};

        var formatter = new CSSFormatter(parser, options),
            lines = formatter.getLines(),
            output = this._output = this.generateTableLines(lines);

        if (options.showLineNumbers) {
            for (var i = 0, tableLine; tableLine = output[i]; i++) {
                if (tableLine.comment) {
                    var lineNum = this.getCommentLineIndex(tableLine.comment, lines);
                    if (lineNum >= 0) {
                        var text = tableLine.text().toString().substr(1 + (2 * CSSUtils.spaceChar.length))
                        var number = CSSUtils.minLeft((lineNum + output.length + 1).toString(), 5);
                        tableLine.text(new CSSComment('*' + number + text));
                    }
                }
            }
        }


        // append formatted lines to table of content lines
        for (var i = 0, indent = 0, line; line = lines[i]; i++) {

            // add ToC indents
            if (options.tocIndent) {
                var text = line.text();
                for (var j = 0, obj; obj = text[j]; j++) {
                    if (typeof obj.tableIndent === 'number') {
                        indent = obj.tableIndent;
                        break;
                    }
                }

                line.indent += indent;
            }
            output.push(line);
        }
    }

    /**
     * Get the generated CSS lines.
     * 
     * @returns {Array}  Array of CSSLine
     */
    CSSTableOfContents.prototype.getLines = function () {
        return this._output;
    };

    /**
     * Get the line index of a selector comment.
     * 
     * @param   {CSSComment} comment  The comment to check.
     * @param   {Array} lines         Array of CSSLine.
     * 
     * @returns {number} The line index or -1 if not found.
     */
    CSSTableOfContents.prototype.getCommentLineIndex = function (comment, lines) {
        for (var i = 0, line; line = lines[i]; i++) {
            for (var j = 0, obj; obj = line.text()[j]; j++) {
                if (obj === comment)
                    return i;
            }
        }
        return -1;
    }

    /**
     * Generate table of contents.
     * 
     * @param   {Array} selectors Array of CSSSelectors, CSSComment and CSSParentSelector.
     *                            
     * @returns {Array} Array of CSSLine
     */
    CSSTableOfContents.prototype.generateTableLines = function (lines) {

        var comments = [],
            depths = [],
            depthSet = {},
            options = this._options;

        // get comments
        for (var i = 0, line; line = lines[i]; i++) {
            var text = line.text(),
                str = text.toString();
            if (text[0] instanceof CSSComment && str.indexOf('/*') === 0) {

                var depthString = this.getDepthString(text[0]);
                if (depthString.length === 1)
                    continue;

                comments.push(text[0]);

                // add to depth "set" to prevent duplicates,
                // will determine the meaning of each later
                depthSet[depthString] = 0;
            }
        }

        // place depth strings in array so they can be sorted by size
        for (var name in depthSet) {
            depths.push(name);
        }
        depths.sort();
        depths.reverse();

        // assign numberic depth values
        for (i = 0, depthString; depthString = depths[i]; i++) {
            depthSet[depthString] = i + 1;
        }

        var lines = [];
        var depthIndent = typeof options.depthIndent === 'number' ? options.depthIndent : 4;

        lines.push(new CSSLine(0, new CSSComment('/*')));
        lines.push(new CSSLine(1, new CSSComment('* TABLE OF CONTENTS')));
        lines.push(new CSSLine(1, new CSSComment('*')));

        for (var i = 0, comment; comment = comments[i]; i++) {

            var depthString = this.getDepthString(comment);
            var depth = depthSet[depthString];

            var extracted = this.extractComment(comment);
            if (!extracted)
                continue;

            var line = new CSSLine(1, new CSSComment('*' + CSSUtils.indent('- ' + extracted, depth)));
            line.comment = comment;
            comment.tableIndent = line.tableIndent = (depth - 1) * depthIndent;

            lines.push(line);
        }

        lines.push(new CSSLine(1, new CSSComment('*')));
        lines.push(new CSSLine(1, new CSSComment('*/')));
        lines.push(new CSSLine(0));
        lines.push(new CSSLine(0));

        lines.depthSet = depthSet;

        return lines;
    };

    /**
     * Get the asterick string that indicates a comments depth.
     * 
     * @param   {CSSComment}  comment  The selector comment.
     * 
     * @returns {string}
     */
    CSSTableOfContents.prototype.getDepthString = function (comment) {
        // get the preceding astericks
        var depthString = '';
        for (var j = 1; j < comment.trimmed.length; j++) {
            var ch = comment.trimmed[j];
            if (ch !== '*')
                break;

            depthString += '*';
        }
        return depthString;
    };


    /**
     * Extract comment text without start and end astericks.
     * 
     * @param   {CSSComment}  comment  The comment.
     *                                  
     * @returns {string}
     */
    CSSTableOfContents.prototype.extractComment = function (comment) {

        var sub = comment.trimmed.substr(1, comment.trimmed.length - 2);
        var result;
        var firstPass = '';
        var endDepth = false;

        for (var j = 0, ch; ch = sub[j]; j++) {

            if (ch === '\t') {
                ch = '    ';
                endDepth = true;
            } else if (ch === '\r' || ch === '\n') {
                break;
            } else if (ch === '*') {
                if (!endDepth)
                    continue;
            }

            endDepth = true;
            firstPass += ch;
        }

        for (var j = firstPass.length - 1, ch; ch = firstPass[j]; j--) {
            if (ch !== '*') {
                result = firstPass.substr(0, j);
                break;
            }
        }

        return result.trim();
    }

    /**
     * Get the formatted stylesheet with table of contents as a string.
     */
    CSSTableOfContents.prototype.toString = function () {
        var output = '';
        for (var i = 0, line; line = this._output[i]; i++) {
            output += CSSUtils.spaces(line.indent) + line.text + '\n';
        }
        return output;
    }

    return CSSTableOfContents;

}]);