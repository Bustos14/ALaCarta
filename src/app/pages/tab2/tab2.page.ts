import {ChangeDetectorRef, Component} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {AuthService} from '../../services/auth.service';
import {take} from 'rxjs/operators';

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
    orderList = [];
    plateList = [];
    finalList = [];

    //Carga de los pedidos realizados por el usuario actual.
    constructor(private db: DatabaseService, private auth: AuthService, private cd: ChangeDetectorRef) {
        this.db.getAllOrders().subscribe(list => {
            this.orderList = list;
            this.cd.detectChanges();
            this.finalList = [];
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < this.orderList.length; i++) {
                if (this.orderList[i].userId === this.auth.currentUser().uid) {
                    this.finalList.push(this.orderList[i]);
                }
            }
        });
    }

    //Cambia el color del estado.
    getStatusColor(item){
        switch(item) {
            case 'Aceptado':
                return 'success';
            case 'Pendiente':
                return 'warning';
            case 'Cancelado': return 'danger';
        }
    }
}
