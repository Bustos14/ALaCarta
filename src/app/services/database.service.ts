import {Injectable} from '@angular/core';
import {
    collection,
    collectionData,
    deleteDoc,
    doc,
    docData,
    Firestore, orderBy,
    query,
    updateDoc
} from '@angular/fire/firestore';
import {Plato} from './interfaces/PlatoInterface';
import {BehaviorSubject, Observable} from 'rxjs';
import {Restaurant} from './interfaces/RestaurantInterface';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AuthService} from './auth.service';
import firebase from 'firebase/compat/app';
import {Storage} from '@capacitor/storage';
import {SqliteService} from './sqlite.service';

const CART_STORAGE_KEY = 'MY_CART';
const INCREMENT = firebase.firestore.FieldValue.increment(+1);
const DECREMENT = firebase.firestore.FieldValue.increment(-1);

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    cart = new BehaviorSubject({});
    cartKey = null;
    networkStatus: any;

    /* METODOS PARA GESTION DE DATOS FIREBASE */
    constructor(private auth: AuthService, private firestore: Firestore, public afs: AngularFirestore, private sqlite: SqliteService) {
        this.loadCart();
    }

    //Obtiene el perfil de administrador.
    getAdminProfile(id) {
        const adminDocRef = doc(this.firestore, `restaurants/${id}`);
        return docData(adminDocRef, {idField: 'id'});
    }

    //Actualiza el usuario de la bd firebase.
    async updateUserProfile(user) {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        const displayName = user.displayName;
        const phone = user.phone;
        await updateDoc(userDocRef, {
            displayName,
            phone
        });
        await this.sqlite.updateUser(user);
        return docData(userDocRef, {idField: 'id'});
    }

    //Actualizacion perfil de Administrador en Firebase.
    async updateAdminProfile(restaurant) {
        const adminDocRef = doc(this.firestore, `restaurants/${restaurant.aId}`);
        const nameRestaurant = restaurant.nameRestaurant;
        const street = restaurant.street;
        const city = restaurant.city;
        const codPostal = restaurant.codPostal;
        const description = restaurant.description;
        await updateDoc(adminDocRef, {
            nameRestaurant,
            street,
            city,
            codPostal,
            description
        });
        await this.sqlite.updateAdmin(restaurant);
        return docData(adminDocRef, {idField: 'id'});
    }

    //Obtiene la lista de restaurantes de firebase.
    getAllRestaurants(): Observable<Restaurant[]> {
        const restRef = collection(this.firestore, 'restaurants');
        const q = query(restRef);
        return collectionData(q, {idField: 'id'}) as Observable<Restaurant[]>;
    }

    //Obtiene la lista de platos de firebase
    getAllPlates(): Observable<Plato[]> {
        const plateRef = collection(this.firestore, 'platos');
        const q = query(plateRef);
        return collectionData(q, {idField: 'id'}) as Observable<Plato[]>;
    }

    //Obtiene un plato por ID de Firebase.
    getPlateById(id) {
        const plateDocRef = doc(this.firestore, `platos/${id}`);
        return docData(plateDocRef, {idField: 'id'});
    }

    //Borra un plato de firebase.
    async deletePlate(plato: Plato) {
        const noteDocRef = doc(this.firestore, `platos/${plato.pId}`);
        await this.sqlite.deletePlate(plato.pId);
        return deleteDoc(noteDocRef);
    }

    //Actualiza el plato en firebase.
    async updatePlate(plato: Plato) {
        const plateDocRef = doc(this.firestore, `platos/${plato.pId}`);
        const nombre = plato.nombre;
        const description = plato.description;
        const ingredients = plato.ingredients;
        const pvp = plato.pvp;
        await this.sqlite.updatePlate(plato);
        await updateDoc(plateDocRef, {
            nombre,
            ingredients,
            pvp,
            description
        });
        return docData(plateDocRef, {idField: 'id'});
    }

    //Añade un plato a firebase
    async savePlato(plato: Plato) {
        try {
            const rId = plato.rId;
            const nombre = plato.nombre;
            const description = plato.description;
            const ingredients = plato.ingredients;
            const pvp = plato.pvp;
            const fbDocument = await this.afs.collection('platos').add({
                rId,
                nombre,
                description,
                ingredients,
                pvp
            });
            const pId = fbDocument.id;
            await this.afs.collection('platos').doc(pId).update({
                pId
            });
            await this.sqlite.addPlate(plato, pId);
            return true;
        } catch (e) {
            return false;
        }
    }

    //Borra el carro anterior
    async removeOld() {
        await this.afs.collection('carro').doc(this.cartKey).delete();
        await Storage.remove(this.cartKey);
    }

    //Carga el carro
    async loadCart() {
        const fbDocument = await this.afs.collection('carro').add({
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        });
        this.cartKey = fbDocument.id;
        await Storage.set({key: CART_STORAGE_KEY, value: this.cartKey});
        this.afs.collection('carro').doc(this.cartKey).valueChanges().subscribe((res: any) => {
            delete res.lastUpdate;
            this.cart.next(res || {});
        });
    }

    //Añade platos al carro
    addToCart(pId) {
        this.afs.collection('carro').doc(this.cartKey).update({
            [pId]: INCREMENT,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    //Borra platos del carro.
    deletePlateFromCart(pId) {
        this.afs.collection('carro').doc(this.cartKey).update({
            [pId]: DECREMENT,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    //"PAGO", crea un nuevo pedido.
    async checkoutCart(totalPrice, cantTotal, status, resId, plateId) {
        const userId = this.auth.currentUser().uid;
        let lastUpdate = firebase.firestore.FieldValue.serverTimestamp();
        const date = new Date().toLocaleDateString();
        const orderDocRef = await this.afs.collection('pedidos').add({
            userId,
            totalPrice,
            cantTotal,
            status,
            resId,
            date,
            lastUpdate
        });
        const plate = plateId;
        const order = orderDocRef.id;
        await updateDoc(orderDocRef, {
            order,
            plate
        });
        this.sqlite.addOrder(order, resId.rId, userId, totalPrice, cantTotal, status, date, lastUpdate);
        lastUpdate = firebase.firestore.FieldValue.serverTimestamp();
        await this.afs.collection('carro').doc(this.cartKey).set({
            lastUpdate
        });
        await Storage.remove(this.cartKey);
    }

    //Obtiene lista de pedidos.
    getAllOrders(): Observable<any[]> {
        const plateRef = collection(this.firestore, 'pedidos');
        const q = query(plateRef, orderBy('lastUpdate', 'desc'));
        return collectionData(q, {idField: 'id'}) as Observable<Plato[]>;
    }

    //Actualiza el estado
    async updateStatus(item, status) {
        const orderDocRef = doc(this.firestore, `pedidos/${item}`);
        await updateDoc(orderDocRef, {
            status
        });
        await this.sqlite.updateOrder(item, status);
        return docData(orderDocRef, {idField: 'id'});
    }
}
