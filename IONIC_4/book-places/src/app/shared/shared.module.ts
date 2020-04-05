import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { ImagePickerComponent } from './pickers/image-picker/image-picker.component';

@NgModule({
    declarations: [
        LocationPickerComponent,
        ImagePickerComponent,
        MapModalComponent
    ],
    imports: [
        CommonModule,
        IonicModule
    ],
    exports: [
        LocationPickerComponent,
        MapModalComponent,
        ImagePickerComponent
    ],
    entryComponents: [
        LocationPickerComponent,
        MapModalComponent
    ]
})

export class SharedModule {

}