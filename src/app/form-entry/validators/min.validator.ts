import { FormControl } from '@angular/forms';

export class MinValidator {


  validate(min: number) {

    return (control: FormControl): {[key: string]: any} => {

      if(control.value && control.value.length != 0) {

        let v: number = control.value;
        return v >= min ? null : { 'min': { requiredValue: min, actualValue: v } };
      }

      return null;
    };
  }
}
