import {
    Component, OnInit, Input, forwardRef,
    OnChanges, Output, EventEmitter
  } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { EncounterViewerService } from '../encounter-viewer.service';
import { DataSource } from '../../form-entry/question-models/interfaces/data-source';
const noop = () => {};

@Component({
    selector: 'remote-answer',
    styles: [`input{
        border: none;
        box-shadow: none;
        color: black;
        background: white !important;
        padding-top: 23px;
        display: block;
        position: relative;
    }
    `],
    template: `<div>
    <div class="input-group" *ngIf="innerValue">
      <input type="text" class="form-control" readonly [(ngModel)]="value">
      </div>
    </div>
`,
    providers: [
      {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => RemoteAnswerComponent),
        multi: true
      }
    ]
  })
export class RemoteAnswerComponent implements ControlValueAccessor {
    @Input() public source: any;
    public innerValue = null;
    private _dataSource: DataSource;
    @Input()
    public get dataSource(): DataSource {
        return this._dataSource;
    }
    public set dataSource(v: DataSource) {
        this._dataSource = v;
    }
    // Placeholders for the callbacks which are later providesd
    // by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;
    constructor(private encounterService: EncounterViewerService) {}
    // get accessor
    get value(): any {
      return this.innerValue;
    }

    // set accessor including call the onchange callback
    set value(v: any) {
      if (v !== this.innerValue) {
        this.innerValue = v;
      }
    }
    // Current time string.

    public writeValue(v: any) {
      if (v !== this.innerValue) {
        this._dataSource.resolveSelectedValue(v).subscribe((ans) => {
            this.innerValue = ans.label;
        });
      }
    }

    // From ControlValueAccessor interface
    public registerOnChange(fn: any) {
      this.onChangeCallback = fn;
    }

    // From ControlValueAccessor interface
    public registerOnTouched(fn: any) {
      this.onTouchedCallback = fn;
    }

    public onBlur() {
      this.onTouchedCallback();
    }

    public onChange(event: any) {
    }
  }
