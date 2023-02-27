require('dotenv').config();


const express= require('express');
const mongoose =require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');

const app = express();


app.use(express.json());
app.use(cors());
app.use(express.static('public'))


mongoose.set('strictQuery', false);



mongoose.connect("mongodb+srv://Jasmine:Jasmine123@cluster1.ksqolek.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(()=> console.log("connected to mongoDB"))
.catch((err)=>console.error("error conecting to mongodb:",err))



const userSchema= new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
});


userSchema.virtual('hashedPassword').set(function (password) {
    this.password = bcrypt.hashSync(password, 10);
  });
  
  // Define method for comparing passwords
  userSchema.methods.comparePasswords = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  
const User =mongoose.model('User',userSchema);

const JWT_SECRET=process.env.JWT_SECRET;




app.post('/api/register',async(req,res)=>{

   try{
    const { name,email,password}=req.body;

    // check

    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message:'email already exist'}) 
    
    }

    // create new user

    const user=new User({name,email,hashedPassword:password});

    await user.save();


    //generate jwt token

    const token =jwt.sign({userID:user._id},JWT_SECRET);

    res.status(200).json({token});

}catch(error){
    console.error('errpr registering user',error);
    res.status(500).json({message:'internal server error'});

   }

});


app.post('/api/login',async (req,res)=>{
    try{
        const {email,password}=req.body;

        const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({message:'user not found'});
        }
         
        const passwordMatch=user.comparePasswords(password);
        if(!passwordMatch){
            return res.status(400).json({message:'ivalid password'})
        }

        const token=jwt.sign({userId:user._id},JWT_SECRET);

        request.status(200).json({token});

    }catch(error){
        console.log('error logging in user',error);

        res.status(500).json({message:'Internal server error'});
    }
})


const PORT=5000;

app.listen(PORT,()=>console.log('server runs on port 5000'));
