import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../../services/interfaces/UserInterface';
import {AlertController, ModalController} from '@ionic/angular';
import {DatabaseService} from '../../services/database.service';
import {SqliteService} from '../../services/sqlite.service';
import {Network} from '@capacitor/network';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  @Input() datosPerfil;
  myRestForm: FormGroup;
  user: User;
  isConnected = false;
  constructor(private sqlite: SqliteService, private fb: FormBuilder, private modalCtrl: ModalController, private db: DatabaseService, private alert: AlertController) { }

  //Carga del formulario
  ngOnInit() {
    this.myRestForm = this.fb.group(
        {
          name: new FormControl('', [Validators.required]),
          phone: new FormControl('', [Validators.required])
        });
  }
  //Actualiza los datos del perfil en función de si se han agregado nuevos o no. (Sólo teléfono y nombre)
  async updateUserData() {
    const user: User = {
      uid: this.datosPerfil.userId,
      email: this.datosPerfil.email,
      phone: this.myRestForm.value.phone === '' ? this.datosPerfil.phone : this.myRestForm.value.phone,
      displayName: this.myRestForm.value.name === '' ? this.datosPerfil.displayName : this.myRestForm.value.name,
    };
    //Comprueba estado de la conexión
    Network.getStatus().then(data=>{
      this.isConnected = data.connected;
      if(!this.isConnected){
        const updated = this.sqlite.updateUser(user);
        if(updated){
          this.modalCtrl.dismiss();
        }
      }
    });
    const rest = await this.db.updateUserProfile(user);
    if (rest) {
      await this.modalCtrl.dismiss();
    }
  }
  //Cierre del modal
  async closeModal() {
    await this.modalCtrl.dismiss();
  }

}
