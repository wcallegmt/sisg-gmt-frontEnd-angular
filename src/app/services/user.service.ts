import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserModel } from '../models/user.model';
import { LoginModel } from '../models/login.model';

const URI_API = environment.URI_API;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  onGetListUser(page = 1, rowsForPage = 10, qEmployee = '', qDocumento = '', qsuario = '', qArea = '', showInactive = false ) {
    showInactive = showInactive ? false : true;
    const params = `page=${ page }&rowsForPage=${ rowsForPage }&qEmployee=${ qEmployee }&qDoc=${ qDocumento }&qUser=${ qsuario }&qArea=${ qArea }&showInactive=${ showInactive }`;

    return this.http.get( URI_API + `/User/Get?${ params }`, { headers: { Authorization: localStorage.getItem('token') } } );
  }

  onGetAreaOfCompany( idCompany: number, query = '' ) {
    return this.http.get( URI_API + `/Area/OfCompany?idCompany=${ idCompany }&q=${ query }`, { headers: { Authorization: localStorage.getItem('token') } } );
  }

  onGetCompanyAll( q = '' ) {
    return this.http.get( URI_API + `/Empresa/GetAll?q=${ q }`, { headers: { Authorization: localStorage.getItem('token') } } );
  }

  onGetTypeDocument() {
    return this.http.get( URI_API + `/TipoDocumento/Get`, { headers: { Authorization: localStorage.getItem('token') } } );
  }

  onGetNationaltity( q = '' ) {
    return this.http.get( URI_API + `/Nationality/GetAll?q=${ q }`, { headers: { Authorization: localStorage.getItem('token') } } );
  }

  onAddUser( body: UserModel ) {
    return this.http.post( URI_API + `/User/Add`, body, { headers: { Authorization: localStorage.getItem('token') } } );
  }

  onUpdateUser( body: UserModel ) {
    return this.http.put( URI_API + `/User/Update/${ body.idEmployee }`, body, { headers: { Authorization: localStorage.getItem('token') } } );
  }

  onDeleteUser( body: UserModel ) {
    return this.http.delete( URI_API + `/User/Delete/${body.idEmployee}/${body.idCompany}/${body.statusRegister}`, { headers: { Authorization: localStorage.getItem('token') } } );
  }

  onGetSedeAll( idCompany: number, q = '' ) {
    return this.http.get( URI_API + `/Sede/GetAll?idCompany=${ idCompany }&q=${ q }`, { headers: { Authorization: localStorage.getItem('token') } } );
  }

  onLogin( body: LoginModel ){
    return this.http.post(URI_API + `/Login`, body);
  }

}
