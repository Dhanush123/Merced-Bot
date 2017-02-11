"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const restService = express();
restService.use(bodyParser.json());

var products = [];
var jacketType = "";
var cardsSend = [];

restService.get("/p", function (req, res) {
  console.log("hook request");
  try {
      if (req) {
        if(req.query.jerq){
          jacketType = req.query.jerq;
          getJackets(req, function(result) {
                     //callback is ultimately to return Messenger appropriate responses formatted correctly
                     console.log("results w/ getJackets: ", cardsSend);
                     if(cardsSend){
                       return res.json({
                         results: cardsSend,
                       });
                     }
                     else{
                       return res.json({
                         err: "NOCARDSFOUND"
                       });
                     }
                   });
        }
        else if(req.query.serq || req.query.yerq == ""){
          getShoes(req, function(result) {
                     //callback is ultimately to return Messenger appropriate responses formatted correctly
                     console.log("results w/ getShoes: ", cardsSend);
                     if(cardsSend){
                       return res.json({
                         results: cardsSend,
                       });
                     }
                     else{
                       return res.json({
                         err: "NOCARDSFOUND"
                       });
                     }
                   });
        }
      }
  }
  catch (err) {
    console.error("Cannot process request", err);
    return res.status(400).json({
        status: {
            code: 400,
            errorType: err.message
        }
    });
  }
});

function getAllProducts(callback){
  WooCommerce.get('products', function(err, data, res) {
    console.log(res);
    products = JSON.parse(res);
    return callback();
  });
}

function getJackets(){
  getAllProducts({
    var matchingJackets = [];
    var searchTerm = (jacketType != "NONE" && jacketType != "NO") ? jacketType : "Jackets";
    for(var x = 0; x < lim; x++){
      if(products[x].tags.indexOf(searchTerm) > -1){
        matchingJackets.push(products[x]);
      }
    }
    var cardObj = {
      title: "",
      image_url: "",
      subtitle: "",
      buttons: [{
        type: "web_url",
        url: "",
        title: "View Jacket"
      }]
    };
    for(var x = 0; x < lim; x++){
      cardObj.title = x.name;
      cardObj.image_url = x.images[0];
      cardObj.subtitle = x.regular_price;
      cardObj.buttons[0].url = x.permalink;
      cardsSend[x] = cardObj;
    }
    return cardsSend;
  });
}
