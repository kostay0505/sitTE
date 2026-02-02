import { Country } from '../countries/types';

export type City = {
  id: string;
  name: string;
  country: Country;
};
