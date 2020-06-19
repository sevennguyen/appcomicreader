var API_KEY = 123456789
var SECRET_KEY = "SEVEN_AppComic_Key_hjklasdf";

var express = require('express')
var router = express.Router()
var moment = require('moment')
var jwt = require('jsonwebtoken');
var exjwt = require('express-jwt');
var server = require("http").createServer(express);
server.listen(process.env.PORT || 3000);

//
var crypto = require('crypto');
var uuid = require('uuid');



const jwtMW = exjwt({
    secret: SECRET_KEY
});
//test jwt
router.get('/testjwt', jwtMW, function (req, res) {
    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    } catch (err) {
        return res.status(401).send('unauthorization');
    }

    var keyid = decoded.keyid;
    res.send(JSON.stringify({ success: true, message: keyid }));
});


/// GET KEY JWT
router.get('/getkey', function (req, res, next) {


    var keyid = req.query.keyid
    if (keyid != null) {

        let token = jwt.sign({ keyid: keyid }, SECRET_KEY, {}); // sign token 
        res.send(JSON.stringify({ success: true, token: token }));



    } else {
        res.send(JSON.stringify({ success: false, message: "Missing keyid in JWT" }));
    }

})
/// GET KEY JWT


//get test 
router.get('/', function (req, res, next) {
    res.send('Hello Word')
})


/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

//get all category

//get comic reader from 1 to 10
router.get('/getStoryLimit', function (req, res, next) {

    req.getConnection(function (err, connect) {

        var startIndex = parseInt(req.query.from);
        var endIndex = parseInt(req.query.to);

        if (isNaN(startIndex))
            startIndex = 0;
        if (isNaN(endIndex))
            endIndex = 10;

        connect.query('SELECT ID,Name,Image,Description,Status,Author,NumOfChap,Date_Upload,Date_Update,'
            + ' CASE WHEN IsComic=1 THEN \'TRUE\' ELSE \'FALSE\' END as IsComic'
            + ' FROM manga ORDER BY ID DESC LIMIT ?,?', [startIndex, endIndex], function (err, rows, fields) {

            if (err) {
                res.status(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            } else {
                if (rows.length > 0) {
                    res.send(JSON.stringify({ success: true, result: rows }));
                } else {
                    res.send(JSON.stringify({ success: false, message: "DATA EMPTY" }));
                }
            }
        })
    })

})

//get all comic reader 
router.get('/getAllStory', function (req, res, next) {

    req.getConnection(function (err, connect) {

        connect.query('SELECT COUNT(ID) AS maxRowNum FROM `manga` ORDER BY ID DESC', function (err, rows, fields) {

                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }));
                    } else {
                        if (rows.length > 0) {
                            res.send(JSON.stringify({ success: true, result: rows }));
                        } else {
                            res.send(JSON.stringify({ success: false, message: "DATA EMPTY" }));
                        }
                    }
                })
        


    })
  

})

router.post('/searchStory', function (req, res, next) {
    
    req.getConnection(function (err, connect) {

        var search_query = '%' + req.body.Name + '%'
        if (search_query != null) {
            connect.query('SELECT ID,Name,Image,Description,Status,Author,Date_Upload,Date_Update'
                + ' FROM manga WHERE Name LIKE ?', [search_query], function (err, rows, fields) {

                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }));
                    } else {
                        if (rows) {
                            res.send(JSON.stringify({ success: true, result: rows }));
                        } else {
                            res.send(JSON.stringify({ success: false, message: "DATA EMPTY" }));
                        }
                    }
                })
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing Name" }));
        }

    })
})

//get Story by category
router.get('/getStoryByCategoryID', function (req, res, next) {

    req.getConnection(function (err, connect) {
        var categoryID = req.query.categoryID;
        if (categoryID != null) {

            connect.query('SELECT ID,Name,Image,Description,Status,Author,NumOfChap,Date_Upload,Date_Update'
                + ' FROM manga WHERE ID IN (SELECT MangaID FROM mangacategory WHERE CategoryID=?)', [categoryID], function (err, rows, fields) {
                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }));
                } else {
                    if (rows.length > 0) {
                        res.send(JSON.stringify({ success: true, result: rows }));
                    } else {
                        res.send(JSON.stringify({ success: false, message: "DATA EMPTY" }));
                    }
                }
            })

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing categoryID" }));
        }

    }) 

   
})


//get all category 
router.get('/getAllCategory', function (req, res, next) {
    req.getConnection(function (err, connect) {
        connect.query('SELECT ID,Name FROM category', function (err, rows, fields) {
            if (err) {
                res.statu(500)
                res.send(JSON.stringify({ success: false, message: err.message }));
            } else {
                if (rows.length > 0) {
                    res.send(JSON.stringify({ success: true, result: rows }));
                } else {
                    res.send(JSON.stringify({ success: false, message:"DATA EMPTY" }));
                }
            }
        })
    })
})


//get category by storyId
router.get('/getCategoryByStoryID',function (req, res, next) {

    req.getConnection(function (err, connect) {
        var storyID = req.query.storyID;
        if (storyID != null) {

            connect.query('SELECT ID,Name'
                + ' FROM category WHERE ID IN (SELECT CategoryID FROM mangacategory WHERE MangaID=?)', [storyID], function (err, rows, fields) {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }));
                    } else {
                        if (rows.length > 0) {
                            res.send(JSON.stringify({ success: true, result: rows }));
                        } else {
                            res.send(JSON.stringify({ success: false, message: "DATA EMPTY" }));
                        }
                    }
                })

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing storyID" }));
        }

    })


})


