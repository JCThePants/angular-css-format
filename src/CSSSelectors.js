module.factory('CSSSelectors', ['CSSUtils', function (CSSUtils) {

    /**
     * Data object of selectors and the properties assigned to them.
     * 
     * @param {Array} [selectors]   Array of CSSSelector
     * @param {Array} [properties]  Array of CSSProperty
     */
    function CSSSelectors(selectors, properties) {
        this.selectors = selectors || [];
        this.properties = properties || [];
        this.start = 0;
        this.end = 0;
    }

    /**
     * Get the selector names as a string.
     */
    CSSSelectors.prototype.toString = function () {
        return this.selectors.toString();
    };

    return CSSSelectors;

}]);