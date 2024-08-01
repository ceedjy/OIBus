import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'oib-test-south-modal',
  templateUrl: './test-south-modal.component.html',
  styleUrl: './test-south-modal.component.scss',
  imports: [],
  standalone: true
})
export class TestSouthModalComponent {
  result: string = 'No result';
  resultContent: string | Record<string, any>[] = 'No content';

  constructor(private modal: NgbActiveModal) {}

  prepare(result: any) {
    console.log(result);
    console.log(result.content);
    if(result) {
      this.result = 'Test successfully run';
    }
    if(result.content) {
      //this.resultContent = this.csvJSON(result.content); 
      this.resultContent = result.content;
    }
    console.log(this.resultContent);
    // faire en sorte que cet affichage soit beau ! (et pretre le mettre das un if pour avoir ''no content'' quand il n'y en a pas)
  }

  csvJSON(csv : string) { // attention il nous faut le delimiter aussi 
    let line: string[] = csv.split("\r\n");
    let result: Record<string, any>[] = [];
    let headers: string[] = line[0].split(",");
    for (var i = 1; i < line.length; i++) {
      let obj: Record<string, any> = {};
      let currentline: string[] = line[i].split(",");
      for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    console.log(result);
    return result;
  }

  close() {
    this.modal.close();
  }
}
