import { Component, Input, Inject } from '@angular/core';
import 'hammerjs';
import { DEFAULT_STYLES } from './form-renderer.component.css';
import { DOCUMENT } from '@angular/platform-browser';
import { DataSources } from '../data-sources/data-sources';
import { ValidationFactory } from '../form-factory/validation.factory';
import { FormErrorsService } from '../services';
var FormRendererComponent = (function () {
    function FormRendererComponent(validationFactory, dataSources, formErrorsService, document) {
        this.validationFactory = validationFactory;
        this.dataSources = dataSources;
        this.formErrorsService = formErrorsService;
        this.document = document;
        this.childComponents = [];
        this.isCollapsed = false;
        this.activeTab = 0;
    }
    FormRendererComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.setUpRemoteSelect();
        this.setUpFileUpload();
        if (this.node && this.node.form) {
            var tab = this.node.form.valueProcessingInfo.lastFormTab;
            if (tab && tab !== this.activeTab) {
                this.activeTab = tab;
            }
        }
        if (this.node && this.node.question.renderingType === 'form') {
            this.formErrorsService.announceErrorField$.subscribe(function (error) {
                _this.scrollToControl(error);
            });
        }
        if (this.node && this.node.question.renderingType === 'section') {
            this.isCollapsed = !this.node.question.isExpanded;
        }
        if (this.parentComponent) {
            this.parentComponent.addChildComponent(this);
        }
    };
    FormRendererComponent.prototype.addChildComponent = function (child) {
        this.childComponents.push(child);
    };
    FormRendererComponent.prototype.setUpRemoteSelect = function () {
        if (this.node && this.node.question.extras &&
            this.node.question.renderingType === 'remote-select') {
            this.dataSource = this.dataSources.dataSources[this.node.question.dataSource];
            if (this.dataSource && this.node.question.dataSourceOptions) {
                this.dataSource.dataSourceOptions = this.node.question.dataSourceOptions;
            }
        }
    };
    FormRendererComponent.prototype.setUpFileUpload = function () {
        if (this.node && this.node.question.extras && this.node.question.renderingType === 'file') {
            this.dataSource = this.dataSources.dataSources[this.node.question.dataSource];
            console.log('Key', this.node.question);
            console.log('Data source', this.dataSource);
        }
    };
    FormRendererComponent.prototype.clickTab = function (tabNumber) {
        this.activeTab = tabNumber;
    };
    FormRendererComponent.prototype.loadPreviousTab = function () {
        if (!this.isCurrentTabFirst()) {
            this.clickTab(this.activeTab - 1);
            document.body.scrollTop = 0;
        }
    };
    FormRendererComponent.prototype.isCurrentTabFirst = function () {
        return this.activeTab === 0;
    };
    FormRendererComponent.prototype.isCurrentTabLast = function () {
        return this.activeTab === this.node.question['questions'].length - 1;
    };
    FormRendererComponent.prototype.loadNextTab = function () {
        if (!this.isCurrentTabLast()) {
            this.clickTab(this.activeTab + 1);
            document.body.scrollTop = 0;
        }
    };
    FormRendererComponent.prototype.tabSelected = function ($event) {
        this.activeTab = $event.index;
        this.setPreviousTab();
    };
    FormRendererComponent.prototype.setPreviousTab = function () {
        if (this.node && this.node.form) {
            this.node.form.valueProcessingInfo['lastFormTab'] = this.activeTab;
        }
    };
    FormRendererComponent.prototype.hasErrors = function () {
        return this.node.control.touched && !this.node.control.valid;
    };
    FormRendererComponent.prototype.errors = function () {
        return this.getErrors(this.node);
    };
    FormRendererComponent.prototype.scrollToControl = function (error) {
        var _this = this;
        var tab = +error.split(',')[0];
        var elSelector = error.split(',')[1] + 'id';
        // the tab components
        var tabComponent = this.childComponents[tab];
        this.clickTab(tab);
        setTimeout(function () {
            // expand all sections
            tabComponent.childComponents.forEach(function (section) {
                section.isCollapsed = false;
                setTimeout(function () {
                    var element = _this.document.getElementById(elSelector);
                    element.focus();
                }, 200);
            });
        }, 200);
    };
    FormRendererComponent.prototype.onDateChanged = function (node) {
        this.node = node;
    };
    FormRendererComponent.prototype.upload = function (event) {
        console.log('Event', event);
        console.log('Data', this.dataSource);
    };
    FormRendererComponent.prototype.toggleInformation = function (infoId) {
        var e = document.getElementById(infoId);
        if (e.style.display == 'block') {
            e.style.display = 'none';
        }
        else {
            e.style.display = 'block';
        }
        console.log('InfoId', infoId);
    };
    FormRendererComponent.prototype.getErrors = function (node) {
        var errors = node.control.errors;
        if (errors) {
            return this.validationFactory.errors(errors, node.question);
        }
        return [];
    };
    FormRendererComponent.decorators = [
        { type: Component, args: [{
                    selector: 'form-renderer',
                    template: "\n    <!--CONTAINERS-->\n    <div *ngIf=\"node.question.renderingType === 'form'\">\n      <div class=\"dropdown dropdown-tabs forms-dropdown\">\n        <a class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\"><i class=\"fa fa-angle-double-down\"></i></a>\n        <ul class=\"dropdown-menu dropdown-menu-right forms-dropdown-menu\" role=\"menu\" aria-labelledby=\"dropdownMenu\">\n          <li *ngFor=\"let question of node.question.questions; let i = index;\" (click)=\"clickTab(i)\">\n            {{question.label}}\n          </li>\n        </ul>\n      </div>\n      <md-tab-group (selectChange)='tabSelected($event)' [selectedIndex]='activeTab'>\n        <md-tab [label]='question.label' *ngFor=\"let question of node.question.questions; let i = index;\">\n          <div (swipeLeft)='loadNextTab()' (swipeRight)='loadPreviousTab()'>\n            <form-renderer [node]=\"node.children[question.key]\" [parentComponent]=\"this\" [parentGroup]=\"node.control\"></form-renderer>\n          </div>\n        </md-tab>\n      </md-tab-group>\n\n      <div style=\"text-align: center;\">\n        <button type=\"button\" class=\"btn btn-default\" (click)=\"loadPreviousTab()\" [ngClass]=\"{disabled: isCurrentTabFirst()}\">&lt;&lt;</button>\n        <button type=\"button\" class=\"btn btn-default\" (click)=\"loadNextTab()\" [ngClass]=\"{disabled: isCurrentTabLast()}\">\n          &gt;&gt;</button>\n      </div>\n    </div>\n    <div *ngIf=\"node.question.renderingType === 'page'\">\n      <!--<h2>{{node.question.label}}</h2>-->\n      <form-renderer *ngFor=\"let question of node.question.questions\" [parentComponent]=\"this\" [node]=\"node.children[question.key]\"\n        [parentGroup]=\"parentGroup\"></form-renderer>\n    </div>\n    <div *ngIf=\"node.question.renderingType === 'section'\">\n      <div class=\"panel  panel-primary\">\n        <div class=\"panel-heading\">\n          <button type=\"button\" class=\"btn btn-primary pull-right\" (click)=\"isCollapsed = !isCollapsed\">\n            {{isCollapsed ? 'Show' : 'Hide'}}\n          </button> {{node.question.label}}\n        </div>\n        <div class=\"panel-body\" [collapse]=\"isCollapsed\">\n          <form-renderer *ngFor=\"let question of node.question.questions\" [parentComponent]=\"this\" [node]=\"node.children[question.key]\"\n            [parentGroup]=\"parentGroup\"></form-renderer>\n        </div>\n      </div>\n    </div>\n    <!-- MESSAGES -->\n    <div *ngIf=\"node.control && node.control.alert && node.control.alert !== ''\" class=\"alert alert-warning\">\n      <a href=\"#\" class=\"close\" data-dismiss=\"alert\">&times;</a> {{node.control.alert}}\n    </div>\n\n    <!--CONTROLS-->\n\n    <div *ngIf=\"node.question.controlType === 0\" class=\"form-group\" [formGroup]=\"parentGroup\" [hidden]=\"node.control.hidden\"\n      [ngClass]=\"{disabled: node.control.disabled}\">\n      <!--LEAF CONTROL-->\n      <div class=\"question-area\">\n      <a class=\"form-tooltip pull-right\" (click)=\"toggleInformation(node.question.extras.id)\" data-placement=\"right\" *ngIf=\"node.question && node.question.extras.questionInfo  && node.question.extras.questionInfo !== ''  && node.question.extras.questionInfo !== ' '\">\n        <i class=\"glyphicon glyphicon-question-sign\" aria-hidden=\"true\"></i>\n        </a>\n\n      <label *ngIf=\"node.question.label\" [style.color]=\"hasErrors()? 'red' :''\" class=\"control-label\" [attr.for]=\"node.question.key\">\n    \t{{node.question.required === 'true' ? '*':''}} {{node.question.label}}\n      </label>\n      <div [ngSwitch]=\"node.question.renderingType\">\n        <select class=\"form-control\" *ngSwitchCase=\"'select'\" [formControlName]=\"node.question.key\" [id]=\"node.question.key + 'id'\">\n          <option *ngFor=\"let o of node.question.options\"\n                  [ngValue]=\"o.value\">{{o.label}}\n          </option>\n        </select>\n\n        <remote-file-upload *ngSwitchCase=\"'file'\" [dataSource]=\"dataSource\" [formControlName]=\"node.question.key\" [id]=\"node.question.key + 'id'\"\n          (fileChanged)=\"upload($event)\">\n        </remote-file-upload>\n        <textarea [placeholder]=\"node.question.placeholder\" [rows]=\"node.question.rows\" class=\"form-control\" *ngSwitchCase=\"'textarea'\"\n          [formControlName]=\"node.question.key\" [id]=\"node.question.key + 'id'\">\n          </textarea>\n        <remote-select *ngSwitchCase=\"'remote-select'\" [placeholder]=\"node.question.placeholder\" tabindex=\"0\" [dataSource]=\"dataSource\"\n          [componentID]=\"node.question.key + 'id'\" [formControlName]=\"node.question.key\" [id]=\"node.question.key + 'id'\"></remote-select>\n        <date-time-picker *ngSwitchCase=\"'date'\" [showTime]=\"node.question.showTime\" tabindex=\"0\" [weeks]='node.question.extras.questionOptions.weeksList'\n          (onDateChange)=\"onDateChanged(node)\" [showWeeks]=\"node.question.showWeeksAdder\" [formControlName]=\"node.question.key\"\n          [id]=\"node.question.key + 'id'\"></date-time-picker>\n        <ng-select *ngSwitchCase=\"'multi-select'\" [noFilter]=\"50\" [style.height]='auto' tabindex=\"0\" [formControlName]=\"node.question.key\"\n          [id]=\"node.question.key + 'id'\" [options]=\"node.question.options\" [multiple]=\"true\">\n        </ng-select>\n        <input class=\"form-control\" *ngSwitchCase=\"'number'\" [formControlName]=\"node.question.key \" [attr.placeholder]=\"node.question.placeholder \"\n          [type]=\"'number'\" [id]=\"node.question.key + 'id' \" [step]=\"'any'\" [min]=\"node.question.extras.questionOptions.min\" [max]=\"node.question.extras.questionOptions.max\">\n        <input class=\"form-control\" *ngSwitchDefault [formControlName]=\"node.question.key \" [attr.placeholder]=\"node.question.placeholder \"\n          [type]=\"node.question.renderingType\" [id]=\"node.question.key + 'id' \">\n        <div *ngIf=\"node.question.enableHistoricalValue && node.question.historicalDisplay\">\n          <div class=\"container-fluid\">\n            <div class=\"row\">\n              <div class=\"col-xs-9\">\n                <span class=\"text-warning\">Previous Value: </span>\n                <strong>{{node.question.historicalDisplay?.text}}</strong>\n                <span *ngIf=\"node.question.showHistoricalValueDate\">\n                  <span> | </span>\n                <strong class=\"text-primary\">{{node.question.historicalDisplay?._date}}</strong>\n                </span>\n\n              </div>\n              <button type=\"button\" [node]=\"node\" [name]=\"'historyValue'\" class=\"btn btn-primary btn-small col-xs-3\">Use\n                Value\n              </button>\n            </div>\n          </div>\n        </div>\n        <appointments-overview [node]=\"node\"></appointments-overview>\n        <div *ngIf=\"hasErrors() \">\n          <p *ngFor=\"let e of errors() \">\n            <span class=\"text-danger \">{{e}}</span>\n          </p>\n        </div>\n      </div>\n\n       <div class=\"question-info col-md-12 col-lg-12 col-sm-12\" id=\"{{node.question.extras.id}}\" *ngIf=\"node.question && node.question.extras.questionInfo  && node.question.extras.questionInfo !== ''  && node.question.extras.questionInfo !== ' '\">\n        {{node.question.extras.questionInfo}}\n        </div>\n\n      </div>\n    </div>\n    <div *ngIf=\"node.question.controlType === 1\" [hidden]=\"node.control.hidden\" [ngClass]=\"{disabled: node.control.disabled}\">\n\n\n      <!--ARRAY CONTROL-->\n      <div [ngSwitch]=\"node.question.renderingType \">\n        <div class='well' style=\"padding: 2px; \" *ngSwitchCase=\" 'repeating' \">\n          <h4 style=\"margin: 2px; font-weight: bold;\">{{node.question.label}}</h4>\n          <hr style=\"margin-left:-2px; margin-right:-2px; margin-bottom:4px; margin-top:8px; border-width:2px;\" />\n          <div [ngSwitch]=\"node.question.extras.type\">\n            <div *ngSwitchCase=\"'testOrder'\">\n              <div *ngFor=\"let child of node.children; let i=index \">\n                <form-renderer *ngFor=\"let question of child.question.questions \" [parentComponent]=\"this\" [node]=\"child.children[question.key]\n                \" [parentGroup]=\"child.control \"></form-renderer>\n                <div>{{child.orderNumber}}</div>\n                <button type=\"button \" class='btn btn-sm btn-danger' (click)=\"node.removeAt(i) \">Remove</button>\n                <br/>\n                <hr style=\"margin-left:-2px; margin-right:-2px; margin-bottom:4px; margin-top:8px; border-width:1px;\" />\n              </div>\n            </div>\n\n            <div *ngSwitchCase=\"'obsGroup'\" style=\"margin-bottom:20px;\">\n              <div *ngFor=\"let child of node.children; let i=index \">\n                <form-renderer *ngFor=\"let question of child.question.questions \" [parentComponent]=\"this\" [node]=\"child.children[question.key]\n                \" [parentGroup]=\"child.control \"></form-renderer>\n                <button type=\"button \" class='btn btn-sm btn-danger' (click)=\"node.removeAt(i) \">Remove</button>\n                <br/>\n                <hr style=\"margin-left:-2px; margin-right:-2px; margin-bottom:4px; margin-top:8px; border-width:1px;\" />\n              </div>\n            </div>\n          </div>\n          <button type=\"button \" class='btn btn-primary' (click)=\"node.createChildNode() \">Add</button>\n        </div>\n      </div>\n\n    </div>\n    <div *ngIf=\"node.question.controlType === 2\" [hidden]=\"node.control.hidden\" [ngClass]=\"{disabled: node.control.disabled}\">\n\n      <!--GROUP-->\n      <div [ngSwitch]=\"node.question.renderingType \">\n        <div *ngSwitchCase=\" 'group' \">\n          <form-renderer *ngFor=\"let question of node.question.questions \" [parentComponent]=\"this\" [node]=\"node.children[question.key]\n                \" [parentGroup]=\"node.control \"></form-renderer>\n        </div>\n        <div *ngSwitchCase=\" 'field-set' \" style=\"border: 1px solid #eeeeee; padding: 2px; margin: 2px;\">\n          <form-renderer *ngFor=\"let question of node.question.questions \" [parentComponent]=\"this\" [node]=\"node.children[question.key]\n                \" [parentGroup]=\"node.control \"></form-renderer>\n        </div>\n      </div>\n    </div>\n  ",
                    styles: ['../../style/app.css', DEFAULT_STYLES]
                },] },
    ];
    /** @nocollapse */
    FormRendererComponent.ctorParameters = function () { return [
        { type: ValidationFactory, },
        { type: DataSources, },
        { type: FormErrorsService, },
        { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
    ]; };
    FormRendererComponent.propDecorators = {
        'parentComponent': [{ type: Input },],
        'node': [{ type: Input },],
        'parentGroup': [{ type: Input },],
    };
    return FormRendererComponent;
}());
export { FormRendererComponent };
//# sourceMappingURL=form-renderer.component.js.map