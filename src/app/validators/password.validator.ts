import {AbstractControl, FormGroup, Validators} from '@angular/forms';

//Validador para comprobar si la contraseña se repite correctamente.
export class PasswordValidator implements Validators{
    static passwordMatching(controlName: string, matchingControlName: string) {
        return (formGroup: FormGroup) => {
            const control = formGroup.controls[controlName];
            const matchingControl = formGroup.controls[matchingControlName];
            if (matchingControl.errors && !matchingControl.errors.mustMatch) {
                return;
            }
            // set error on matchingControl if validation fails
            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({ mustMatch: true });
            } else {
                matchingControl.setErrors(null);
            }
            return null;
        };
    }
}
