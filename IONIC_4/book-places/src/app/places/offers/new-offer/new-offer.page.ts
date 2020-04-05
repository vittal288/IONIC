import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';

import { PlacesService } from '../../places.service';
import { PlaceLocation } from '../../location.model';
import { switchMap } from 'rxjs/operators';

// convert string to base64 
function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}
@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  offerForm: FormGroup;
  constructor(private placeService: PlacesService,
    private router: Router,
    private readonly loadingCtrl: LoadingController,
    private readonly alertCtrl: AlertController) {

  }

  ngOnInit() {
    this.offerForm = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      location: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null)
    });
  }

  onLocationPicked(location: PlaceLocation) {
    this.offerForm.patchValue({
      location
    });
  }

  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = base64toBlob(imageData.replace('data:image/jpeg;base64', ''), 'image/jpeg');
      } catch (err) {
        console.log('Error in Conversion of Image', err);
        return;
      }
    } else {
      imageFile = imageData;
    }
    this.offerForm.patchValue({
      image: imageData
    });
  }

  onCreateOffer() {
    if (!this.offerForm.valid || !this.offerForm.get('image').value) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Creating place...'
    }).then((loadingEl) => {
      loadingEl.present();
      this.placeService.uploadImage(this.offerForm.get('image').value).pipe(
        switchMap(uploadedImageResp => {
          return this.placeService.addPlace(
            this.offerForm.value.title,
            this.offerForm.value.description,
            +this.offerForm.value.price,
            new Date(this.offerForm.value.dateFrom),
            new Date(this.offerForm.value.dateTo),
            this.offerForm.value.location,
            uploadedImageResp.imageUrl);
        })
      ).subscribe(() => {
        loadingEl.dismiss();
        this.offerForm.reset();
        this.router.navigate(['/places/tabs/offers']);
      }, (error) => {
        console.error('Error In Creating place', error);
        this.alertCtrl.create({
          header: 'Error In Creating Place',
          message: 'Please try after some time!!!',
          buttons: [{
            text: ' Okay'
          }]
        }).then(alertEl => {
          loadingEl.dismiss();
          alertEl.present();
        });
      });
    });
  }
}
