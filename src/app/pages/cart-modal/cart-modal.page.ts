import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {take} from 'rxjs/operators';
import {AlertController, ModalController, ViewDidEnter} from '@ionic/angular';
import {Router} from '@angular/router';

@Component({
  selector: 'app-cart-modal',
  templateUrl: './cart-modal.page.html',
  styleUrls: ['./cart-modal.page.scss'],
})
export class CartModalPage implements OnInit, ViewDidEnter {
  @Input() rest;
  allProductsCount = 0;
  plateList = [];
  totalPrice = 0;
  constructor(private db: DatabaseService, private modalCtrl: ModalController, private alertCtrl: AlertController, private router: Router) { }
  ngOnInit() {
    //carga el contador de productos del carrito junto a sus productos
    const cartPlates = this.db.cart.value;
    this.db.getAllPlates().pipe(take(1)).subscribe(list=>{
      const plateFilter = list.filter( p => cartPlates[p.pId]);
      this.plateList = plateFilter.map(plate => ({...plate, count: cartPlates[plate.pId]}));
    });
  }
  ionViewDidEnter(): void {
    //Calculo del total a pagar
    this.plateList.forEach(item => {
      this.allProductsCount = this.allProductsCount + item.count;
      this.totalPrice = this.totalPrice + (item.count * item.pvp);
    });
  }

  //Cierre del modal
  async closeModal(){
    await this.modalCtrl.dismiss();
  }

  //Metodo para la finalización del pedido
  async clickCheckOut(total, cantTotal, status, restaurant, plate){
    const alert = await this.alertCtrl.create({
      header: 'Gracias por su pedido',
      message: 'Le entregarán sus productos lo antes posible',
      buttons: ['Cerrar']
    });
    await this.modalCtrl.dismiss();
    await this.router.navigateByUrl('/tabs/tab2', {replaceUrl: true});
    await alert.present();
    await this.db.checkoutCart(total, cantTotal, status, restaurant, plate);
  }
  viewCartButton(count): boolean {
    return count !== 0;
  }
}
