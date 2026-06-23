import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ImportService, ImportacaoResponse } from '../../../core/services/import.service';
import { Navbar } from '../../../shared/components/navbar/navbar.component';

interface CardState {
  arquivo: File | null;
  nomeArquivo: string;
  dragOver: boolean;
  carregando: boolean;
}

interface Toast {
  visivel: boolean;
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'aviso';
  timer: any;
}

@Component({
  selector: 'app-importar-devices',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule],
  templateUrl: './importar-devices.component.html',
  styleUrls: ['./importar-devices.component.css']
})
export class ImportarDevicesComponent {

  serial = '';
  serialInvalido = false;
  serialCarregando = false;

  toast: Toast = { visivel: false, mensagem: '', tipo: 'sucesso', timer: null };

  cards: CardState[] = Array.from({ length: 9 }, () => ({
    arquivo: null,
    nomeArquivo: '',
    dragOver: false,
    carregando: false
  }));

  constructor(
    private importService: ImportService,
    private cdr: ChangeDetectorRef
  ) {}

  importarSerial(): void {
    if (!this.serial.trim()) {
      this.serialInvalido = true;
      this.cdr.detectChanges();
      return;
    }
    this.serialInvalido = false;
    this.serialCarregando = true;
    this.cdr.detectChanges();

    this.importService.importarPorSerial(this.serial.trim()).subscribe({
      next: (res) => {
        this.serialCarregando = false;
        this.serial = '';
        this.exibirToast(res.message || 'Device importado com sucesso.', 'sucesso');
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.serialCarregando = false;
        const msg = err.error?.message || err.error?.erro || 'Erro ao importar o dispositivo.';
        this.exibirToast(msg, 'erro');
        this.cdr.detectChanges();
      }
    });
  }

  onSerialInput(): void {
    if (this.serialInvalido && this.serial.trim()) {
      this.serialInvalido = false;
      this.cdr.detectChanges();
    }
  }

  onFileChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.definirArquivo(index, file);
    input.value = '';
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.cards[index].dragOver = true;
    this.cdr.detectChanges();
  }

  onDragLeave(index: number): void {
    this.cards[index].dragOver = false;
    this.cdr.detectChanges();
  }

  onDrop(event: DragEvent, index: number): void {
    event.preventDefault();
    this.cards[index].dragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.definirArquivo(index, file);
  }

  private definirArquivo(index: number, file: File): void {
    this.cards[index].arquivo = file;
    this.cards[index].nomeArquivo = file.name;
    this.cdr.detectChanges();
  }

  importar(index: number): void {
    const card = this.cards[index];
    if (!card.arquivo) {
      this.exibirToast('Selecione um arquivo antes de importar.', 'aviso');
      return;
    }
    card.carregando = true;
    this.cdr.detectChanges();

    this.resolverRequest(index, card.arquivo).subscribe({
      next: (res) => {
        card.carregando = false;
        card.arquivo = null;
        card.nomeArquivo = '';
        this.exibirToast(this.montarMensagemSucesso(res), 'sucesso');
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        card.carregando = false;
        const msg = err.error?.message || err.error?.erro || 'Erro ao processar o arquivo.';
        this.exibirToast(msg, 'erro');
        this.cdr.detectChanges();
      }
    });
  }

  private resolverRequest(index: number, arquivo: File) {
    switch (index) {
      case 0: return this.importService.importarDispositivosCsv(arquivo);
      case 1: return this.importService.cadastrarDispositivosCsv(arquivo);
      case 2: return this.importService.preCadastroPorSerialTxt(arquivo);
      case 3: return this.importService.marcarMqeTxt(arquivo);
      case 4: return this.importService.cadastrarPontosCsv(arquivo);
      case 5: return this.importService.cadastrarPontosExcel(arquivo);
      case 6: return this.importService.cadastrarPontosStg(arquivo);
      case 7: return this.importService.importarSlf(arquivo);
      case 8: return this.importService.associarImei(arquivo);
      default: return this.importService.importarDispositivosCsv(arquivo);
    }
  }

  private montarMensagemSucesso(res: ImportacaoResponse): string {
  if (res.sucesso !== undefined && res.falhas !== undefined) {
    if (res.falhas === 0) {
        return `${res.sucesso} registro(s) importado(s) com sucesso.`;
      }
        const listaErros = res.erros?.join(' | ') ?? '';
          return `${res.sucesso} importado(s), ${res.falhas} falha(s). ${listaErros}`;
    }
          return res.message || 'Operação realizada com sucesso.';
  }

  private exibirToast(mensagem: string, tipo: 'sucesso' | 'erro' | 'aviso'): void {
    clearTimeout(this.toast.timer);
    this.toast = {
      visivel: true,
      mensagem,
      tipo,
      timer: setTimeout(() => {
        this.toast.visivel = false;
        this.cdr.detectChanges();
      }, 10000)
    };
  }
}