
var blogApp = angular.module('dBlogApp', ['ngRoute', 'ngMessages', 'angularUtils.directives.dirPagination', 'ngCookies' ]);

    blogApp.config(['$routeProvider',
      function($routeProvider) {
        $routeProvider
          .when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginController',
            hideMenus: true
          })
          .when('/signup', {
            templateUrl: 'partials/signup.html',
            controller: 'SignupController',
            secure: true
          })
          .when('/', {
            templateUrl: 'partials/blogs.html',
            controller: 'ArticlesController'
          })
          .when('/article/:id', {
            templateUrl: 'partials/article.html',
            controller: 'ArticleDetailController'
          })
          .when('/new-article', {
            templateUrl: 'partials/new-article.html',
            controller: 'NewArtController'
          })
          .otherwise({
            redirectTo: '/'
          })
      }])

.run(['$rootScope', '$location', '$cookieStore', '$http',
  function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }
  
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
             
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
              // allow just login and signup views to be available
                $location.path('/login') && $location.path('/signup') ;
            }
        });
    }]);

 
// Cut filter
blogApp.filter('cut', function(ArticleService) {
     return function (value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    value = value.substr(0, lastspace);
                }
            }
            return value + (tail || ' …');
        };
});

// compare password directive
var compareTo = function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {
             
            ngModel.$validators.compareTo = function(modelValue) {
                console.log("directive compareTo");
                return modelValue == scope.otherModelValue;
            };
 
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
};
 var RegistrationController = 
 blogApp.directive("compareTo",['ArticleService', compareTo] );

// SignUp Controller
  blogApp.controller('SignupController', 
    ['$scope', '$rootScope', '$routeParams', '$location', 'AuthenticationService', 
          
           function($scope, $rootScope, $routeParams, $location, AuthenticationService) {
                 $scope.signup = function(){
                       $scope.dataLoading = true;
                        AuthenticationService.SignUp($scope.firstname, $scope.lastname, $scope.username, $scope.email, $scope.password, function(response) {
                          if(response.success) {
                              $location.path('/login');
                          } else {
                              $scope.error = response.message;
                              $scope.dataLoading = false;
                          }
                      });
                  }
            
  }])

// Articles Controller
    blogApp.controller('ArticlesController', ['$scope','$rootScope', '$routeParams', '$location', 'ArticleService', 
          
           function($scope, $rootScope, $routeParams, $location, ArticleService) {
                    
                   $scope.articles = ArticleService.getArticles()       
    }])

// OtherController pagination    
  blogApp.controller('OtherController', ['$scope', 'ArticleService',
     function($scope) {
        $scope.pageChangeHandler = function(num) {
            console.log('going to page ' + num);
          };
     }])

// LoginController
blogApp.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService',
    function ($scope, $rootScope, $location, AuthenticationService) {
        
        AuthenticationService.ClearCredentials();
        $scope.logout = AuthenticationService.ClearCredentials();
      
        $scope.login = function () {
            $scope.dataLoading = true;
           // $scope.loggedInUser
            AuthenticationService.Login($scope.username, $scope.password, function(response) {
                if(response.success) { 
                  
                    AuthenticationService.SetCredentials($scope.username, $scope.password);
                    $location.path('/');
                } else { 
                    //$rootScope.currentUser.name = "";
                    $scope.error = response.message;
                    $scope.dataLoading = false;
                }
            });

        };
}]);
 
//  ArticleDetailController
  blogApp.controller('ArticleDetailController', ['$scope', '$location', '$routeParams', 'ArticleService', 
          
           function($scope, $location, $routeParams, ArticleService) {
             $scope.article = ArticleService.getArticle($routeParams.id)
           
  }])

// NewArtController
blogApp.controller('NewArtController', ['$scope', '$rootScope', '$location','ArticleService',
     function($scope, $rootScope, $location, ArticleService) {

              $scope.articles = ArticleService.getArticles()
              
              $scope.addArticle = function(){
                var new_id = 1 + $scope.articles[$scope.articles.length - 1].id
                $scope.articles.push({
                  title: $scope.newPost.title,
                  id: new_id,
                  createdAt: new Date(),
                  data: $scope.newPost.text,
                  by: $rootScope.globals.currentUser.username
                })
                $scope.newPost = { }
                console.log(" PostsController $scope.posts" + $scope.articles);
              $location.path('/');
              }     
    }]) 

