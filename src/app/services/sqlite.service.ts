import {Injectable} from '@angular/core';
import {Platform} from '@ionic/angular';
import {User} from './interfaces/UserInterface';
import {Restaurant} from './interfaces/RestaurantInterface';
import {Plato} from './interfaces/PlatoInterface';
import {Order} from './interfaces/OrderInterface';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {SQLitePorter} from '@ionic-native/sqlite-porter/ngx';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite/ngx';

@Injectable({
    providedIn: 'root'
})
export class SqliteService {
    dbName = '';
    userList = new BehaviorSubject([]);
    adminList = new BehaviorSubject([]);
    plateList: Plato[];
    orderList: Order[];
    private storage: SQLiteObject;
    private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private platform: Platform,
        private sqlite: SQLite,
        private httpClient: HttpClient,
        private sqlPorter: SQLitePorter) {
        //Si el dispositivo esta listo, crea la bd.
        this.platform.ready().then(() => {
            this.sqlite.create({
                name: 'alacarta_db.db',
                location: 'default'
            }).then((db: SQLiteObject) => {
                    this.storage = db;
                    this.getData();
                });
        });
    }
    //Observable al estado de la BD
    dbState() {
        return this.isDbReady.asObservable();
    }
    //Busca la lista de platos
    fetchPlates(){
        return this.plateList;
    }
    //Busca la lista de pedidos.
    fetchOrders() {
        return this.orderList;
    }
    // Renderiza los datos de la aplicación.
    getData() {
        this.httpClient.get(
            'assets/alacarta.sql',
            {responseType: 'text'}
        ).subscribe(data => {
            this.sqlPorter.importSqlToDb(this.storage, data)
                .then(_ => {
                    this.getUsers();
                    this.getAdmins();
                    this.getPlates();
                    this.getOrders();
                    this.isDbReady.next(true);
                })
                .catch(error => console.error(error));
        });
    }
    // Obtiene las listas de los datos de la base de datos local.
    getUsers(){
        return this.storage.executeSql('SELECT * FROM users', []).then(res => {
            const items: User[] = [];
            if (res.rows.length > 0) {
                for (let i = 0; i < res.rows.length; i++) {
                    items.push({
                        uid: res.rows.item(i).user_id,
                        email: res.rows.item(i).user_email,
                        displayName: res.rows.item(i).user_name,
                        phone: res.rows.item(i).user_tlf
                    });
                }
            }
            this.userList.next(items);
        });
    }
    getAdmins(){
        return this.storage.executeSql('SELECT * FROM admins', []).then(res => {
            const items: Restaurant[] = [];
            if (res.rows.length > 0) {
                for (let i = 0; i < res.rows.length; i++) {
                    items.push({
                       aId: res.rows.item(i).admin_id,
                       email: res.rows.item(i).admin_email,
                       nameRestaurant: res.rows.item(i).admin_name,
                       street: res.rows.item(i).admin_street,
                       city: res.rows.item(i).admin_city,
                       codPostal: res.rows.item(i).admin_cp,
                       description: res.rows.item(i).admin_desc
                    });
                }
            }
            this.adminList.next(items);
        });
    }
    getPlates(){
       this.storage.executeSql('SELECT * FROM plates', []).then(res => {
            const items: Plato[] = [];
            if (res.rows.length > 0) {
                for (let i = 0; i < res.rows.length; i++) {
                    items.push({
                        pId: res.rows.item(i).plate_id,
                        rId: res.rows.item(i).admin_id,
                        nombre: res.rows.item(i).plate_name,
                        ingredients: res.rows.item(i).plate_ingredients,
                        pvp: res.rows.item(i).plate_pvp,
                        description: res.rows.item(i).plate_description
                    });
                }
            }
            return this.plateList = items;
        });
    }
    getOrders(){
        return this.storage.executeSql('SELECT * FROM orders', []).then(res => {
            const items: Order[] = [];
            if (res.rows.length > 0) {
                for (let i = 0; i < res.rows.length; i++) {
                    items.push({
                        order: res.rows.item(i).order_id,
                        userId: res.rows.item(i).user_id,
                        resId: res.rows.item(i).admin_id,
                        date: res.rows.item(i).order_date,
                        lastUpdate: res.rows.item(i).last_update,
                        status: res.rows.item(i).order_status,
                        totalPrice: res.rows.item(i).totat_Price,
                        cant: res.rows.item(i).cant
                    });
                }
            }
           return this.orderList = items;
        });
    }

    // Obtiene un solo objeto de la base de datos local en función a su ID.
    getUserById(id): Promise<User> {
        return this.storage.executeSql('SELECT * FROM users WHERE user_id = ?', [id]).then(res => ({
                uid: res.rows.item(0).user_id,
                displayName: res.rows.item(0).user_name,
                email: res.rows.item(0).user_email,
                phone: res.rows.item(0).user_tlf
            }));
    };

    getAdminById(id): Promise<Restaurant> {
        return this.storage.executeSql('SELECT * FROM admins WHERE admin_id = ?', [id]).then(res => (
            {
            aId: res.rows.item(0).admin_id,
            email: res.rows.item(0).admin_email,
            nameRestaurant: res.rows.item(0).admin_name,
            street: res.rows.item(0).admin_street,
            city: res.rows.item(0).admin_city,
            codPostal: res.rows.item(0).admin_cp,
            description: res.rows.item(0).admin_desc
        }));
    }
    getPlateById(id): Promise<Plato> {
        return this.storage.executeSql('SELECT * FROM plate WHERE plate_id = ?', [id]).then(res => ({
            pId: res.rows.item(0).plate_id,
            rId: res.rows.item(0).admin_id,
            nombre: res.rows.item(0).plate_name,
            ingredients: res.rows.item(0).plate_ingredients,
            pvp: res.rows.item(0).plate_pvp,
            description: res.rows.item(0).plate_description
        }));
    }
    getOrderById(id): Promise<Order> {
        const data= [id];
        return this.storage.executeSql('SELECT * FROM orders WHERE order_id = ?', data).then(res => ({
            order: id,
            userId: res.rows.item(0).user_id,
            resId: res.rows.item(0).admin_id,
            date: res.rows.item(0).order_date,
            lastUpdate: res.rows.item(0).last_update,
            status: res.rows.item(0).order_status,
            totalPrice: res.rows.item(0).totat_Price,
            cant: res.rows.item(0).cant
        }));
    }


    // Metodos de agregación de la base de datos local.
    addUser(userId, email, displayName, phone) {
        const data = [userId, displayName, email, phone];
        return this.storage.executeSql('INSERT INTO users ( user_id, user_name, user_email, user_tlf) VALUES (?, ?, ?, ?)', data)
            .then(res => {
                this.getUsers();
            });
    }
    addAdmin(admins: Restaurant) {
        const data = [admins.aId, admins.email, admins.nameRestaurant, admins.street, admins.city, admins.codPostal, admins.description];
        return this.storage.executeSql('INSERT INTO admins ( admin_id, admin_email, admin_name, admin_street, admin_city, admin_cp, admin_desc) VALUES (?, ?, ?, ?, ?, ?, ?)', data)
            .then(res => {
                this.getAdmins();
            });
    }

    addPlate(plate: Plato, id) {
        plate.pId = id;
        const data = [plate.pId, plate.rId, plate.nombre, plate.ingredients, plate.pvp, plate.description];
        return this.storage.executeSql('INSERT INTO plates ( plate_id, admin_id, plate_name, plate_ingredients, plate_pvp, plate_description) VALUES (?, ?, ?, ?, ?, ?)', data)
            .then(res => {
                this.getPlates();
            });
    }

    addOrder(order, resId, userId, total, cant, status, date, lastUpdate) {
        const data = [order, userId, resId, date, lastUpdate, status, total, cant];
        return this.storage.executeSql('INSERT OR REPLACE INTO orders ( order_id, user_id, admin_id, order_date, last_update, order_status, totat_Price, cant) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', data)
            .then(res => {
                this.getOrders();
            });
    }
    // Metodos de actualización de la base de datos local.
    updateUser( user: User) {
        const data = [user.displayName, user.phone, user.uid];
        return this.storage.executeSql('UPDATE users SET user_name = ?, user_tlf = ? WHERE user_id = ?', data)
            .then(res => {
                this.getUsers();
            });
    }
    updateAdmin(admin: Restaurant) {
        const data = [admin.nameRestaurant, admin.description, admin.codPostal, admin.street, admin.city, admin.aId];
        return this.storage.executeSql('UPDATE admins SET admin_name = ?, admin_desc = ?, admin_cp = ?, admin_street = ?, admin_city = ? WHERE admin_id = ?', data)
            .then(res => {
                this.getAdmins();
            });
    }
    updatePlate(plate: Plato) {
        const data = [plate.nombre, plate.ingredients, plate.pvp, plate.description, plate.pId];
        return this.storage.executeSql('UPDATE plates SET plate_name = ?, plate_ingredients = ?, plate_pvp = ?,plate_description = ? WHERE plate_id = ?', data)
            .then(res => {
                this.getPlates();
            });
    }
    updateOrder(id, status) {
        const data = [status, id];
        return this.storage.executeSql('UPDATE orders SET order_status = ? WHERE order_id = ?',data)
            .then(res => {
                this.getOrders();
            });
    }
    // Delete
    deletePlate(id) {
       return this.storage.executeSql('DELETE FROM plates WHERE plate_id = ?', [id])
            .then(_ => {
                this.getPlates();
            });
    }
}
