import { Injectable } from '@angular/core';
import { AfeFormControl, AfeFormArray, AfeFormGroup, AfeControlType } from '../../abstract-controls-extension/control-extensions';
import { QuestionBase } from '../question-models/question-base';
import { ValidationFactory } from '../form-factory/validation.factory';
import { HidersDisablersFactory } from './hiders-disablers.factory';
import { ExpressionRunner } from '../expression-runner/expression-runner';
import { JsExpressionHelper } from '../helpers/js-expression-helper';
var FormControlService = (function () {
    function FormControlService(validationFactory, hidersDisablersFactory) {
        this.controls = [];
        this.validationFactory = validationFactory;
        this.hidersDisablersFactory = hidersDisablersFactory;
    }
    FormControlService.prototype.generateControlModel = function (questionModel, parentControl, generateChildren, form) {
        if (questionModel instanceof QuestionBase) {
            if (questionModel.controlType === AfeControlType.AfeFormArray) {
                return this.generateFormArray(questionModel, parentControl, form);
            }
            if (questionModel.controlType === AfeControlType.AfeFormGroup) {
                return this.generateFormGroupModel(questionModel, generateChildren, parentControl, form);
            }
            if (questionModel.controlType === AfeControlType.AfeFormControl) {
                return this.generateFormControl(questionModel, parentControl, form);
            }
        }
        return null;
    };
    FormControlService.prototype.generateFormGroupModel = function (question, generateChildren, parentControl, form) {
        var formGroup = new AfeFormGroup({});
        this.wireHidersDisablers(question, formGroup, form);
        if (parentControl instanceof AfeFormGroup) {
            parentControl.setControl(question.key, formGroup);
        }
        var asGroup = question;
        if (generateChildren && asGroup && asGroup.questions.length > 0) {
            this._generateFormGroupChildrenModel(asGroup.questions, formGroup, form);
        }
        return formGroup;
    };
    FormControlService.prototype._generateFormGroupChildrenModel = function (questions, parentControl, form) {
        var _this = this;
        if (questions.length > 0) {
            questions.forEach(function (element) {
                var generated = _this.generateControlModel(element, parentControl, true, form);
                if (generated !== null) {
                    parentControl.addControl(element.key, generated);
                }
            });
        }
    };
    FormControlService.prototype.generateFormArray = function (question, parentControl, form) {
        var formArray = new AfeFormArray([]);
        formArray.uuid = question.key;
        this.wireHidersDisablers(question, formArray, form);
        if (parentControl instanceof AfeFormGroup) {
            parentControl.setControl(question.key, formArray);
        }
        return formArray;
    };
    FormControlService.prototype.generateFormControl = function (question, parentControl, form) {
        var value = question.defaultValue || '';
        var validators = this.validationFactory.getValidators(question, form);
        var control = new AfeFormControl(value, validators);
        control.uuid = question.key;
        this.wireHidersDisablers(question, control, form);
        this.wireCalculator(question, control, (form ? form.dataSourcesContainer.dataSources : null));
        if (parentControl instanceof AfeFormGroup) {
            parentControl.setControl(question.key, control);
        }
        return control;
    };
    FormControlService.prototype.wireHidersDisablers = function (question, control, form) {
        if (question.hide && question.hide !== '') {
            var hider = this.hidersDisablersFactory.getJsExpressionHider(question, control, form);
            control.setHidingFn(hider);
        }
        if (question.disable && question.disable !== '') {
            var disable = this.hidersDisablersFactory.getJsExpressionDisabler(question, control, form);
            control.setDisablingFn(disable);
        }
    };
    FormControlService.prototype.wireCalculator = function (question, control, dataSource) {
        if (question.calculateExpression && question.calculateExpression !== '') {
            var helper = new JsExpressionHelper();
            var runner = new ExpressionRunner();
            var runnable = runner.getRunnable(question.calculateExpression, control, helper.helperFunctions, dataSource);
            // this functionality strictly assumes the calculateExpression function has been defined in the JsExpressionHelper class
            control.setCalculatorFn(runnable.run);
        }
    };
    FormControlService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    FormControlService.ctorParameters = function () { return [
        { type: ValidationFactory, },
        { type: HidersDisablersFactory, },
    ]; };
    return FormControlService;
}());
export { FormControlService };
//# sourceMappingURL=form-control.service.js.map