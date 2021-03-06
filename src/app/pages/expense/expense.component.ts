import { Component, OnInit } from '@angular/core';
import { ExpenseModel, DetailExpenseModel } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';
import { PagerService } from '../../services/pager.service';
import { BranchOfficeService } from '../../services/branch-office.service';
import * as $ from 'jquery';
import { UploadService } from '../../services/upload.service';
import { environment } from '../../../environments/environment';
import { PeriodService } from '../../services/period.service';
import { NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})

export class ExpenseComponent implements OnInit {
  
  maxDate =  this.calendar.getToday();
  ngToday = this.calendar.getToday();

  dateExpense: any = this.calendar.getToday() ;

  isDisabled: any;
  isWeekend: any;
  //  configuracion de ng picker bootstrap
  
  filesValid = ['JPG', 'JPEG', 'PDF', 'XLSX', 'XLS'];

  periodClose = false;

  dataMoney: any[] = [];
  dataTypeExpense: any[] = [];
  dataTypeVoucher: any[] = [];
  dataExpense: any[] = [];
  dataPattern: any[] = [];
  dataOfficeBranch: any[] = [];
  bodyExpense: ExpenseModel;
  qNumeration = '';
  qPartner = '';
  qDoc = '';
  qOffice = '';
  qVoucher = '';
  qEmpresa = '';
  
  qGteTotal = 0;
  qLteTotal = 0;
  qEqTotal = 0;
  
  statusPeriod = false;
  showInactive = false;
  loading = false;
  loadingTable = false;
  loadData = false;
  validFile = false;
  titleModal = 'Nuevo gasto';
  textButton = 'Guardar';
  actionConfirm = 'eliminar';
  rowsForPage = 10;
  infoPagination = 'Mostrando 0 de 0 registros.';
  srcFile = './assets/images/017-upload.png';
  apiDonwland = environment.URI_API + `/Document/expense/`;
  token = '';
  fileExpense: File = null;
  nameFileExpense = '';

  dateStartPeriod = new Date();
  dateStarPeriodStr = '';
  pagination = {
    currentPage : 0,
    pages : [],
    totalPages: 0
  };

  constructor(private expenseSvc: ExpenseService, private pagerSvc: PagerService, private branchSvc: BranchOfficeService, private uploadSvc: UploadService, private periodSvc: PeriodService, private calendar: NgbCalendar) { }

  ngOnInit() {
    // configuración para date picker
    this.isDisabled = (date: NgbDate, current: {month: number}) => date.month !== current.month;
    this.isWeekend = (date: NgbDate) =>  this.calendar.getWeekday(date) >= 6;

    this.bodyExpense = new ExpenseModel();
    this.token = localStorage.getItem('token');

    this.expenseSvc.onGetMoneyAll( '' ).subscribe( (res: any) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataMoney = res.data;
    });

