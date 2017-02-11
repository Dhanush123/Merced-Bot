"use strict";

const express = require("express");
const bodyParser = require("body-parser");
var WooCommerceAPI = require('woocommerce-api');

var WooCommerce = new WooCommerceAPI({
  url: 'http://dhanushpatel.x10host.com/', // Your store URL
  consumerKey: 'ck_365a06a1c7fb871432485d71d8a5c3aa063fa958', // Your consumer key
  consumerSecret: 'cs_53601b80bf1829af2bfcaa1d90e44642d13b9249', // Your consumer secret
  wpAPI: true, // Enable the WP REST API integration
  version: 'wc/v1' // WooCommerce WP REST API version
});

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
  getAllProducts(function(){
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

restService.listen((process.env.PORT || 8000), function () {
  console.log("Server listening");
});
