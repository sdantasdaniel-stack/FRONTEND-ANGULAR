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
        this.exibirToast(this.extrairErro(err), 'erro');
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
        this.exibirToast(this.extrairErro(err), 'erro');
        this.cdr.detectChanges();
      }
    });
  }

  private resolverRequest(index: number, arquivo: File) {
    const calls: Array<(f: File) => ReturnType<ImportService[keyof ImportService]>> = [
      (f) => this.importService.importarDispositivosCsv(f),
      (f) => this.importService.cadastrarDispositivosCsv(f),
      (f) => this.importService.preCadastroPorSerialTxt(f),
      (f) => this.importService.marcarMqeTxt(f),
      (f) => this.importService.cadastrarPontosCsv(f),
      (f) => this.importService.cadastrarPontosExcel(f),
      (f) => this.importService.cadastrarPontosStg(f),
      (f) => this.importService.importarSlf(f),
      (f) => this.importService.associarImei(f),
    ];

    const call = calls[index] ?? calls[0];
    return call(arquivo);
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

  private extrairErro(err: HttpErrorResponse): string {
    if (err.status === 401) return 'Sessão expirada. Faça login novamente.';
    if (err.status === 403) return 'Você não tem permissão para esta operação.';
    if (err.status === 413) return 'Arquivo muito grande para envio.';
    if (err.status === 0)   return 'Sem conexão com o servidor.';
    return err.error?.message
      ?? err.error?.erro
      ?? err.message
      ?? 'Erro ao processar a requisição.';
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