    this.branchSvc.onPartnerGetAll( '' ).subscribe( (res: any) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataPattern = res.data;

    });

    this.expenseSvc.onGetTypeExpense( '' ).subscribe( (res: any) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataTypeExpense = res.data;
    });

    this.expenseSvc.onGetTypeVoucher( '' ).subscribe( (res: any) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataTypeVoucher = res.data;
    });

    this.onGetListExpense(1);
    this.onLoadStatusPeriod();
  }

  onLoadStatusPeriod() {
    this.periodSvc.onGetStatusPeriod().subscribe( (res: any) => {
      if (!res.ok) {
        throw new Error( res.error );
      }
      if (!res.data) {
        this.statusPeriod = true; // perioodo cerrado
        this.onShowAlert( '¡Periodo cerrado, por favor aperturar primero!', 'warning' );
        this.onShowAlert( '¡Periodo cerrado, por favor aperturar primero!', 'warning' , 'alertExpenseModal');
      } else {
        this.dateStartPeriod = new Date( res.data.fechaApertura );
        this.dateStarPeriodStr = `${ this.dateStartPeriod.getFullYear() }-${ this.dateStartPeriod.getMonth() < 9 ? '0' + (this.dateStartPeriod.getMonth() + 1) : (this.dateStartPeriod.getMonth() + 1)  }-${ this.dateStartPeriod.getDate() }`;
      }

    });
  }

  onGetListExpense( page: number, chk = false ) {
    if (chk) {
      this.showInactive = !this.showInactive;
      this.actionConfirm = this.showInactive ? 'restaurar' : 'eliminar';
    }
    
    this.loadingTable = true;

    this.expenseSvc.onGetExpense( page, this.rowsForPage, this.qNumeration, this.qPartner, this.qDoc, this.qOffice, this.qVoucher, this.qGteTotal, this.qLteTotal, this.qEqTotal, this.showInactive )
    .subscribe( (res: any) => {

      this.dataExpense = res.data;

      this.pagination = this.pagerSvc.getPager(res.dataPagination.total, page, this.rowsForPage);

      if ( this.pagination.totalPages > 0 ) {

        const start = ((this.pagination.currentPage - 1) * this.rowsForPage) + 1;
        const end = ((this.pagination.currentPage - 1) * this.rowsForPage) + this.dataExpense.length;
        this.infoPagination = `Mostrando del ${ start } al ${ end } de ${ res.dataPagination.total } registros.`;
      }
      
      this.loadingTable = false;

    });

  }

  onEditExpense( idExpense: number) {
    const dataTemp = this.dataExpense.find( expense => expense.idGastoSucursal === idExpense );

    if (!dataTemp) {
      throw new Error('No se encontró registro de gasto');
    }

    this.titleModal = 'Editar gasto';
    this.textButton = 'Guardar cambios';
    this.loadData = true;
    this.bodyExpense.idExpense = dataTemp.idGastoSucursal;
    this.bodyExpense.idPartner = dataTemp.idSocio;
    this.bodyExpense.idBranchOffice = dataTemp.idSucursal;
    this.bodyExpense.idMoney = dataTemp.idMoneda;
    this.bodyExpense.idTypeVoucher = dataTemp.idComprobante;
    this.bodyExpense.idTypeExpense = dataTemp.idTipoGasto;

    const emisionTemp = new Date( dataTemp.fechaEmision );
    this.dateExpense = {
      year : emisionTemp.getFullYear(),
      month : emisionTemp.getMonth() + 1,
      day : emisionTemp.getDate()
    };
    // this.dateExpense.;
    // this.dateExpense.;
    // this.dateExpense.;

    console.log(this.dateExpense);
    // const monthTemp = emisionTemp.getMonth() + 1;

    // this.bodyExpense.dateEmission = `${ emisionTemp.getFullYear() }-${ monthTemp < 10 ? '0' + monthTemp : monthTemp }-${ emisionTemp.getDate() }`;

    this.validFile = true;
    this.nameFileExpense = dataTemp.nombreArchivo || 'No se cargo archivo!';
    this.srcFile = !dataTemp.nombreArchivo ? './assets/images/017-upload.png' : './assets/images/001-accepted.png';

    this.bodyExpense.observation = dataTemp.observacion;
    this.bodyExpense.totalExpense = dataTemp.totalGasto;

    if ( !dataTemp.estadoGasto ) {
      this.periodClose = true;
      this.onShowAlert( '¡Registro cerrado!', 'warning' , 'alertExpenseModal');
    }

    this.expenseSvc.onGetBranchByPartner( '', dataTemp.idSocio ).subscribe( (res: any) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      this.dataOfficeBranch = res.data;
    });

    $('#btnShowModalExpense').trigger('click');
  }

  onShowConfirm(idExpense: number) {
    const dataTemp = this.dataExpense.find( expense => expense.idGastoSucursal === idExpense );

    if (!dataTemp) {
      throw new Error('No se encontró registro de gasto');
    }

    this.bodyExpense.idExpense = dataTemp.idGastoSucursal;
    this.bodyExpense.statusRegister = !dataTemp.estadoRegistro;
  }

  onChangeFileExpense( file: FileList ) {

    const auxtype = file[0].name;
    const typeFile = auxtype.split('.');
    const extension = typeFile[typeFile.length - 1];
    // console.log( extension.toUpperCase() );

    if (this.filesValid.indexOf( extension.toUpperCase() ) < 0) {
      this.validFile = false;
      this.srcFile = './assets/images/005-declined.png';
      return;
    }
    this.validFile = true;
    this.nameFileExpense = file[0].name;
    this.srcFile = './assets/images/001-accepted.png';
    this.fileExpense = file.item(0);
  }

  onSubmitExpense(form: any) {
    if (form.valid) {

      this.loading = true;

      const tempMonth = Number( this.dateExpense.month ) < 9 ? '0' + this.dateExpense.month : this.dateExpense.month ;
      const tempDay = Number( this.dateExpense.day ) < 9 ? '0' + ( Number( this.dateExpense.day ) + 1 ) : ( Number( this.dateExpense.day )  + 1 );

      this.bodyExpense.dateEmission = `${ this.dateExpense.year }-${ tempMonth }-${ tempDay }`;
      
      // console.log(this.bodyExpense.dateEmission);
      // tslint:disable-next-line: no-debugger
      // debugger;
      if (!this.loadData) {

        this.expenseSvc.onAddExpense( this.bodyExpense ).subscribe( async (res: any) => {
          if (!res.ok) {
            throw new Error( res.error );
          }

          const { message, css, idComponent } = this.onGetErrors( res.data.showError );
          this.onShowAlert(message, css, idComponent);

          if ( res.data.showError === 0) {

            if (this.fileExpense !== null && this.validFile) {
              await this.onUploadFile( res.data.idGasto );
            }

            $('#btnCloseModalExpense').trigger('click');
            this.onResetForm();
            this.onGetListExpense(1);

          }

          this.loading = false;

        });
      } else {
        this.expenseSvc.onUpdateExpense( this.bodyExpense ).subscribe( async (res: any) => {

          if (!res.ok) {
            throw new Error( res.error );
          }

          const { message, css, idComponent } = this.onGetErrors( res.data.showError );
          this.onShowAlert(message, css, idComponent);

          if ( res.data.showError === 0) {

            if (this.fileExpense !== null && this.validFile) {
              await this.onUploadFile( this.bodyExpense.idExpense );
            }

            $('#btnCloseModalExpense').trigger('click');
            this.onResetForm();
            this.onGetListExpense(1);

          }

          this.loading = false;
        });
      }

    }
  }

  onLoadBodyDateExpense(): Promise<boolean> {
    return new Promise( (resolve) => {

      this.bodyExpense.dateEmission = `${ this.dateExpense.year }`;
      
    });
  }

  onUploadFile( idExpense: number ): Promise<boolean> {
    return new Promise( (resolve) => {
      this.uploadSvc.onUploadDocument( 'expense', idExpense, this.fileExpense ).subscribe( (resUpload: any) => {

        if (!resUpload.ok) {
          throw new Error( resUpload.error );
        }

        // tslint:disable-next-line: no-console
        console.info('Respuesta upload', resUpload);
        resolve(true);

      });
    });
  }

  onResetForm() {
    $('#frmExpense').trigger('reset');
    this.bodyExpense = new ExpenseModel();
    $('#frmExpense').trigger('refresh');
    this.dateExpense = this.calendar.getToday();
    this.fileExpense = null;
    this.validFile = false;
    this.loadData = false;
    this.periodClose = false;
    this.titleModal = 'Nuevo gasto';
    this.textButton = 'Guardar';
    this.srcFile = './assets/images/017-upload.png';
    $('#alertExpenseModal').html('');
  }

  onUpdateStatus() {
    this.loading = true;
    this.expenseSvc.onDeleteExpense( this.bodyExpense ).subscribe( (res: any) => {
      if (!res.ok) {
        throw new Error( res.error );
      }
      $('#btnCloseConfirmExpense').trigger('click');
      console.log(res);

      const { message, css } = this.onGetErrors( res.data.showError );

      this.onShowAlert( message, css, 'alertExpenseTable');

      if ( res.data.showError === 0) {
        this.onShowAlert( `Se ${ this.showInactive ? 'restauró' : 'eliminó' } un gasto con éxito`, css, 'alertExpenseTable');
        $('#btnCloseConfirmExpense').trigger('click');
        this.onResetForm();
        this.onGetListExpense(1);

      }

      this.loading = false;
    });
  }

  onChangePartner() {

    this.expenseSvc.onGetBranchByPartner( '', this.bodyExpense.idPartner ).subscribe( (res: any) => {
      if (!res.ok) {
        throw new Error( res.error );
      }
      this.dataOfficeBranch = res.data;
    });

  }

  onShowAlert( msg = '', css = 'success', idComponent = 'alertExpenseTable' ) {

    let htmlAlert = `<div class="alert alert-${ css } alert-dismissible fade show" role="alert">`;
    htmlAlert += `<i class="feather icon-info mr-1 align-middle"></i>`;
    htmlAlert += msg;
    htmlAlert += `<button type="button" class="close" data-dismiss="alert" aria-label="Close">`;
    htmlAlert += `<span aria-hidden="true"><i class="feather icon-x-circle"></i></span>`;
    htmlAlert += `</button>`;
    htmlAlert += `</div>`;
    htmlAlert += ``;

    $(`#${ idComponent }`).html(htmlAlert);
  }

  onGetErrors( showError: number ) {
    const action = this.loadData ? 'actualizó' : 'agregó';
    let arrErrors = showError === 0 ? [`Se ${ action } un gasto con éxito`] : [];
    const css = showError === 0 ? 'success' : 'danger';
    const idComponent = showError === 0 ? 'alertExpenseTable' : 'alertExpenseModal';
    // tslint:disable-next-line: no-bitwise
    if ( showError & 1 ) {
      arrErrors = ['No existe el socio especificado'];
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 2 ) {
      arrErrors.push('se encuentra inactivo');
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 4 ) {
      arrErrors = ['No existe la sucursal especificada'];
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 8 ) {
      arrErrors.push('se encuentra inactivo');
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 16 ) {
      arrErrors = ['No existe la moneda especificada'];
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 32 ) {
      arrErrors = ['No existe el tipo de comprobante especificado'];
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 64 ) {
      arrErrors = ['No existe el tipo de gasto especificado'];
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 128 ) {
      arrErrors = ['No existe la empresa especificada'];
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 256 ) {
      arrErrors = ['¡Periodo cerrado, por favor aperturar primero!'];
    }

    // tslint:disable-next-line: no-bitwise
    if ( showError & 512 ) {
      arrErrors = ['Registro cerrado'];
    }

    return { message: arrErrors.join(', '), css, idComponent };

  }

}
