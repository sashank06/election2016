(function () {
  angular.module('app').controller('SearchController', ['$location', 'searchService', 'Notification', SearchController]);

  function SearchController($location, searchService, Notification) {
    var controller = this;
    controller.data = {
      results: {
        search: {
          results: 0
        },
        tweets: [/*
          {
            "message": {
              "body": "Ir ao Maraca sem a camisa do Fluminense eu não perdôo. Fred mercenário de merda.",
              "favoritesCount": 1,
              "link": "http://twitter.com/Cris_BrandaoFFC/statuses/402807933144006656",
              "retweetCount": 3,
              "twitter_lang": "pt",
              "postedTime": "2013-11-19T14:37:49.000Z",
              "provider": {
                "link": "http://www.twitter.com",
                "displayName": "Twitter",
                "objectType": "service"
              },
              "actor": {
                "twitterTimeZone": "Brasilia",
                "summary": "Empresário, músico, coach e boêmio, mas não necessariamente nesta ordem. Tricolor de alma e coração desde 21 de julho de 1902. O resto é só perguntar.",
                "friendsCount": 143,
                "favoritesCount": 109,
                "location": {
                  "displayName": "Rio de Janeiro",
                  "objectType": "place"
                },
                "link": "http://www.twitter.com/Cris_BrandaoFFC",
                "postedTime": "2010-08-17T00:12:37.000Z",
                "image": "https://pbs.twimg.com/profile_images/510887712610848769/8HwV1Zeh_normal.jpeg",
                "links": [
                  {
                    "rel": "me",
                    "href": "http://instagram.com/crisbrandaoffc#"
            }
          ],
                "listedCount": 28,
                "id": "id:twitter.com:179298309",
                "languages": [
            "pt"
          ],
                "verified": false,
                "followersCount": 880,
                "utcOffset": "-7200",
                "statusesCount": 15428,
                "displayName": "Cris Brandão ★★★★ ",
                "preferredUsername": "Cris_BrandaoFFC",
                "objectType": "person"
              },
              "object": {
                "id": "object:search.twitter.com,2005:402807933144006656",
                "summary": "Ir ao Maraca sem a camisa do Fluminense eu não perdôo. Fred mercenário de merda.",
                "link": "http://twitter.com/Cris_BrandaoFFC/statuses/402807933144006656",
                "postedTime": "2013-11-19T14:37:49.000Z",
                "objectType": "note"
              },
              "twitter_entities": {
                "trends": [],
                "symbols": [],
                "urls": [],
                "hashtags": [],
                "user_mentions": []
              },
              "twitter_filter_level": "low",
              "id": "tag:search.twitter.com,2005:402807933144006656",
              "verb": "post",
              "generator": {
                "link": "http://twitter.com",
                "displayName": "Twitter Web Client"
              },
              "objectType": "activity"
            },
            "cde": {
              "author": {
                "location": {
                  "state": "",
                  "country": "BRAZIL",
                  "city": "Rio de Janeiro"
                },
                "parenthood": {
                  "isParent": "true"
                },
                "maritalStatus": {
                  "isMarried": "true"
                },
                "gender": "male"
              }
            }
    }
        */]
      },
      selected: {},
      query: "",
      link_to_share: ""
    };
  
    var queryBuilder = $('#query-builder');
    queryBuilder.queryBuilder({
      plugins: [
        'filter-description',
        'bt-tooltip-errors'
        ],
      lang: {
        "add_rule": "Add criteria"
      },
      filters: queryDemocrats
    });

    // Call Insights for Twitter service and retrieve results
    controller.search = function (countOnly) {
      var queryRules = queryBuilder.queryBuilder('getRules');
      console.info("Rules are", queryRules);

      // set the query as the URL so that it can be bookmarked
      $location.search('query', JSURL.stringify(queryRules));

      controller.data.link_to_share = $location.absUrl();
      
      // build the Insights for Twitter query string
      var queryString = buildQueryString(queryRules);
      controller.data.query = queryString;
      controller.data.results = {
        search: {
          results: 0
        },
        tweets: []
      };
      controller.data.selected = {};

      // call the service
      searchService.search(queryString, countOnly).then(
        function (data) {
          console.log("Found ", data);

          controller.data.results = data;

          // fill source code
          $("#results-raw").removeClass("prettyprinted").text(angular.toJson(data, 2));
          var resultdata=angular.toJson(data,2);
          
//          raja
          var data=parseJSON(resultdata);
          console.log(data);
  		var visualization = d3plus.viz()
  	    .container("#vis")
  	    .data(data)
  	    .type("bar")
  	    .id("name")
  	    .x("name")
  	    .y("value")
  	    .draw()
  	    
          prettyPrint();
        });
    };

    // select an element from the results and display details
    controller.select = function (tweet) {
      console.info("Selecting", tweet);
      controller.data.selected = tweet;

      $("#selected-tweet").text("");
      $("#selected-tweet-raw").removeClass("prettyprinted").text(angular.toJson(tweet, 2));
      prettyPrint();

      //"id": "tag:search.twitter.com,2005:597277951177003009",
      var tweetId = tweet.message.id.substring(tweet.message.id.lastIndexOf(':') + 1);
      console.info("Displaying tweet with id", tweetId);

      twttr.widgets.createTweet(
          tweetId,
          document.getElementById('selected-tweet'), {
            align: 'center'
          })
        .then(function (el) {});
    };
    
    // initialize fields from the query parameter or with default
    var queryParam = $location.search().query;
    if (queryParam) {
      try {
        queryBuilder.queryBuilder('setRules', JSURL.parse(queryParam));
      } catch (err) {
        console.error("Can't restore query from URL:", err);
        // default to defaultQuery
        queryBuilder.queryBuilder('setRules', defaultQuery);
        // notify of a problem
        Notification.error("Oups! I could not restore the query from the link. The default query has been used instead.");
      }
    } else {
      queryBuilder.queryBuilder('setRules', defaultQuery);
    }
  }
})();

