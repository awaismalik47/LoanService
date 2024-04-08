const AppError=require('./../utilites/appError')


const handleCastErrorDb=(err)=>{
    const message=`Invalid ${err.path}:${err.value}.`
    return new AppError(message,400)
}
const handleDuplicateKey=(err)=>{
    const message=`This "${err.keyValue.name}" is duplicate..`
    return new AppError(message,400)
}
const handleValidationErrorDb=(err)=>{
    const errors=Object.values(err.errors).map(el=>el.message)
    const message= `Invalid Input Data ${errors.join('. ')}`;
    return new AppError(message,400)
}
const handleJwtVerficationToken=(err)=>{
    const message=`Invalid token Please Login Again !`
    return new AppError(message,401)
}
const handleExpiresIn=(err)=>{
    const message=`Session Expired! Please Login Again..`
    return new AppError(message,401)
}
const sendErrorDev=(err,res)=>{
    console.log("Inside Send Error Dev",err)
    res.status(err.statusCode).json({
        status: err.status,
        error:err,
        message: err.message,
        stack:err.stack,
      });
}

const sendErrorPro=(err,res)=>{
   if(err.isOperational){
    console.log("inside is opertional ...")
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message
    });
   }
   else {
    res.status(500).json({
        message:"Internal Server Error.."
    })
   }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    console.log('INSIDE THE ERROR CONTROLLER')
   if(process.env.NODE_ENV=='development'){
    sendErrorDev(err,res)
   }
   else if(process.env.NODE_ENV==='production'){
    let error={...err};
    if(err.name==='CastError') {
        error=handleCastErrorDb(error)
    }
    else if(err.code===11000) {
        error=handleDuplicateKey(error)
    }
    else if(err.name==="ValidationError"){
        error=handleValidationErrorDb(error)
    }
    else if(err.name==="JsonWebTokenError"){
        error=handleJwtVerficationToken(error);
    }
    else if(err.name==="TokenExpiredError"){
        error=handleExpiresIn(error)
    }
    sendErrorPro(error,res)
   }
};
