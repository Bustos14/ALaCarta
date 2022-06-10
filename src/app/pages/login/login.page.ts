import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {NavController, ActionSheetController, AlertController, LoadingController, MenuController} from '@ionic/angular';
import {SqliteService} from '../../services/sqlite.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials: FormGroup;
  data: any[] = [];
  data2: any[] = [];
  data3: any[] = [];
  constructor(
    private nvCtrl: NavController,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private router: Router,
    public actionSheetController: ActionSheetController,
    private auth: AuthService,
    private cntrlMenu: MenuController,
    private sqlite: SqliteService) {
    this.cntrlMenu.enable(false, 'admin');
  }

  //Obtiene el email
  get email() {
    return this.credentials.get('email');
  }
  //Obtiene la contraseña
  get password() {
    return this.credentials.get('password');
  }
  //Carga el formulario
  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

  }
  //Dialogo para comprobar a que registro quieres acceder. Administrador o usuario respectivamente
  public async showActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: '¿Como desea registrarse?',
      buttons: [{
        text: 'Administrador',
        role: 'destructive',
        icon: 'desktop-outline',
        handler: () => {
          this.router.navigateByUrl('register-admin');
        }
      }, {
        text: 'Usuario',
        role: 'destructive',
        icon: 'person-add-outline',
        handler: () => {
          this.router.navigateByUrl('register');
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
        }
      }]
    });
    await actionSheet.present();
  }
  //Metodo de login, si es correcto te redirige donde corresponde en función del tipo de usuario.
  async login() {
    const loading = await this.loadingController.create();
    await loading.present();
    const user = await this.auth.login(this.credentials.value);
    await loading.dismiss();
    if (user) {
      await this.auth.checkTypeUser(user.user.uid);
    } else {
      await this.showAlert('Inicio de sesión fallido', 'Registrate si no lo estás');
    }
  }

  //Alerta
  async showAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
