import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})

export class HelperService {
    constructor(private readonly alertCtrl: AlertController) {

    }


    showAlert(header: string, message: string) {
        this.alertCtrl.create({
            header,
            message,
            buttons: [{
                text: 'OKAY'
            }]
        }).then(alertEl => {
            alertEl.present();
        });
    }
}