const app = require('./app');
const dotenv  = require('dotenv');
const mongoose  = require('mongoose');
const PORT  = 5300;
 
// Path For Enviornment File
dotenv.config( {path:'./config.env'} );

process.on('uncaughtException', err => {
  console.log('Error', err.name, err.message);
  process.exit(1)
})

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
// console.log(process.env.PORT);
mongoose.connect(DB, {
    // these properties are basically depreciation warnings
    useNewUrlParser:true,
}).then( () => {
        console.log('Database Connected SuccessFully');
});

// Server listening ....
 const server= app.listen(PORT, function(err){
    if (err)  console.log('Error in server setup')
    console.log('Server listening on Port', PORT);
});


process.on('unhandledRejection', err => {
  console.log('error', err.name, err.message);
  server.close( () => {
    process.exit( 1 )
  })
});


