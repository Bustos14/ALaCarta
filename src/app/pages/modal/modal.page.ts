import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {AuthService} from '../../services/auth.service';
import {Plato} from '../../services/interfaces/PlatoInterface';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {DatabaseService} from '../../services/database.service';
import {Network} from '@capacitor/network';
import {SqliteService} from '../../services/sqlite.service';


@Component({
    selector: 'app-modal',
    templateUrl: './modal.page.html',
    styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {
    @Input() platoEdit;
    @Input() checkingEditable;
    plato: Plato;
    myPlateForm: FormGroup;
    isConnected = false;

    constructor(private modalCtrl: ModalController, private auth: AuthService, private fb: FormBuilder,
                private db: DatabaseService, private sqlite: SqliteService) {
    }

    //Carga de formulario
    ngOnInit() {
        this.myPlateForm = this.fb.group({
                plateName: new FormControl('',),
                ingredients: new FormControl(''),
                description: new FormControl(''),
                pvp: new FormControl('')
            }
        );
    }

    // Cierre del modal
    async cerrarModal() {
        await this.modalCtrl.dismiss();
    }

    //Coomprueba la accion a realizar, en función de si es una creación o una edición de plato
    async checkingAction() {
        if (this.platoEdit == null) {
            await this.newPlate();
        } else {
            await this.updatePlate();
        }
    }

    //Actualiza el plato en función de si se le han metido datos o no.
    async updatePlate() {
        this.plato = {
            pId: this.platoEdit.pId,
            rId: this.platoEdit.rId,
            nombre: this.myPlateForm.value.plateName === '' ? this.platoEdit.nombre : this.myPlateForm.value.plateName,
            description: this.myPlateForm.value.description === '' ? this.platoEdit.description : this.myPlateForm.value.description,
            ingredients: this.myPlateForm.value.ingredients === '' ? this.platoEdit.ingredients : this.myPlateForm.value.ingredients,
            pvp: this.myPlateForm.value.pvp === '' ? this.platoEdit.pvp : this.myPlateForm.value.pvp,
        };
        //Comprueba el estado de la conexión
        Network.getStatus().then(data => {
            this.isConnected = data.connected;
            if (!this.isConnected) {
                const updated = this.sqlite.updatePlate(this.plato);
                if (updated) {
                    this.modalCtrl.dismiss();
                }
            }
        });
        const plate = await this.db.updatePlate(this.plato);
        if (plate) {
            await this.modalCtrl.dismiss();
        }
    }

    //Crea un nuevo plato
    async newPlate() {
        this.plato = {
            rId: this.auth.currentUser().uid,
            nombre: this.myPlateForm.value.plateName,
            description: this.myPlateForm.value.description,
            ingredients: this.myPlateForm.value.ingredients,
            pvp: this.myPlateForm.value.pvp,
        };
        const plate = await this.db.savePlato(this.plato);
        if (plate) {
            await this.modalCtrl.dismiss();
        }
        await this.modalCtrl.dismiss();
    }
}
