import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, LoadingController } from '@ionic/angular';
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
  placeSub: Subscription;
  newOfferEditForm: FormGroup;
  constructor(private activatedRoute: ActivatedRoute,
              private placeService: PlacesService,
              private navCtrl: NavController,
              private readonly loadingCtrl: LoadingController,
              private readonly router: Router) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack(`/places/tabs/offers`);
        return;
      }
      this.placeSub = this.placeService.getPlace(paramMap.get('placeId')).subscribe((place) => {
        this.place = place;
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
      });
    });
  }

  onUpdateOffer() {
    if (!this.newOfferEditForm.valid) {
      return;
    }
    console.log('creting offer page', this.newOfferEditForm);
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
