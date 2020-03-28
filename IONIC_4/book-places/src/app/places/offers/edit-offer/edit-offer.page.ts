import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { Subscription, of } from 'rxjs';

import { PlacesService } from '../../places.service';
import { Place } from '../../places.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  placeId: string;
  placeSub: Subscription;
  newOfferEditForm: FormGroup;
  isLoading = false;
  constructor(private activatedRoute: ActivatedRoute,
    private placeService: PlacesService,
    private navCtrl: NavController,
    private readonly loadingCtrl: LoadingController,
    private readonly router: Router,
    private readonly alertCtrl: AlertController) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack(`/places/tabs/offers`);
        return;
      }
      this.placeId = paramMap.get('placeId');
      this.isLoading = true;
      this.placeSub = this.placeService.getPlace(paramMap.get('placeId')).subscribe((place) => {
        this.place = { ...place, id: paramMap.get('placeId') };
        this.newOfferEditForm = new FormGroup({
          title: new FormControl(this.place.title, {
            updateOn: 'blur',
            validators: [Validators.required]
          }),
          description: new FormControl(this.place.description, {
            updateOn: 'blur',
            validators: [Validators.required, Validators.maxLength(180)]
          })
        });
        this.isLoading = false;
      }, (err) => {
        this.alertCtrl.create({
          header: 'ERROR',
          message: 'Place could not fetched, Please try again later',
          buttons: [
            {
              text: ' Okay',
              handler: () => {
                this.router.navigate(['/places/tabs/offers']);
              }
            }
          ]
        }).then((alertEl)=>{
            alertEl.present();
        });
      });
    });
  }

  onUpdateOffer() {
    if (!this.newOfferEditForm.valid) {
      return;
    }
    console.log('creting offer page', this.newOfferEditForm.value);
    this.loadingCtrl.create({
      message: 'Updating place...'
    }).then((el) => {
      el.present();
      this.placeService.updatePlace(this.place.id,
        this.newOfferEditForm.value.title,
        this.newOfferEditForm.value.description).
        subscribe(() => {
          el.dismiss();
          this.newOfferEditForm.reset();
          this.router.navigate(['/places/tabs/offers']);
        });
    });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
