/**
 * Created by vhanssen on 3/19/15.
 */

var test = [
    [[1,2,3], 5],
    [[4,5,6], 3],
    [[1,4,5], 4]
]

var numbers = [1,2,3,4,5,6].sort();
var result = {};
var result_score = Number.MAX_VALUE;

traverseArray(test, 0, [], [], 0);

var traverseArray = function(test, pos, res, arr, score) {
    // If current solution is more costly than the best, don't check more
    if (score>result_score) {
        return;
    }
    // If we have a solution store it if it's better than before
    if (arr.equals(numbers)) {
        if (score<result_score) {
            console.log("Storing solution");
            console.log(res);
            result = res.slice();
            result_score = score;
        }
        return;
    }
    var i;
    for(i=pos+1;i<test.length;i++) {
        var dinner = test[i][0];
        var cost = test[i][1];
        // all participants must not be used already
        if (arr.indexOf(dinner[0])==-1 && arr.indexOf(dinner[1])==-1 && arr.indexOf(dinner[2])==-1) {
            
        }
    }
}

Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}