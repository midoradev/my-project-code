const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const statuses = {
    false: "Offline",
    true: "Online"
}

//main router
router.get(`/:userId`, (req, res) => {

    let userId = req.params.userId;
    //if user id is not a number
    if (isNaN(userId)) return res.status(403).json({ errors: [{ code: 403, message: `User id is not a number`, status: `Forbidden` }] });

    fetch(`https://users.roblox.com/v1/users/${userId}`)
        .then(res => res.json())
        .then(json => {
            let name = json.name;
            let displayName = json.displayName;
            let about = json.description;
            let joinDate = json.created;
            fetch(`https://api.roblox.com/users/${userId}`)
                .then(res => res.json())
                .then(json => {
                    let isonline = json.IsOnline;
                    let status = statuses[isonline];
                    fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=352x352&format=Png`)
                        .then(res => res.json())
                        .then(json => {
                            let avatar = json.data[0].imageUrl;

                            fetch(`https://api.roblox.com/users/${userId}/onlinestatus`)
                                .then(res => res.json())
                                .then(json => {
                                    let lastOnline = json.LastOnline;
                                    let userProfile = `https://www.roblox.com/users/${userId}/profile`;

                                    res.json({ data: [{ name: name, displayName: displayName, about: about, avatar: avatar, status: status, joinDate: joinDate, lastOnline: lastOnline, userProfile: userProfile }] });
                                }).catch(error => {
                                    console.error(error),
                                        res.status(400).json({ errors: [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] });
                                });
                            
                        }).catch(error => {
                            console.error(error),
                                res.status(400).json({ errors: [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] });
                        });
                }).catch(error => {
                    console.error(error),
                        res.status(400).json({ errors: [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] });
                });
        }).catch(error => {
            console.error(error),
                res.status(400).json({ errors: [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] });
        });
});

//support axios
router.get(`/:userId/axios`, (req, res) => {

    let userId = req.params.userId;
    //if user id is not a number
    if (isNaN(userId)) return res.status(403).json([{ code: 403, message: `User id is not a number`, status: `Forbidden` }]);

    fetch(`https://users.roblox.com/v1/users/${userId}`)
        .then(res => res.json())
        .then(json => {
            let name = json.name;
            let displayName = json.displayName;
            let about = json.description;
            let joinDate = json.created;
            fetch(`https://api.roblox.com/users/${userId}`)
                .then(res => res.json())
                .then(json => {
                    let isonline = json.IsOnline;
                    let status = statuses[isonline];
                    fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=352x352&format=Png`)
                        .then(res => res.json())
                        .then(json => {
                            let avatar = json.data[0].imageUrl;

                            fetch(`https://api.roblox.com/users/${userId}/onlinestatus`)
                                .then(res => res.json())
                                .then(json => {
                                    let lastOnline = json.LastOnline;
                                    let userProfile = `https://www.roblox.com/users/${userId}/profile`;

                                    res.json( [{ name: name, displayName: displayName, about: about, avatar: avatar, status: status, joinDate: joinDate, lastOnline: lastOnline, userProfile: userProfile }] );
                                }).catch(error => {
                                    console.error(error),
                                        res.status(400).json( [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] );
                                });
                            
                        }).catch(error => {
                            console.error(error),
                                res.status(400).json( [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] );
                        });
                }).catch(error => {
                    console.error(error),
                        res.status(400).json( [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] );
                });
        }).catch(error => {
            console.error(error),
                res.status(400).json( [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] );
        });
});

// router.get(`/:userId/presence`, (req, res) => {

//     let userId = req.params.userId;
//     //if user id is not a number
//     if (isNaN(userId)) return res.status(403).json({ errors: [{ code: 403, message: `User id is not a number`, status: `Forbidden` }] });

//     fetch(`https://users.roblox.com/v1/users/${userId}`)
//         .then(res => res.json())
//         .then(json => {
//             let name = json.name;
//             let displayName = json.displayName;
//             fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=352x352&format=Png`)
//             .then(res => res.json())
//             .then(json => {
//                 let avatar = json.data[0].imageUrl;

//                 fetch(`https://api.roblox.com/users/${userId}/onlinestatus`)
//                     .then(res => res.json())
//                     .then(json => {
//                         let status = json.LastLocation;
//                         let lastOnline = json.LastOnline;
                        
//                             let onlineTime = new Date().getTime();
//                             res.json({ data: [{ name: name, displayName: displayName, avatar: avatar, status: status, onlineTime: onlineTime, lastOnline: lastOnline }] });

//                     }).catch(error => {
//                         console.error(error),
//                             res.status(400).json({ errors: [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] });
//                     });
                
//             }).catch(error => {
//                 console.error(error),
//                     res.status(400).json({ errors: [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] });
//             });
//         }).catch(error => {
//             console.error(error),
//                 res.status(400).json({ errors: [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] });
//         });
// });

//cant get invalid user id
router.use(function (err, req, res, next) {

    res.status(400).json({ errors: [{ code: 400, message: `Invalid user id`, status: `Bad Request` }] });

})

//cant get user id
router.get(`/`, (req, res) => {

    res.status(404).json({ errors: [{ code: 404, message: `User id not found!`, status: `Not Found` }] });

});

//some client error: 400 (invalid user id), 403 (cant get user id), 404 (user id not found)

module.exports = router;