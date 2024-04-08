const errorHandler=require('./controller/errorController')

const AppError = require('./utilites/appError')
const express = require('express');
const app = express();
const userRouter = require('./routes/userRoutes');


// Middleware 
app.use(express.json());

app.use("/api/v1/loanService", userRouter);

app.all('*',(req,res,next)=>{
    const err=new AppError(`can not find "${req.originalUrl}" url`,404)
    next(err)
});
// Exporting App File To use in othe File...
app.use(errorHandler)
module.exports = app;
