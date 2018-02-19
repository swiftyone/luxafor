import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'datumPipe'})
export class DatumPipe implements PipeTransform {
  transform(value: string): string {
    let datum = value.split('-')
    let newStr = datum[2] + '.' + (Number(datum[1]) + 1) + '.' + datum[0];
    return newStr;
  }
}