// ArticleService
blogApp.factory('ArticleService', function(){
          
      var posts = [ 
                { 
                  title: "Microbes can play games with the mind", 
                  id: 1, 
                  data: "The 22 men took the same pill for four weeks. When interviewed, they said they felt less daily stress and their memories were sharper. The brain benefits were subtle, but the results, reported at last year’s annual meeting of the Society for Neuroscience, got attention. That’s because the pills were not a precise chemical formula synthesized by the pharmaceutical industry. The capsules were brimming with bacteria. In the ultimate PR turnaround, once-dreaded bacteria are being welcomed as health heroes. People gobble them up in probiotic yogurts, swallow pills packed with billions of bugs and recoil from hand sanitizers. Helping us nurture the microbial gardens in and on our bodies has become big business, judging by grocery store shelves. These bacteria are possibly working at more than just keeping our bodies healthy: They may be changing our minds. Recent studies have begun turning up tantalizing hints about how the bacteria living in the gut can alter the way the brain works. These findings raise a question with profound implications for mental health: Can we soothe our brains by cultivating our bacteria? By tinkering with the gut’s bacterial residents, scientists have changed the behavior of lab animals and small numbers of people. Microbial meddling has turned anxious mice bold and shy mice social. Rats inoculated with bacteria from depressed people develop signs of depression themselves. And small studies of people suggest that eating specific kinds of bacteria may change brain activity and ease anxiety. Because gut bacteria can make the very chemicals that brain cells use to communicate, the idea makes a certain amount of sense. Though preliminary, such results suggest that the right bacteria in your gut could brighten mood and perhaps even combat pernicious mental disorders including anxiety and depression. The wrong microbes, however, might lead in a darker direction.",
                  createdAt: "2013-04-23T18:25:43.511Z", 
                  by: "Homer Simpson" 
                },
                 { 
                    title: "Sesame Street's Elmo and Raya Warn Kids About Zika", 
                    id: 2, 
                    data: "Two chipper Sesame Street Muppets are lending their cheerful voices to a serious topic in a pair of public-service announcements intended to raise awareness of the Zika virus among children and families. The two 30-second videos were created by the Pan American Health Organization in collaboration with Sesame Workshop, the nonprofit organization behind the children's television show Sesame Street. The recordings are meant to engage young viewers in South and Central America and the Caribbean, where the Zika virus is spreading. In the videos, popular characters Elmo and Raya share tips and suggestions that even young children can follow, instructing them on how to prevent Zika from spreading and how to avoid mosquito bites. Zika virus is currently spreading in 39 countries in the Americas, according to the Centers for Disease Control and Prevention. The virus is usually transmitted to people by the Aedes aegypti mosquito, and until recently was thought to cause mild symptoms, such as fever and rashes, which only appeared in about 20 percent of the people it infected. The familiar faces of Sesame Street characters have appeared in a number of public service initiatives over the years, helping children to understand and take action on important issues related to health and wellness, emotional well-being, literacy, and respect for others. Elmo, a character that is especially popular with Sesame Street's youngest fans, features in many of these programs, helping kids come to terms with topics including healthy eating, living with asthma, emergency preparedness and dealing with grief.", 
                    createdAt: "2014-04-23T18:25:43.511Z", 
                    by: "Bart Simpson" 
                  },
                  { 
                    title: "Deadly Venoms Help Rather Than Hurt", 
                    id: 3, 
                    data: "Biochemist Glenn King spends his days getting up close and personal with the creatures that make us shudder: spiders, centipedes and scorpions. He’s collecting their often-deadly venoms to find the perfect painkiller. King, a researcher at the University of Queensland in Australia, studies the neurotoxins that allow these creatures to paralyze and kill their prey. The toxins shut down a channel on the membranes of different types of neurons. In humans, the same mechanism that spells doom",
                    createdAt: "2015-04-23T18:25:43.511Z", 
                    by: "Marge Simpson" 
                  },
                  { 
                    title: "Minimal Cell Reveals How Little We Know About Fundamental Genetics", 
                    id: 4, 
                    data: "A team of biologists has synthesized the smallest genome that can encode for a living, replicating cell, but the discovery reveals how much we still don’t know about the fundamental building blocks of life. Geneticist J. Craig Venter and his colleagues at the Venter Institute started with the genome of Mycoplasma mycoides, which is a species of bacteria with the smallest genome of any self-replicating cell scientists know of so far. They inserted a foreign genetic sequence called a transposon into one gene at a time, which stopped the gene from working so the researchers could watch what happened. If the cell kept going without the disrupted gene, the researchers labelled it as non-essential and cut it out of the genome. After four years of working their way through M. mycoides’ genome, the researchers had whittled it down to the bare minimum: 473 genes, about half of the original bacterial genome. They call the result JCVI-Syn3.0, and they published their results Thursday in the journal Science. Venter and his colleagues say that some of the unknown genes occupy similar places in the bacterial genome as genes that encode universal proteins found in other organisms, but scientists aren’t sure what role those proteins play in the complex processes of life. For scientists, it was a reminder of how much we still don’t understand about fundamental biology. “Knowing that we’re missing a third of our fundamental knowledge, I think, is a very key finding, even if there’s no other uses for this organism,” says Venter. “I think we’re showing how complex life is even in the simplest of organisms, if we don’t understand the functions of a third of those genes.” ",
                    createdAt: "2012-04-23T18:25:43.511Z", 
                    by: "Homer Simpson" 
                  }
                ];
         var api = {
          // Atricles part
             getArticles : function() {
                 return posts
             },
             getArticle : function(id) {
                var result = null
               posts.forEach(function(post){
                  if (post.id == id) {
                     result  = post
                    }
               })
                return result
             },
          }
          return api
    })
 
