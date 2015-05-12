/**
 * Service detecting application mode
 */
module.exports = (function ($routeParams) {
	'use strict';

    var _mode = null;

    var set = function (mode) {
        _mode = mode;
    };

    /**
     * @returns string Application mode
     */
    var get = function() {
        return _mode;
    };

    /**
     * @returns bool Returns true if TV enviroment detected
     */
    var isTV = function() {
        return 'tv' === get();
    };

    /**
     * @returns bool Returns true if PC enviroment detected
     */
    var isPC = function() {
        return 'tv' !== get();
    };

    var _detect = function() {
        // temporary use link option
        _mode = $routeParams.device ? $routeParams.device : 'pc';
    };

    _detect();

    return {
        set: set,
        get: get,
        isTV: isTV,
        isPC: isPC
    };
});
