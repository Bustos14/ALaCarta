import {Injectable} from '@angular/core';
import {Auth} from '@angular/fire/auth';
import {doc, Firestore, updateDoc} from '@angular/fire/firestore';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadString,
} from '@angular/fire/storage';
import {Photo} from '@capacitor/camera';
import {User} from './interfaces/UserInterface';
@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  networkStatus: any;
  //Database controller to manage photo updates
  constructor(private auth: Auth,
              private firestore: Firestore,
              private storage: Storage) {
  }

  //Metodo de actualizacion para la foto de los usuarios
  async uploadUserImg(cameraFile: Photo, user: User) {
    const path = `users/${user.uid}/.png`;
    const storageRef = ref(this.storage, path);
    try {
      await uploadString(storageRef, cameraFile.base64String, 'base64');

      const userImg = await getDownloadURL(storageRef);
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      await updateDoc(userDocRef, {
        userImg,
      });
      return true;
    } catch (e) {
      return null;
    }
  }
  //Metodo de actualizacion para la foto de los platos.
  async uploadPlateImg(cameraFile: Photo, plato) {
    const path = `plates/${plato.pId}/.png`;
    const storageRef = ref(this.storage, path);
    try {
      await uploadString(storageRef, cameraFile.base64String, 'base64');
      const img = await getDownloadURL(storageRef);
      const userDocRef = doc(this.firestore, `platos/${plato.pId}`);
      await updateDoc(userDocRef, {
        img,
      });
      return true;
    } catch (e) {
      return null;
    }
  }

  //Metodo de actualizacion para la foto de los administradores
  async uploadRestaurantImg(cameraFile: Photo, name: string, id: string) {
    const path = `restaurants/${name}${id}/.png`;
    const storageRef = ref(this.storage, path);
    try {
      await uploadString(storageRef, cameraFile.base64String, 'base64');
      const img = await getDownloadURL(storageRef);
      const restDocRef = doc(this.firestore, `restaurants/${id}`);
      await updateDoc(restDocRef, {
        img,
      });
      return true;
    } catch (e) {
      return null;
    }
  }
}
