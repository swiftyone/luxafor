import { Pipe, PipeTransform } from '@angular/core';
import md5 from 'crypto-md5';

@Pipe({name: 'gravatarPipe'})
export class GravatarPipe implements PipeTransform {
  transform(value: string): string {
    let newStr = md5(value, 'hex');
    return newStr;
  }
}