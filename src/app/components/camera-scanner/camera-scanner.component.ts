import {
  Component,
  Inject,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  NgZone
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
  Result,
  NotFoundException
} from '@zxing/library';

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
  private scanning = false;

  // Hints customizados e intervalo de scan em 150 ms
  private codeReader = new BrowserMultiFormatReader(
    new Map<DecodeHintType, any>([
      [DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.CODE_128,
        BarcodeFormat.QR_CODE
      ]],
      [DecodeHintType.TRY_HARDER, false]
    ]),
    150
  );

  constructor(
    private dialogRef: MatDialogRef<CameraScannerComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CameraScannerData,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    this.startScanner();
  }

  /** Método público para acionamento via template */
  public async startScanner(): Promise<void> {
    if (this.scanning) {
      return;
    }
    this.scanning = true;

    const constraints: MediaStreamConstraints = {
      video: this.data.videoConstraints ?? {
        facingMode: 'environment',
        width:  { ideal: 640 },
        height: { ideal: 480 }
      }
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();

      // Tenta aplicar foco contínuo diretamente na track (com cast para any)
      const [track] = this.stream.getVideoTracks();
      if (track.applyConstraints) {
        track.applyConstraints(
          { advanced: [{ focusMode: 'continuous' }] } as any
        ).catch(() => {
          // sem foco contínuo, continua normalmente
        });
      }

      this.codeReader.decodeFromVideoDevice(
        null,
        video,
        (result: Result | undefined, err: Error | undefined) => {
          if (result) {
            const text = result.getText();
            console.log('Código lido:', text);
            this.ngZone.run(() => {
              this.stopScanner();
              this.dialogRef.close(text);
            });
          } else if (err && !(err instanceof NotFoundException)) {
            console.error(err);
          }
        }
      );

    } catch (err) {
      console.error('Erro ao acessar a câmera:', err);
      this.scanning = false;
    }
  }

  /** Para a leitura e libera a câmera */
  private stopScanner(): void {
    this.codeReader.reset();
    this.stream?.getTracks().forEach(track => track.stop());
    this.scanning = false;
  }

  /** Chamado quando o usuário clica no “X” */
  onUserClose(): void {
    this.stopScanner();
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }
}
