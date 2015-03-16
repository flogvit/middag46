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
var bunyan = require('bunyan').createLogger({
  name: 'middag46',
  streams: [
    {
      level: 'info',
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
        familydinners[dinner[0]] += 1;
        familydinners[dinner[1]] += 1;
        familydinners[dinner[2]] += 1;
        var connection1 = dinner[0] + ":" + dinner[1];
        var connection2 = dinner[0] + ":" + dinner[2];
        var connection3 = dinner[1] + ":" + dinner[2];
        dinners[connection1] += 1;
        dinners[connection2] += 1;
        dinners[connection3] += 1;
        if (!connection1 in dinnerslast) {
          dinnerslast[connection1] = date;
        } else if (dinnerslast[connection1] < date) {
          dinnerslast[connection1] = date;
        }
        if (!connection2 in dinnerslast) {
          dinnerslast[connection2] = date;
        } else if (dinnerslast[connection2] < date) {
          dinnerslast[connection2] = date;
        }
        if (!connection3 in dinnerslast) {
          dinnerslast[connection3] = date;
        } else if (dinnerslast[connection3] < date) {
          dinnerslast[connection3] = date;
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
 * Line: <id>;<active>;<name>;<address>;<phone>
 */
var readFamilies = function(cb) {
  fs.exists(familiesFile, function(exists) {
    if (exists) {
      lineReader.eachLine(familiesFile, function (line) {
        var family = line.split(";");
        if (family[1]) {
          families[family[0]] = {
            "name": family[2],
            "address": family[3],
            "phone": family[4]
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

var doCalculate = function() {
  bunyan.info("Starting calculation");
}

readFamilies(function() {
  readDinners(function() {
    doCalculate();
  })
})