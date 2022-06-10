//Interfaz para el plato
export interface Plato{
  pId?: string;
  rId: string;
  img?: string;
  nombre: string;
  description: string;
  ingredients: string;
  pvp: number;
}
