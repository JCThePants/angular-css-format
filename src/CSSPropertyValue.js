module.factory('CSSPropertyValue', [function () {

    /**
     * CSS Property value data object.
     * 
     * @param {string} name  The property name.
     */
    function CSSPropertyValue(value) {
        this.value = value.trim();
    }

    /**
     * Get the property value.
     * 
     * @returns {String}
     */
    CSSPropertyValue.prototype.toString = function () {
        return this.value;
    };

    return CSSPropertyValue;
}]);