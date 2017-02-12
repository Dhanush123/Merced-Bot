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
var prodIDS = [];
var city = "";
var cardsSend = [];

restService.get("/p", function (req, res) {
  console.log("hook request");
  try {
      if (req) {
        if(req.query.jerq){
          jacketType = req.query.jerq;
          if(req.query.location){
            city = req.query.location;
          }
          console.log("jacketType",jacketType);
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

// function getAllProducts(callback){
//   WooCommerce.get('products', function(err, data, res) {
//     console.log(res);
//     products = JSON.parse(res);
//   });
// }

function getJackets(req, callback){
  cardsSend = [];
  WooCommerce.get('products?per_page=100', function(err, data, res) {
    // var cardsTemp = [];
    console.log(res);
    products = JSON.parse(res);
    console.log("inside getJackets method");
    // var matchingJackets = [];
    var searchTerm = (jacketType != "NONE" && jacketType != "NO") ? jacketType : "Jackets";
    console.log("products.length",products.length);
    for(var x = 0; x < products.length; x++){
      for(var y = 0; y < products[x].tags.length; y++){
        console.log("tags",products[x].tags);
        if(products[x].tags[y].name == searchTerm){
          console.log("matching tags found");
          var payInfo = {
            payment_method: 'bacs',
            payment_method_title: 'Direct Bank Transfer',
            set_paid: true,
            billing: {
              first_name: 'Dhanush',
              last_name: 'Patel',
              city: 'San Francisco',
              country: 'US',
              email: 'dhanush.patel@ymail.com',
              phone: '(123) 456-7890'
            },
            shipping: {
              first_name: 'Dhanush',
              last_name: 'Patel',
              city: 'San Francisco',
              country: 'US'
            },
            line_items: [
              {
                product_id: products[x].id,
                quantity: 1
              }
            ],
            shipping_lines: [
              {
                method_id: 'flat_rate',
                method_title: 'Flat Rate',
                total: 10
              }
            ]
          };
          // matchingJackets.push(products[x]);
          var cardObj = {
            title: "",
            image_url: "",
            subtitle: "",
            buttons: [{
              type: "web_url",
              url: "",
              title: "View Jacket"
            },
            {
              "type":"element_share"
            }]
          };
          console.log("creating cards");
          console.log("cardObj.title",products[x].name.substring(0,80));
          cardObj.title = products[x].name.substring(0,80);
          cardObj.image_url = products[x].images[0].src;
          cardObj.subtitle = products[x].regular_price;
          cardObj.buttons[0].url = products[x].permalink;
          cardsSend[x] = cardObj;
          doOrder(payInfo);
        }
      }
    }
    // for(var x = 0; x < matchingJackets.length; x++){
    //   var cardObj = {
    //     title: "",
    //     image_url: "",
    //     subtitle: "",
    //     buttons: [{
    //       type: "web_url",
    //       url: "",
    //       title: "View Jacket"
    //     }]
    //   };
    //   console.log("creating cards");
    //   console.log("cardObj.title",matchingJackets[x].name.substring(0,80));
    //   cardObj.title = matchingJackets[x].name.substring(0,80);
    //   cardObj.image_url = matchingJackets[x].images[0].src;
    //   cardObj.subtitle = matchingJackets[x].regular_price;
    //   cardObj.buttons[0].url = matchingJackets[x].permalink;
    //   cardsSend[x] = cardObj;
    // }
    console.log("should be exiting getJackets method");
    // for(var i = 0; i < cardsTemp.length; i++){
    //   if(cardsTemp[i] != null){
    //     console.log("legit jacket card!!!!!!!!!");
    //     cardsSend[i] = cardsTemp[i];
    //   }
    // }
    callback();
  });
}

function doOrder(payInfo){
  WooCommerce.post('orders', payInfo, function(err, data, res) {
    console.log(res);
  });
}

restService.listen((process.env.PORT || 8000), function () {
  console.log("Server listening");
});
