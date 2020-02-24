import { File } from '@ionic-native/file/ngx';
import { Component } from '@angular/core';
import { Crop } from '@ionic-native/crop/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// import { CloudmersiveImageApiClient } from 'cloudmersive-image-api-client';
// var fs = require('fs');

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  fileUrl: any = null;
  respData: any;
  apiKey: string = "c3543902-1862-498b-ba4a-256688c39435";
  url: string = "https://api.cloudmersive.com/image/recognize/describe";
  NLPurl: string = "https://api.cloudmersive.com/nlp/language/detect";

  constructor(private imagePicker: ImagePicker,
    private crop: Crop,
    private transfer: FileTransfer,
    private file: File,
    private http: HttpClient,
    public toastController: ToastController) { }
    
    
    async presentToast(msg) {
      const toast = await this.toastController.create({
        message: msg,
        duration: 2000
      });
      toast.present();
    }
  cropUpload() {
    this.imagePicker.getPictures({ maximumImagesCount: 1, outputType: 0 }).then((results) => {
      for (let i = 0; i < results.length; i++) {
          console.log('Image URI: ' + results[i]);
          this.crop.crop(results[i], { quality: 100 })
            .then(
              newImage => {
                console.log('new image path is: ' + newImage);
                const fileTransfer: FileTransferObject = this.transfer.create();
                const uploadOpts: FileUploadOptions = {
                   fileKey: 'file',
                   fileName: newImage.substr(newImage.lastIndexOf('/') + 1)
                };

                // fileTransfer.upload(newImage, 'http://192.168.0.7:3000/api/upload', uploadOpts)
                //  .then((data) => {
                //    console.log(data);
                //    this.respData = JSON.parse(data.response);
                //    console.log(this.respData);
                //    this.fileUrl = this.respData.fileUrl;
                //  }, (err) => {
                //    console.log(err);
                //  });
                
                // var defaultClient = CloudmersiveImageApiClient.ApiClient.instance;
                // var Apikey = defaultClient.authentications['Apikey'];
                // Apikey.apiKey = "c3543902-1862-498b-ba4a-256688c39435" // Get your own key at https://account.cloudmersive.com                

                // var apiInstance = new CloudmersiveImageApiClient.RecognizeApi();
                // // var imagePath = "C:\\Users\\sathw\\OneDrive\\Pictures\\dlsjb\\IMG_1054.JPG";

                // var imageFile = Buffer.from(this.file.readAsArrayBuffer(newImage, newImage.substr(newImage.lastIndexOf('/') + 1))); // File | Image file to perform the operation on.  Common file formats such as PNG, JPEG are supported.

                // var callback = function(error, data, response) {
                //   if (error) {
                //     console.error(error);
                //   } else {
                //     this.presentToast('data: ' + JSON.stringify(data));
                //   }
                // };
                // apiInstance.recognizeDescribe(imageFile, callback);

                // const httpOptions = {
                //     headers: new HttpHeaders({
                //       'Content-Type':  'image/jpeg'
                //     }),
                //     observe: 'response'
                // };
                // return this.http.get(`${this.url}?s=${encodeURI(title)}&type=${type}&apikey=${this.apiKey}`).pipe(
                  // this.presentToast("Calling API");
                  // const formData = new FormData();
                  
                  // this.file.readAsArrayBuffer(newImage, newImage.substr(newImage.lastIndexOf('/') + 1)).
                  //   then(blob => {
                  //     const imgBlob = new Blob([blob], { type: 'image/jpeg' } );

                  //     formData.append('file', imgBlob);

                  //     this.http.post(this.url, formData, {
                  //       headers: new HttpHeaders({
                  //         'Content-Type':  'image/jpeg',
                  //         'Apikey': this.apiKey
                  //       })
                  //     }).subscribe(data => {
                  //       console.log('data', data);  
                  //       this.presentToast('description ' + data["BestOutcome"]["Description"]);
                  //   });
                  // });
            //       this.http.post(`${this.url}?Apikey=${this.apiKey}`, formData, {
            //       headers: new HttpHeaders({
            //         'Content-Type':  'image/jpeg',
            //         'Apikey': this.apiKey
            //       }),
            //       observe: 'response'
            //   }).subscribe(data => {
            //     console.log('data', data);
            //     this.presentToast("Best Outcome");
            //     this.presentToast('description ' + data["BestOutcome"]["Description"]);
            // });
        //     this.http.post(`${this.NLPurl}?Apikey=${this.apiKey}`, {"textToDetect": "Hi Ravi! How are you?"}, {
        //       headers: new HttpHeaders({
        //         'Content-Type':  'application/json',
        //         'Apikey': this.apiKey
        //       }),
        //       observe: 'response'
        //   }).subscribe(data => {
        //     console.log('data', data);
        //     this.presentToast('language name ' + JSON.stringify(data));
        // });
            // this.file.checkDir(this.file.dataDirectory, 'test').then(_ => this.presentToast('Directory exists')).catch(err =>
            //   this.presentToast("Directory doesn't exist"));
              },
              error => console.error('Error cropping image', error)
            );
      }
    }, (err) => { console.log(err); });
  }
}
