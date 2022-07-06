var express = require('express')
var router = express.Router()
const nodeMailer = require('nodemailer')
const BodyParser = require('body-parser')
const Mongoose = require('mongoose')
const {
  UserDetails
} = require('../DBConfig')
const {
  ActiveUserDetails
} = require('../urlSchema')
const crypto = require('crypto')
const cors = require('cors')
const ShortId = require('shortid')
const {
  Hashing,
  HashCompare,
  CreateToken,
  AuthVerify
} = require('../auth')
const {
  Session
} = require('inspector')
router.use(cors())
require('dotenv').config()

//DataBase Connectio Set Up
const DbUrl = 'mongodb+srv://adarshk0027:adarshk0027@cluster0.snbxi.mongodb.net/webshortner'
Mongoose.connect(DbUrl)
Mongoose.connection
  .once('open', () => console.log('Connected Mongoose '))
  .on('error', error => {
    console.log('My Error:::' + error)
  })
//DataBase Connection Finished
let CURRENT_EMAIL = ''
let Email = ''

const Auth = async (req, res, next) => {
  try {
    const Verify = await AuthVerify(req.body.Token)
    if (Verify) {
      const User = await UserDetails.findOne({
        email: Verify.email
      })
      if (User) {
        req.body.User = User
        console.log(User)
        console.log('Auth Success')
        next()
      }
    } else {

      res.send({
        StatusCode: 400,
        Message: 'user Expired or Un authorized'
      })
    }
  } catch (error) {
    console.log(error)
    res.send({
      StatusCode: 400
    })
  }
}

let transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
})

//Checking Email Is IN DataBase Or Not
router.post('/check-email', async (req, res) => {
  try {
    console.log(req.body.email)
    const EmailFind = await UserDetails.find({
      email: req.body.email
    })
    if (EmailFind) {
      res.status(200).json({
        message: "email find SUccesFully"


      })
    } else {
      res.status(400).json({

        Message: 'data not find',

      })
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({

      message: 'Internal Server Error'
    })
  }
})
const addMinutes = (minute) => {
  const time = new Date()
  const addedTime = time.setMinutes(time.getMinutes() + minute)
  const timestring = new Date(addedTime).toLocaleTimeString()
  return timestring
}
router.post('/send', async (req, res) => {
  try {
    CURRENT_EMAIL = req.body.email
    console.log(CURRENT_EMAIL,"current");
    const randomString = crypto.randomBytes(3).toString('hex')
    let mailOptions = {
      from: 'adarshkdev27@gmail.com',
      to: CURRENT_EMAIL,
      subject: 'password Reset email',
      html: `<a href="http://localhost:3000/send"> OtpVerification : ${randomString}</a>`,
      text: randomString
    }

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log('error is', err)
      } else {
        console.log('email sent')
      }
    })
    const InsertOTP = await UserDetails.findOneAndUpdate({
      email: req.body.email
    }, {
      $set: {
        otpString: randomString,
        ExpiresIn:addMinutes(8)

      }
    })
    if (InsertOTP) return res.status(200).json({
      message: "mail send"
    })
    else return res.status(400).json({
      message: "not send"
    })


  } catch (error) {
    console.log(error)
    res.send({
      StatusCode: 400,
      Message: 'Internal Error'
    })
  }
})
router.post('/verificationss', Auth, async (req, res) => {
  try {
    const FindData = await UserDetails.findOne({
      email: CURRENT_EMAIL
    })
    console.log(FindData)
    if (FindData.otpString === req.body.OtpString) {
      console.log('successs!!!')
      res.redirect('http://localhost:3000/new-password')
      // res.send({
      //   StatusCode: 200,
      //   Message: 'Checked SuccesFully'
      // })
    }
  } catch (error) {
    console.log(error)
    res.send({
      StatusCode: 400,
      message: 'Internal Server Error'
    })
  }
})

//Router For Register
//ADD Email And Password To DataBase
router.post('/register', async (req, res) => {
  try {
    const AlreadyUser = await UserDetails.findOne({
      email: req.body.email
    })
    if (AlreadyUser) {
      console.log('user Exist')
      return res.status(400).json({
        Message: 'User Already Exist'
      })
    } else {
      const HashedPassword = await Hashing(req.body.password)
      console.log(HashedPassword, "hash")
      req.body.password = HashedPassword

      const Details = await UserDetails.create(req.body)
      res.status(200).json({
        message: 'Data Added succesFully',
        data: req.body
      })
    }
  } catch (error) {
    console.log(error)
    res.send({
      StatusCode: 400,
      Message: 'Inteernal Server Error'
    })
  }
})

router.post('/Change', async (req, res) => {
  try {
    console.log(req.body)
    const HashedPassword = await Hashing(req.body.password)
    console.log(HashedPassword);
    const passwordChanged = await UserDetails.findOneAndUpdate({
      email: req.body.email
    }, {
      $set: {
        password: HashedPassword
      }
    })
    if(passwordChanged) return res.status(200).json({message:"password changed"})
    else return res.status(400).json({message:"password not changed"})
  } catch (error) {
    console.log(error)
    res.send({
      StatusCode: 400,
      Message: 'INTERNAL SERVER ERROR'
    })
  }
})
//  Router For Send Mail
//Send the Link To Particular Mail Address

// router.get('/send', function (req, res) {
//   res.render('index')
// })

//

