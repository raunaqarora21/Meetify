function checkAuthenticated(req, res,next){
    if(req.isAuthenticated()){
        // console.log("Check Authenticated");

        return next();
    }
    // console.log("not authenticated");
    return res.redirect('/login');
}

function checkNotAuthenticated(req, res,next){
    // console.log(req.isAuthenticated());
    // console.log("Check Not Authenticated");
    
    if(req.isAuthenticated() == true){
        return res.redirect('/');
    }
    // console.log("authenticated");

    return next();
  
}


module.exports = { checkAuthenticated, checkNotAuthenticated };