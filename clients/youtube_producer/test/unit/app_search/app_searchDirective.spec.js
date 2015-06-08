'use strict';

describe('Directive: app_search', function () {
    var $compile, scope, $timeout;

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$compile_, $rootScope, _$timeout_){
        $compile = _$compile_;
        scope = $rootScope.$new();
        $timeout = _$timeout_;
    }));

    afterEach(function() {
        scope.$destroy();
    });

    it('should compile to div with default class with input and button elements inside', function() {
        var element = $compile('<app-search></app-search>')(scope);
        scope.$digest();
        expect(element.find('div').eq(0).attr('class')).toBe('app-search');
        expect(element.find('input').eq(0).attr('class')).toContain('query');
        expect(element.find('input').eq(0).attr('type')).toBe('text');
        expect(element.find('button').eq(0).attr('class')).toBe('search');
    });

    it('should compile element properly with placeholder and value', function() {
        var element = $compile('<app-search placeholder="enter search value" value="some search value"></app-search>')(scope);
        scope.$digest();
        expect(element.find('input').eq(0).attr('placeholder')).toBe('enter search value');
        expect(element.find('input').eq(0).attr('value')).toBe('some search value');
    });

    it('should react on click', function() {
        var element = $compile('<app-search trigger-search="button" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        scope.$digest();
        element.find('button').eq(0).triggerHandler('click');
        expect(elementScope.$emit).toHaveBeenCalledWith("app:search-value", "yetu");
        expect(elementScope.emitted).toBe('yetu');
    });

    it('should not react on click', function() {
        var element = $compile('<app-search trigger-search="enter" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        element.find('button').eq(0).triggerHandler('click');
        expect(elementScope.$emit).not.toHaveBeenCalled();
        expect(elementScope.emitted).not.toBe('yetu');
    });

    it('should react on enter on key up', function() {
        var element = $compile('<app-search trigger-search="enter" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        scope.$digest();
        element.find('input').eq(0).triggerHandler({type: 'keyup', keyCode: 13});
        expect(elementScope.$emit).toHaveBeenCalledWith('app:search-value', 'yetu');
        expect(elementScope.emitted).toBe('yetu');
    });

    it('should not react on enter on key down', function() {
        var element = $compile('<app-search trigger-search="enter" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        scope.$digest();
        element.find('input').eq(0).triggerHandler({type: 'keydown', keyCode: 13});
        expect(elementScope.$emit).not.toHaveBeenCalled();
        expect(elementScope.emitted).not.toBe('yetu');
    });

    it('should not react on other key on key up', function() {
        var element = $compile('<app-search trigger-search="enter" value="yetu"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        scope.$digest();
        element.find('input').eq(0).triggerHandler({type: 'keyup', keyCode: 65});
        expect(elementScope.$emit).not.toHaveBeenCalled();
        expect(elementScope.emitted).not.toBe('yetu');
    });

    it('should reset search', function() {
        var element = $compile('<app-search trigger-search="button" value="test"></app-search>')(scope);
        var elementScope = element.isolateScope();
        spyOn(elementScope, '$emit');
        scope.$digest();
        element.find('button').eq(0).triggerHandler('click');
        expect(elementScope.emitted).toBe('test');
        elementScope.$emit.calls.reset();
        element.find('input').eq(0).prop('value', '');
        element.find('button').eq(0).triggerHandler('click');
        expect(elementScope.$emit).toHaveBeenCalledWith("app:search-reset");
        expect(elementScope.emitted).toBe('');
    });

    it('should debounce input value', function() {
        var element = $compile('<app-search trigger-search="auto"></app-search>')(scope);
        var elementScope = element.isolateScope();
        scope.$digest();
        expect(elementScope.searchValue).toBe(undefined);
        spyOn(elementScope, '$emit');
        elementScope.searchValue = 'yetu';
        scope.$digest();
        expect(elementScope.$emit).toHaveBeenCalledWith("app:search-value", "yetu");
        expect(elementScope.emitted).toBe('yetu');
    });

    it('should not debounce empty input value', function() {
        var element = $compile('<app-search trigger-search="auto"></app-search>')(scope);
        var elementScope = element.isolateScope();
        scope.$digest();
        expect(elementScope.searchValue).toBe(undefined);
        spyOn(elementScope, '$emit');
        elementScope.searchValue = '';
        expect(elementScope.$emit).not.toHaveBeenCalled();
        scope.$digest();
        expect(elementScope.$emit).not.toHaveBeenCalled;
        expect(elementScope.emitted).toBeUndefined();
    });
    
    xit('should get focus on the input field on click in input field', function() {
        var element = $compile('<app-search trigger-search="button" value="test"></app-search>')(scope);
        scope.$digest();
        var inputField = element.find('input').eq(0);
        inputField.triggerHandler('click');
        scope.$digest();
        expect(inputField[0]).toBe(document.activeElement);
    });
    
    xit('should loose focus on the input field on blur', function() {
        var element = $compile('<app-search trigger-search="button" value="test"></app-search>')(scope);
        scope.$digest();
        var inputField = element.find('input').eq(0);
        inputField.triggerHandler('click');
        console.log(inputField.html());
        scope.$digest();
        expect(inputField[0]).toBe(document.activeElement);
        inputField.triggerHandler('blur');
        scope.$digest();
        expect(inputField[0]).not.toBe(document.activeElement);
    });
});