module.factory('CSSPropertyName', [function () {

    /**
     * CSS Property name data object.
     * 
     * @param {string} name  The property name.
     */
    function CSSPropertyName(name) {
        this.name = name.trim();
    }

    /**
     * Get the property name.
     * 
     * @returns {String}
     */
    CSSPropertyName.prototype.toString = function () {
        return this.name;
    };

    return CSSPropertyName;
}]);