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
        this.indent = 0;
        this.comments = [];
    }

    /**
     * Compare the specificity with another CSSSelector.
     *
     * @param  {CSSSelector} other The other CSSSelector to compare to.
     *
     * @returns {number}
     */
    CSSSelectors.prototype.compareSpecificity = function (other) {
        return this.selectors[0].compareSpecificity(other.selectors[0]);
    };

    /**
     * Get the selector names as a string.
     */
    CSSSelectors.prototype.toString = function () {
        return this.selectors.toString();
    };

    /**
     * Get the name of the root selector in the first selector.
     */
    Object.defineProperty(CSSSelectors.prototype, 'rootSelector', {
        get: function () {
            return this.selectors[0].rootSelector;
        },
        enumerable: true
    });

    return CSSSelectors;

}]);