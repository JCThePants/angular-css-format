module.factory('CSSProperty', ['CSSPropertyName', 'CSSPropertyValue', 'CSSUtils', function (CSSPropertyName, CSSPropertyValue, CSSUtils) {

    /**
     * CSS property data object.
     * 
     * @param {string} name   The property name.
     * @param {string} value  The property value.
     */
    function CSSProperty(name, value) {
        this._name = typeof name === 'string' ? new CSSPropertyName(name) : null;
        this._value = typeof value === 'string' ? new CSSPropertyValue(value) : null;
        this.comment = null;
        this.start = 0;
        this.end = 0;
    }

    /**
     * Get or set the CSS property name.
     * 
     * @param   {string} name  The name of the property.
     * 
     * @returns {CSSPropertyName}
     */
    CSSProperty.prototype.name = function (name) {
        if (typeof name === 'undefined')
            return this._name;

        return this._name = new CSSPropertyName(name);
    };

    /**
     * Get or set the CSS property value.
     * 
     * @param   {string} value  The property value.
     *
     * @returns {CSSPropertyValue}
     */
    CSSProperty.prototype.value = function (value) {
        if (typeof value === 'undefined')
            return this._value;

        return this._value = new CSSPropertyValue(value);
    };

    /**
     * Get the property as a string.
     * 
     * @param {number} depth   The number of indents to add.
     * @param {string} indent  The indent string to use.
     *
     * @returns {string}
     */
    CSSProperty.prototype.toString = function (depth, indent) {
        var result = CSSUtils.indent(this.name() + ': ' + this.value() + ';', depth, indent);
        if (this.comment)
            result += ' ' + this.comment;
        return result;
    };

    return CSSProperty;
}]);