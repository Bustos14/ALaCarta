import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DatabaseService} from '../../services/database.service';
import {Plato} from '../../services/interfaces/PlatoInterface';
import {DocumentData} from '@angular/fire/compat/firestore';
import {Animation, AnimationController, ModalController} from '@ionic/angular';
import {CartModalPage} from '../cart-modal/cart-modal.page';


@Component({
    selector: 'app-restaurant-details',
    templateUrl: './restaurant-details.page.html',
    styleUrls: ['./restaurant-details.page.scss'],
})
export class RestaurantDetailsPage implements OnInit, AfterViewInit {

    @ViewChild('opCart', {read: ElementRef}) cartBtn: ElementRef;
    cartAnimation: Animation;
    plateList: Plato[] = [];
    finalList: Plato[] = [];
    restaurant: DocumentData;
    cart = {};
    id = null;

    constructor(private route: ActivatedRoute, private db: DatabaseService, private cd: ChangeDetectorRef,
                private animationCtrl: AnimationController, private modalCtrl: ModalController, private router: Router) {
    }

    ngOnInit() {
        this.restaurantContent();
        this.db.cart.subscribe(value => {
            this.cart = value;
        });
    }

    //Carga los detalles del restaurante al que accede el usuario.
    restaurantContent() {
        this.id = this.route.snapshot.paramMap.get('aId');
        this.db.getAdminProfile(this.id).subscribe((data) => {
            this.restaurant = data;
        });
        this.db.getAllPlates().subscribe(plate => {
            this.plateList = plate;
            this.cd.detectChanges();
            this.finalList = [];
            for (let i = 0; i < this.plateList.length; ++i) {
                if (this.plateList[i].rId === this.id) {
                    this.finalList.push(this.plateList[i]);
                }
            }
        });
    }

    //Animación del boton del carrito a la hora de agregar o eliminar un producto.
    ngAfterViewInit() {
        this.cartAnimation = this.animationCtrl.create('cart-animation');
        this.cartAnimation
            .addElement(this.cartBtn.nativeElement)
            .keyframes([
                {offset: 0, transform: 'scale(1)'},
                {offset: 0.5, transform: 'scale(1.2)'},
                {offset: 0.8, transform: 'scale(0.9)'},
                {offset: 1, transform: 'scale(1)'}
            ])
            .duration(300)
            .easing('ease-out');
    }

    //Borra un producto agregado a la lista
    removeFromCart(event, plate) {
        event.stopPropagation();
        this.db.deletePlateFromCart(plate.pId);
        this.cartAnimation.play();
    }

    //Añade un producto a la lista
    addToCart(event, plate) {
        event.stopPropagation();
        this.db.addToCart(plate.pId);
        this.cartAnimation.play();
    }

    //Abre el modal del carrito
    async openCart(id) {
        const modal = await this.modalCtrl.create({
            component: CartModalPage,
            componentProps: {
                rest: id
            },
        });
        await modal.present();
    }
    //Vuelve al inicio.
    async back() {
        await this.router.navigateByUrl('tabs/tab1', {replaceUrl: true});
        await this.db.removeOld();
    }


}
