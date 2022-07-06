const mongoose=require('mongoose')
//const timestamps=require()
const UrlSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId , ref:"userdata"
    },
    createdUrls:[{
        LargeUrl:{
            type:String
        },
        ShortUrl:{
            type:String
        },
        Clicks:{
            type:Number,
            default:0
        },
    }]
})

module.exports=mongoose.model('urls',UrlSchema)