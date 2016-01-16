module.factory('CSSSelector', [function () {

    /**
     * Single selector data object.
     *
     * @param {string} name  The selector name.
     */
    function CSSSelector(name) {
        this.name = name.trim();
    }

    /**
     * Determine if the selector has a combinator.
     *
     * @returns {boolean}
     */
    CSSSelector.prototype.hasCombinator = function () {
        return this.name.indexOf(' ') !== -1 ||
            this.name.indexOf('>') !== -1 ||
            this.name.indexOf('+') !== -1 ||
            this.name.indexOf('~') !== -1;
    };

    /**
     * Get the selector as a string.
     */
    CSSSelector.prototype.toString = function () {
        return this.name;
    };

    return CSSSelector;
}]);