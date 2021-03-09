const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose')
const user = require("./model/user.js")
const swaggerJsDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const swaggerOptions = {
    swaggerDefinition: {
      info: {
        version: "1.0.0",
        title: "CRUD login ",
        description: "CRUD login sejutacita",
        contact: {
          name: "Justin Pitoby"
        },
        servers: ["http://localhost:3000"]
      }
    },
    // ['.routes/*.js']
    apis: ["./src/index.js"]
  };
  
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const uri = "mongodb+srv://ADMIN:ADMIN@cluster0.7wanw.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true}).then((result)=>console.log("masuk db"));


/**
 * @swagger
 * check:
 *  get:
 *    description: use to check if given username and password are available in database
 *    parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         type: string
 *         description: text that will be checked for their username.
 *       - in: path
 *         name: password
 *         required: true
 *         type: string
 *         description: text that will be checked for their password.
 *    responses:
 *      'detail user':
 *        description: detail of a user with the same username and password
 *      'detail user + kamu admin':
 *        description: detail of a user with the same username and password which have the role =1
 *      'orang tidak ada':
 *        description: the username and password does not exist in the database
 */
app.get('/check/:username/:password',(req,res)=>{
    const un=req.params.username;
    const pw=req.params.password;
    user.find({username:un,password:pw}).then(activeuser=>{
        if(activeuser[0].role==0){
            res.send(activeuser);
        }
        else if(activeuser[0].role==1){
            res.send(activeuser +"kamu admin ")
        }
    }).catch(error=>{
        res.send("orang tidak ada"+error)
    })
})
/**
 * @swagger
 * viewusers:
 *  get:
 *    description: use to check every users in database
 *    parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         type: int
 *         description: the role of the user who is acessing this API.
 *    responses:
 *      'alluser':
 *        description: detail of every users
 *      'you cannot access this':
 *        description: the role of a person who is accessing this API is not 1 which is admin
 */
app.get('/viewusers/:role',(req,res)=>{
  // the role is in params as oppose to other method which is in body
    if(req.params.role==1){
        user.find().then(allusers=>res.send(allusers))
    }
    else{
        res.send("you cannot access this ")
    }
})
/**
 * @swagger
 * signin:
 *  get:
 *    description: use to createa recordin database
 *    parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         type: string
 *         description: text that will be added as their username.
 *       - in: path
 *         name: password
 *         required: true
 *         type: string
 *         description: text that will be added as their password.
 *    responses:
 *      'details ':
 *        description: detail of a user that had just been created
 */
app.get('/signin/:username/:password',(req,res)=>{
    const un=req.params.username;
    const pw=req.params.password;
    const newuser = new user({
        username:un,
        password:pw,
        role:0
    })
    newuser.save().then((result)=> res.send(result));
})
/**
 * @swagger
 * delete:
 *  get:
 *    description: use to delete a record in database
 *    parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: id of a user that wants to be deleted.
 *    responses:
 *      'details ':
 *        description: detail of a user that had just been deleted
 *      'orang tidak ada ':
 *        description: the targeted id was not found in the database
 */
app.get('/delete/:id',(req,res)=>{
    const id=req.params.id;
    //const role = req.body.role
    //if(role==1){
    user.findByIdAndDelete(id,(err, target) => {
        if (err) return res.status(500).send(err);

        const response = {
            message: "user successfully deleted",
            id: target._id
        };
        return res.status(200).send(response);
    }).catch(error=>{
        res.send("orang tidak ada"+error)
    })
    //}
})
/**
 * @swagger
 * searchid:
 *  get:
 *    description: use to search a record in database
 *    parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: id of a user that wants to be found.
 *    responses:
 *      'details ':
 *        description: detail of a user with the same id 
 *      'orang tidak ada ':
 *        description: the targeted id was not found in the database
 */
app.get('/searchid/:username',(req,res)=>{
    const un=req.params.username;
    //const role = req.body.role
    //if(role==1){
        user.find({username:un}).then(target=>{
            res.send(target[0]._id)
        }).catch(error=>{
            res.send("orang tidak ada"+error)
        })
        //}
})
/**
 * @swagger
 * deleteuser:
 *  get:
 *    description: use to delete a record in database given their username
 *    parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         type: string
 *         description: username of a user that wants to be deleted.
 *    responses:
 *      'details ':
 *        description: detail of a user that had just been deleted
 *      'orang tidak ada ':
 *        description: the targeted id was not found in the database
 */
app.get('/deleteuser/:username',async (req,res)=>{
    const un=req.params.username;
    //const role = req.body.role
    //if(role==1){
    await searchid(un,(id)=>{
        console.log(id+" ini didalam deletuser")
        user.findByIdAndDelete(id,(err, target) => {
            if (err) return res.status(500).send(err);
    
            
            const response = {
                message: "user successfully deleted",
                idnya: id
            };
            return res.status(200).send(response);
        }).catch(error=>{
            res.send("orang tidak ada"+error)
        })
    })
    //}
})
// a function to get the id given the username 
async function searchid(name,cb){
  //const role = req.body.role
    //if(role==1){
    try {
        await user.find({username:name}).then(target=>{
            const ret = target[0]._id
            console.log(ret+" ini didalam function")
            cb(ret)
            return ret;
        }
        )
    } catch (error) {
        return error
    }
    //}
}
/**
 * @swagger
 * update:
 *  get:
 *    description: use to update record in database given their id
 *    parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: id of a record that will be updated.
 *       - in: path
 *         name: newusername
 *         required: true
 *         type: string
 *         description: a new username that will get updated into.
 *       - in: path
 *         name: newpassword
 *         required: true
 *         type: string
 *         description: a new username that will get updated into.
 *       - in: path
 *         name: newrole
 *         required: true
 *         type: string
 *         description: a new username that will get updated into.
 *    responses:
 *      'details ':
 *        description: detail of a user that had just been updated
 *      'orang tidak ada ':
 *        description: the targeted id was not found in the database
 */
app.get('/update/:id/:newusername/:newpassword/:newrole',(req,res)=>{
    const id=req.params.id;
    const nun=req.params.newusername;
    const npw=req.params.newpassword;
    const nrole=req.params.newrole;
    //const role = req.body.role
    //if(role==1){
    user.findByIdAndUpdate(id,{username:nun,password:npw,role:nrole},(err, target) => {
        if (err) return res.status(500).send(err);
        const response = {
            message: "user successfully altered",
            id: target._id
        };
        return res.status(200).send(response);
    }).catch(error=>{
        res.send("orang tidak ada"+error)
    })
    //}
    
})



app.listen(port, () => {
    console.log(`ini  di index sejutacita`)
  })