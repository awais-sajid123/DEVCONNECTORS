const jwt=require('jsonwebtoken');
const config=require('config');


module.exports=function(req,res,next){
    // Get the Token from the header
    const token=req.header('x-auth-token');

    // check if no Token

    if(!token){
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    //verify the token

    try{
        const decoded=jwt.verfify(token,config.get('jwtSecret'));

        req.user=decoded.user;

    } catch(err){
        res.status(401).json({msg: 'Token is not valid'});
    }
}