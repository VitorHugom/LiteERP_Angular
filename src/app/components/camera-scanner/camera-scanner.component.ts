// camera-scanner.component.ts
import { Component, Inject, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BrowserMultiFormatReader, Result, NotFoundException } from '@zxing/library';

export interface CameraScannerData {
  videoConstraints?: MediaTrackConstraints;
}

@Component({
  selector: 'app-camera-scanner',
  templateUrl: './camera-scanner.component.html',
  styleUrls: ['./camera-scanner.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class CameraScannerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;

  private stream?: MediaStream;
  private codeReader = new BrowserMultiFormatReader();

  constructor(
    private dialogRef: MatDialogRef<CameraScannerComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CameraScannerData,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    this.startScanner();
  }

  startScanner(): void {
    const constraints: MediaStreamConstraints = {
      video: this.data.videoConstraints ?? {
        facingMode: 'environment',
        width:  { ideal: 1280 },
        height: { ideal: 720 }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        this.stream = stream;
        const videoEl = this.videoRef.nativeElement;
        videoEl.srcObject = stream;
        return videoEl.play();
      })
      .then(() => {
        this.codeReader.decodeFromVideoDevice(
          null,
          this.videoRef.nativeElement,
          (result: Result | undefined, err: Error | undefined) => {
            if (result) {
              const text = result.getText();
              console.log('Código lido:', text);

              // Fecha o diálogo COM payload dentro da zona Angular
              this.ngZone.run(() => {
                this.stopScanner();
                this.dialogRef.close(text);
              });
            } else if (err && !(err instanceof NotFoundException)) {
              console.error(err);
            }
          }
        );
      })
      .catch(err => console.error('Erro ao acessar a câmera:', err));
  }

  /** Para a leitura e a câmera, mas NÃO fecha o diálogo */
  private stopScanner(): void {
    this.codeReader.reset();
    this.stream?.getTracks().forEach(track => track.stop());
  }

  /** Chamado quando o usuário clica no “X” */
  onUserClose(): void {
    this.stopScanner();
    this.dialogRef.close();  // fecha SEM payload
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }
}
