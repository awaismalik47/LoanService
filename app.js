const express     = require( 'express' );
const app         = express( );
const usersRoutes = require('./routes/userRoutes');

// Middleware
app.use( express.json( ));

app.use("/api/v1/users", usersRoutes);

app.all('*',(req,res,next)=>{
    const err=new AppError(`can not find "${req.originalUrl}" url`,404)
    next(err)
});
// Exporting App File To use in othe File...
module.exports = app;
