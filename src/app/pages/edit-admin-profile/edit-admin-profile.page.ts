import {Component, Input, OnInit} from '@angular/core';
import {LoadingController, ModalController, NavParams} from '@ionic/angular';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DatabaseService} from '../../services/database.service';
import {Restaurant} from '../../services/interfaces/RestaurantInterface';
import {Network} from '@capacitor/network';
import {SqliteService} from '../../services/sqlite.service';

@Component({
    selector: 'app-edit-admin-profile',
    templateUrl: './edit-admin-profile.page.html',
    styleUrls: ['./edit-admin-profile.page.scss'],
})
export class EditAdminProfilePage implements OnInit {
    @Input() datosPerfil;
    myRestForm: FormGroup;
    restaurant: Restaurant;
    isConnected = false;
    constructor(private navParams: NavParams, private modalCtrl: ModalController, private fb: FormBuilder, private db: DatabaseService
    , private sqlite: SqliteService, private load: LoadingController) {
    }
    //Carga del formulario al iniciar la pantalla
    ngOnInit() {
        this.myRestForm = this.fb.group(
            {
                nameRestaurant: new FormControl('', [Validators.required]),
                street: new FormControl('', [Validators.required]),
                city: new FormControl('', [Validators.required]),
                codPostal: new FormControl('', [Validators.required]),
                description: new FormControl('', [Validators.required, Validators.maxLength(255)])
            });
    }

    //Actualización de los datos del restaurante, obteniendo si se han cambiado o no.
    async updateRestaurantData() {
        const restaurant: Restaurant = {
            aId: this.datosPerfil.aId,
            email: this.datosPerfil.email,
            // eslint-disable-next-line max-len
            nameRestaurant: this.myRestForm.value.nameRestaurant === '' ? this.datosPerfil.nameRestaurant : this.myRestForm.value.nameRestaurant,
            city: this.myRestForm.value.city === '' ? this.datosPerfil.city : this.myRestForm.value.city,
            street: this.myRestForm.value.street === '' ? this.datosPerfil.street : this.myRestForm.value.street,
            codPostal: this.myRestForm.value.codPostal === '' ? this.datosPerfil.codPostal : this.myRestForm.value.codPostal,
            description: this.myRestForm.value.description === '' ? this.datosPerfil.description : this.myRestForm.value.description,
        };
        //Comprueba el estado de la conexión
        Network.getStatus().then(data=>{
            this.isConnected = data.connected;
            if(!this.isConnected){
                const updated = this.sqlite.updateAdmin(restaurant);
                if(updated){
                    this.modalCtrl.dismiss();
                }
            }
        });
        const rest = await this.db.updateAdminProfile(restaurant);
        if (rest) {
            await this.modalCtrl.dismiss();
        }
    }

    //Cierre del modal
    async cerrarModal() {
        await this.modalCtrl.dismiss();
    }
}