// Default query when none specified
var defaultQuery = {
  "condition": "AND",
  "rules": [ {
	  "id": "hashtag",
	  "field": "Hashtag",
	  "type": "string",
	  "input": "text",
      "description": "Matches Tweets with the hashtag #hashtag.",
      "values": "Hillary Clinton",
      "operators": ['equal', 'not_equal'],
      "data": {}
  }, {
    "id": "posted",
    "field": "posted",
    "type": "date",
    "input": "text",
    "operator": "greater_or_equal",
    "value": "2015-07-01",
    "data": {}
  }]
};

//
// Definitions of the query filters
//

function sanitize(string) {
  return string.replace('"', '\'');
}

function enclose(string) {
  if (string.indexOf(' ') != -1) {
    return '"' + string + '"';
  } else {
    return string;
  }
}

var convertSimpleWord = {
  convert: function convertSimpleWord(rule) {
    return (rule.operator == "equal" ? "" : "-") + enclose(sanitize(rule.value));
  }
};

var convertSimpleSelect = {
  convert: function (rule) {
    return (rule.operator == "equal" ? "" : "-") + rule.id + ":" + rule.value;
  }
};

var convertSimpleSelectHashtag = {
		  convert: function (rule) {
		    return (rule.operator == "equal" ? "" : "-") + enclose(sanitize(rule.value) );
		  }
		};

var convertWithQuotes = {
  convert: function (rule) {
    return (rule.operator == "equal" ? "" : "-") + rule.id + ":\"" + sanitize(rule.value) + "\"";
  }
};

var convertBoolean = {
  convert: function (rule) {
    return rule.value == "true" ? rule.id : "-" + rule.id;
  }
};

var convertRange = {
  convert: function (rule) {
    return (rule.operator == "not_between" ? "-" : "") + rule.id + ":" + rule.value;
  }
}

var passthrough = {
  convert: function (rule) {
    return rule.value;
  }
}

