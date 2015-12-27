module.factory('CSSLine', [function () {

    /**
     * Class that represents a single CSS line.
     * 
     * @param {number}               [indent=0]  The number of indents before the text.
     * @param {string|object|array}  [text]      The initial text.
     */
    function CSSLine(indent, text) {
        this._text = new CSSLineObjects(text);
        this.indent = indent || 0;
    }

    /**
     * Get or set the line text.
     * 
     * @param   {string,object,Array}  text   The line text.
     *                                     
     * @returns {CSSLineObjects}
     */
    CSSLine.prototype.text = function (text) {
        if (typeof text !== 'undefined') {
            this._text = new CSSLineObjects(text);
        }

        return this._text;
    };

    /**
     * Convenience function to push more text into the current text.
     * 
     * @param {string|object|Array}  text  The text to push.
     */
    CSSLine.prototype.push = function (text) {
        this._text.push(text);
    };

    /**
     * Get the length of the line as a string.
     * 
     * @returns {number}
     */
    CSSLine.prototype.length = function () {
        return this._text.toString().length;
    };

    /**
     * Get the CSS line as a string.
     * 
     * @returns {string}
     */
    CSSLine.prototype.toString = function () {
        return this._text.toString();
    };

    /**
     * Array of objects that represent individual components in the line text.
     * 
     * @param {object|Array} [first]  The first object to put into the array
     */
    function CSSLineObjects(first) {
        this.push(first);
    }

    CSSLineObjects.prototype = new Array;

    CSSLineObjects.prototype._push = CSSLineObjects.prototype.push;

    /**
     * Push text objects into the line objects array. All arrays that are
     * pushed are flattened.
     */
    CSSLineObjects.prototype.push = function (obj) {

        if (obj instanceof Array) {
            for (var i = 0; i < obj.length; i++) {
                pushArray(obj[i], this);
            }
        } else if (typeof obj !== 'undefined') {
            this._push(obj);
        }

        function pushArray(obj, self) {
            if (obj instanceof Array) {
                for (var i = 0; i < obj.length; i++) {
                    pushArray(obj[i]);
                }
            } else if (typeof obj !== 'undefined') {
                self._push(obj);
            }
        }
    };


    /**
     * Get the line as a string.
     */
    CSSLineObjects.prototype.toString = function () {
        var result = '';
        for (var i = 0; i < this.length; i++) {
            result += this[i].toString();
        }
        return result;
    };

    return CSSLine;
    
}]);