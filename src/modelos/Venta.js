// Módulo de venta: FacturaVenta + DetalleVenta

import mongoose from "mongoose";
import { getListaLotesDisponibles } from "./Productos.js";
import { getNuevoNroFactura } from "./FacturaCompra.js";

const ventaSchema = new mongoose.Schema({
  idFacturaVenta: { type: Number, unique: true },
  idCliente: Number,
    nroFactura: String,
    fechaFactura: Date,
    montoTotal: Number,
    fechaAlta: Date,
    fechaUltimoMovimiento: Date,
    operador: String
}, { versionKey: false });

// ----- Funciones de saldo -----
/*
  Partes involucradas:  
    - FacturaVenta: representa la factura de una venta realizada a un cliente.
    - DetalleVenta: representa los detalles de cada producto vendido en una factura, incluyendo cantidad, precio unitario y monto total.
    Funciones de obtención de los productos a vender de Stock por FEFO
    // Inicio de la transaccion de venta
    // Verificación de stock disponible para cada producto/cantidad en DetalleVenta
    // Si el stock es suficiente, se procede a actualizar el stock restando la cantidad vendida
    // Si el stock no es suficiente, se puede generar una alerta o mensaje de error indicando la falta de stock para ese producto específico.
    Funciones de actualización de Stock por FEFO


*/

export async function emitirFactura1( aListaPedido, idCliente, nroFactura, fechaFactura, operador ) {
    // Obtener el último ID de factura para generar uno nuevo, debo separar sucursal de Numero de factura
    const ultimaFactura = await mongoose.model("Venta").findOne().sort({ idFacturaVenta: -1 });
    const nuevoIdFactura = ultimaFactura ? ultimaFactura.idFacturaVenta + 1 : 1;
}

export async function emitirFactura( aListaPedido, idCliente, nroFactura, fechaFactura ) {
    // Checks de parámetros de entrada
    if ( !aListaPedido || !idCliente || !nroFactura || !fechaFactura ) {
        throw new Error("Faltan parámetros requeridos para emitir la factura.");
    }
    if ( !Array.isArray(aListaPedido) || aListaPedido.length === 0 ) {
        throw new Error("La lista de pedido debe ser un array no vacío.");
    }
    if ( typeof idCliente !== "number" || typeof nroFactura !== "string" || !( fechaFactura instanceof Date) ) {
        throw new Error("Tipo de dato incorrecto para idCliente, nroFactura o fechaFactura.");
    }
    if ( nroFactura.trim().length < 13 || nroFactura.trim().length > 14 ) {
        throw new Error("El número de factura debe tener entre 13 y 14 caracteres.");
    }
    else if ( nroFactura.trim().length === 13 ) {
        // Procesar factura de 14 caracteres por sucursal + '-' + número de factura
        nroFactura = nroFactura.substr(0, 5) + "-" + nroFactura.substr(5, 8);
    }
    // Fin Checks de parámetros de entrada
    // Obtener la lista de lotes disponibles para cada producto en el pedido
    // Verificar que para cada producto en el pedido haya stock suficiente en los lotes disponibles
    for ( const itemPedido of aListaPedido ) {
        let listaLotesDisponibles = await getListaLotesDisponibles( itemPedido.idProducto, fechaFactura );
        let consumo = ( itemPedido.cantidad < 0 ) ? 0 : itemPedido.cantidad;
        for ( let i = 0, len = listaLotesDisponibles.length; i < len; i++ ) {
            let lote = listaLotesDisponibles[i];
            if ( lote.saldo >= consumo ) {
                lote.cargado = consumo;
                lote.saldo -= consumo;
                consumo = 0;
                break;  // Ya se completó el consumo para este producto, paso al siguiente
            } else {
                lote.cargado = lote.saldo;
                lote.saldo = 0;
                consumo -= lote.cargado;
            }
        }
        if ( consumo > 0 ) {
            throw new Error(`No hay stock suficiente para el producto ${itemPedido.idProducto}.`);
        }
    }

    // Si se llega aquí, significa que hay stock suficiente para todos los productos en el pedido
    // Proceder a emitir la factura y actualizar el stock de los lotes correspondientes
    // Aquí se debería crear el documento de la factura en la base de datos y luego actualizar el stock de los lotes según lo cargado en cada uno
    const nroFactura = await getNuevoNroFactura();
    if ( !nroFactura ) {
        throw new Error("No se pudo generar un nuevo número de factura.");
    }
    



}

export default mongoose.model("Venta", ventaSchema);