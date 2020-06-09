import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FileModel} from '../models/file.model';
import {GRAPHCOOL_CONFIG, GraphcoolConfig} from '../providers/graphcool.config';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private http: HttpClient,
    @Inject(GRAPHCOOL_CONFIG) private graphcoolConfig: GraphcoolConfig,
  ) { }

  upload(file: File): Observable<FileModel> {
    const formData = new FormData();
    formData.append('data', file);
    return this.http.post<FileModel>(this.graphcoolConfig.fileAPI, formData);
  }
}