// AuthenticationService
blogApp.factory('AuthenticationService',
    ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout', 
    function (Base64, $http, $cookieStore, $rootScope, $timeout ) {
        var service = { };
      
        var users = [ 
                        { "id": 1,
                          "firstname": "Homer", 
                          "lastname": "Simpson",
                          "username": "Homer",
                          "email": "homer@simpson.com", 
                          "password": "secret"
                        },
                        {
                          "id": 2,
                          "firstname": "Bart", 
                          "lastname": "Simpson",
                          "username": "Bart",
                          "email": "bart@simpson.com", 
                          "password": "secret"
                        },
                        {
                          "id": 3,
                          "firstname": "Marge", 
                          "lastname": "Simpson",
                          "username": "Marge",
                          "email": "marge@simpson.com", 
                          "password": "secret"
                        }
                        ]
 
        service.Login = function (username, password, callback) {
            // console.log(username, password, callback);
            /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/
            $timeout(function(){
               users.forEach(function(user){
                var response = { success: username === user.username && password === user.password };
                 
                if(!response.success) {
                    response.message = 'Username or password is incorrect';
                   //  console.log( $rootScope.$broadcast);
                } 
                callback(response);
             } )}, 1000);
 
            /* Use this for real authentication */
            //$http.post('/api/authenticate', { username: username, password: password })
            //    .success(function (response) {
            //        callback(response);
            //    });
 
        };
        //
        service.SignUp = function (firstname, lastname, username, email, password, callback){

                        var new_id = 1 + users[users.length - 1].id
                        users.push({
                          id: new_id,
                          firstname: firstname,
                          lastname: lastname,
                          username: username,
                          email: email,
                          password: password
                        })
                        var response = {success:true};
                        callback(response);
                 
       }
        
        service.SetCredentials = function (username, password) {
            var authdata = Base64.encode(username + ':' + password);
  
            $rootScope.globals = {
                currentUser: {
                    username: username,
                    loggedIn: true,
                    authdata: authdata
                }
            };
          
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };
  
        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };
  
        return service;
    }])

// Base64 service
blogApp.factory('Base64', function () {
    /* jshint ignore:start */
  
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
  
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
  
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
  
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
  
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
  
            return output;
        },
  
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
  
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
  
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
  
                output = output + String.fromCharCode(chr1);
  
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
  
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
  
            } while (i < input.length);
  
            return output;
        }
    };
  
    /* jshint ignore:end */
});
 