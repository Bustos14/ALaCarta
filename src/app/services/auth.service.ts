/* eslint-disable no-trailing-spaces */
import {Injectable} from '@angular/core';
import {Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from '@angular/fire/auth';
import {doc, Firestore, setDoc, getDoc, collection, docData} from '@angular/fire/firestore';
import {BehaviorSubject, Observable} from 'rxjs';
//Objetos
import {User} from './interfaces/UserInterface';
//Rutas
import {Router} from '@angular/router';
//Conexion
import {SqliteService} from './sqlite.service';


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    isConnected = false;

    constructor(private auth: Auth, private firestore: Firestore, private router: Router
                ,private sqlite: SqliteService) {
    }

    //Funcion de registro, pasamos email y password y nos devuelve el usuario creado
    async register({email, password}) {
        try {
            const user = await createUserWithEmailAndPassword(
                this.auth,
                email,
                password
            );
            return user;
        } catch (e) {
            return null;
        }
    }

    //Agrega un restaurante a firebase
    async saveRestaurant(restaurante) {
        try {
            const nameRestaurant = restaurante.nameRestaurant;
            const street = restaurante.street;
            const aId = restaurante.aId;
            const city = restaurante.city;
            const codPostal = restaurante.codPostal;
            const description = restaurante.description;
            const restDocRef = doc(this.firestore, `restaurants/${aId}`);
            await this.sqlite.addAdmin(restaurante);
            await setDoc(restDocRef, {
                aId,
                nameRestaurant,
                street,
                city,
                codPostal,
                description
            });
        } catch (e) {
            return null;
        }
    }

    //Agrega un usuario a firebase
    async saveUser(user, displayName: string, phone: number) {
        user = this.auth.currentUser;
        try {
            const email = user.email;
            const userId = user.uid;
            await this.sqlite.addUser(userId, email, displayName, phone);
            const userDocRef = doc(this.firestore, `users/${user.uid}`);
            await setDoc(userDocRef, {
                email,
                displayName,
                userId,
                phone
            });
            return true;
        } catch (e) {
            return null;
        }
    }

    //Crea el token de autentificación
    async login({email, password}) {
        try {
            return await signInWithEmailAndPassword(this.auth, email, password);
        } catch (e) {
            return null;
        }
    }

    //Cierre de sesión
    logout() {
        return signOut(this.auth).then(() => {
        }).catch((error) => {
        });
    }

    //Obtiene el usuario actual.
    currentUser() {
        const user = this.auth.currentUser;
        return user;
    }
    //Obtiene usuario por ID de la base de datos.
    getUsers(id: string): Observable<User> {
        const userRef = doc(this.firestore, `users/${id}`);
        return docData(userRef, {idField: 'id'}) as Observable<User>;
    }

    //Comprueba el tipo de usuario para redireccionarlo a una pantalla u otra
    async checkTypeUser(id: string) {
        const docRef = doc(this.firestore, `users/${id}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await this.router.navigateByUrl('/tabs', {replaceUrl: true});
        } else {
            await this.router.navigateByUrl('/tabs-admin', {replaceUrl: true});
        }
    }
}
