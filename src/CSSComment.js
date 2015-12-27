module.factory('CSSComment', ['CSSUtils', function (CSSUtils) {

    /**
     * CSS comment data object.
     * 
     * @param {string} comment  Optional. The comment string.
     */
    function CSSComment(comment, type) {
        this.raw = comment || '';
        this.trimmed = this.raw.trim();
        this.start = 0;
        this.end = 0;
        this.type = type || 'selector';
    }

    /**
     * Get the comment as a CSS string.
     */
    CSSComment.prototype.toString = function () {
        return this.trimmed;
    };

    // return class
    return CSSComment
}]);