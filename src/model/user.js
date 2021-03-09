const mongoose = require('mongoose')
const schema = mongoose.schema

const userschema = mongoose.Schema({
    username:{
        type:String,
        required:true
        ,unique : true, index : true, dropDups: true

    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:Number,
        required :true
    }

})

const user =mongoose.model('Users',userschema) 
module.exports = user