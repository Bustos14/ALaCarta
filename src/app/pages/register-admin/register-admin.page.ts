import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AlertController, LoadingController} from '@ionic/angular';
import {AuthService} from '../../services/auth.service';
import {PasswordValidator} from '../../validators/password.validator';
import {SqliteService} from '../../services/sqlite.service';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-register-admin',
  templateUrl: './register-admin.page.html',
  styleUrls: ['./register-admin.page.scss'],
})
export class RegisterAdminPage implements OnInit {
  networkStatus: any;
  hide = true;
  myForm: FormGroup;
  myRestForm: FormGroup;
  validator: Validators = new Validators();
  res;

  constructor(private fb: FormBuilder, private router: Router, private loadingController: LoadingController,
              private alertController: AlertController, private authService: AuthService, private sqlite: SqliteService) {
  }

  //Registro de administrador, si es exitoso te redirige a la pantalla correspondiente.
  async sregister() {
    this.networkStatus = await Network.getStatus();
    const loading = await this.loadingController.create();
    await loading.present();
    const user = await this.authService.register(this.myForm.value);
    await loading.dismiss();
      this.res = {
        aId: user.user.uid,
        email: this.myForm.value.email,
        nameRestaurant: this.myRestForm.value.nameRestaurant,
        city: this.myRestForm.value.city,
        street: this.myRestForm.value.street,
        codPostal: this.myRestForm.value.codPostal,
        description: this.myRestForm.value.description,
        img: null,
      };
    if(this.networkStatus.connected){
      if (user) {
        await this.authService.saveRestaurant(this.res);
        await this.router.navigateByUrl('/tabs-admin/admin-restaurant', {replaceUrl: true});
      } else {
        await this.showAlert('Registro fallido', 'Pruebe de nuevo');
      }
    }else{
      await this.showAlert('Registro fallido', 'Compruebe su conexión a internet');
    }
  }
  //Carga del control del formulario
  get f() {
    return this.myForm.controls;
  }
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
  //Metodo para el control de formulario Administrador
  newAdminForm(){
    this.myForm = new FormGroup(
      {
        name: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8)
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
        dni : new FormControl('', [Validators.required])
      },
      PasswordValidator.passwordMatching('password', 'confirmPassword'));//Llamada al validador para las contraseñas
  }
  //Metodo para el control del formulario para Restaurante
  newRestForm(){
    this.myRestForm= new FormGroup(
      {
      nameRestaurant: new FormControl('', [Validators.required]),
      street: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      codPostal: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required, Validators.maxLength(255)])
    });
  }
  ngOnInit() {
    this.newAdminForm();
    this.newRestForm();
  }

  //Envio del formulario si es válido
  async submit() {
    if (this.myForm.valid){
      await this.sregister();
    }
  }

  //Control de errores del formulario.
  public hasError = (controlName: string, errorName: string) => this.myForm.controls[controlName].hasError(errorName);
  passwordsMatch = (_form: FormGroup): boolean => {
    if (_form.controls.password.dirty && _form.controls.confirmPassword.dirty) {
      return _form.value.password === _form.value.confirmPassword;
    }
    return true;
  };
}
