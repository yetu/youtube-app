/**
 * Service detecting application mode
 */
module.exports = (function ($routeParams, $rootScope) {
	'use strict';

    var _mode = null;

    var set = function (mode) {
        _mode = mode;
    };

    /**
     * @returns {String} Application mode
     */
    var get = function() {
        return _mode;
    };

    /**
     * @returns {Boolean} Returns true if TV enviroment detected
     */
    var isTV = function() {
        return 'tv' === get();
    };

    /**
     * @returns {Boolean} Returns true if PC enviroment detected
     */
    var isPC = function() {
        return 'tv' !== get();
    };

    /**
     * @returns {String} Classes names depending on application mode and view type (if applied)
     */
    var getClass = function() {
        return get() + 'mode ' + $routeParams.mode;
    };

    /**
     * @returns {String} View mode depending on view type (if applied)
     */
    var getView = function() {
        return $routeParams.mode;
    };

    /**
     * @returns {String} Application mode depending on system ('tv'|'pc')
     */
    var _detect = function() {
        // temporary use link option
        _mode = $routeParams.device ? $routeParams.device : 'pc';

        // set global application class directly
        $rootScope.appModeClass = getClass();
    };

    _detect();

    return {
        set: set,
        get: get,
        isTV: isTV,
        isPC: isPC,
        getClass: getClass,
        getView: getView
    };
});
