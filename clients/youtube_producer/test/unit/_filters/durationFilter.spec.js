'use strict';

describe('Filter: duration', function () {
    var filter;

    beforeEach(module('_filters'));

    beforeEach(inject(function(durationFilter){
        filter = durationFilter;
    }));

    it('should replace youtube video duration string with time in h:mm:ss', function() {
        expect(filter('PT01M33S')).toBe('01:33');
        expect(filter('PT1M33S')).toBe('01:33');
        expect(filter('PT2H45M3S')).toBe('02:45:03');
        expect(filter('PT26S')).toBe('00:26');
        expect(filter('PT3S')).toBe('00:03');
    });

});