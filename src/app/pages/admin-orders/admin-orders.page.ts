import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {AuthService} from '../../services/auth.service';
import {ActionSheetController} from '@ionic/angular';
import {Network} from '@capacitor/network';
import {SqliteService} from '../../services/sqlite.service';
import {Order} from "../../services/interfaces/OrderInterface";

@Component({
    selector: 'app-admin-orders',
    templateUrl: './admin-orders.page.html',
    styleUrls: ['./admin-orders.page.scss'],
})
export class AdminOrdersPage implements OnInit {
    orderList = [];
    finalList = [];
    user = [];
    order: Order;
    dataAllOrders = [];
    isConnected = false;

    constructor(private db: DatabaseService, private auth: AuthService, private cd: ChangeDetectorRef
        , private actionSheetController: ActionSheetController, private sqlite: SqliteService) {
        this.getOrders();
    }

    //Obtenemos el listado de pedidos
    getOrders() {
        this.db.getAllOrders().subscribe(list => {
            this.orderList = list;
            this.cd.detectChanges();
            this.finalList = [];
            this.user = [];
            for (const item1 of this.orderList) {
                if (item1.resId.aId === this.auth.currentUser().uid) {
                    this.finalList.push(item1);
                    this.getUser(item1);
                }
            }
        });
    }


    //Obtenemos la lista de los usuarios en función a un id
    getUser(item) {
        this.auth.getUsers(item.userId).subscribe(res => {
            this.user.push(res);
            this.cd.detectChanges();
        });
    }

    //Ventana de dialogo para la actualización del estado de los pedidos.
    public async showActionSheet(order) {
        const actionSheet = await this.actionSheetController.create({
            buttons: [{
                text: 'Cancelar pedido',
                role: 'destructive',
                icon: 'trash',
                handler: () => {
                    Network.getStatus().then(data => {
                        this.isConnected = data.connected;
                        if (!this.isConnected) {
                            this.sqlite.updateOrder(order, 'Cancelado');
                        } else {
                            this.db.updateStatus(order, 'Cancelado');
                            this.getOrders();
                        }
                    });
                }
            }, {
                text: 'Aceptar pedido',
                role: 'destructive',
                icon: 'create-outline',
                handler: () => {
                    Network.getStatus().then(data => {
                        this.isConnected = data.connected;
                        if (!this.isConnected) {
                            this.sqlite.updateOrder(order, 'Aceptado');
                        } else {
                            this.db.updateStatus(order, 'Aceptado');
                            this.getOrders();
                        }
                    });
                }
            }, {
                text: 'No hacer nada',
                icon: 'close',
                role: 'cancel',
                handler: () => {
                }
            }]
        });
        await actionSheet.present();
    }

    //Da un color al tipo de estado que tiene el pedido
    getStatusColor(item) {
        switch (item) {
            case 'Aceptado':
                return 'success';
            case 'Pendiente':
                return 'warning';
            case 'Cancelado':
                return 'danger';
        }
    }
    //Sincronización de pedidos de la bd Firebase a la base de datos local
    sync(){
        this.db.getAllOrders().subscribe(list2 => {
            for (const item1 of list2) {
                this.sqlite.addOrder(item1.order, item1.resId.aId, item1.userId, item1.totalPrice, item1.cant,
                    item1.status, item1.date, item1.lastUpdate);
            }
        });
        this.sqlite.dbState().subscribe((res) => {
            // @ts-ignore
            if (res) {
                this.dataAllOrders = [];
                this.dataAllOrders =  this.sqlite.fetchOrders();
                this.dataAllOrders.forEach(item => {
                    this.db.updateStatus(item.order, item.status);
                });
            }
        });
    }
    ngOnInit() {
        this.sync();
    }
}
