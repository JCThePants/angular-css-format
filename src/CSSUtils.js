module.factory('CSSUtils', [function () {
    var factory;
    return factory = {

        /**
         * The space character to use.
         */
        spaceChar: '&nbsp;',

        /**
         * The default string that is a single indent.
         */
        indentString: '&nbsp;&nbsp;&nbsp;&nbsp;',

        /**
         * Add an indent to the beginning of a string.
         * 
         * @param   {string} str            The string to indent.
         * @param   {number} depth          The number of indents to add.
         * @param   {string} indentString   The string that is a single indent.
         *                                  
         * @returns {string}
         */
        indent: function (str, depth, indentString) {
            depth = typeof depth === 'number' ? depth : 1;
            indentString = typeof indentString === 'undefined' ? factory.indentString : indentString;

            var indent = '';
            for (var i = 0; i < depth; i++) {
                indent += indentString;
            }
            return indent + str;
        },

        /**
         * Generate a string of space characters.
         * 
         * @param   {number} length       The number of spaces.
         * @param   {string} [spaceChar]  The space character to use.
         *                           
         * @returns {string}
         */
        spaces: function (length, spaceChar) {
            var result = '';
            for (var i = 0; i < length; i++) {
                result += spaceChar || factory.spaceChar;
            }
            return result;
        },

        /**
         * Pad the left side of a string with the specified characters.
         * 
         * @param  {number} length    The number of characters to add.
         * @param  {string} [ch=' ']  The character to use for padding.
         * 
         * @returns {string}
         */
        padLeft: function (str, length, ch) {
            ch = ch || factory.spaceChar
            for (var i = 0; i < length; i++) {
                str = ch + str;
            }
            return str;
        },

        /**
         * Ensure the string is a minumum length and if not, pad left.
         * 
         * @param {string} str       The string to pad.
         * @param {number} length    The minimum length of the string.
         * @param {string} [ch=' ']  The character to use for padding.
         */
        minLeft: function (str, length, ch) {
            ch = ch || factory.spaceChar;
            var startLen = str.length,
                addLen =0;
            
            while (startLen + addLen < length) {
                str = ch + str;
                addLen++;
            }
            return str;
        }
    };

}]);