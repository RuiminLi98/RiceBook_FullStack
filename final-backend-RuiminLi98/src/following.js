const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const Profiles = require('./dbConnect').Profiles;
const Users = require('./dbConnect').Users
const thisLoginUser = require('./auth');
const profile = [{
    username: 'DLeebron',
    headline: 'This is DLeebron headline!',
    follower: [],
    email: 'foo@bar.com',
    zipcode: 12345,
    dob: '128999122000',
    avatar: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/DWLeebron.jpg/220px-DWLeebron.jpg'
}
]

function getFollowing(req, res) {
    let user = "";
    if (req.params.user)
        user = req.params.user;
    else
        user = req.username;
    Profiles.find ({ username: user}).exec(function(err, items) {
        items.forEach(item => {
            res.status(200).send({username: item.username, followers: item.followers});
        })
    })
}

function putFollowing(req, res) {
    let username = req.username;
    let newFollowers = req.params.user;
    let followers = [];
    if (newFollowers === username) {
        res.status(200).send({result: "you cannot follow yourself"})
        return;
    }
    let flag = 0;
    Profiles.find({username: newFollowers}).exec(function(err, items2) {
        if (items2.length === 0 || !items2) {
            flag = 1;
            res.status(400).send({result: "the follow user do not exist"})
            return;
        }
        Profiles.find({username: username}).exec(function(err, items3) {
            followers = items3[0].followers
            followers.push(newFollowers)
            Profiles.updateOne({ username: username }, {$set : { followers: followers}}, function (err, items) {
                res.status(200).send({username: username, following: followers})
            })
        })
    })
    //
    // Profiles.find ({ username: username}).exec(function(err, items) {
    //
    //     followers.forEach(value => {
    //         if (value === newFollowers) {
    //             flag = 2;
    //         }
    //     })
    // if (flag === 2) {
    //     res.status(400).send({result: 'the user already be followed'})
    // }
    // else {
    //     followers.push(newFollowers);
    //     Profiles.updateOne({username: username}, {$set: {followers: followers}}, function (err, items3) {
    //         res.status(200).send({username: username, followers: followers});
    //     })
    // }
    // })
}

function deleteFollowing(req, res) {
    let username = req.username;
    let newFollowers = req.params.user;
    let followers = [];
    Profiles.find ({ username: username}).exec(function(err, items) {
        followers = items[0].followers;
        const index = followers.indexOf(newFollowers);
        if (index > -1) {
            followers.splice(index, 1);
        }
        Profiles.updateOne({username: username}, {$set:{followers: followers}}, function(err, items) {
            res.status(200).send({username: username, followers: followers});
        })    })

}

module.exports = (app) => {
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.get('/following/:user?', getFollowing);
    app.put('/following/:user', putFollowing);
    app.delete('/following/:user', deleteFollowing);
}
