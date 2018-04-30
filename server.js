var http = require('http');
//var urlData = require('url');
var express = require('express');
var request = require('sync-request');
var request2 = require('request');
var yelp = require('yelp-fusion');

var app = express();

app.get('/search', function (req, res) {
    console.log('connected');
    res.header('Access-Control-Allow-Origin','*');
    // console.log(req.query);
    var formdata = req.query;

    var lat;
    var lon;
    var status = "OK";

    if(formdata['gridRadios'] == 'option2'){
        var location = encodeURI(formdata['inputLocation']);
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+location+'&key=AIzaSyBujGjblZKUI3x7RPPeuuibylg57cxIikg';
        var geoJson = JSON.parse(request('GET', url).getBody('utf8'));

        //console.log(geoJson["status"]);
        if(geoJson["status"]=="OK") {
            lat = geoJson["results"][0]["geometry"]["location"]["lat"];
            lon = geoJson["results"][0]["geometry"]["location"]["lng"];

        }
        else if(geoJson["status"]=="ZERO_RESULTS") {
            status="ZERO_RESULTS";
        }
        else{
            status="FAILED";
        }

    }else{
        lat = formdata['lat'];
        lon = formdata['lon'];
    }

    // console.log(lat,lon);
    var keyword = encodeURI(formdata['keyword']);
    var category = encodeURI(formdata['category']);
    var distance = formdata['inputDistance'] * 1609 ;

    var placeUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lon+'&radius='+distance+'&type='+category+'&keyword='+keyword+'&key=AIzaSyCxF6BWr5FLMiSJyD5DYjDvPDVQHUB3Bco';
    // var placeJson = JSON.parse(request('GET', placeUrl).getBody('utf8'));
    if(status=="OK") {

        request2(placeUrl, function (err, response, body) {

            if (!err) {
                var placeJson = JSON.parse(body);

                res.send(placeJson);
            } else {
                var placeJson = {"failed": "FAILED"};
                res.send(placeJson);
            }
        })
    }else if(status=="ZERO_RESULTS"){
        var placeJson = {"failed": "ZERO_RESULTS"};
        res.send(placeJson);
    }else{
        var placeJson = {"failed": "FAILED"};
        res.send(placeJson);
    }

    //res.send('Hello World' + req.query.symbol);

})

app.get('/next', function (req, res) {
    console.log('connected');
    res.header('Access-Control-Allow-Origin','*');
    console.log(req);
    var nextToken = req.query.nextToken;
    var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken="+nextToken+"&key=AIzaSyCxF6BWr5FLMiSJyD5DYjDvPDVQHUB3Bco";
    request2(url, function (err, response, body) {

        if (!err) {
            var placeJson = JSON.parse(body);
            console.log(placeJson);
            res.send(placeJson);
        }
    })


})

app.get('/yelp', function (req, res) {
    console.log('connected');
    res.header('Access-Control-Allow-Origin','*');

    const client = yelp.client("H6gyxq0cWPTF-artq-tWuWHwjxwK7dP8WN9WaByfW8G93kjOFx_Di0LsK7qzpA7ksq6njhPbOP7EyuNyzFYb004c_l5QZLNyq4NUi_lGD8FeF4TdRHTL4Qbe8ZPEWnYx");


    sp = req.query.formatted_address.split(",");

    var name = req.query.name;

    var state = sp[sp.length-2].trim().split(" ")[0];

    var city = sp[sp.length-3].trim();
    var address1= sp[0].trim();

    var id="";


    client.businessMatch('lookup', {
        name: name,
        address1: address1,
        city: city,
        state: state,
        country: 'US'
    }).then(response => {
        id = response.jsonBody.businesses;

        if(id != "")
        {
            client.reviews(id[0].alias).then(response => {
                //console.log(response.jsonBody);
                res.send(response.jsonBody);
            }).catch(e => {
                console.log(e);
                var yelpJson = {"failed": "FAILED"};
                res.send(yelpJson);
            });

        }else{
            var yelpJson = {"failed": "ZERO_RESULTS"};
            res.send(yelpJson);
        }

    }).catch(e => {
        var yelpJson = {"failed": "FAILED"};
        res.send(yelpJson);
    });




})

var server = app.listen(8081, function () {

    var host = server.address().address;
    var port = server.address().port;
    console.log("visiting http://%s:%s", host, port)

})













// var server = http.createServer(function(req,res){
//
//     console.log('connected');//创建连接成功显示在后台
//     //console.log(urlData.parse(req.url, true)['query']);
//
//     var formdata = urlData.parse(req.url, true)['query'];
//
//
//     var lat;
//     var lon;
//     if(formdata['gridRadios'] == 'option2'){
//         var location = encodeURI(formdata['inputLocation']);
//         var url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+location+'&key=AIzaSyBujGjblZKUI3x7RPPeuuibylg57cxIikg';
//         var geoJson = JSON.parse(request('GET', url).getBody('utf8'));
//
//         if(geojson["status"]=="OK") {
//             lat = geoJson["results"][0]["geometry"]["location"]["lat"];
//             lon = geoJson["results"][0]["geometry"]["location"]["lng"];
//         }
//
//     }else{
//         lat = formdata['lat'];
//         lon = formdata['lon'];
//     }
//     //console.log(lat, lon);
//     var keyword = encodeURI(formdata['keyword']);
//     var category = encodeURI(formdata['category']);
//     var distance = formdata['inputDistance'] * 1609 ;
//
//     var placeUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lon+'&radius='+distance+'&type='+category+'&keyword='+keyword+'&key=AIzaSyCxF6BWr5FLMiSJyD5DYjDvPDVQHUB3Bco';
//     var placeJson = JSON.parse(request('GET', placeUrl).getBody('utf8'));
//
//
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.writeHeader(200,{
//         'content-type' : 'application/json;charset="utf-8"'
//     });
//
//     res.write(JSON.stringify(placeJson));
//     res.end();
//
// }).listen(8888);
