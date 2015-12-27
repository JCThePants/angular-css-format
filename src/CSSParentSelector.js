module.factory('CSSParentSelector', [function () {

    /**
     * CSS parent selector data object. (i.e @media)
     * 
     * @param {CSSSelector} selector  The selector.
     */
    function CSSParentSelector(selector) {
        this.selector = selector;
        this.children = [];
        this.start = 0;
        this.end = 0;
    };

    /**
     * Get the parent selector as a string.
     */
    CSSParentSelector.prototype.toString = function () {
        return this.selector;
    };

    return CSSParentSelector;

}]);