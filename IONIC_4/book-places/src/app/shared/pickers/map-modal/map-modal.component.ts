import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { SharedService } from '../../service/shared.service';

import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map') mapElementRef: ElementRef;
  @Input() center = { lat: 12.972442, lng: 77.580643 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';

  mapClickListener: any;
  googleMaps: any;


  constructor(private readonly modalCtrl: ModalController,
              private readonly render: Renderer2,
              private readonly sharedService: SharedService) { }
          
  ngOnInit() { }

  ngAfterViewInit() {
    this.getGoogleMap()
      .then(googleMaps => {
        this.googleMaps = googleMaps;
        const mapEl = this.mapElementRef.nativeElement;
        const map = new googleMaps.Map(mapEl, {
          center: this.center,
          zoom: 16
        });

        this.googleMaps.event.addListenerOnce(map, 'idle', () => {
          this.render.addClass(mapEl, 'visible');
        });

        // this click listener may caus memory leak, so please un register it 
        if (this.selectable) {
          this.mapClickListener = map.addListener('click', event => {
            const selectedCoords = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };
            this.modalCtrl.dismiss(selectedCoords);
          });
        } else {
          const marker = new googleMaps.Marker({
            position : this.center,
            map,
            title : 'Picked Location'
          });
          marker.setMap(map);
        }
      })
      .catch((err) => {
        console.log('ERROR', err);
      });
  }

  ngOnDestroy() {
    // un register google map click listener 
    if (this.mapClickListener) {
      this.googleMaps.event.removeListener(this.mapClickListener);
    }
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  private getGoogleMap(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.sharedService.getGoogleMapSDK();
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google Maps SDK Is Not Available ');
        }
      }
    });
  }

}