import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Storage } from '@ionic/storage';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

import { finalize } from 'rxjs/operators';
import { ReadVarExpr } from '@angular/compiler';

const STORAGE_KEY = 'my_images';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  images = [];
  path: string = '';
  // apiKey: string = "c3543902-1862-498b-ba4a-256688c39435";
  apiKey: string = "6d626dcd-d35e-4d72-b459-48c70851413a";
  url: string = "https://api.cloudmersive.com/image/recognize/describe";
  NLPurl: string = "https://api.cloudmersive.com/nlp/language/detect";
  imgBlob: any;
  imageData: any;
  
  constructor(private camera: Camera, private file: File, private http: HttpClient, private webview: WebView,
    private actionSheetController: ActionSheetController, private toastController: ToastController,
    private storage: Storage, private platform: Platform, private loadingController: LoadingController,
    private ref: ChangeDetectorRef, private filePath: FilePath, private transfer: FileTransfer, private tts: TextToSpeech) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.loadStoredImages();
    });
  }

  loadStoredImages() {
    this.storage.get(STORAGE_KEY).then(images => {
      if (images) {
        let arr = JSON.parse(images);
        this.images = [];
        for (let img of arr) {
          let filePath = this.file.dataDirectory + img;
          let resPath = this.pathForImage(filePath);
          this.images.push({ name: img, path: resPath, filePath: filePath });
        }
      }
    });
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      position: 'bottom',
      duration: 3000
    });
    toast.present();
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
        text: 'Load from Library',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType) {
    var options: CameraOptions = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(imagePath => {
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    });
  }
  createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
    return newFileName;
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.updateStoredImages(newFileName);
    }, error => {
      this.presentToast('Error while storing file.');
    });
  }

  updateStoredImages(name) {
    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      if (!arr) {
        let newImages = [name];
        this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
      } else {
        arr.push(name);
        this.storage.set(STORAGE_KEY, JSON.stringify(arr));
      }

      let filePath = this.file.dataDirectory + name;
      let resPath = this.pathForImage(filePath);

      let newEntry = {
        name: name,
        path: resPath,
        filePath: filePath
      };

      this.images = [newEntry, ...this.images];
      this.ref.detectChanges(); // trigger change detection cycle
    });
  }

  deleteImage(imgEntry, position) {
    this.images.splice(position, 1);

    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      let filtered = arr.filter(name => name != imgEntry.name);
      this.storage.set(STORAGE_KEY, JSON.stringify(filtered));

      var correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);

      this.file.removeFile(correctPath, imgEntry.name).then(res => {
        this.presentToast('File removed.');
      });
    });
  }

  // Inspired by https://golb.hplar.ch/2017/02/Uploading-pictures-from-Ionic-2-to-Spring-Boot.html

  startUpload(imgEntry) {
    this.file.resolveLocalFilesystemUrl(imgEntry.filePath)
      .then(entry => {
      console.log('imgEntry: ' + JSON.stringify(imgEntry));
    this.path = imgEntry.FilePath;
    (<FileEntry>entry).file(file => this.readFile(file))
      })
      .catch(err => {
        this.presentToast('Error while reading file.');
      });
  }

  readFile(file: any) {
    const reader = new FileReader();
    reader.onload = () => {
      const formData = new FormData();
      console.log('reader: ', reader);
      this.imgBlob = new Blob([reader.result], {
        type: file.type
      });
      this.imageData = file.localURL;
      this.path = file.name;
      console.log('imgBlob',  this.imgBlob);
      console.log('file:', file);
      formData.append('file', this.imgBlob, file.name);
      for (var key in formData) {
        console.log('formData', key, formData[key]);
      }
      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {
    const loading = await this.loadingController.create({
      message: 'Analyzing...',
    });
    await loading.present();
    var headers = new HttpHeaders();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
    headers.append('Apikey', this.apiKey);
    // this.presentToast('File upload started.')
    const uploadOpts: FileUploadOptions = {
      fileKey: 'file',
      fileName: this.path,
      headers: {'Content-Type': 'application/multipart-formdata', 'Apikey': '6d626dcd-d35e-4d72-b459-48c70851413a'}
    };
    // this.presentToast('fileName: ' + this.path);
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.upload(this.imageData, this.url, uploadOpts)
      .then((data) => {
        loading.dismiss();
        console.log(data.response);
        this.textToSpeech('Looks like ' + JSON.parse(data.response)['BestOutcome']['Description']);
        this.presentToast('Looks like ' + JSON.parse(data.response)['BestOutcome']['Description']);
      }, (err) => {
        console.log(err);
      });

    // this.http.post(this.url, formData, { headers: {'Content-Type': 'application/multipart-formdata', 'Apikey': '6d626dcd-d35e-4d72-b459-48c70851413a'} })
    //   .pipe(
    //     finalize(() => {
    //       loading.dismiss();
    //     })
    //   )
    //   .subscribe(res => {
    //     console.log('res:', res);
    //     if (res['Successful']) {
    //       console.log('res:', res);
    //       this.presentToast('Response success!');
    //     } else {
    //       this.presentToast('File upload failed.');
    //     }
    //   });
  }

  textToSpeech(text) {
    this.tts.speak(text)
      .then(() => console.log('Spoken', text))
      .catch((reason: any) => console.log(reason));
  }

}