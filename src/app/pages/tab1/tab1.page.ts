import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {Restaurant} from '../../services/interfaces/RestaurantInterface';
import {NavController} from '@ionic/angular';
import {AuthService} from '../../services/auth.service';
import {User} from '../../services/interfaces/UserInterface';
import {SqliteService} from '../../services/sqlite.service';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
    tipsOpts = {
        slidesPerView: 1.05,
        slidesOffsetBefore: 11,
        centeredSlides: true,
        spaceBetween: 10,
        loop: true,
    };
    restOptions = {
        slidesPerView: 1.2,
        spaceBetween: 10,
        freeMode: true,
    };
    restaurantList: Restaurant [] = [];
    user: User;

    constructor(private db: DatabaseService, private cd: ChangeDetectorRef, private navCtrl: NavController, private auth: AuthService, private sqlite: SqliteService) {
        this.syncUser();
    }

    //Sincroniza al usuario de la base de dalos Firebase a la local.
    syncUser() {
        this.auth.getUsers(this.auth.currentUser().uid).subscribe(res => {
            this.user = res;
            this.sqlite.dbState().subscribe(status => {
                if (status) {
                    const localUser = this.sqlite.getUserById(this.user.uid);
                    if (!localUser) {
                        this.sqlite.addUser(this.user.uid, this.user.email, this.user.displayName, this.user.phone);
                    }
                }
            });
        });
    }

    //Obtiene la lista de restaurantes
    getRestaurants() {
        this.db.getAllRestaurants().subscribe(restaurants => {
            this.restaurantList = [];
            this.restaurantList = restaurants;
            this.cd.detectChanges();
        });
    }
    //Metodo para ir al perfil
    async userProfile() {
        await this.navCtrl.navigateForward('tabs/tab3');
    }

    //Abre el modal de restaurante y carga el carrito
    async goToDetails(id) {
        await this.db.loadCart();
        await this.navCtrl.navigateForward('/restaurant-details/' + id);
    }

    ngOnInit(): void {
        this.getRestaurants();
    }
}