var queryLanguages = {
  'ar': "Arabic",
  'zh': "Chinese",
  'da': "Danish",
  'dl': "Dutch",
  'en': "English",
  'fi': "Finnish",
  'fr': "French",
  'de': "German",
  'el': "Greek",
  'he': "Hebrew",
  'id': "Indonesian",
  'it': "Italian",
  'ja': "Japanese",
  'ko': "Korean",
  'no': "Norwegian",
  'fa': "Persian",
  'pl': "Polish",
  'pt': "Portuguese",
  'ru': "Russian",
  'es': "Spanish",
  'sv': "Swedish",
  'th': "Thai",
  'tr': "Turkish",
  'uk': "Ukrainian"
};
var queryDemocratsCandidates={
		
		'HillaryClinton':"Hillary Clinton",
		'MartinOMalley':"Martin O'Malley",
		'BernieSanders':"Bernie Sanders"
};
// https://www.ng.bluemix.net/docs/services/Twitter/index.html#query_lang
var queryFilters = [
  {
    id: 'keyword',
    label: 'Keyword',
    type: 'string',
    description: 'Matches Tweets that have "keyword" in their body. The search is case-insensitive.',
    operators: ['equal', 'not_equal'],
    data: convertSimpleWord
  },
  {
    id: 'hashtag',
    label: 'Hashtag',
    type: 'string',
    description: 'Matches Tweets with the hashtag #hashtag.',
    operators: ['equal', 'not_equal'],
    data: convertSimpleWord
  },
  {
    id: 'bio_lang',
    label: 'Bio Language',
    type: 'string',
    input: 'select',
    description: 'Matches Tweets from users whose profile language settings match the specified language code.',
    values: queryLanguages,
    operators: ['equal', 'not_equal'],
    data: convertSimpleSelect
  },
  {
    id: 'bio_location',
    label: 'Location',
    type: 'string',
    description: 'Matches Tweets from users whose profile location setting contains the specified location reference.',
    operators: ['equal', 'not_equal'],
    data: convertWithQuotes
  },
  {
    id: 'country_code',
    label: 'Country Code',
    type: 'string',
    description: 'Matches Tweets whose tagged place or location matches the specified country code.',
    operators: ['equal', 'not_equal'],
    data: convertSimpleSelect
  },
  {
    id: 'followers_count',
    label: 'Followers Count',
    type: 'integer',
    description: 'Matches Tweets from users that have a number of followers that fall within the specified range. The upper bound is optional and both limits are inclusive.',
    operators: ['greater_or_equal', 'between', 'not_between'],
    data: convertRange
  },
  {
    id: 'friends_count',
    label: 'Friends Count',
    type: 'integer',
    description: 'Matches Tweets from users that follow a number of users that fall within the specified range. The upper bound is optional and both limits are inclusive.',
    operators: ['greater_or_equal', 'between', 'not_between'],
    data: convertRange
  },
  {
    id: 'from',
    label: 'From',
    type: 'string',
    description: 'Matches Tweets from users with the preferredUsername twitterHandle. Must not contain the @ symbol.',
    operators: ['equal', 'not_equal'],
    data: convertSimpleSelect
  },
  {
    id: 'has:children',
    label: 'Author has children',
    type: 'string',
    input: 'radio',
    description: 'Matches Tweets from users that have children.',
    operators: ['equal'],
    values: {
      "true": "Yes",
      "false": "No"
    },
    data: convertBoolean
  },
  {
    id: 'is:married',
    label: 'Author is married',
    type: 'string',
    input: 'radio',
    description: 'Matches Tweets from users that are married.',
    operators: ['equal'],
    values: {
      "true": "Yes",
      "false": "No"
    },
    data: convertBoolean
  },
  {
    id: 'is:verified',
    label: 'Author is verified',
    type: 'string',
    input: 'radio',
    description: 'Matches Tweets where the author has been verified by Twitter.',
    operators: ['equal'],
    values: {
      "true": "Yes",
      "false": "No"
    },
    data: convertBoolean
  },
  {
    id: 'lang',
    label: 'Language',
    type: 'string',
    input: 'select',
    description: 'Matches Tweets from a particular language.',
    values: queryLanguages,
    operators: ['equal', 'not_equal'],
    data: convertSimpleSelect
  },
  {
    id: 'listed_count',
    label: 'Listed Count',
    type: 'integer',
    description: 'Matches Tweets where Twitter\'s listing of the author falls within the specified range. The upper bound is optional and both limits are inclusive.',
    operators: ['greater_or_equal', 'between', 'not_between'],
    data: convertRange
  },
  //TODO point_radius:[longitude latitude radius]	
  {
    id: 'posted',
    label: 'Posted',
    type: 'date',
    description: 'Matches Tweets that have been posted at or after "startTime". The "endTime" is optional and both limits are inclusive.',
    operators: ['greater_or_equal', 'between', 'not_between'],
    validation: {
      format: 'YYYY-MM-DD'
    },
    plugin: 'datepicker',
    plugin_config: {
      format: 'yyyy-mm-dd',
      todayBtn: 'linked',
      todayHighlight: true,
      autoclose: true
    },
    data: convertRange
  },
  {
    id: 'sentiment',
    label: 'Sentiment',
    type: 'string',
    input: 'select',
    values: {
      'positive': 'Positive',
      'negative': 'Negative',
      'neutral': 'Neutral',
      'ambivalent': 'Ambivalent'
    },
    description: 'Matches Tweets with a particular sentiment.',
    operators: ['equal'],
    data: convertSimpleSelect
  },
  {
    id: 'statuses_count',
    label: 'Statuses Count',
    type: 'integer',
    description: 'Matches Tweets from users that have posted a number of statuses that falls within the specified range. The upper bound is optional and both limits are inclusive.',
    operators: ['greater_or_equal', 'between', 'not_between'],
    data: convertRange
  },
  {
    id: 'time_zone',
    label: 'Time zone or city',
    type: 'string',
    description: 'Matches Tweets from users whose profile settings match the specified time zone or city.',
    operators: ['equal', 'not_equal'],
    data: convertWithQuotes
  },
  {
    id: 'raw',
    label: 'Raw Query',
    type: 'string',
    description: '',
    operators: ['equal'],
    data: passthrough
  }

];

