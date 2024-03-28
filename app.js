const express = require( 'express' );

const app=express();
app.use(express.json());

app.get('/api/v1/loanService',(req,res ) => {
   res.status(200).send('Hello From Server..')
})


const port=3000;
app.listen(port ,()=>{
    console.log( `Running server on ${port} ` );
});


