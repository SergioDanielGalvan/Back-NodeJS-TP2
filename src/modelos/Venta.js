// Módulo de venta: FacturaVenta + DetalleVenta

import mongoose from "mongoose";
import { getListaLotesDisponibles, modificarSaldo } from "./Productos.js";
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

export async function emitirFactura( aListaPedido, idCliente, fechaFactura ) {
    // Checks de parámetros de entrada
    if ( !aListaPedido || !idCliente || !fechaFactura ) {
        throw new Error("Faltan parámetros requeridos para emitir la factura.");
    }
    if ( !Array.isArray(aListaPedido) || aListaPedido.length === 0 ) {
        throw new Error("La lista de pedido debe ser un array no vacío.");
    }
    if ( typeof idCliente !== "number" || !( fechaFactura instanceof Date) ) {
        throw new Error("Tipo de dato incorrecto para idCliente, nroFactura o fechaFactura.");
    }

    // Fin Checks de parámetros de entrada
    // Obtener la lista de lotes disponibles para cada producto en el pedido
    // Verificar que para cada producto en el pedido haya stock suficiente en los lotes disponibles
    let datosFactura = { "nroFactura": "", "fechaFactura": fechaFactura, "idCliente": idCliente, "montoTotal": 0 };
    for ( const itemPedido of aListaPedido ) {
        let listaLotesDisponibles = await getListaLotesDisponibles( itemPedido.idProducto, fechaFactura );
        let consumo = ( itemPedido.cantidad < 0 ) ? 0 : itemPedido.cantidad;
        for ( let i = 0, len = listaLotesDisponibles.length; i < len; i++ ) {
            let lote = listaLotesDisponibles[i];
            if ( lote.saldo >= consumo ) {
                lote.idLote = lote.idLote;  // Asegurarse de que el idLote esté presente
                lote.cargado = consumo;
                lote.saldo -= consumo;
                consumo = 0;
                break;  // Ya se completó el consumo para este producto, paso al siguiente
            } else {
                lote.idLote = lote.idLote;  // Asegurarse de que el idLote esté presente
                lote.cargado = lote.saldo;
                lote.saldo = 0;
                consumo -= lote.cargado;
            }
        }
        if ( consumo > 0 ) {
            throw new Error(`No hay stock suficiente para el producto ${itemPedido.idProducto}.`);
        }
        datosFactura.montoTotal += lote.cargado * itemPedido.precioventa;
    }

    // Si se llega aquí, significa que hay stock suficiente para todos los productos en el pedido
    

    // Proceder a emitir la factura y actualizar el stock de los lotes correspondientes
    // Aquí se debería crear el documento de la factura en la base de datos y luego actualizar el stock de los lotes según lo cargado en cada uno
    datosFactura.nroFactura = await getNuevoNroFactura();
    if ( !datosFactura.nroFactura ) {
        throw new Error( "No se pudo generar un nuevo número de factura." );
    }
    else if ( typeof datosFactura.nroFactura !== "string" ) {
        throw new Error( "El número de factura generado no es válido." );
    }
    else if ( datosFactura.nroFactura.trim().length !=14 ) {
        throw new Error( "El número de factura generado debe tener 14 caracteres incluyendo el guion." );
    }
    
}

async function grabarFactura( adatosFactura ) {
    if ( !adatosFactura || typeof adatosFactura !== "object" ) {
        throw new Error( "Datos de factura no válidos para grabar." );
    }
    else if ( !adatosFactura.nroFactura || typeof adatosFactura.nroFactura !== "string" || adatosFactura.nroFactura.trim().length != 14 ) {
        throw new Error( "El número de factura es obligatorio y debe tener 14 caracteres incluyendo el guion." );
    }

    // Checks de validación de datos de factura antes de grabar
    if ( !adatosFactura.fechaFactura || !( adatosFactura.fechaFactura instanceof Date ) ) {
        throw new Error( "La fecha de factura es obligatoria y debe ser un objeto Date válido." );
    }
    else if ( typeof adatosFactura.idCliente !== "number"  || adatosFactura.idCliente <= 0 ) {
        throw new Error( "El ID del cliente es obligatorio y debe ser un número positivo." );
    }
    else if ( typeof adatosFactura.montoTotal !== "number" || adatosFactura.montoTotal < 0 ) {
        throw new Error( "El monto total es obligatorio y debe ser un número positivo." );
    }

    const facturaVentasData = await fs.readFile( path.join(DATA_PATH, "FacturaVenta.json"), "utf8");
    let facturaVentas = JSON.parse( facturaVentasData );
    // Verificar que el número de factura no exista ya en el sistema
    if ( facturaVentas.some( f => f.nroFactura === adatosFactura.nroFactura ) ) {
        throw new Error( "El número de factura ya existe en el sistema." );
    }
    // Si se llega aquí, significa que los datos de la factura son válidos y el número de factura es único
    // Proceder a grabar la factura en el sistema (en este caso, agregándola al array y guardando el archivo JSON)
    facturaVentas.push( adatosFactura );
    await fs.writeFile( path.join(DATA_PATH, "FacturaVenta.json"), JSON.stringify(facturaVentas, null, 2), "utf8" );

}

async function actualizarStock( aListaPedido, fechaFactura ) {
    stockAfectado = [{}];
    for ( const itemPedido of aListaPedido ) {
        saldo = await getSaldoLote( itemPedido.idLote );
        if ( saldo.Saldo < itemPedido.cantidad ) {
            stockAfectado[ idLote ] = { idLote : itemPedido.idLote, cantidad : itemPedido.cantidad, saldo: saldo.Saldo, afectado : 0 };
            break;  // Se sale para hacer un rollback de lo descargado
        }
        else {
            modificarSaldo( itemPedido.idLote, itemPedido.cantidad );
            stockAfectado[ idLote ] = { idLote : itemPedido.idLote, cantidad : itemPedido.cantidad, saldo: saldo.Saldo, afectado = itemPedido.cantidad };
        }
    }
    return stockAfectado;
}

async function generarDetalleVenta( aListaPedido, idFacturaVenta ) {
    const detalleVentasData = await fs.readFile( path.join(DATA_PATH, "DetalleVentas.json"), "utf8");
    let detalleVentas = JSON.parse(detalleVentasData);
    for ( const itemPedido of aListaPedido ) {
        let detalleVenta = {
            idFacturaVenta: idFacturaVenta,
            idProducto: itemPedido.idProducto,
            idLote: itemPedido.idLote,
            cantidad: itemPedido.cantidad,  
            precioUnitario: itemPedido.precioventa,
            montoTotal: itemPedido.cantidad * itemPedido.precioventa
        };
        detalleVentas.push( detalleVenta );
    }
    await fs.writeFile( path.join(DATA_PATH, "DetalleVentas.json"), JSON.stringify(detalleVentas, null, 2), "utf8" );
}

export default mongoose.model("Venta", ventaSchema);