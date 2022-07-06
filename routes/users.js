var express = require('express');
var router = express.Router();
const URLs = require('../urlSchema')
const ShortId = require('shortid')
const {
  UserDetails
} = require('../DBConfig')
const {
  HashCompare,
  CreateToken,
  AuthVerify
} = require('../auth')
/* GET users listing. */
router.post('/activation', async (req, res) => {
  console.log("haii");
  try {
    console.log(req.body);
    console.log(req.body.email, "for activation");
    const ActivedUser = await UserDetails.updateOne({
      email: req.body.email
    }, {
      $set: {
        Activation: true
      }
    })
    //Active Users DataBase Schema
    if (ActivedUser) return res.status(200).json({
      Message: 'User Activated'
    })
    else return res.status(400).json({
      message: "failed"
    })
  } catch (error) {
    console.log(error)
  }
})

router.post('/login', async (req, res) => {
  try {
    const AvailableUser = await UserDetails.findOne({
      email: req.body.email
    })
    
    if (!AvailableUser) {
      return res.status(400).json({
        Message: 'User Doesnt Exist'
      })
    } else {
      console.log(AvailableUser)
      const Compare = await HashCompare(
        req.body.password,
        AvailableUser.password
      )
      console.log(Compare);

      if (Compare) {
        if (AvailableUser.Activation) {
          const Token = await CreateToken({
            email: req.body.email,
            _id: AvailableUser._id
          })
          console.log(Token)
          return res.status(200).json({
            Message: 'Login Is Success',
            Token: Token,
            user: AvailableUser.FirstName
          })
        } else {
          return res.status(400).json({
            Message: 'NOT an  Actived User'
          })
        }
      } else {
        res.status(400).json({
        
          Message: 'Incorrect Password'
        })
      }
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({
      Message: 'Error Occured'
    })
  }
})

router.post('/createShort', AuthVerify, async (req, res) => {
  try {
    console.log(req.body);
    const user = req.user._id
    const UserData = await URLs.findOne({
      user: user
    }).exec()
    const ShortUrl = ShortId.generate()
    if (UserData) {
      //push urls
      const {
        LargeUrl
      } = req.body
      const Collection = await URLs.findOneAndUpdate({
        user: user
      }, {
        $push: {
          "createdUrls": {
            ShortUrl,
            LargeUrl
          }
        }
      })
      if (Collection) return res.status(200).json({
        message: "updated added",
        ShortUrl
      })
      else return res.status(400).json({
        message: "not updated"
      })

    } else {
      //create Urls

      const {
        LargeUrl,
      } = req.body
      const createdUrls = [{
        LargeUrl,
        ShortUrl
      }]
      const Create = await URLs.create({
        user,
        createdUrls
      })
      if (Create) return res.status(200).json({
        message: "created succes fully",
        ShortUrl
      })
      else return res.status(400).json({
        message: "creation Failed"
      })
    }
  } catch (error) {
    console.log(error);
  }
})

router.get('/shorturls', AuthVerify, async (req, res) => {
  try {
    console.log(req.user,"user");
    const UsersUrl = await URLs.findOne({
      user: req.user._id
    }).exec()
    if (UsersUrl) return res.status(200).json({
      message: "url cart",
      Urls: UsersUrl.createdUrls
    })
    else return res.status(400).json({
      message: "Not A User"
    })
  } catch (error) {
    console.log(error);
  }
})
router.post('/render', AuthVerify, async (req, res) => {
  try {
    const user = await URLs.findOneAndUpdate({
      user: req.user._id,
      'createdUrls.ShortUrl': req.body.ShortUrl
    }, {
    $inc:{
      'createdUrls.$.Clicks':1
    }
    })
    if (user) return res.status(200).json({message:"increase count"})
    else return res.status(400).json({message:"not increase"})
  } catch (error) {
    console.log(error);
  }
})



module.exports = router;