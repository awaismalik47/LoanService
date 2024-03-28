const express   = require( 'express' );
const app       = express( );

// Middleware
app.use( express.json( ));

// Exporting App File To use in othe File...
module.exports = app;
