/**
 * Created by vhanssen on 3/16/15.
 */

var familiesFile = "families.txt";
var dinnersFile = "dinners.txt";
var families = {};
var familydinners = {};
var dinners = {};
var dinnerslast = {};

var lineReader = require('line-reader');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var bunyan = require('bunyan').createLogger({
  name: 'middag46',
  streams: [
    {
      level: 'debug',
      path: 'middag46.log'
    }
  ]
});

/*
 * Line: <date>;<familyid:1>;<familyid:2>;<familyid:3>
 */
var readDinners = function(cb) {
    fs.exists(dinnersFile, function(exists) {
        if (exists) {
            lineReader.eachLine(dinnersFile, function (line) {
                var dinner = line.split(";");
                var date = Date.parse(dinner.shift());
                dinner.sort();
                if (dinner[0] in families)
                    familydinners[dinner[0]] = dinner[0] in familydinners ? familydinners[dinner[0]]+1 : 1;
                if (dinner[1] in families)
                    familydinners[dinner[1]] = dinner[1] in familydinners ? familydinners[dinner[1]]+1 : 1;
                if (dinner[2] in families)
                    familydinners[dinner[2]] = dinner[2] in familydinners ? familydinners[dinner[2]]+1 : 1;
                var connection = dinner[0] + ":" + dinner[1] + ":" + dinner[2];
                var connection1 = dinner[0] + ":" + dinner[1];
                var connection2 = dinner[0] + ":" + dinner[2];
                var connection3 = dinner[1] + ":" + dinner[2];
                dinners[connection1] = connection1 in dinners ? dinners[connection1]+1 : 1;
                dinners[connection2] = connection2 in dinners ? dinners[connection2]+1 : 1;
                dinners[connection3] = connection3 in dinners ? dinners[connection3]+1 : 1;
                if (!(connection in dinnerslast)) {
                    dinnerslast[connection] = date;
                } else if (dinnerslast[connection] < date) {
                    dinnerslast[connection] = date;
                }
            }).then(function () {
                bunyan.info("Finished reading dinners");
                cb();
            });
        } else {
            cb();
        }
    });
}

/*
 * Line: <id>;<active>;<count>;<name>;<address>;<phone>;<email>
 */
var readFamilies = function(cb) {
  fs.exists(familiesFile, function(exists) {
    if (exists) {
      lineReader.eachLine(familiesFile, function (line) {
        var family = line.split(";");
        if (family[1]==1) {
            bunyan.debug("Adding family: "+family[0]);
            families[family[0]] = {
                "count": family[2],
                "name": family[3],
                "address": family[4],
                "phone": family[5],
                "email": family[6]
            };
        }
      }).then(function () {
        bunyan.info("Finished reading families");
        cb();
      });
    } else {
      cb();
    }
  });
}

var getHighestFamily = function(cb) {
    var result = null;
    var highest = 0;
    _.keys(families).forEach(function(item) {
        bunyan.debug("Checking item: "+item);
        if((item in familydinners && familydinners[item]>highest) || result == null) {
            result = item;
            highest = familydinners[item];
        }
    })
    bunyan.debug("Returning family: "+result);
    cb(null, result);
}

var doCalculate = function() {
    bunyan.info("Starting calculation");
    var family;
    calculateNext(function(dinner) {
        console.log(dinner);
        calculateNext(function(dinner2) {
            console.log(dinner2);
        })
    })
}

var calculateNext = function(cb) {
    var score = Number.MAX_VALUE;
    var result = [];
    getHighestFamily(function(err, family) {
        bunyan.debug("Got family: "+family);
        _.keys(families).forEach(function(family2) {
            _.keys(families).forEach(function(family3) {
                if (family!=family2 && family!=family3 && family2 != family3) {
                    var famarr = [family, family2, family3].sort();
                    var nscore = 0;
                    if (famarr[0]+":"+famarr[1] in dinners)
                        nscore += dinners[famarr[0]+":"+famarr[1]];
                    if (famarr[0]+":"+famarr[2] in dinners)
                        nscore += dinners[famarr[0]+":"+famarr[2]];
                    if (famarr[1]+":"+famarr[2] in dinners)
                        nscore += dinners[famarr[1]+":"+famarr[2]]
                    if (nscore<score) {
                        result = famarr;
                        score = nscore;
                    }
                }
            })
        })
        var dinner = result[0]+":"+result[1]+":"+result[2];
        console.log("Checking "+dinner);
        // If this has been a dinner before, pick the oldest dinner instead
        if (dinner in dinnerslast) {
            console.log("Found old dinner");

            cb([]);
        } else {
            delete families[result[0]];
            delete families[result[1]];
            delete families[result[2]];
            cb(result);
        }
    });
}

readFamilies(function() {
  readDinners(function() {
      console.log(families);
      console.log(dinners);
    doCalculate();
  })
})