angular.module('starter.controllers', [])
.controller('IndexCtrl', function($scope, $stateParams,$timeout,$window,$http, $ionicScrollDelegate,$location) {
var url=$location.search();
var ip=$location.host();
var port=$location.port();
var clientPort=url.port;;
$scope.soapServiceURL = "http://"+ip+":"+port+'/kpos/ws/kposService';
$scope.photoUrl="http://"+ip+":"+port+'/kpos/';
var currentUrl="http://127.0.0.1:"+clientPort+"/device/dualscreen/sub";
var defaultPhotoUrl="http://"+ip+":"+port+"/kpos/dual/img/default.jpg";

var cssHtml="";
var photoCount=4;
var cssList=[];
var cssPhoto=[];
var photoList=[];
var displayTime=3000;
$scope.transitionEffect="WIPE";
var autoInt=0;
var autoSign=false;
cssList[0]='.sliderMenusifu--el.anim-4parts .part:before {content: "";display: block;position: absolute;background-position: center center;background-size: cover ;background-repeat: no-repeat;width: 200%;height: 200%;';
cssList[1]='.sliderMenusifu--el.anim-9parts .part:before {content: "";display: block;position: absolute;background-position: center center;background-size: cover;background-repeat: no-repeat;width: 300%;height: 300%;';
cssList[2]='.sliderMenusifu--el.anim-5parts .part:before { content: ""; display: block;  position: absolute;background-position: center center; background-size: cover;background-repeat: no-repeat;  top: 0;  width: 500%;height: 100%;';
cssList[3]='.sliderMenusifu--el.anim-3parts .part:before {content: "";display: block;position: absolute;background-position: center center;background-size: cover;background-repeat: no-repeat;width: 300%;height: 100%;';
var dbList = [4];
var tArray = new Array();   
var rows=1;
function gcd(a,b){
          var minNum = Math.min(a,b),maxNum = Math.max(a,b),i=minNum,vper=0;
          if(a ===0 || b===0){
              return maxNum;
          }
  
         for(;i<=maxNum;i++){
             vper = minNum * i;
             if(vper % maxNum === 0){
                 return vper;
                 break;
             }
         }
     }
function gcds(arr){
                            
         var onum = 0,i = 0,len = arr.length,midNum = 0;
        for(;i<len;i++){
             onum = Math.floor(arr[i]);
             midNum = gcd(midNum,onum);
         }
         return midNum;
    }
(function(){

	var keyPaths = [];

	var saveKeyPath = function(path) {
		keyPaths.push({
			sign: (path[0] === '+' || path[0] === '-')? parseInt(path.shift()+1) : 1,
			path: path
		});
	};

	var valueOf = function(object, path) {
		var ptr = object;
		for (var i=0,l=path.length; i<l; i++) ptr = ptr[path[i]];
		return ptr;
	};

	var comparer = function(a, b) {
		for (var i = 0, l = keyPaths.length; i < l; i++) {
			aVal = valueOf(a, keyPaths[i].path);
			bVal = valueOf(b, keyPaths[i].path);
			if (aVal > bVal) return keyPaths[i].sign;
			if (aVal < bVal) return -keyPaths[i].sign;
		}
		return 0;
	};

	Array.prototype.sortBy = function() {
		keyPaths = [];
		for (var i=0,l=arguments.length; i<l; i++) {
			switch (typeof(arguments[i])) {
				case "object": saveKeyPath(arguments[i]); break;
				case "string": saveKeyPath(arguments[i].match(/[+-]|[^.]+/g)); break;
			}
		}
		return this.sort(comparer);
	};

})();
$scope.gallery={};
$scope.gallery.photoList=[];
$scope.restaurantInfo={};
/*var style0 = document.createElement('style');
var style1 = document.createElement('style');  
*/
$scope.createCss=function(n){

var cssHtml=tArray[n][0]+tArray[n][1]+tArray[n][2];
createStyle(cssHtml +tArray[n][3]);



autoInt=0;
if(autoSign==false){$scope.autoPhoto();}else{$timeout($scope.autoPhoto,0);}
}
var rowsCount=0;
$scope.autoPhoto=function(){
autoSign=false
autoInt++;
if(autoInt>4 ){
     autoInt=1;
     rowsCount++;
     if(rowsCount>=rows){rowsCount=0};
     //alert(document.getElementsByTagName("STYLE").length);
       for(var i=6;i<document.getElementsByTagName("STYLE").length;i++){
        document.getElementsByTagName('head')[0].removeChild(document.getElementsByTagName("STYLE")[i]);
       }

      autoSign=true;
      $scope.createCss(rowsCount);
}
 if(autoSign==false){
    document.getElementById("page"+autoInt).checked=true;
    $timeout($scope.autoPhoto,displayTime);
 }

}
$scope.getRestaurant=function(){
  
var soapMessage = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">'
   +'<soapenv:Header/><soapenv:Body><app:FetchCompanyProfileType></app:FetchCompanyProfileType></soapenv:Body></soapenv:Envelope>';


   var parser;
  var xmlhttp = null;
  if(window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else {
   try
    { xmlhttp = new ActiveXObject("Msxml2.XMLHTTP"); }
    catch (e)
    {xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
  }
  xmlhttp.open("POST", $scope.soapServiceURL, false);


  xmlhttp.onreadystatechange = function() {
 if (xmlhttp.readyState == 4) {
   var x2js = new X2JS();
    var responseText = xmlhttp.responseText;
    var jsonObj = x2js.xml_str2json(responseText);
      
      $scope.restaurantInfo=jsonObj.Envelope.Body.FetchCompanyProfileResponseType.company;
     // console.log($scope.restaurantInfo)
  }else{
    alert("error");
  }
 }

        try{
       
        xmlhttp.send(soapMessage);
      }catch(e){
      alert("error");
      }

    
}

$scope.callSOAPWS=function()
{
var soapXMLBegin = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
            '<soapenv:Header/><soapenv:Body><app:FindGalleryType>';
var soapXMLEnd = '</app:FindGalleryType></soapenv:Body></soapenv:Envelope>';
var soapMessage =soapXMLBegin+soapXMLEnd;
var parser;
  var xmlhttp = null;
  if(window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else {
   try
    { xmlhttp = new ActiveXObject("Msxml2.XMLHTTP"); }
    catch (e)
    {xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
  }
  xmlhttp.open("POST", $scope.soapServiceURL, false);
  xmlhttp.onreadystatechange = function() {
 if (xmlhttp.readyState == 4) {
var x2js = new X2JS();
    var responseText = xmlhttp.responseText;
    var jsonObj = x2js.xml_str2json(responseText);


     if(1>0){
    if(typeof(jsonObj.Envelope.Body.FindGalleryResponseType.gallery)=="undefined"){
      photoCount=0;
    }else{
     var gallery=jsonObj.Envelope.Body.FindGalleryResponseType.gallery;
   
    if(gallery instanceof Array==false){
      photoList.push(gallery);
    }else{
      photoList=gallery;
    }
     photoCount=photoList.length;
    }
    photoList.sortBy('displayOrder');
    if(!!photoList[0]){
    displayTime=1000*photoList[0].displayTime;
    $scope.transitionEffect=photoList[0].transitionEffect?photoList[0].transitionEffect:"WIPE";
    }
     $scope.gallery.photoList=photoList;
        $scope.transitionEffect="FADE";
      if($scope.transitionEffect =="FADE"){

         
        displayTime=displayTime/1000;
               var cssHTML="";
          var len=$scope.gallery.photoList.length;
          $scope.gallery.photoList[len]=$scope.gallery.photoList[0];

          angular.forEach($scope.gallery.photoList,function(v,k){
                 
                 var delayTime=parseInt(displayTime)*k;

                 
                  cssHTML+=".anim_fade_image"+k+"{-webkit-animation: fadeInOut ease-in-out "+displayTime+"s "+delayTime+"s alternate forwards;z-index:"+(len-k)+";animation: fadeInOut ease-in-out "+displayTime+"s "+delayTime+"s alternate forwards;z-index:"+(len-k)+";}";
          })
       
         createStyle(cssHTML);
        // console.log(cssHTML)
        $timeout(function(){fade(len);},50)

      }else{
        
              if(photoCount==0){photoCount[0]='background-image: url("'+$scope.photoUrl+photoList[i].thumbPath+'")}';photoCount=1;}
             dbList.push(photoCount);
             var minMax=gcds(dbList);
              rows=minMax/4;
             for(var i=0;i<rows;i++){
            tArray[i]=new Array();   
              tArray[i][0]=cssList[0]+'background-image: url("'+$scope.photoUrl+photoList[(i*4)%photoCount].thumbPath+'")}';
              tArray[i][1]=cssList[1]+'background-image: url("'+$scope.photoUrl+photoList[(i*4+1)%photoCount].thumbPath+'")}';
              tArray[i][2]=cssList[2]+'background-image: url("'+$scope.photoUrl+photoList[(i*4+2)%photoCount].thumbPath+'")}';
              tArray[i][3]=cssList[3]+'background-image: url("'+$scope.photoUrl+photoList[(i*4+3)%photoCount].thumbPath+'")}';
              
              }
                 $scope.createCss(0);
      }

   
       
   }
  }else{
    alert("error");
  }
  }
  try{
  xmlhttp.send(soapMessage);
}catch(e){
alert("error");
}

}
$scope.callSOAPWS();
$scope.getRestaurant();
$scope.dishes=[];
$scope.receipt={};

$scope.id=-1;

//var e=document.querySelector("#dishesShow");
//console.log(e);
$scope.pay={};
$scope.pay.sign=false;
$scope.welcome=false;

 /*                       $timeout(function(){
                          $scope.pay=!$scope.pay;
                        },1000);*/
$scope.getApiMenu=function(){
            
                   $ionicScrollDelegate.$getByHandle('small').scrollBottom(true)
               // angular.element(e)[0].clientTop=1000;
                // c//onsole.log(angular.element(e)[0].clientHeight) ;
      //Object {msg: "{"type":"settle","total":"$12.45"}", id: 135}

             $http({
                      method: "POST",
                      url: currentUrl,
                      headers: { 'Content-Type': 'application/json; charset=UTF-8'},
                      data:{"id":$scope.id}

                    }).success(function(d){
                  
                       $scope.id=d.id;
          /*             console.log("------------------");
                       console.log(d);
                       console.log("------------------");*/
                      
                      $timeout($scope.getApiMenu,800);
                      if(d.msg!="timeout" && d.msg!=null){
                        $scope.welcome=true;
                        var dataJson=angular.fromJson(d.msg);

                        if(dataJson.type=="order"){
                        $scope.receipt=angular.copy(dataJson.order.summary);
                        $scope.dishes=angular.copy(dataJson.order.dishes);

                          $scope.pay.sign=false;
                          $scope.pay.total=0;
                          $scope.pay.paid=0;
                          $scope.pay.change=0;
                        }
                        if(dataJson.type=="settle"){
                          $scope.pay.sign=true;
                          $scope.pay.total=dataJson.total;
						               //console.log(dataJson);
                        }
                        if(dataJson.type=="change"){
                          $scope.pay.sign=true;
                          $scope.pay.paid=dataJson.paid;
                          $scope.pay.change=dataJson.change;
                        //  $scope.pay.total=dataJson.total;
												  //console.log(dataJson);
                        }
                        if(dataJson.type=="welcome"){
                          $scope.welcome=false;
                          $scope.pay.sign=false;
                          $scope.pay.total=0;
                          $scope.pay.paid=0;
                          $scope.pay.change=0;


                        }

                     }
                    
                    }).error(function(){
                       $scope.id=-1;
                       $timeout($scope.getApiMenu,800);
                     
                    })

}

$scope.getApiMenu();

    
})




      function createStyle(cssHTML){
      
    var style = document.createElement('style');
    style.type = 'text/css';

    var head = document.getElementsByTagName('head')[0];
    if(style.styleSheet){
    style.styleSheet.cssText = cssHTML;

    }else{
      
    style.appendChild(document.createTextNode(cssHTML));

    }
    document.getElementsByTagName('head')[0].appendChild(style); 
 }

 function fade(len) {
  
   
     var  elementList = document.querySelectorAll(".efg");
     var e=elementList[elementList.length-2];
   
    function whichTransitionEvent(){
       var t;
       var el = document.createElement('fakeelement');
       var transitions = {
         'animation':'animationend',
         'webkitAnimation':'webkitAnimationEnd',
         'transition':'transitionend',
         'OTransition':'oTransitionEnd',
         'MozTransition':'transitionend',
         'WebkitTransition':'webkitTransitionEnd',
         
       }
       for(t in transitions){
           if( el.style[t] !== undefined ){
               return transitions[t];
           }
       }
   }
   var transitionEvent = whichTransitionEvent();


  // $("#sun").bind('animationend webkitAnimationEnd', function() { alert("fin") } )

         transitionEvent && e.addEventListener(transitionEvent, function() {
          
           
           for(var i=0;i<elementList.length;i++){
                    elementList[i].classList.toggle('anim_fade_image'+i);
                     
                   
                  }
           window.setTimeout(function(){
             for(var i=0;i<elementList.length;i++){
                    elementList[i].classList.toggle('anim_fade_image'+i);
                     
                   
                  }
             
            },10)
              });
         
  }