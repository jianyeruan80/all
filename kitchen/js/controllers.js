angular.module('starter.controllers', [])
 .filter('to_trusted', function() {
  return function(input, uppercase) {
   var reg = new RegExp("<[^>]+>", "g");
   if (!!input) {
    return input.replace(reg, "");
   } else {
    return "";
   }

  }
 })
 .filter('to_12', function() {
  return function(data) {
   var d = new Date(data);

   var h = d.getHours();
   var m = d.getMinutes();
   var s = d.getSeconds();
   var end = " AM";

   if (h > 12) {
    h = h % 12;
    end = " PM";
   }
   return (100 + h).toString().substring(1, 3) + ":" + (100 + m).toString().substring(1, 3) + end;


  }
 })
 .directive("myCurrentTime", function() {
  var timeOut = {};
  return function(scope, element, attrs) {
   scope.itemsub.count = 0;
   var userTime = function() {
    scope.itemsub.count = 0;
    scope.itemsub.count = attrs.requestTime - scope.itemsub.kitchenTicketItemStatus[0].prepareTime > 0 ? attrs.requestTime - scope.itemsub.kitchenTicketItemStatus[0].prepareTime : 0;

    window.clearInterval(timeOut[scope.itemsub.kitchenTicketItemStatus[0].id]);

    timeOut[scope.itemsub.kitchenTicketItemStatus[0].id] = setInterval(function() {

     var hours = 0,
      mins = 0,
      secs = 0;

     scope.itemsub.count = parseInt(scope.itemsub.count, 10) + 1000;
     hours = scope.itemsub.count / 3600 / 1000;
     mins = (scope.itemsub.count / 60 / 1000) % 60;
     secs = scope.itemsub.count / 1000 % 60;
     element.text((parseInt(hours + 100) + ":").substring(1, 4) + (parseInt(mins + 100) + ":").substring(1, 4) + (parseInt(secs + 100) + "").substring(1, 3));
     //element.text("O");
     // }


    }, 1000);
   }
   userTime();
  }
 })

.filter('stopTime', function() {
  return function(data, scope) {
   var time = 0;
   if (!!data.kitchenTicketItemStatus[0].serveTime) {
    time = data.kitchenTicketItemStatus[0].serveTime;
   } else {
    time = data.kitchenTicketItemStatus[0].completeTime;
   }
   var count = time - data.kitchenTicketItemStatus[0].prepareTime;
   count = parseInt(count, 10) + 1000;
   hours = count / 3600 / 1000;
   mins = (count / 60 / 1000) % 60;
   secs = count / 1000 % 60;
   return (parseInt(hours + 100) + ":").substring(1, 4) + (parseInt(mins + 100) + ":").substring(1, 4) + (parseInt(secs + 100) + "").substring(1, 3);


  }
 })
