import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AlertController, LoadingController} from '@ionic/angular';
import {AuthService} from '../../services/auth.service';
import {PasswordValidator} from '../../validators/password.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  hide = true;
  myForm: FormGroup;
  validator: Validators = new Validators();

  constructor(private fb: FormBuilder, private router: Router, private loadingController: LoadingController,
              private alertController: AlertController, private authService: AuthService) {}
  //Controlador del formulario
  get f() {
    return this.myForm.controls;
  }
  //Carga de formulario.
  reactiveForm() {
    this.myForm = new FormGroup(
      {
        name: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        phone: new FormControl('', [Validators.required]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8)
        ]),
        confirmPassword: new FormControl('', [Validators.required])
      },
      PasswordValidator.passwordMatching('password', 'confirmPassword') // insert here
    );
  }
  //Metodo de registro. Si es exitoso te redirecciona a la pantalla correspondiente.
  async sregister() {
    const loading = await this.loadingController.create();
    await loading.present();
    const user = await this.authService.register(this.myForm.value);;
    await loading.dismiss();
    if (user) {
      await this.authService.saveUser(user, this.myForm.value.name, this.myForm.value.phone);
      await this.router.navigateByUrl('/tabs', {replaceUrl: true});
    } else {
      await this.showAlert('Registro fallido', 'Pruebe de nuevo');
    }
  }

  //Vuelta al login.
  async back() {
    await this.router.navigateByUrl('', {replaceUrl: true});
  }

  async showAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  ngOnInit() {
    this.reactiveForm();
  }

  //Envio de formulario
  submit() {
    if (this.myForm.valid){
       this.sregister();
    }
  }

  //Comprobador de errores
  public hasError = (controlName: string, errorName: string) => this.myForm.controls[controlName].hasError(errorName);
  passwordsMatch = (_form: FormGroup): boolean => {
    if (_form.controls.password.dirty && _form.controls.confirmPassword.dirty) {
      return _form.value.password === _form.value.confirmPassword;
    }
    return true;
  };

}