var queryDemocrats = [
                    
                    {
                      id: 'hashtag',
                      label: 'Hashtag',
                      type: 'string',
                      input: 'select',
                      description: 'Matches Tweets with the hashtag #hashtag.',
                      values: queryDemocratsCandidates,
                      operators: ['equal', 'not_equal'],
                      data: convertSimpleSelectHashtag
                    },
                    
                    //TODO point_radius:[longitude latitude radius]	
                    {
                      id: 'posted',
                      label: 'Posted',
                      type: 'date',
                      description: 'Matches Tweets that have been posted at or after "startTime". The "endTime" is optional and both limits are inclusive.',
                      operators: ['greater_or_equal', 'between', 'not_between'],
                      validation: {
                        format: 'YYYY-MM-DD'
                      },
                      plugin: 'datepicker',
                      plugin_config: {
                        format: 'yyyy-mm-dd',
                        todayBtn: 'linked',
                        todayHighlight: true,
                        autoclose: true
                      },
                      data: convertRange
                    }

                  ];

// convert query rules into the Insights for Twitter format
function buildQueryString(queryRules) {

  var query = "";
  queryRules.rules.forEach(function (rule) {

    var queryElement;
    if (rule.hasOwnProperty("rules")) {
      queryElement = "(" + buildQueryString(rule) + ")";
    } else {
      queryElement = rule.data.convert(rule);
    }

    if (query == "") {
      query = queryElement;
    } else {
      query = query + " " + queryRules.condition + " " + queryElement;
    }
  });

  return query;
}




function parseJSON(data){
	 var obj = JSON.parse(data);
	 var tweets = obj.tweets;
	 var positive=0,negative=0,neutral=0;
	 var node,content,senti,polarity;
	 var output = [];
	 for ( var tweet in tweets) {
		 node = tweets[tweet];
		 
		 
		 if(node.hasOwnProperty('cde')) 
			 {
			 content = node.cde;
			 if(content.hasOwnProperty('content')) 
				 {
				  senti = content.content;
				  if(senti.hasOwnProperty('sentiment'))
					  { 
					  polarity = senti.sentiment;
					  if (polarity.hasOwnProperty('polarity')) {
						  if(polarity.polarity == "POSITIVE") positive +=1;
						  else if(polarity.polarity == "NEGATIVE") negative +=1;
						  else neutral +=1;
						}
					  
					  }
				  
				 }
			 }
	 	}
	 output.push({"name":"POSITIVE", "value":positive});
	 output.push({"name":"NEGATIVE", "value":negative});
	 output.push({"name":"NEUTRAL", "value":neutral});
	 return output;
	 }
