var request = require('request');
var _ = require('lodash');
var async = require('async');

var options = {
    url: 'https://api.github.com/repos/facebook/react/issues',
    headers: {
        'User-Agent': 'request'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        var issuePages = getMaxPages(response.headers.link);
        var issues = getIssues(body);

        //takes a range to operate on the collection
        async.mapSeries(_.range(2, issuePages), function(i, done) {
            var options2 = {
                url: 'https://api.github.com/repos/facebook/react/issues?page=' + i, //
                headers: {
                    'User-Agent': 'request'
                }
            };
            request(options2, function(error2, response2, body2){
                done(null, getIssues(body))
            })
        },function(error, results){
            var finalResults = _.concat(issues, _.flatten(results));
            console.log(finalResults, finalResults.length)
        })

    }
}

//main content of issues
function getIssues(body) {
    // local variables
    var info = JSON.parse(body);

    //gets all things that don't have .pull_request
    return _.reject(info, function(item) {
        return item.pull_request;
    })
}

//gets how many pages of issues there are
function getMaxPages(linkHeader) {
    var exp = /page=(\d+)>; rel="last"/
        //you operate on the string with .match, and argument is the regexp
    return parseInt(linkHeader.match(exp)[1]);
}

request(options, callback);