//get chapter by storyID
router.get('/getChapterByStoryID', function (req, res, next) {

    req.getConnection(function (err, connect) {
        var storyID = req.query.storyID;
        if (storyID != null) {

            connect.query('SELECT ID,Name'
                + ' FROM `chapter` WHERE MangaID=?', [storyID], function (err, rows, fields) {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }));
                    } else {
                        if (rows.length > 0) {
                            res.send(JSON.stringify({ success: true, result: rows }));
                        } else {
                            res.send(JSON.stringify({ success: false, message: "DATA EMPTY" }));
                        }
                    }
                })

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing categoryID" }));
        }

    })


})

//get content story by chapter
router.get('/getContentStoryByChapterID', function (req, res, next) {

    req.getConnection(function (err, connect) {
        var ChapterID = req.query.ChapterID;
        if (ChapterID != null) {

            connect.query('SELECT ID,Link'
                + ' FROM `link` WHERE ChapterID=?', [ChapterID], function (err, rows, fields) {
                    if (err) {
                        res.status(500)
                        res.send(JSON.stringify({ success: false, message: err.message }));
                    } else {
                        if (rows.length > 0) {
                            res.send(JSON.stringify({ success: true, result: rows }));
                        } else {
                            res.send(JSON.stringify({ success: false, message: "DATA EMPTY" }));
                        }
                    }
                })

        } else {
            res.send(JSON.stringify({ success: false, message: "Missing categoryID" }));
        }

    })


})


///password encrypt
var genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex') // convert to hexa format
        .slice(0,length);
};

var sha512 = function (password, salt) {
    var hash = crypto.createHmac('sha512',salt);
    hash.update(password);

    var value = hash.digest('hex');
    return {
        Salt: salt,
        passwordHash: value
    };
};

function saltHashPassword(userPassword) {
    var salt = genRandomString(16); // random with 16 character
    var passwordData = sha512(userPassword,salt);
    return passwordData;
}

/*==== funtion test hash password  */
/*
router.get('/getHashPassword', function (req, res, next) {
    console.log('password : 12345');
    var encrypt = saltHashPassword("12345");
    console.log('Encrypt: ' + encrypt.passwordHash);
    console.log('Salt : ' + encrypt.Salt);
})
*/
/*==== funtion test hash password  */

/*==== POST USER FORM ====  */
router.post('/newUser', function (req, res, next) {

    req.getConnection(function (err, connect) {

        var post_data = req.body;

        var uid = uuid.v4();

        var email = post_data.Email;
        var name = post_data.userName;


        var plaint_password = post_data.password;

        var hash_data = saltHashPassword(plaint_password);

        var password = hash_data.passwordHash;

        var salt = hash_data.Salt;

        if (email != null && name != null && password != null) {
            connect.query('SELECT * FROM `user` WHERE Email=?', [email], function (err, result, fields) {

                if (err) {
                    res.status(500)
                    res.send(JSON.stringify({ success: false, message: err.message }));
                } else {
                    if (result && result.length) {
                        res.send(JSON.stringify({ success: true, message: "User already exists" }));
                    } else {
                        connect.query('INSERT INTO `user`(`Unique_id`, `Email`, `UserName`, `UserPassword`, `Salt`, `Create_at`, `Update_at`)'
                            + ' VALUES(?,?,?,?,?,NOW(),NOW())', [uid, email, name, password, salt], function (err, result, fields) {

                                if (err) {
                                    res.status(500)
                                    res.send(JSON.stringify({ success: false, message: err.message }));
                                }
                                else {
                                    if (result.affectedRows > 0) {
                                        res.send(JSON.stringify({ success: true, message: "Success" }));
                                    }
                                }
                            })

                    }
                }
            })
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing email, name, password and id" }));
        }

    })

})


function checkHashPassword(userPassword, salt) {
    var passwordData = sha512(userPassword, salt);
    return passwordData;
}
// login 
router.post('/login', function (req, res, next) {
    req.getConnection(function (err, connect) {

        var post_data = req.body;

        var email = post_data.Email;
        var userPassword = post_data.password;

        connect.query('SELECT * FROM `user` WHERE Email=?', [email], function (err, rows, fields) {

            if (err) {
                res.status(500);
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
            else {
                if (rows && rows.length) {
                    var salt = rows[0].Salt; // get salt of rows if user exists
                    console.log("salt", salt + "");
                    var encrypted_password = rows[0].UserPassword;
                    console.log("password", encrypted_password + "");

                    //hash password from login request with salt in database
                    var hashed_password = checkHashPassword(userPassword,salt).passwordHash;
                    console.log("passwordE", hashed_password + "");
                    console.log("passwordF", userPassword + " " + salt);

                    if (encrypted_password == hashed_password) {
                        res.send(JSON.stringify({ success: true, result: rows[0] })) // if password = true return all infor
                        
                        
                    } else {
                        res.send(JSON.stringify({ success: false, message: "Wrong password" }));
                    }
                    
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "User not exist" }));
                }
            }
        })

    })
})
/*==== POST USER FORM ====  */


module.exports = router