router.post('/activation', async (req, res) => {
  console.log(req.body.email, "email");
  Email = req.body.email
  let mailOptions = {
    from: 'adarshkdev27@gmail.com',
    to: Email,
    subject: 'Activation  Email',
    html: `<a href="http://localhost:3000/Activelink"> Activation Link </a>`
  }
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log('error is', err)
    } else {
      console.log('email sent')
      res.status(200).json({
        message: "email send SuccessFully"
      })
    }
  })
})


// router.post('active-user', async (req, res) => {
//   console.log("haii");
//   try {
//     console.log(req.body);
//     // console.log(req.body.email, "for activation");
//     // const ActivedUser = await UserDetails.updateOne({
//     //   email: req.body.email
//     // }, {
//     //   $set: {
//     //     Activation: true
//     //   }
//     // })
//     // //Active Users DataBase Schema
//     // if (ActivedUser) return res.status(200).json({
//     //   Message: 'User Activated'
//     // })
//     // else return res.status(400).json({
//     //   message: "failed"
//     // })
//   } catch (error) {
//     console.log(error)
//   }
// })
// router.get('/Activation', (req, res) => {
//   res.render('index')
// })
// router.post('/login', async (req, res) => {
//   try {
//     const AvailableUser = await UserDetails.findOne({
//       email: req.body.email
//     })
//     console.log(AvailableUser)
//     if (!AvailableUser) {
//       res.send({
//         StatusCode: 401,
//         Message: 'User Doesnt Exist'
//       })
//     } else {
//       const Compare = await HashCompare(
//         req.body.password,
//         AvailableUser.password
//       )

//       if (Compare) {
//         if (AvailableUser.Activation) {
//           const Token = await CreateToken({
//             email: req.body.email
//           })
//           console.log(Token)
//           res.send({
//             StatusCode: 200,
//             Message: 'Login Is Succeeded',
//             Login: Compare,
//             Token: Token
//           })
//         } else {
//           res.send({
//             StatusCode: 300,
//             Message: 'Login Is Succeeded NOT Actived'
//           })
//         }
//       } else {
//         res.send({
//           StatusCode: 400,
//           Message: 'Incorrect Password'
//         })
//       }
//     }
//   } catch (error) {
//     console.log(error)
//     res.send({
//       StatusCode: 400,
//       Message: 'Error Occured'
//     })
//   }
// })

router.post('/auth', async (req, res) => {
  try {
    const Verify = await AuthVerify(req.body.Token)
    console.log(Verify)
    res.send({
      StatusCode: 200,
      Data: Verify
    })
  } catch (error) {
    console.log(error)
    res.send({
      StatusCode: 400
    })
  }
})

// router.post('/createShort', Auth, async (req, res) => {
//   try {
//     console.log(req.body)
//     const ShortenUrl = await ShortId.generate()
//     const AddUrlToDb = await ActiveUserDetails.findOneAndUpdate({
//       email: req.body.User.email
//     }, {
//       $push: {
//         urls: {
//           LargeUrl: req.body.LargeUrl,
//           ShortUrl: ShortenUrl
//         }
//       }
//     })

//     res.send({
//       StatusCode: 200,
//       Message: 'Url Created',
//       Url: ShortenUrl,
//       data: AddUrlToDb
//     })
//   } catch (error) {
//     console.log(error)
//     res.send({
//       StatusCode: 500,
//       Message: 'InternalError'
//     })
//   }
// })

// router.post('/shorturls', Auth, async (req, res) => {
//   try {
//     const ShortUrls = await ActiveUserDetails.findOne({
//       email: req.body.User.email
//     })
//     res.send({
//       StatusCode: 200,
//       Message: 'Find All Url',
//       data: ShortUrls.urls
//     })
//   } catch (error) {
//     console.log(error)
//     res.send({
//       StatusCode: 400,
//       Message: 'Intenal Server Error'
//     })
//   }
// })
router.post('/verification', async (req, res) => {
  console.log("otp", req.body);

  try {
    const deadDate = new Date().toLocaleTimeString()
    const FindData = await UserDetails.findOne({
      email: req.body.email
    })
    console.log(FindData);
    if (FindData.ExpiresIn > deadDate) {
      console.log(FindData.ExpiresIn);
      if (FindData.otpString === req.body.otpString) {
        console.log("successs!!!");
        res.status(200).json({
          message: "Otp Verified Success"
        })


      } else {
        res.status(400).json({
          message: "Otp Not Match"
        })
      }
    } else {
      return res.status(400).json({
        message: "time expires please Try Again"
      })
    }

  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: 'Something Wrong'
    })
  }
})


router.post('/render', Auth, async (req, res) => {
  try {
    const ClickUpdate = await ActiveUserDetails.updateOne({
      email: req.body.User.email,
      'urls.ShortUrl': req.body.Short
    }, {
      $inc: {
        'urls.$.Clicks': 1
      }
    })

    res.send({
      StatusCode: 200,
      Message: 'Data Changed'
    })
  } catch (error) {
    console.log(error)
    res.send({
      status: 400
    })
  }
})

router.post('/dailychart', Auth, async (req, res) => {

  try {

    const DistinctDate = await ActiveUserDetails.aggregate([{
        $match: {
          email: req.body.User.email
        }
      },
      {
        $unwind: {
          path: "$urls"
        }
      },
      {
        $group: {
          _id: "$urls.CreatedAt",
          Total: {
            $sum: 1
          }
        }
      }
    ])


    res.send({
      StatusCode: 200,
      Message: "Date Distincted",
      data: DistinctDate
    })
  } catch (error) {
    console.log(error);
    res.send({
      StatusCode: 400
    })
  }

})


module.exports = router