.filter("PROCESSING", function() {
            return function(data, scope) {
           var obj=scope.config.DOME;

               var size = 0, key;
    for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
    }
    return size;
     }
  })
 .controller('TabCtrl', function($scope, $rootScope, $interval, $timeout, $ionicModal, $ionicPopup,$ionicLoading, localStorageService, $http, $location, $filter, $translate, localStorageService) {

  var ip = $location.host();
  var port = $location.port();
  $scope.config = {};
  $scope.config.soapServiceURL = "http://" + ip + ":" + port + "/kpos/ws/kposService";
  $scope.config.firstSetting = true;
  $scope.appInstances = {};
  $scope.config.DOME={};
  $scope.config.RROCESS={};
  $scope.runner = false;
  $scope.filterStr = "";

  if ($location.absUrl().indexOf("runner") != -1) {
   $scope.runner = true;
  }
  $scope.requestLicense = $location.absUrl().split("licenseName=")[1];
  $scope.config.buttonClose= $location.absUrl().split("close=")[1];

  $scope.config.intervalTime = null;
  $scope.filterKitcher = {};
  $scope.filterKitcher.kitcherKey = [];
  $scope.filterKitcher.runnerKey = [];
  $scope.filterKitcher.runnerServedKey = [];
  $scope.filterKitcher.filterWord = ""; //input\

  $scope.filterKitcher.searchList = [];


  $scope.filterKitcher.key = true;
  $scope.filterKitcher.listShow = false;
  $scope.filterKitcher.headers = true;
  $scope.type = {
   "DINE_IN": "Dine In",
   "TOGO": "To Go",
   "DELIVERY": "Delivery",
   "PICKUP": "Pick Up",
   "ONLINE_PICKUP": "Online Pick Up",
   "ONLINE_DELIVERY": "Online Delivery",
   "SELF_DINE_IN": "Self Dine In"


  };
  $scope.prepareStatus = {
   "WAITING": "Waiting",
   "PROCESSING": "In Process",
   "DONE": "Finished",
   "SERVED": "SERVED",
   "COMPLETE": "SERVED"

  };
  $scope.runPrepareStatus = {
   "WAITING": "Waiting",
   "PROCESSING": "In Process",
   "DONE": "",
   "SERVED": "",
   "COMPLETE": ""
  };
  $scope.OK = function() {
   $scope.config.license = $scope.config.inputLicense;
   $interval.cancel($scope.config.intervalTime);
   window.clearTimeout($scope.config.time);
   if (!!$scope.config.license) {

    $scope.config.sessionKeyXml = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app"><soapenv:Header/><soapenv:Body><app:ClientInstanceLoginType><app:name>' + $scope.config.license + '</app:name><app:type>KITCHEN_DISPLAY</app:type></app:ClientInstanceLoginType></soapenv:Body></soapenv:Envelope>';
    $scope.requestServer($scope.config.sessionKeyXml, "ClientInstanceLoginResponseType", true);
    $scope.config.intervalTime = $interval(function() {
     $scope.requestServer($scope.config.sessionKeyXml, "ClientInstanceLoginResponseType", true);
    }, 1000 * 60 * 5)
   }
  




  }

  $scope.openLicense = function() {


   $ionicModal.fromTemplateUrl('license.html', function($ionicModal) {
    $scope.license = $ionicModal;
   }, {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose: true
   }).then(function() {
    $scope.license.show();
   });
  }
  $scope.closeLicense = function() {
   if (!!$scope.license) {
    $scope.license.hide();
     $timeout(function(){	 window.location.reload(true);},10);

   }

  };
  $scope.requestServer = function(xml, type, method) {

   var method = !!method ? true : false;

   var parser;
   var xmlhttp = null;
   if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
   } else {
    try {
     xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
     xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   }
   xmlhttp.open("POST", $scope.config.soapServiceURL, method);
   xmlhttp.onreadystatechange = function() {

    if (xmlhttp.readyState == 4) {
     console.log("190 Error");
     var x2js = new X2JS();
     var responseText = xmlhttp.responseText;
     var jsonObj = x2js.xml_str2json(responseText);

     if (xmlhttp.status == 200) {
      $ionicLoading.hide();


      if (jsonObj.Envelope.Body[type].Result.successful == "true") {
       if (type == "ClientInstanceLoginResponseType") {


        $scope.config.sessionKey = jsonObj.Envelope.Body[type].sessionKey;

        localStorageService.set("license", $scope.config.license);
        localStorageService.set("sessionKey", $scope.config.sessionKey);
        localStorageService.set("sessionKeyTime", new Date().getTime());
        localStorageService.set("runner", $scope.runner);

        if ($scope.config.firstSetting == true) {

         var xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app"> <soapenv:Header/> <soapenv:Body> <app:FindAppInstancesType><app:name>' + $scope.config.license + '</app:name> <app:type>KITCHEN_DISPLAY</app:type></app:FindAppInstancesType></soapenv:Body> </soapenv:Envelope>';
         $scope.requestServer(xml, "FindAppInstancesResponseType", true);
        }
        $scope.closeLicense();
         
       } else {
        $scope.config.firstSetting = false;


        $scope.appInstances = jsonObj.Envelope.Body[type].appInstances;

        if (!jsonObj.Envelope.Body[type].appInstances.displaysName && $scope.runner) {
         $scope.appInstances.enableServe = "true";
         $scope.appInstances.enableWait = "true";
         $scope.appInstances.modifyWait = "false";
         $scope.appInstances.modifyDone = "false";
        } else if (!!jsonObj.Envelope.Body[type].appInstances.printerName) {
         $scope.appInstances.enableServe = "true";
         $scope.appInstances.enableWait = "true";
         $scope.appInstances.modifyWait = "true";
         $scope.appInstances.modifyDone = "true";
        }
        if ($scope.appInstances.enableWait == "false") {
       
         $scope.runPrepareStatus = {
          "WAITING": "Done",
          "PROCESSING": "Done",
          "DONE": "Done",
          "SERVED": "Done",
          "COMPLETE": "Done"
         };
        }
        $scope.getData();
       }


      } else {
       $ionicLoading.hide();
       $scope.config.error = jsonObj.Envelope.Body[type].Result.failureReason ? jsonObj.Envelope.Body[type].Result.failureReason : "Server connection failed";
      }

     } else {
      console.log("239 Error");
      $ionicLoading.hide();

      $scope.config.error = xmlhttp.statusText ? xmlhttp.statusText : "Server connection failed";

     }

    }
   }

   try {


    xmlhttp.send(xml);
    $ionicLoading.show();
   } catch (e) {
    console.log("253 Error");
    $scope.config.error = e;
    $ionicLoading.hide();

    return;
   }


  }

  $scope.runnerSearchStatus = function(item) {
   return (item.status != "COMPLETE") && (item.status != "SERVED");


  }
  $scope.runnerStatus = function(item) {
    if((item.status != "COMPLETE") && (item.status != "SERVED")){
       $scope.config.DOME[item.orderId]=1;
    }

   if ($scope.appInstances.enableServe == "true") {
    return (item.status != "COMPLETE");
   } else {
    return (item.status != "COMPLETE") && (item.status != "SERVED");

   }

  }
  
 
  $scope.kitcherStatus = function(item) {
   return item.kitchenTicketItemStatus[0].status == "WAITING" || item.kitchenTicketItemStatus[0].status == "PROCESSING";
  }
  $scope.kitcherRecallStatus = function(item) {
   return !(item.kitchenTicketItemStatus[0].status == "WAITING" || item.kitchenTicketItemStatus[0].status == "PROCESSING");
  }

  var urlJson = getKeyValue($location.url());
  $scope.config.printerName = "";
  $scope.config.active = "none";
  if (isObject(urlJson)) {

   $scope.config.active = (urlJson.action == "do") ? "myclick" : "none";
   $scope.config.printerName = urlJson.printername;
  }
  $scope.audio = new Audio('img/alert.wav');
  $scope.alert = function() {
    $scope.audio = new Audio('img/alert.wav');
    $scope.audio.play();

  }


  $scope.config.platform = false;
  if (!!navigator.platform) {
   $scope.config.platform = navigator.platform.match(/Win/i);
  }


  $scope.config.language = !!localStorageService.get("language") ? localStorageService.get("language") : "en";
  localStorageService.set("language", $scope.config.language);
  $translate.use($scope.config.language);
  $scope.language = function() {
   $scope.config.language = ($scope.config.language == "en") ? "zh" : "en";
   $translate.use($scope.config.language);
   localStorageService.set("language", $scope.config.language);

  }

  $scope.config.keyBoard = [{
    key: 'q',
    'width': 'keyAll'
   }, {
    key: 'w',
    'width': 'keyAll'
   }, {
    key: 'e',
    'width': 'keyAll'
   }, {
    key: 'r',
    'width': 'keyAll'
   }, {
    key: 't',
    'width': 'keyAll'
   }, {
    key: 'y',
    'width': 'keyAll'
   }, {
    key: 'u',
    'width': 'keyAll'
   }, {
    key: 'i',
    'width': 'keyAll'
   }, {
    key: 'o',
    'width': 'keyAll'
   }, {
    key: 'p',
    'width': 'keyAll'
   }, {
    key: '',
    'width': 'keyBorder'
   }, {
    key: '1',
    'width': 'keyAll'
   }, {
    key: '2',
    'width': 'keyAll'
   }, {
    key: '3',
    'width': 'keyAll'
   }, {
    key: 'a',
    'width': 'keyAll'
   }, {
    key: 's',
    'width': 'keyAll'
   }, {
    key: 'd',
    'width': 'keyAll'
   }, {
    key: 'f',
    'width': 'keyAll'
   }, {
    key: 'g',
    'width': 'keyAll'
   }, {
    key: 'h',
    'width': 'keyAll'
   }, {
    key: 'j',
    'width': 'keyAll'
   }, {
    key: 'k',
    'width': 'keyAll'
   }, {
    key: 'l',
    'width': 'keyAll'
   }, {
    key: '#',
    'width': 'keyAll'
   }, {
    key: '',
    'width': 'keyBorder'
   }, {
    key: '4',
    'width': 'keyAll'
   }, {
    key: '5',
    'width': 'keyAll'
   }, {
    key: '6',
    'width': 'keyAll'
   }, {
    key: 'z',
    'width': 'keyAll'
   }, {
    key: 'x',
    'width': 'keyAll'
   }, {
    key: 'c',
    'width': 'keyAll'
   }, {
    key: 'v',
    'width': 'keyAll'
   }, {
    key: 'b',
    'width': 'keyAll'
   }, {
    key: 'n',
    'width': 'keyAll'
   }, {
    key: 'm',
    'width': 'keyAll'
   }, {
    key: '/',
    'width': 'keyAll'
   }, {
    key: 'Backspace',
    'width': 'Backspace'
   }, {
    key: '',
    'width': 'keyBorder'
   }, {
    key: '7',
    'width': 'keyAll'
   }, {
    key: '8',
    'width': 'keyAll'
   }, {
    key: '9',
    'width': 'keyAll'
   },
    {
    key: '(',
    'width': 'keyAll'
   }, 
    {
    key: ')',
    'width': 'keyAll'
   }, 

    {
    key: ' ',
    'width': 'Otherspace'
   }, 
   {
    key: '',
    'width': 'keyBorder'
   }, {
    key: '*',
    'width': 'keyAll'
   }, {
    key: '0',
    'width': 'keyAll'
   }, {
    key: '#',
    'width': 'keyAll'
   }

  ]
  $scope.inputLicense = function(key) {
    if(!$scope.config.inputLicense){$scope.config.inputLicense=""}
   if (key == "Backspace") {
    $scope.config.inputLicense = $scope.config.inputLicense.substring(0, $scope.config.inputLicense.length - 1);
   } else {
    $scope.config.inputLicense = $scope.config.inputLicense + key;
   }

  }

  $scope.inputKey = function(key) {
    
   if (key == "Backspace") {
    $scope.filterKitcher.filterWord = $scope.filterKitcher.filterWord.substring(0, $scope.filterKitcher.filterWord.length - 1);
   } else {
    $scope.filterKitcher.filterWord = $scope.filterKitcher.filterWord + key;
   }

  }

  var ip = $location.host();
  var port = $location.port();
  $scope.url = ip + ":" + port;
  $scope.searchName = "";

  $scope.unique5 = function(array) {
   var r = [];
   for (var i = 0, l = array.length; i < l; i++) {
    for (var j = i + 1; j < l; j++)
     if (array[i] === array[j]) j = ++i;
    r.push({
     "key": array[i]
    });
   }
   return r;
  }

  $scope.processSubmit = function(orderId, orderItemId) {
   if ($scope.appInstances.modifyWait == "true") {
    if (!!document.getElementById("change" + orderItemId)) {
     var status = document.getElementById("change" + orderItemId).innerText;
    }

    if (status != "" && status != "SERVED" && status != "COMPLETE") {
     var processJson = {};
     processJson.orderId = orderId;
     processJson.prepareToServeIds = [];
     processJson.prepareToServeIds.push(orderItemId);

     processJson.status = "DONE";
     if (status == "Waiting") {

      processJson.status = "PROCESSING";
     }

     $http({
       method: 'POST',
       url: $rootScope.updateOrderUrl,
       headers: {
        'Content-Type': 'application/json; charset=utf-8'
       },
       data: processJson
      })
      .then(function success(response) {

       if (!response.data.resultType.successful) {
       
         $ionicPopup.alert({
        title: '<h1>Server is error</h1>'
        });

       } else if (status != "Confirm") {

        if ($scope.runner) {
         var runnerUpdoList = localStorageService.get("runnerUpdo");
        } else {
         var kitchenUpdoList = localStorageService.get("kitchenUpdo");
        }

        if (processJson.status == "PROCESSING") {
         processJson.status = "WAITING";
         document.getElementById("change" + orderItemId).innerText = "In Process";
        } else if (processJson.status == "DONE") {
         processJson.status = "PROCESSING";
         if (!!document.getElementById("change" + orderItemId)) {
          document.getElementById("change" + orderItemId).innerText = "Finished";
         }
        }

        processJson.time = new Date().getTime();

        if ($scope.runner) {

         if (!!runnerUpdoList) {
          runnerUpdoList = JSON.parse(runnerUpdoList);

          runnerUpdoList.push(processJson);

         } else {
          runnerUpdoList = [];
          runnerUpdoList.push(processJson);

         }
         runnerUpdoList.sort(function(a, b) {
          return parseFloat(b.time) - parseFloat(a.time);
         });

         if (runnerUpdoList.length > 5) {
          runnerUpdoList.length = 5;
         }
         $scope.config.runnerUpdoListLen = runnerUpdoList.length;
         localStorageService.set("runnerUpdo", JSON.stringify(runnerUpdoList));
        } else {


         if (!!kitchenUpdoList) {
          kitchenUpdoList = JSON.parse(kitchenUpdoList);

          kitchenUpdoList.push(processJson);

         } else {
          kitchenUpdoList = [];
          kitchenUpdoList.push(processJson);

         }
         kitchenUpdoList.sort(function(a, b) {
          return parseInt(b.time) - parseInt(a.time);
         });
         if (kitchenUpdoList.length > 5) {
          kitchenUpdoList.length = 5;
         }
         $scope.config.kitchenUpdoListLen = kitchenUpdoList.length;

         localStorageService.set("kitchenUpdo", JSON.stringify(kitchenUpdoList));

        }


       }
      }, function error(response) {
       console.log(response);
      });
    }
   }


  };

  $scope.goBack = function() {
   //alert("S")
   $scope.filterKitcher.listShow = false;
   $location.path("tab/kitchen");
  }

  $scope.search = function(searchName, sign, go) {

   var time = 0;
   if (go == "go") {
    time = 800;
    if (sign == "runner") {
     $location.path("tab/runnerSearch");
    } else {
     $location.path("tab/kitchenSearch");
    }


   }



   $scope.filterKitcher.filterWord = "";
   $timeout(function() {
    $scope.filterKitcher.filterWord = searchName;


    if (sign != "runner") {
     angular.forEach($scope.orderList, function(value, key) {
      if (value.kitchShow == true) {
       value.parent = false;
       angular.forEach(value.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {
        angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
         for (var j = 0; j < groundValue.orderItemList.length; j++) {
          if (groundValue.orderItemList[j].prepareStatus == "COMPLETE" || groundValue.orderItemList[j].itemDetail != $scope.filterKitcher.filterWord) {} else {
           value.parent = true;

          }

         }


        })
       })
      }
     })

    } else {
     angular.forEach($scope.orderList, function(value, key) {
      if (value.orderStatus != "SERVED") {
       value["parent"] = false;
       angular.forEach(value.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {
        angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
         for (var j = 0; j < groundValue.orderItemList.length; j++) {
          if (groundValue.orderItemList[j].itemDetail != $scope.filterKitcher.filterWord) {

          } else {
           value.parent = true;
          }

         }


        })
       })
      }
     })

    }

   }, time);

  }
  $scope.$on('parentDone', function(event, data) {

   $scope.processSubmit(data.orderId, data.orderItemId);
   if (!!data.search && document.getElementById("change" + data.orderItemId).innerText == "In Process") {
    var temp = angular.copy($scope.filterKitcher.filterWord);


   }


  })
  $scope.getSearchKey = function() {
   $scope.filterKitcher.runnerKey = [];
   $scope.filterKitcher.runnerServedKey = [];
   $scope.filterKitcher.kitcherKey = [];
   $scope.config.DOME={};
   $scope.config.W={};
   angular.forEach($scope.orderList, function(value, key) {
    angular.forEach(value.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {
     angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
      angular.forEach(groundValue.orderItemList, function(setValue, setKey) {
       if (setValue.kitchenTicketItemStatus[0].status == "WAITING" || setValue.kitchenTicketItemStatus[0].status == "PROCESSING") {
        $scope.filterKitcher.kitcherKey.push(setValue.itemDetail);
        $scope.filterKitcher.runnerServedKey.push(setValue.itemDetail);
        $scope.filterKitcher.runnerKey.push(setValue.itemDetail);
       } else if (setValue.kitchenTicketItemStatus[0].status == "DONE") {
        $scope.filterKitcher.runnerKey.push(setValue.itemDetail);
        $scope.filterKitcher.runnerServedKey.push(setValue.itemDetail);
       } else if (setValue.kitchenTicketItemStatus[0].status == "SERVED") {
        $scope.filterKitcher.runnerServedKey.push(setValue.itemDetail);
       }



      })
     })
    })

   })

   $scope.filterKitcher.kitcherKey = $scope.unique5($scope.filterKitcher.kitcherKey);
   $scope.filterKitcher.runnerKey = $scope.unique5($scope.filterKitcher.runnerKey);
   $scope.filterKitcher.runnerServedKey = $scope.unique5($scope.filterKitcher.runnerServedKey);
  }




  $scope.kitchFilter = function(item) {
   if ($scope.searchName == "") {
    return item.kitchShow == true;
   } else {

    return item.kitchShow == true && (item.itemDetail == $scope.searchName);
   }

  }

  $scope.delay = 60 * 10 * 1000;
  $scope.TimeCtrl = function($scope, $timeout) {
   $scope.clock = "loading clock..."; // initialise the time variable
   $scope.tickInterval = 1000 //ms
   var tick = function() {
    $scope.clock = Date.now() // get the current time
    $timeout(tick, $scope.tickInterval); // reset the timer
   }
   $timeout(tick, $scope.tickInterval);
  }
  $scope.TimeCtrl($scope, $timeout);

  $scope.orderList = [];


  $rootScope.wsServer = 'ws://' + $scope.url + '/kpos/webapp/webSocket/systemInfo';
  $rootScope.kitchOrderUrl = "http://" + $scope.url + "/kpos/webapp/order/listAllKitchenItemsByRange";
  $rootScope.updateOrderUrl = "http://" + $scope.url + "/kpos/webapp/order/updateInKitchenOrder";
  $rootScope.recallOrderUrl = "http://" + $scope.url + "/kpos/webapp/order/fetchInKitchenOrder";
  var sock = null;
  $scope.onload = function() {
   console.log("onload");
   sock = new WebSocket($rootScope.wsServer);
   sock.onopen = function() {
    console.log("connected to " + $rootScope.wsServer);
    sock.send('{"instanceName":"SERVER" , "sessionKey":"QlK4V79OeJjyaxb1y2rl"}');
    console.log("send");
   }
   sock.onclose = function(e) {
    
       $ionicPopup.alert({
        title: '<h1>Server is error</h1>'
        });
    window.location.reload(true);
    console.log("connection closed (" + e.code + ")");
   }
   sock.onmessage = function(e) {
    var d = JSON.parse(e.data);
/*     console.log("------");
     console.log(d);
    console.log("------");*/
    if (!!d.orderInfo && $scope.filterStr.indexOf(d.orderInfo.printerName.toLowerCase()) != -1) {


     if (!d.orderInfo.hasVoid) {

      angular.forEach(d.orderInfo.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {
       angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
        angular.forEach(groundValue.orderItemList, function(setValue, setKey) {
         setValue.itemDetail = $filter('to_trusted')(setValue.itemDetail);

         $scope.filterKitcher.kitcherKey.push(setValue.itemDetail);
         $scope.filterKitcher.runnerKey.push(setValue.itemDetail);
         $scope.filterKitcher.runnerServedKey.push(setValue.itemDetail);
        })
       })
      })
      d.orderInfo.kitchShow = true;
      d.orderInfo.runnerShow = true;
      d.orderInfo.done = false;
      d.orderInfo.doneId = d.orderInfo.kitchenOrderItemsGroupByCourses[0].orderItemListGroupBySubOrder[0].orderItemList[0].kitchenTicketItemStatus[0].id;
      $scope.orderList.push(d.orderInfo);

      $scope.filterKitcher.kitcherKey = $scope.unique5($scope.filterKitcher.kitcherKey);
      $scope.filterKitcher.runnerKey = $scope.unique5($scope.filterKitcher.runnerKey);
      $scope.filterKitcher.runnerServedKey = $scope.unique5($scope.filterKitcher.runnerServedKey);
      $scope.alert();
     } else {
      var voidItemJson = {};
      angular.forEach(d.orderInfo.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {
       angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
        angular.forEach(groundValue.orderItemList, function(setValue, setKey) {
         setValue.itemDetail = $filter('to_trusted')(setValue.itemDetail);
         angular.forEach(setValue.kitchenTicketItemStatus, function(v, k) {
      
              voidItemJson["*" + v.id + "-"] = setValue;

         })
        })
       })
      })
      var voidItemStr = Object.keys(voidItemJson).toString();

      var goOut = false;
      for (var i = 0; i < $scope.orderList.length; i++) {
       var value = $scope.orderList[i];
       if (goOut == true) {
        break;
       }
       angular.forEach(value.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {
        angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
         angular.forEach(groundValue.orderItemList, function(setValue, setKey) {
          var tempKey = "*" + setValue.kitchenTicketItemStatus[0].id + "-";

          if (voidItemStr.indexOf(tempKey) != -1) {
        
           
           for(var i=0;i<voidItemJson[tempKey].kitchenTicketItemStatus.length;i++){
              var tKey="*" + voidItemJson[tempKey].kitchenTicketItemStatus[i].id + "-";
              if(tempKey==tKey){

                 groundValue.orderItemList[setKey]=angular.copy(voidItemJson[tempKey]);

                 groundValue.orderItemList[setKey].kitchenTicketItemStatus.length=0;
                 groundValue.orderItemList[setKey].kitchenTicketItemStatus[0]=voidItemJson[tempKey].kitchenTicketItemStatus[i];;


                  voidItemStr = voidItemStr.replace(tempKey, "");
                  
                 break;
              }

           }

          



           

          
           if (voidItemStr == "") {
            goOut = true;
           }
          }


         })
        })
       })
      }
     }


     $scope.getSearchKey();

    } else if (!!d.orderUpdateInfo) {
     orderInfo = d.orderUpdateInfo;


     var goOut = false;
     for (var i = 0; i <= $scope.orderList.length; i++) {
      if (goOut) {
       break;
      }
      value = $scope.orderList[i];
      if (orderInfo.orderId == value.orderId) {
       angular.forEach(value.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {

        angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
         angular.forEach(groundValue.orderItemList, function(setValue, setKey) {

          if (orderInfo.prepareToServeId == setValue.kitchenTicketItemStatus[0].id) {
           setValue.kitchenTicketItemStatus[0].prepareTime = orderInfo.prepareTime;
           setValue.kitchenTicketItemStatus[0].currentTime = orderInfo.currentTime;
           setValue.kitchenTicketItemStatus[0].serveTime = orderInfo.serveTime;
           setValue.kitchenTicketItemStatus[0].completeTime = orderInfo.completeTime;


           setValue.kitchenTicketItemStatus[0].status = orderInfo.status;

           goOut = true;

           if (!!orderInfo.recall) {

            var tempValue = angular.copy(value);
            
            tempValue.kitchShow = true;
            tempValue.kitchRecallShow = false;

            tempValue.done = false;
            tempValue.recall = true;
            value.kitchRecallShow = false;
            tempValue.currentTime = 0;

            if (groundValue.orderItemList.length >= 2) {

             if (orderInfo.prepareToServeId == setValue.kitchenTicketItemStatus[0].id) {
              tempValue.kitchenOrderItemsGroupByCourses[0].orderItemListGroupBySubOrder[0].orderItemList.length = 0;
              tempValue.kitchenOrderItemsGroupByCourses[0].orderItemListGroupBySubOrder[0].orderItemList[0] = setValue;

              groundValue.orderItemList.splice(setKey, 1);
             }
             
             $scope.orderList.unshift(tempValue);

                        for(var i=0;i<orderValue.orderItemListGroupBySubOrder.length;i++){ 
                           for (var j = 0; j < groundValue.orderItemList[i].length; j++) {
                            var status = groundValue.orderItemList[j].kitchenTicketItemStatus[0].status;
                            if (status == "DONE" || status == "COMPLETE" || status == "SERVED") {
                             value.kitchRecallShow = true;
                             break;
                            }

                           }
                       }

            } else {
             value.kitchShow = true;

             value.done = false;
             value.recall = true;
             $scope.orderList.splice(i, 1);
             $scope.orderList.unshift(value);
            }
             $scope.alert();

           } else {
            value.kitchShow = false;
            value.kitchRecallShow = false;
            value.done = false;

            value.status = null;
            if (orderInfo.status == "SERVED") {
             value.status = orderInfo.status;
             value.completeTime = orderInfo.completeTime;
            } else if (orderInfo.status == "COMPLETE") {
             value.status = orderInfo.status;

            } else {
              angular.forEach(orderValue.orderItemListGroupBySubOrder, function(gv, gk) {
             angular.forEach(gv.orderItemList, function(v, k) {
              value.doneId = v.kitchenTicketItemStatus[0].id;

              if (v.kitchenTicketItemStatus[0].status == "DONE" ||
               v.kitchenTicketItemStatus[0].status == "SERVED" ||
               v.kitchenTicketItemStatus[0].status == "COMPLETE") {
               value.doneId = v.kitchenTicketItemStatus[0].id;

               value.kitchRecallShow = true;
              } else {
               value.kitchShow = true;


              }

             })})


             if (!value.kitchShow && !value.orderStatus) {
              value.done = true;

             }

            }

           }

          }

         })
        })

       })
      }

     }

     $scope.getSearchKey();

    } else if (!!d.specialCommand) {
     if (d.specialCommand.refresh == true) {
      window.location.reload(true);
     } else {

      angular.forEach($scope.orderList, function(value, key) {

       if (value.orderId == d.specialCommand.orderId) {
        value.orderNum = d.specialCommand.orderNum;
        value.orderType = d.specialCommand.orderType;
        value.server = d.specialCommand.server;
        value.tableName = d.specialCommand.tableName;

       }
      })
     }

    }


   };
  }

  $scope.onload();
  /*        $scope.test123=function(){
            console.log($scope.orderList);
          }*/
  $scope.getData = function() {

   $http({
    method: 'POST',
    url: $rootScope.kitchOrderUrl,
    headers: {
     'Content-Type': 'application/json; charset=utf-8'
    },
    data: {}

   }).then(function success(response) {
    var tempOrderList = response.data.orderDetailInfoList;
    $scope.orderList = [];

 console.log("------");
     console.log(tempOrderList);
    console.log("------");
    if ($scope.runner) {
     if (!$scope.appInstances.displaysName) {

     } else {
      $scope.filterStr = $scope.appInstances.displaysName.replace(/\s+/g, "");

     }
    } else if (!!$scope.appInstances.printerName) {
     $scope.filterStr = $scope.appInstances.printerName.replace(/\s+/g, "");



    } else {
     
        $ionicPopup.alert({
        title: '<h1>Please Setting Kitchen Display!</h1>'
        });
     return false;
    }

    $scope.filterStr = $scope.filterStr.toLowerCase();

    angular.forEach(tempOrderList, function(value, key) {


     if ($scope.filterStr.indexOf(value.printerName.toLowerCase()) != -1) {

      value.showRecall = false;
      value.kitchShow = false;
      value.kitchRecallShow = false;
      value.done = false;

      angular.forEach(value.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {
       angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
        angular.forEach(groundValue.orderItemList, function(setValue, setKey) {
         setValue.itemDetail = $filter('to_trusted')(setValue.itemDetail);


         value.doneId = setValue.kitchenTicketItemStatus[0].id;

         if (!value.status) {

          if (setValue.kitchenTicketItemStatus[0].status == "DONE") {
           value.kitchRecallShow = true;
           value.doneId = setValue.kitchenTicketItemStatus[0].id;
          } else {

           value.kitchShow = true;
          }
         }

        })



       })

       if (!value.kitchShow && !value.orderStatus) {
        value.done = true;
       }

      })
      $scope.orderList.push(value);
     }

    });

    if ($scope.orderList.length == 0) {
     localStorageService.set("kitchenUpdo", "");
     localStorageService.set("runnerUpdo", "");
    }
    
    $scope.getSearchKey();



   }, function error(response) {
    console.log(response);

   });

   var kitchenUpdoList = localStorageService.get("kitchenUpdo");
   $scope.config.kitchenUpdoListLen = 0;
   if (!!kitchenUpdoList) {
    kitchenUpdoList = JSON.parse(kitchenUpdoList);
    $scope.config.kitchenUpdoListLen = kitchenUpdoList.length;
   }

   var runnerUpdoList = localStorageService.get("runnerUpdo");
   $scope.config.runnerUpdoListLen = 0;
   if (!!runnerUpdoList) {
    runnerUpdoList = JSON.parse(runnerUpdoList);
    $scope.config.runnerUpdoListLen = runnerUpdoList.length;
   }
  }

  if (!$scope.requestLicense) {
   if (!!localStorageService.get("license") && !!localStorageService.get("sessionKey") && !!localStorageService.get("sessionKeyTime") && localStorageService.get("runner") == $scope.runner) {


    $scope.config.license = localStorageService.get("license");
    $scope.config.sessionKey = localStorageService.get("sessionKey");
    var nowTime = new Date().getTime();
    var sessionKeyTime = localStorageService.get("sessionKeyTime");
    $scope.config.sessionKeyXml = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app"><soapenv:Header/><soapenv:Body><app:ClientInstanceLoginType><app:name>' + $scope.config.license + '</app:name><app:type>KITCHEN_DISPLAY</app:type></app:ClientInstanceLoginType></soapenv:Body></soapenv:Envelope>';

    var time = (nowTime - parseInt(sessionKeyTime)) / 1000;


    if (time > 300) {
     console.log(">300")

     $scope.requestServer($scope.config.sessionKeyXml, "ClientInstanceLoginResponseType", true);

     $scope.config.intervalTime = $interval(function() {
      $scope.requestServer($scope.config.sessionKeyXml, "ClientInstanceLoginResponseType", true);
     }, 1000 * 60 * 5)
    } else {
     console.log("<300" + time)
     $scope.config.time = $timeout(function() {

      $scope.requestServer($scope.config.sessionKeyXml, "ClientInstanceLoginResponseType", true);

      $scope.config.intervalTime = $interval(function() {

       $scope.requestServer($scope.config.sessionKeyXml, "ClientInstanceLoginResponseType", true);
      }, 1000 * 60 * 5)

     }, 1000 * (300 - time));
    }
    xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app"> <soapenv:Header/> <soapenv:Body> <app:FindAppInstancesType><app:name>' + $scope.config.license + '</app:name> <app:type>KITCHEN_DISPLAY</app:type></app:FindAppInstancesType></soapenv:Body> </soapenv:Envelope>';
    $scope.requestServer(xml, "FindAppInstancesResponseType", true);
    //$scope.config.firstSetting
   } else {
    $scope.filterKitcher.listShow = true;
    $scope.config.error = "Please Input license";
    $scope.openLicense();

   }
  } else {


   var xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app"> <soapenv:Header/><soapenv:Body><app:FindAppInstancesType><app:name>' + $scope.requestLicense + '</app:name><app:type>KITCHEN_DISPLAY</app:type></app:FindAppInstancesType></soapenv:Body> </soapenv:Envelope>';
   $scope.requestServer(xml, "FindAppInstancesResponseType", true);
   $scope.getData();

  }


 })
 .controller('RunnerSearchCtrl', function($scope, $location, $rootScope, $timeout, $ionicModal, localStorageService, $http, $timeout, localStorageService) {
  $scope.config.runnerIndex = localStorageService.get("runnerUrl");
  $scope.find = function(value) {
   $scope.filterKitcher.listShow = false;
   $scope.filterKitcher.filterWord = value;
   $scope.search(value, 'runner', "")
  }

 })
 .controller('KitchenSearchCtrl', function($scope, $rootScope, $timeout, $ionicModal, localStorageService, $http, $timeout) {
  $scope.config.kitchenerUrl = localStorageService.get("kitchenerUrl");
  $scope.find = function(value) {

   $scope.filterKitcher.listShow = false;
   $scope.filterKitcher.filterWord = value;

   $scope.search(value, 'kitchen', "")
  }

  $scope.processSubmit = function(orderId, orderItemId) {
   var json = {};
   json.orderId = orderId;
   json.orderItemId = orderItemId;
   json.search = true;
   $scope.$emit('parentDone', json);
  }

 })
 .controller('KitchenCtrl', function($scope, $rootScope, $location, $timeout, $ionicModal, localStorageService, $http, $timeout) {


  $scope.goToRecall = function() {
   $location.path("tab/kitchenRecall");
  }
  $scope.processSubmit = function(orderId, orderItemId) {
   var json = {};
   json.orderId = orderId;
   json.orderItemId = orderItemId;
   $scope.$emit('parentDone', json);
  }



  $scope.kitchUpdo = function() {

   var kitchenUpdoList = localStorageService.get("kitchenUpdo");

   if (!!kitchenUpdoList) {
   tempKitchenUpdoList=JSON.parse(kitchenUpdoList);
  /*  var tempKitchenUpdoList = [];
    kitchenUpdoList = JSON.parse(kitchenUpdoList);

    angular.forEach($scope.orderList, function(value, key) {

     angular.forEach(value.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {
      angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
       angular.forEach(groundValue.orderItemList, function(setValue, setKey) {
        if (value.status != "SERVED" || value.status != "COMPLETE") {

         angular.forEach(kitchenUpdoList, function(localValue, localKey) {

          if (setValue.kitchenTicketItemStatus[0].id == localValue.prepareToServeIds[0]) {
           tempKitchenUpdoList.push(localValue);
           kitchenUpdoList.splice(localKey, 1);

          }


         })
        }
       })
      })
     })
    })
*/
    tempKitchenUpdoList.sort(function(a, b) {

     return parseInt(a.time) - parseInt(b.time);
    });
    var length = tempKitchenUpdoList.length;

    if (length > 0) {

     $http({
       method: 'POST',
       url: $rootScope.updateOrderUrl,
       headers: {
        'Content-Type': 'application/json; charset=utf-8'
       },
       data: tempKitchenUpdoList[length - 1]
      })
      .then(function success(response) {

       if (!response.data.resultType.successful) {
        
        $ionicPopup.alert({
        title: '<h1>Server is error</h1>'
        });
       } else {


        tempKitchenUpdoList.length = length - 1;
        $scope.config.kitchenUpdoListLen = tempKitchenUpdoList.length;

        var tempStr = "";

        if (tempKitchenUpdoList.length >= 1) {
         tempStr = JSON.stringify(tempKitchenUpdoList);
        }

        localStorageService.set("kitchenUpdo", tempStr);


       }
      }, function error(response) {

       console.log(response);
      });
    } else {

     $scope.config.kitchenUpdoListLen = 0;
     localStorageService.set("kitchenUpdo", "");
    }
   }


  }



 })

