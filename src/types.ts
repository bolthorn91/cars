import { AUTOSCOUT_COUNTRY_URL_VALUE } from './enums';
export interface IDescriptionInfo {
    title: string;
    version: string;
    link: string;
    price: string;
    kilometers: string,
    date: string,
    power: string,
    status: string,
    owners: string,
    transmission: string,
    consumption: string,
    emission: string
  }

export interface IAd extends IDescriptionInfo {
  creationDate: string;
  country: AUTOSCOUT_COUNTRY_URL_VALUE
}