import {ActionSheetController, AlertController, LoadingController, ModalController} from '@ionic/angular';
import {ModalPage} from '../modal/modal.page';
import {DatabaseService} from '../../services/database.service';
import {Plato} from '../../services/interfaces/PlatoInterface';
import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Camera, CameraResultType, CameraSource} from '@capacitor/camera';
import {PhotoService} from '../../services/photo.service';
import {Observable} from 'rxjs';
import {Restaurant} from '../../services/interfaces/RestaurantInterface';
import {EditAdminProfilePage} from '../edit-admin-profile/edit-admin-profile.page';
import {Router} from '@angular/router';
import {SqliteService} from '../../services/sqlite.service';


@Component({
    selector: 'app-admin-restaurant',
    templateUrl: './admin-restaurant.page.html',
    styleUrls: ['./admin-restaurant.page.scss'],
})

export class AdminRestaurantPage implements OnInit {
    plateList: Plato[] = [];
    finalList: Plato[] = [];
    componentes: Observable<Component[]>;
    profile = null;
    networkStatus: any;
    datAdmin: Restaurant;
    dataAllPlate: Plato[] = [];
    constructor(private photo: PhotoService, private modalCtrl: ModalController,
                private alertController: AlertController,
                private db: DatabaseService, private cd: ChangeDetectorRef,
                private auth: AuthService, private loadingController: LoadingController,
                private router: Router,
                public actionSheetController: ActionSheetController,
                private sqlite: SqliteService) {
        //Comprueba el estado de la bd local y actualiza o agrega en función a necesidad
        this.sqlite.dbState().subscribe((res) => {
            if(res){
                this.sqlite.getAdminById(this.auth.currentUser().uid).then(item => {
                    if(!item){
                        this.getProfile(true);
                        this.getPlates(true);
                    }else{
                        this.datAdmin = item;
                        this.db.updateAdminProfile(this.datAdmin);
                    }
                });
                    this.dataAllPlate = [];
                    this.dataAllPlate = this.sqlite.fetchPlates();
                    this.dataAllPlate.forEach(item => {
                        if(item.rId === this.auth.currentUser().uid){
                            this.db.updatePlate(item);
                        }
                    });
            }
        });
        this.getPlates(false);
        this.getProfile(false);
    }



//Platos
    //Obtiene el listado de platos
    getPlates(sync) {
            this.db.getAllPlates().subscribe(plate => {
                this.plateList = plate;
                this.cd.detectChanges();
                this.finalList = [];
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i = 0; i < this.plateList.length; ++i) {
                    if (this.plateList[i].rId === this.auth.currentUser().uid) {
                        this.finalList.push(this.plateList[i]);
                        //Comprueba si debe sincronizar
                        if(sync === true){
                            this.sqlite.addPlate(this.plateList[i], this.plateList[i].pId);
                        }
                    }
                }
            });
    }

    //Metodo de actualizacion de fotos para los platos
    async changeImage(plate: Plato) {
        const image = await Camera.getPhoto({
            quality: 90,
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera,
        });
        if (image) {
            const loading = await this.loadingController.create();
            await loading.present();
            const result = await this.photo.uploadPlateImg(image, plate);
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

    async deletePlate(plate) {
        await this.db.deletePlate(plate);
    }


    //Abre el modal para agregar un plato.
    async openModal() {
        const modal = await this.modalCtrl.create({
            component: ModalPage,
            componentProps: {
                checkingEditable: false
            }
        });
        await modal.present();
    }

    //Abre el modal de edición de platos
    async openEditModal(plate) {
        const modal = await this.modalCtrl.create({
            component: ModalPage,
            componentProps: {
                platoEdit: plate,
                checkingEditable: true,
            }
        });
        await modal.present();
    }

    //Ventana de dialogo para la eliminación o edición de platos.
    public async showActionSheet(plato: Plato) {
        const actionSheet = await this.actionSheetController.create({
            buttons: [{
                text: 'Eliminar',
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    this.deletePlate(plato);
                }
            }, {
                text: 'Editar',
                role: 'destructive',
                icon: 'create-outline',
                handler: () => {
                    this.openEditModal(plato);
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

    //Profile
    //Metodo para la actualización de una foto para el restaurante
    async changeImageProfile(restaurant: Restaurant) {
        const image = await Camera.getPhoto({
            quality: 90,
            resultType: CameraResultType.Base64,
            source: CameraSource.Photos
        });
        const loading = await this.loadingController.create();
        if (image) {
            await loading.present();
            const result = await this.photo.uploadRestaurantImg(image, restaurant.nameRestaurant, this.auth.currentUser().uid);
            await loading.dismiss();

            if (!result) {
                const alert = await this.alertController.create({
                    header: 'Upload failed',
                    message: 'Hubo un problema actualizando tu foto de perfil.',
                    buttons: ['OK'],
                });
                await alert.present();
            }
        } else {
            await loading.dismiss();
        }
    }

    //Metodo para la apertura de un modal para la edición de los datos del restaurante
    async modalEditProfile() {
        const modal = await this.modalCtrl.create({
            component: EditAdminProfilePage,
            componentProps: {
                datosPerfil: this.profile,
            }
        });
        await modal.present();

    }

    //Cierra sesión
    async endSession() {
        await this.auth.logout();
        await this.router.navigateByUrl('', {replaceUrl: true});
    }

    //Obtiene el perfil del administrador
    getProfile(sync) {
        this.db.getAdminProfile(this.auth.currentUser().uid).subscribe((data) => {
            this.profile = data;
            if(sync === true){
                this.sqlite.addAdmin(this.profile);
            }
        });
    }

    ngOnInit() {
    }
}
