import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {User} from '../../services/interfaces/UserInterface';
import {Router} from '@angular/router';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {EditProfilePage} from '../edit-profile/edit-profile.page';
import {Camera, CameraResultType, CameraSource} from '@capacitor/camera';
import {PhotoService} from '../../services/photo.service';
import {SqliteService} from '../../services/sqlite.service';
import {DatabaseService} from '../../services/database.service';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  user: User;
  data: User;
  constructor(private auth: AuthService, private router: Router, private modalCtrl: ModalController, private photo: PhotoService, private loadingController: LoadingController,
              private alertController: AlertController, private sqlite: SqliteService, private db: DatabaseService) {

    //Actualiza el usuario de la bd local a Firebase.
    this.sqlite.dbState().subscribe((res) => {
      if(res){
        this.sqlite.getUserById(this.auth.currentUser().uid).then(item => {
          this.data = item;
          this.db.updateUserProfile(this.data);
        });
      }
    });
  }

  //Obtiene el usuario de la base de datos.
  getUser(){
    this.auth.getUsers(this.auth.currentUser().uid).subscribe(res => {
      this.user = res;
    });
}

  //Cierra la sesión.
  async endSession(){
    await this.auth.logout();
    this.router.navigateByUrl('',{replaceUrl: true});
  }
  ngOnInit(): void {
    this.getUser();
  }
  //Modal de edición de la información de usuario.
  async openEditModal(user) {
    const modal = await this.modalCtrl.create({
      component: EditProfilePage,
      componentProps:{
        datosPerfil: user,
        checkingEditable: true,
      }
    });
    await modal.present();
  }

  //Actualiza el perfil de usuario.
  async changeImageProfile(user) {
    user = this.auth.currentUser();
    const image = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });
    if (image) {
      const loading = await this.loadingController.create();
      await loading.present();
      const result = await this.photo.uploadUserImg(image, user);
      await loading.dismiss();
      if (!result) {
        const alert = await this.alertController.create({
          header: 'Upload failed',
          message: 'Hubo un problema actualizando tu foto de perfil.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }

}
