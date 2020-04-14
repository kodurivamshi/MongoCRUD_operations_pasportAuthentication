var mongoose=require("mongoose");
var schema=mongoose.Schema;

var user=new schema({
    user_name:String,
    user_mail:String, 
    user_mobile:String 
    });
var myuser=new schema({
    user_email:String,
    user_data:[user],
});

module.exports=mongoose.model('userdata',myuser);