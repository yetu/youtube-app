'use strict';

describe('Directive: app_input', function () {
    var $compile, scope, $timeout, $window, appKeyInputConfig,
        inputConfig = {
            letters: ['a', 'b', 'c', 'space'],
            numbers: ['1', '2', '3', '#']
        };
        
    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$compile_, $rootScope, _$timeout_, _$window_, _appKeyInputConfig_){
        $compile = _$compile_;
        scope = $rootScope.$new();
        $timeout = _$timeout_;
        $window = _$window_;
        scope.model = { value: '' };
        appKeyInputConfig = _appKeyInputConfig_;
        appKeyInputConfig.letters = inputConfig.letters;
        appKeyInputConfig.numbers = inputConfig.numbers;
    }));

    afterEach(function() {
        scope.$destroy();
    });

    it('should compile and initialize with the configured letters and numbers', function() {
        var element = $compile('<app-key-input></app-key-input>')(scope);
        var elementScope = element.isolateScope();
        scope.$digest();
        expect(elementScope.letters.length).toBe(4);
        expect(elementScope.letters).toBe(inputConfig.letters);
        expect(elementScope.numbers.length).toBe(4);
        expect(elementScope.numbers).toBe(inputConfig.numbers);
    });

    it('should add "a" on click on letter "a"', function() {
        var element = $compile('<app-key-input ng-model="model"></app-key-input>')(scope);
        var elementScope = element.isolateScope();
        var spy = spyOn(elementScope, 'addChar').and.callThrough();
        scope.$digest();
        element.find('li').eq(0).triggerHandler('click');
        expect(elementScope.addChar).toHaveBeenCalled();
        var charElement = angular.element(spy.calls.allArgs(0)[0][0].target);
        expect(charElement.attr('char')).toBe('a');
        // TODO: I could not yet figure out, how to access the searchValue in the parent scope, I could not find it...
    });

    it('should add "b" on click on letter "b"', function() {
        var element = $compile('<app-key-input ng-model="model"></app-key-input>')(scope);
        var elementScope = element.isolateScope();
        var spy = spyOn(elementScope, 'addChar').and.callThrough();
        scope.$digest();
        element.find('li').eq(1).triggerHandler('click');
        expect(elementScope.addChar).toHaveBeenCalled();
        var charElement = angular.element(spy.calls.allArgs(0)[0][0].target);
        expect(charElement.attr('char')).toBe('b');
        // TODO: I could not yet figure out, how to access the searchValue in the parent scope, I could not find it...
    });

    it('should remove the last character on click on del button', function() {
        var element = $compile('<app-key-input ng-model="model"></app-key-input>')(scope);
        var elementScope = element.isolateScope();
        var spy = spyOn(elementScope, 'deleteChar').and.callThrough();
        scope.$digest();
        var listElements = element.find('li');
        listElements.eq(listElements.length-2).triggerHandler('click');
        expect(elementScope.deleteChar).toHaveBeenCalled();
        // TODO: I could not yet figure out, how to access the searchValue in the parent scope, I could not find it...
    });
});