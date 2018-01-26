import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'minuteSecondPipe'})
export class MinuteSecondPipe implements PipeTransform {
  transform(value: number): string {
    let timeStr = new Date(value * 1000).toISOString().substr(11, 8);
    return timeStr;
  }
}