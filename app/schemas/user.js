/**
 * Created by vickyzhu on 2016/1/5.
 */
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
var UserSchema = new mongoose.Schema({
    name:{
        unique:true,
        type:String
    },
    password:{
        unique:true,
        type:String
    },
    role:{
        type:Number,
        default : 0
    },
    meta:{
        createAt:{
            type:Date,
            default:Date.now()
        },
        updateAt:{
            type:Date,
            default:Date.now()
        }
    }
})


UserSchema.pre('save',function(next){
    var user=this;
    if(this.isNew){
        this.meta.createAt=this.meta.updateAt=Date.now();
    }else{
        this.meta.updateAt=Date.now();
    }
    bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt){
        if(err) return next(err);
        //console.log("password:"+user.password);
        bcrypt.hash(user.password,salt,function(err,hash){
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
    //转移控制权，即往下执行
    //next();
});

UserSchema.methods={
    comparePassword:function(_password,cb){
        bcrypt.compare(_password,this.password,function(err,isMatch){
            if(err) return cb(err);
            cb(null,isMatch);
        });
    }
}
UserSchema.statics={
    fetch:function(cb){
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb);
    },
    findById:function(id,cb){
        return this
            .findOne({_id:id})
            .exec(cb)
    }
}

module.exports=UserSchema;