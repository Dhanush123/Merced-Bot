"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const WooCommerceAPI = require("woocommerce-api");
const request = require("request");
const weather = require('npm-openweathermap');

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
// api_key is required. You can get one at http://www.openweathermap.com/
weather.api_key = '8a06625d9e996bce4caee3926bf83e72';
weather.temp = 'f';

restService.get("/p", function (req, res) {
  console.log("hook request");
  try {
      if (req) {
        if(req.query.location){
          city = req.query.location;
        }
        //---------------------------
        if(req.query.jerq){
          jacketType = req.query.jerq;
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
        else if(req.query.serq){
          if(!city){
            city = "Merced";
          }
          console.log("city is",city);
          getSmartRecs(req, function(result) {
                     //callback is ultimately to return Messenger appropriate responses formatted correctly
                     console.log("results w/ getSmartRecs: ", cardsSend);
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
        else if (req.query.cerq){
          getCoupons(req, function(result) {
                     //callback is ultimately to return Messenger appropriate responses formatted correctly
                     console.log("results w/ getCoupons: ", cardsSend);
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

function getCoupons(req, callback){
  WooCommerce.get('coupons', function(err, data, res) {
    var coupons = JSON.parse(res);
    console.log(coupons);
    for(var x = 0; x < res.length; x++){
      if(coupons[x].description){
        var cardObj = {
          title: "",
          subtitle: "",
          buttons: [{
            "type":"element_share"
          }]
        };
        console.log("creating cards");
        console.log("cardObj.title",coupons[x].description.substring(0,80));
        cardObj.title = products[x].description.substring(0,80);
        cardObj.subtitle = "Discount: " + products[x].amount + "%";
        cardsSend.push(cardObj);
      }
    }
  });
}
function getSmartRecs(req, callback){

  weather.get_weather_custom('city', city+',us', 'forecast').then(function(res){
    console.log(res);
    var tempF = 9.0/5.0 * ((res[0].main.temp) - 273) + 32;
    var searchTerm = tempF > 68 ? "Hot" : "Cold";
    cardsSend = [];
    WooCommerce.get('products?per_page=100', function(err, data, res) {
      console.log(res);
      products = JSON.parse(res);
      console.log("inside getSmartRecs method");
      console.log("products.length",products.length);
      for(var x = 0; x < products.length; x++){
        for(var y = 0; y < products[x].tags.length; y++){
          console.log("tags",products[x].tags);
          if(products[x].tags[y].name == searchTerm){
            console.log("matching tags found");
            var cardObj = {
              title: "",
              image_url: "",
              subtitle: "",
              buttons: [{
                type: "web_url",
                url: "",
                title: "View Clothing"
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
            if(cardsSend.length < 10){
              cardsSend.push(cardObj);
            }
          }
        }
      }
      console.log("should be exiting getSmartRecs method");
      callback();
    });
  },function(error){
      console.log(error);
  });
  // var options = {
  //   url: "api.openweathermap.org/data/2.5/weather?q="+city+",us&APPID=ac0889c32e5d10abd3c6f4e3edd0af1f&callback=test",
  //   method: "GET"
  // };
  // console.log("weather url",options.url);
  // request(options,
  // function (res) {
  //     res = JSON.parse(res);
  //     console.log("weather res: " + JSON.stringify(res));

}

function getJackets(req, callback){
  cardsSend = [];
  WooCommerce.get('products?per_page=100', function(err, data, res) {
    console.log(res);
    products = JSON.parse(res);
    console.log("inside getJackets method");
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
          cardsSend.push(cardObj);
          doOrder(payInfo);
        }
      }
    }
    console.log("should be exiting getJackets method");
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
