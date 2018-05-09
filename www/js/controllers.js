angular.module('starter.controllers', [])


.controller('DashCtrl', ['$scope', '$stateParams', '$http', '$ionicLoading','$rootScope', '$cordovaCamera',
 function($scope, $stateParams, $http, $ionicLoading, $rootScope, $cordovaCamera) {

//var placa = "";
var resposta;
var carros = 0;
var sinesp = "";
$scope.showB = "ng-hide";

$scope.consultarPlaca = function(placas) {
    $scope.placa = placas;
    $ionicLoading.show();
    $scope.sinesp = "0";
    $scope.showB = "ng-hide";
    $scope.retorno = "consultarPlaca";
    $scope.consultaPlacaSinespHTTP();
}

$scope.consultaPlacaSinespHTTP = function()    {
    $scope.retorno = "consultaPlacaSinespHTTP";
    const crypto = require('crypto')

    //$ionicLoading.show();

    const secret = '#8.1.0#Mw6HqdLgQsX41xAGZgsF';

    var lat = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    var lon = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    var latitude  = '-45.5' //. rand(100000, 999999);
    var longitude = '-15.7' //. rand(100000, 999999);

    latitude = latitude.concat(lat.toString());
    longitude = longitude.concat(lon.toString());

    placa =  $scope.placa;

    const token = crypto.createHmac('sha1', placa+secret).update(placa).digest('hex');
    const data = new Date().toISOString().replace("T", " ").substr(0, 19);

    const xml = '<?xml version="1.0" encoding="utf-8" standalone="yes" ?>\
      <v:Envelope xmlns:v="http://schemas.xmlsoap.org/soap/envelope/">\
        <v:Header>\
          <b>samsung GT-I9192</b>\
          <c>ANDROID</c>\
          <d>8.1.0</d>\
          <i>'+latitude+'</i>\
          <e>4.1.5</e>\
          <f>10.0.0.1</f>\
          <g>'+token+'</g>\
          <k></k>\
          <h>'+longitude+'</h>\
          <l>'+data+'</l>\
          <m>8797e74f0d6eb7b1ff3dc114d4aa12d3</m>\
        </v:Header>\
        <v:Body>\
          <n0:getStatus xmlns:n0="http://soap.ws.placa.service.sinesp.serpro.gov.br/">\
            <a>'+placa+'</a>\
          </n0:getStatus>\
        </v:Body>\
      </v:Envelope>';

      const headers = {
        "Content-type": "text/xml",
        "Accept": "text/xml",
        "Content-length": xml.length
      }
    $scope.retorno = "consultaPlacaSinespHTTPINICIO";
    $http({
        method : "POST",
        url : "https://cidadao.sinesp.gov.br/sinesp-cidadao/mobile/consultar-placa/v3",
        data: xml,
        headers: headers
    }).then(function mySuccess(response) {
        $scope.sinesp = JSON.stringify(response.data);
        $scope.consultarPlacaCC();
    }, function myError(response) {
        $scope.sinesp = "E";
        $scope.consultarPlacaCC();
    });
}


$scope.consultarPlacaCC = function()  {
    $scope.retorno = "consultarPlacaCC";
    var dadoscarro = [];

    const headers = {
        "Content-type": "text/xml",
        "Accept": "text/xml"
      }

    $http({
        method : "POST",
        url : "http://casarochadois.servehttp.com/fipe/consultasinesp.php?placa=" + $scope.placa,
        data: $scope.sinesp,
        headers: headers
    }).then(function mySuccess(response) {
        try {
            $scope.item = 0;
            $scope.consulta = '';
            dadoscarro = JSON.stringify(response.data);
            if (dadoscarro.length > 10) { 
                $scope.dadoscarro = JSON.parse(dadoscarro).placas;
                $scope.carros = $scope.dadoscarro.length;
                if($scope.carros > 1 ){
                   $scope.showB = "ng-show";
                }else{
                    $scope.showB = "ng-hide";
                }
                $rootScope.dadosmodelomr = JSON.parse(dadoscarro).carros;
                $ionicLoading.hide();
            } else {
                $scope.showB = "ng-hide";
                $scope.consulta = 'Placa não Encontrada';
                $ionicLoading.hide();
            }
        }
        catch(err) {
            $scope.item = 0;
            $scope.showB = "ng-hide";
            $scope.consulta = 'Placa não Encontrada';
            $ionicLoading.hide();
        }
    }, function myError(response) {
        $ionicLoading.hide();
        $scope.dadoscarro = null;
        $rootScope.dadosmodelomr = null;
        $scope.carros = 0;
        $scope.item = 0;
        $rootScope.dadosmodelomr = null
        $scope.consulta = 'Placa não Encontrada';
    });
}

$scope.consultarModeloMR = function()    {
    $scope.retorno = "consultarModeloMR";
    $http({
        method : "GET",
        url : "http://casarochadois.servehttp.com/fipe/modelomr.php?fipe="+$scope.dadoscarro[$scope.item].codigo_fipe
    }).then(function mySuccess(response) {
        $ionicLoading.hide();
         try {
            dadoscarro = JSON.stringify(response.data);
            $rootScope.dadosmodelomr = JSON.parse(dadoscarro);
        }
        catch(err) {
            $scope.consulta = 'Erro ao consultar Carro Curioso';
        }
    }, function myError(response) {
        $ionicLoading.hide();
    });
}

$scope.selecionaCarro = function(dadocarro) {
    var arr = dadocarro.split('/');
    for(var i = 0; i < $scope.dadoscarro.length; i++) {
        if($scope.dadoscarro[i].codigo_fipe == arr[0].trim()){
            $scope.item = i;
            $ionicLoading.show();
            $scope.consultarModeloMR();
        }
    }
}

$scope.habilitaDefinirPlaca = function() {
    if($scope.carros > 1 ){
        return 'ng-show';
    }else{
        return 'ng-hide';
    }
}

$scope.definirPlaca = function()    {
    $ionicLoading.show();
    $http({
        method : "GET",
        url : "http://casarochadois.servehttp.com/fipe/defineplacafipe.php?placa=" + $scope.placa + "&fipe=" + $scope.dadoscarro[$scope.item].codigo_fipe + "&acao=I"
    }).then(function mySuccess(response) {
        $ionicLoading.hide();
        $scope.consultarPlaca($scope.placa);
    }, function myError(response) {
        console.log(response);
        $ionicLoading.hide();
    });
}


$scope.takePhotos = function () {
  var options = {
    quality: 100,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: Camera.PictureSourceType.CAMERA,
    allowEdit: true,
    encodingType: Camera.EncodingType.JPEG,
    targetWidth: 480,
    targetHeight: 240,
    popoverOptions: CameraPopoverOptions,
    saveToPhotoAlbum: false,
    correctOrientatio:true
};

    $cordovaCamera.getPicture(options).then(function (imageData) {
        $scope.imgURI = "data:image/jpeg;base64," + imageData;
    }, function (err) {
        // An error occured. Show a message to the user
    });
}

$scope.testOcrad = function(){
  $ionicLoading.show();
  try {
      OCRAD(document.getElementById("pic"), function(text){
        var placaocr = text;
        $rootScope.placa = placaocr;
        if (placaocr.length == 8){
          placaocr = placaocr.replace("-","");
          $scope.consultarPlaca (placaocr);
        }
        //location.reload();
        $ionicLoading.hide();
      });
  }
  catch(err) {
       $ionicLoading.hide();
       //location.reload();
  }
 
}

$scope.doThis = function(){
  $scope.testOcrad();
}

$scope.poePlaca = function(){
  alert ($rootScope.placa);
  $rootScope.placa = 'ABC';
  alert ($rootScope.placa);
}



}])

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $cordovaCamera, $ionicLoading) {

    
      $scope.takePhoto = function () {
        var options = {
          quality: 100,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 480,
          targetHeight: 240,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientatio:true
      };

          $cordovaCamera.getPicture(options).then(function (imageData) {
              $scope.imgURI = "data:image/jpeg;base64," + imageData;
          }, function (err) {
              // An error occured. Show a message to the user
          });
      }

      $scope.choosePhoto = function () {
        var options = { 
          quality: 100,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 300,
          targetHeight: 300,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
      };

          $cordovaCamera.getPicture(options).then(function (imageData) {
              $scope.imgURI = "data:image/jpeg;base64," + imageData;
          }, function (err) {
              // An error occured. Show a message to the user
          });
      }

      $scope.testOcrad = function(){
        $ionicLoading.show();
        try {
            OCRAD(document.getElementById("pic"), function(text){
              $scope.placa = text;
              if (text.length == 8) {
                  $scope.placa = $scope.placa.replace("-","");
                  $scope.consultarPlaca($scope.placa);
              }
              //console.log(text);
              //alert(text);
            });
             $ionicLoading.hide();
        }
        catch(err) {
             $ionicLoading.hide();
        }
       
      }

      $scope.doThis = function(){
        $scope.testOcrad();
      }
      


});