.controller('KitchenRecallCtrl', function($scope, $http, $rootScope) {

  $scope.kitchenRecall = function(orderId, orderItemId) {

   var processJson = {};
   processJson.orderId = orderId;
   processJson.prepareToServeIds = [];
   processJson.prepareToServeIds.push(orderItemId);


   processJson.status = "WAITING";

   $http({
     method: 'POST',
     url: $rootScope.recallOrderUrl,
     //url:$rootScope.updateOrderUrl,
     headers: {
      'Content-Type': 'application/json; charset=utf-8'
     },
     data: processJson
    })
    .then(function success(response) {

     if (!response.data.resultType.successful) {

     
     $ionicPopup.alert({
        title: '<h1>Server is error</h1>'
        });

     }
    }, function error(response) {

     console.log(response);
    });


  };
 })
 .controller('RunnerReviewCtrl', function($scope, $http, $rootScope, localStorageService) {
  $scope.runnerReview = function(item) {
   return (item.kitchenTicketItemStatus[0].status == "SERVED" || item.kitchenTicketItemStatus[0].status == "COMPLETE");
  }
  $scope.config.runnerIndex = localStorageService.get("runnerUrl");

 })
 .controller('RunnerCtrl', function($scope, $http, localStorageService, $rootScope, $location) {
  localStorageService.set("runnerUrl", $location.url());
  $scope.config.runnerIndex = $location.url();

  $scope.runnerUpdo = function() {
   var runnerUpdoList = localStorageService.get("runnerUpdo");
   if (!!runnerUpdoList) {
    tempRunnerUpdoList= JSON.parse(runnerUpdoList);
    /*runnerUpdoList = JSON.parse(runnerUpdoList);
    var tempRunnerUpdoList = [];

    angular.forEach($scope.orderList, function(value, key) {

     angular.forEach(value.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {
      angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
       angular.forEach(groundValue.orderItemList, function(setValue, setKey) {


        angular.forEach(runnerUpdoList, function(localValue, localKey) {
         if (setValue.kitchenTicketItemStatus[0].id == localValue.prepareToServeIds[0]) {
          tempRunnerUpdoList.push(localValue);
         }


        })

       })
      })
     })
    })*/
    

    runnerUpdoList = tempRunnerUpdoList;
    var length = runnerUpdoList.length;

    if (length > 0) {
     runnerUpdoList.sort(function(a, b) {
      return parseInt(a.time) - parseInt(b.time);
     });

     if (runnerUpdoList[length - 1].status == "COMPLETE") {
      runnerUpdoList[length - 1].status = "SERVED";
     } else if (runnerUpdoList[length - 1].status == "SERVED") {
      runnerUpdoList[length - 1].status = "DONE";
     }



     $http({
       method: 'POST',
       url: $rootScope.updateOrderUrl,
       headers: {
        'Content-Type': 'application/json; charset=utf-8'
       },
       data: runnerUpdoList[length - 1]
      })
      .then(function success(response) {

       if (!response.data.resultType.successful) {
        
             $ionicPopup.alert({
        title: '<h1>Server is error</h1>'
        });
       } else {


        runnerUpdoList.length = length - 1;

        $scope.config.runnerUpdoListLen = runnerUpdoList.length;

        localStorageService.set("runnerUpdo", JSON.stringify(runnerUpdoList));
       }
      }, function error(response) {
       console.log(response);
      });
    } else {
     localStorageService.set("runnerUpdo", "");
     $scope.config.runnerUpdoListLen = 0;
    }
   }


  }

  $scope.kitchUpdo = function() {

   var kitchenUpdoList = localStorageService.get("kitchenUpdo");
   if (!!kitchenUpdoList) {
    tempKitchenUpdoList=JSON.parse(kitchenUpdoList);
    /*var tempKitchenUpdoList = [];
    kitchenUpdoList = JSON.parse(kitchenUpdoList);

    angular.forEach($scope.orderList, function(value, key) {

     angular.forEach(value.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {
      angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
       angular.forEach(groundValue.orderItemList, function(setValue, setKey) {
        if (value.status != "SERVED" || value.status != "COMPLETE") {

         angular.forEach(kitchenUpdoList, function(localValue, localKey) {

          if (setValue.kitchenTicketItemStatus[0].id == localValue.orderItemId[0]) {
           tempKitchenUpdoList.push(localValue);


          }


         })
        }
       })
      })
     })
    })*/

    tempKitchenUpdoList.sort(function(a, b) {

     return parseInt(a.time) - parseInt(b.time);
    });
    var length = tempKitchenUpdoList.length;

    if (length > 0) {

     $http({
       method: 'POST',
       url: $rootScope.updateOrderUrl,
       headers: {
        'Content-Type': 'application/json; charset=utf-8'
       },
       data: tempKitchenUpdoList[length - 1]
      })
      .then(function success(response) {

       if (!response.data.resultType.successful) {
        
             $ionicPopup.alert({
        title: '<h1>Server is error</h1>'
        });
       } else {


        tempKitchenUpdoList.length = length - 1;
        $scope.config.kitchenUpdoListLen = tempKitchenUpdoList.length;

        var tempStr = "";

        if (tempKitchenUpdoList.length >= 1) {
         tempStr = JSON.stringify(tempKitchenUpdoList);
        }

        localStorageService.set("kitchenUpdo", tempStr);


       }
      }, function error(response) {

       console.log(response);
      });
    } else {

     $scope.config.kitchenUpdoListLen = 0;
     localStorageService.set("kitchenUpdo", "");
    }
   }


  }


  $scope.done = function(e) {


   var processJson = {};
   processJson.status = e.target.innerText == "Served" ? "COMPLETE" : "SERVED";

   if ($scope.appInstances.modifyDone == "true" && processJson.status == "SERVED" || processJson.status == "COMPLETE") {
    var doneId = e.target.dataset.doneid;

    processJson.prepareToServeIds = [];


    var goOut = false;
    for (var i = 0; i < $scope.orderList.length; i++) {
     var value = $scope.orderList[i];
     if (goOut == true) {
      break;
     }
     
     angular.forEach(value.kitchenOrderItemsGroupByCourses, function(orderValue, orderKey) {
      angular.forEach(orderValue.orderItemListGroupBySubOrder, function(groundValue, groundKey) {
       angular.forEach(groundValue.orderItemList, function(setValue, setKey) {
        if (doneId == setValue.kitchenTicketItemStatus[0].id) {


         processJson.orderId = value.orderId;
        
         angular.forEach(orderValue.orderItemListGroupBySubOrder, function(gv, gk) {
              angular.forEach(gv.orderItemList, function(sv, sk) {
              processJson.prepareToServeIds.push(sv.kitchenTicketItemStatus[0].id);
             })
         })
         


         goOut = true;
        }


       })



      })
     })

    };

    $http({
     method: 'POST',
     url: $rootScope.updateOrderUrl,
     headers: {
      'Content-Type': 'application/json; charset=utf-8'
     },
     data: processJson
    }).then(function success(response) {
     if (!response.data.resultType.successful) {
      
           $ionicPopup.alert({
        title: '<h1>Server is error</h1>'
        });
     } else {

      var runnerUpdoList = localStorageService.get("runnerUpdo");
      processJson.time = new Date().getTime();
      if (!!runnerUpdoList) {
       runnerUpdoList = JSON.parse(runnerUpdoList);

       runnerUpdoList.push(processJson);

      } else {
       runnerUpdoList = [];
       runnerUpdoList.push(processJson);

      }
      runnerUpdoList.sort(function(a, b) {
       return parseFloat(b.time) - parseFloat(a.time);
      });

      if (runnerUpdoList.length > 5) {
       runnerUpdoList.length = 5;
      }
      $scope.config.runnerUpdoListLen = runnerUpdoList.length;
      localStorageService.set("runnerUpdo", JSON.stringify(runnerUpdoList));

     }
    }, function error(response) {
     console.log(response);
    });
   }

  }


 })

