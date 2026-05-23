const mongoose = require("mongoose");

export const connectDB = () => {
    return mongoose.connect("mongodb://localhost/TP2-ITFS29", function(error) {
        if ( error ) {
            throw error;
        } else {
            console.log("Conectado con Mongo Db TP2-ITFS29");
        } 
    });
};
