import { Component } from '@angular/core';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import {Subject} from 'rxjs';
import {Observable} from 'rxjs';
import { HttpClient,HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private http: HttpClient) { }

  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];
  public picshow=false;
  public picurl:any;
  // latest snapshot
  public webcamImage: WebcamImage = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerSnapshot(): void {
    this.trigger.next();
    this.picurl=this.webcamImage.imageAsDataUrl;
    this.picshow=true;
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public handleImage(webcamImage: WebcamImage): void {
    console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }

  //////image upload////////
  public imagePath;
  imgURL: any;
  public message: string;
 
  preview(files) {
    if (files.length === 0)
      return;
 
    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
 
    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]); 
    reader.onload = (_event) => { 
      this.imgURL = reader.result; 
    }
  }

  uploadok(){
    this.picshow=true
    this.picurl=this.imgURL;
  }
  //////image upload////////
  pop=false;
  
  popclose(){
    this.pop=false;
  }
  uploadServer(){
    var data={pic:this.picurl}
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };
    console.log(data)
    this.http.post("http://localhost:5000/file_upload",{
      title: 'pic',
      body: data,
    },httpOptions) .subscribe(
      (val) => {
          console.log(val);
          if(val['data']=='Person not matched'){
            this.pop=true;
          }
      },
      error => {
          console.log("POST call in error", error);
      },
      () => {
          console.log("The POST observable is now completed.");
      });
    }
labelname="";
uploadpic(){
  if(this.labelname=="")
  {
    alert("Give label name below")
  }
  else{
    var data={pic:this.picurl,name:this.labelname}
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };
    console.log(data)
    this.http.post("http://localhost:5000/newLabel",{
      title: 'pic',
      body: data,
    },httpOptions) .subscribe(
      (val) => {
          console.log(val);
          if(val['data']=='Person not matched'){
            this.pop=true;
          }
      },
      error => {
          console.log("POST call in error", error);
      },
      () => {
          console.log("The POST observable is now completed.");
      });
  }
}
}
