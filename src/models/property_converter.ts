export interface PropertyConverter {
  regexp: RegExp;
  replacer: (substring: string, ...args: any[]) => string;
}