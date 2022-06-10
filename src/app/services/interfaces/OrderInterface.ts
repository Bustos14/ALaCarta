//Interfaz para el pedido.
export interface Order{
    order: string;
    cant: number;
    date: string;
    lastUpdate: string;
    userId: string;
    plateId?: string;
    resId: string;
    status: string;
    totalPrice: number;}
