import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { Plugins, Capacitor, CameraSource, CameraResultType } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker') filePicker: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() showPreview = false;
  
  selectedImage: string;
  usePicker = false;

  constructor(private readonly platform: Platform) { }

  ngOnInit() {
    console.log('MObile', this.platform.is('mobile'));
    console.log('Hybrid', this.platform.is('hybrid'));
    console.log('IOS', this.platform.is('ios'));
    console.log('Andriod', this.platform.is('android'));
    console.log('Desktop', this.platform.is('desktop'));
    if ((this.platform.is('mobile') && !this.platform.is('hybrid')) ||
      this.platform.is('desktop')) {
      this.usePicker = true;
    } else {
      this.usePicker = false;
    }
  }

  // image is picking from device camera 
  onPickImage() {
    // triggering the file click event when the app is running on browser 
    // if (!Capacitor.isPluginAvailable('Camera') || this.usePicker) {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePicker.nativeElement.click();
      return;
    }

    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      // height: 320,
      width: 600,
      resultType: CameraResultType.Base64
    }).then(image => {
      this.selectedImage = image.base64String;
      this.imagePick.emit(image.base64String);
      // this below line of conversion is required only for web browser image capture
      this.selectedImage = `data:image/png;base64,${this.selectedImage}`;
    }).catch(error => {
      console.log('Error in Camera Image Pick', error);
      if (this.filePicker) {
        this.filePicker.nativeElement.click();
      }
      return false;
    });
  }

  // image is selecting from file system 
  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    // file reader async task
    const fr = new FileReader();
    fr.onload = () => {
      const dataURL = fr.result.toString();
      this.selectedImage = dataURL;
      this.imagePick.emit(pickedFile);
    };
    fr.readAsDataURL(pickedFile);
  }

}

