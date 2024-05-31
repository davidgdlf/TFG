import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage'; // Importar AngularFireStorage

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);
  storage = inject(AngularFireStorage); // Inyectar AngularFireStorage

  // autenticacion 
  getAuth() {
    return getAuth();
  }

  // acceder

  singIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // registro

  singUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // actualizar usuario

  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName });
  }

  // enviar mail para restablecer contra

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  // cerrar sesion
  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routerLink('/auth');
  }

  //BBDD

  //crear nuevo docuemtno si no existe o reemplazarlo si existe

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  // Obtener colección
  getCollection<T>(collectionName: string) {
    return this.firestore.collection<T>(collectionName).valueChanges({ idField: 'id' });
  }

  // Subir imagen
  async uploadImage(imagePath: string, dataUrl: string): Promise<string> {
    const fileRef = this.storage.ref(imagePath);
    await fileRef.putString(dataUrl, 'data_url');
    return fileRef.getDownloadURL().toPromise();
  }
  updateDocument(path: string, data: any) {
    return this.firestore.doc(path).update(data);
  }
}