function toggleFullScreen() {

 if (!document.fullscreenElement && // alternative standard method
  !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods

  if (document.documentElement.requestFullscreen) {
   document.documentElement.requestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) {
   document.documentElement.msRequestFullscreen();
  } else if (document.documentElement.mozRequestFullScreen) {
   document.documentElement.mozRequestFullScreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
   document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  }
 } else {
  // alert("xdddddxx");
  if (document.exitFullscreen) {
   document.exitFullscreen();
  } else if (document.msExitFullscreen) {
   document.msExitFullscreen();
  } else if (document.mozCancelFullScreen) {
   document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
   document.webkitExitFullscreen();
  }
 }
}

var clolseW=window;
function closeChrome() {
//window.location.reload(true);
/*window.opener = null;

   window.open("", "_self");

  
   window.location.href="about:blank";*/
  // console.log(window);
   if(confirm("确定要退出吗？")){
                 var browserName=navigator.appName;
                 if (browserName=="Netscape"){
                       window.open('', '_self', '');
                       window.close();
                 }
                 if (browserName=="Microsoft Internet Explorer") { 
                       window.parent.opener = "whocares"; 
                       window.parent.close(); 
                 }
        }
  

}

function getKeyValue(url) {
 var result = {};
 var reg = new RegExp('([\\?|&])(.+?)=([^&?]*)', 'ig');
 var arr = reg.exec(url.toLowerCase());
 while (arr) {
  result[arr[2]] = arr[3];
  arr = reg.exec(url);
 }
 return result;
}

function isObject(e) {
 var sign = false;
 if (!!e && e instanceof Object && !(e instanceof Array) && Object.keys(e).length) {
  sign = true;
 }
 return sign;
}