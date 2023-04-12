const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

//main router
router.get(`/:gameId`, (req, res) => {

  let gameId = req.params.gameId;
  //if game id is not a number
  if (isNaN(gameId)) return res.status(403).json({ errors: [{ code: 403, message: `Game id is not a number`, status: `Forbidden` }] });

  fetch(`https://api.roblox.com/universes/get-universe-containing-place?placeid=${gameId}`)
    .then(res => res.json())
    .then(json => {
      let universeid = json.UniverseId;

      fetch(`https://games.roblox.com/v1/games?universeIds=${universeid}`)
        .then(res => res.json())
        .then(json => {
          let name = json.data[0].name;
          let description = json.data[0].description;
          let active = json.data[0].playing;
          let visits = json.data[0].visits;
          let favourite = json.data[0].favouritedCount;

          fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeid}&size=256x256&format=Png&isCircular=false`)
            .then(res => res.json())
            .then(json => {
              let thumbnails = json.data[0].imageUrl;

              fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeid}`)
                .then(res => res.json())
                .then(json => {
                  let like = json.data[0].upVotes;
                  let dislike = json.data[0].downVotes;
                  let gameLink = `https://www.roblox.com/games/${gameId}`

                  res.json({ data: [{ name: name, description: description, thumbnails: thumbnails, active: active, visits: visits, favourite: favourite, like: like, dislike: dislike, gameLink: gameLink }] });
                }).catch(error => {
                  console.error(error),
                    res.status(400).json({ errors: [{ code: 400, message: `Invalid game id`, status: `Bad Request` }] });
                });
            }).catch(error => {
              console.error(error),
                res.status(400).json({ errors: [{ code: 400, message: `Invalid game id`, status: `Bad Request` }] });
            });
        }).catch(error => {
          console.error(error),
            res.status(400).json({ errors: [{ code: 400, message: `Invalid game id`, status: `Bad Request` }] });
        });
    }).catch(error => {
      console.error(error),
        res.status(400).json({ errors: [{ code: 400, message: `Invalid game id`, status: `Bad Request` }] });
    });

});

//support axios
router.get(`/:gameId/axios`, (req, res) => {

  let gameId = req.params.gameId;
  //if game id is not a number
  if (isNaN(gameId)) return res.status(403).json([{ code: 403, message: `Game id is not a number`, status: `Forbidden` }]);

  fetch(`https://api.roblox.com/universes/get-universe-containing-place?placeid=${gameId}`)
    .then(res => res.json())
    .then(json => {
      let universeid = json.UniverseId;

      fetch(`https://games.roblox.com/v1/games?universeIds=${universeid}`)
        .then(res => res.json())
        .then(json => {
          let name = json.data[0].name;
          let description = json.data[0].description;
          let active = json.data[0].playing;
          let visits = json.data[0].visits;
          let favourite = json.data[0].favouritedCount;

          fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeid}&size=256x256&format=Png&isCircular=false`)
            .then(res => res.json())
            .then(json => {
              let thumbnails = json.data[0].imageUrl;

              fetch(`https://games.roblox.com/v1/games/votes?universeIds=${universeid}`)
                .then(res => res.json())
                .then(json => {
                  let like = json.data[0].upVotes;
                  let dislike = json.data[0].downVotes;
                  let gameLink = `https://www.roblox.com/games/${gameId}`

                  res.json( [{ name: name, description: description, thumbnails: thumbnails, active: active, visits: visits, favourite: favourite, like: like, dislike: dislike, gameLink: gameLink }] );
                }).catch(error => {
                  console.error(error),
                    res.status(400).json( [{ code: 400, message: `Invalid game id`, status: `Bad Request` }] );
                });
            }).catch(error => {
              console.error(error),
                res.status(400).json( [{ code: 400, message: `Invalid game id`, status: `Bad Request` }] );
            });
        }).catch(error => {
          console.error(error),
            res.status(400).json( [{ code: 400, message: `Invalid game id`, status: `Bad Request` }] );
        });
    }).catch(error => {
      console.error(error),
        res.status(400).json( [{ code: 400, message: `Invalid game id`, status: `Bad Request` }] );
    });

});

//cant get invalid game id
router.use(function (err, req, res, next) {

  res.status(400).json({ errors: [{ code: 400, message: `Invalid game id`, status: `Bad Request` }] });

})

//cant get game id
router.get(`/`, (req, res) => {

  res.status(404).json({ errors: [{ code: 404, message: `Game id not found!`, status: `Not Found` }] });

});

//some client error: 400 (invalid game id), 403 (cant get game id), 404 (game id not found)

module.exports = router;