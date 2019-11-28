// Crear objetos y cargar imagen principal
var canvas = document.getElementById("canvas");
var pixels;
var ctx = canvas.getContext('2d');
var image = new Image();
var matriz = [];
var size = [];
// Crear objetos y cargar template
var canvasTem = document.getElementById("template");
var pixelsTem;
var ctxtmp = canvasTem.getContext('2d');
var template = new Image();
var matrizTem = [];
var sizeTem = [];
var bestNCC = 0;
var bestCoor = [];

// Diferencial
var f = 0.6;			    //Factor de aplicación
var cr = 0.2;		      //Constante de recombinación
var d = 2;			      //Dimensión
var limU;             //Limite superior
var limL;             //Limite inferior
var tam = 0;        //Muestras
var gen = 0;        //Generaciones
var particulas = [];	//Población
var v = [];			      //Vector mutante
var fitness = [];	    //Fitness

// Inicializar imagen
function imagen(src){
  canvas.width = canvas.scrollWidth;
  canvas.height = canvas.scrollHeight;
  image.src = src;
  image.onload = function(){
    ctx.drawImage(image, 0, 0);
    size = [image.width, image.height];
    var pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pixels = pixelData;
    bandw(pixels, ctx);
    pasMatriz(pixels, image.width);
  }
}

// Inicializar template
function plantilla(src){
  canvasTem.width = canvasTem.scrollWidth;
  canvasTem.height = canvasTem.scrollHeight;
  template.src = src;
  template.onload = function(){
    ctxtmp.drawImage(template, 0, 0);
    sizeTem = [template.width, template.height];
    var pixelData = ctxtmp.getImageData(0, 0, canvasTem.width, canvasTem.height);
    pixelsTem = pixelData;
    bandw(pixelsTem, ctxtmp);
    pasMatrizTem(pixelsTem, template.width);
  }
}

// Imagen a blanco y negro
  function bandw(pixel, ctrl){
    for(var i = 0; i < pixel.data.length; i += 4){
      var r = pixel.data[i];
      var g = pixel.data[i + 1];
      var b = pixel.data[i + 2];

      gray = (r + g + b)/3;

      pixel.data[i]     = gray;
      pixel.data[i + 1] = gray;
      pixel.data[i + 2] = gray;
    }

    ctrl.putImageData(pixel, 0, 0);
  }

  function pasMatriz(pixel, ancho){
    var cont = 0;
    var line = [];
    for(var i = 0; i < pixel.data.length; i += 4){
      var r = pixel.data[i];
      var g = pixel.data[i + 1];
      var b = pixel.data[i + 2];

      gray = (r + g + b)/3;
      if(cont == ancho){
        matriz.push(line);
        line = [];
        cont = 0;
      }
      if(cont < ancho){
        line.push(gray);
        cont += 1;
      }
    }
    if(line.length == ancho){
      matriz.push(line);
    }
  }

  function pasMatrizTem(pixel, ancho){
    var cont = 0;
    var line = [];
    for(var i = 0; i < pixel.data.length; i += 4){
      var r = pixel.data[i];
      var g = pixel.data[i + 1];
      var b = pixel.data[i + 2];

      gray = (r + g + b)/3;
      if(cont == ancho){
        matrizTem.push(line);
        line = [];
        cont = 0;
      }
      if(cont < ancho){
        line.push(gray);
        cont += 1;
      }
    }
    if(line.length == ancho){
      matrizTem.push(line);
    }
  }

  function ncc(x, y){
    var sum_img = 0;
    var sum_tem = 0;
    var sum_gen = 0;

    for(var i = 0; i < sizeTem[0]; i++){
      for(var j = 0; j < sizeTem[1]; j++){
        sum_img = sum_img + Math.pow( matriz[y+j][x+i] , 2);
        sum_tem = sum_tem + Math.pow( matrizTem[j][i]  , 2);
        sum_gen = sum_gen + ( matriz[y+j][x+i] * matrizTem[j][i] );
      }
    }

    var val = sum_gen / ( Math.sqrt(sum_img) * Math.sqrt(sum_tem) );
    return val;
  }

  function printFitness(x, y){
    $("#fitness").css("width", sizeTem[0]);
    $("#fitness").css("height", sizeTem[1]);

    var left = parseFloat($(".pict").css("width")) - size[0];

    $("#fitness").css("left", left/2 + x);
    $("#fitness").css("top", y);
  }

  function hardSearch(){
    for(var i = 0; i < size[0]-sizeTem[0]; i++){
      for(var j = 0; j < size[1]-sizeTem[1]; j++){
        var nccij = ncc(i, j);
        if(nccij > bestNCC){
          bestNCC = nccij;
          printFitness(i, j);
          bestCoor = [i, j];
        }
      }
    }
    console.log("Busqueda finalizada");
  }

  function diferencial(){
    for(var a = 0; a < gen; a++){
      for(var b = 0; b < tam; b++){
        var u = [];
        var particula = [];
        var rand1 = Math.floor(Math.random() * tam);
        var rand2 = Math.floor(Math.random() * tam);
        var rand3 = Math.floor(Math.random() * tam);
        while (rand1 == rand2) {
          rand2 = Math.floor(Math.random() * tam);
        }
        while (rand1 == rand3 || rand2 == rand3) {
          rand3 = Math.floor(Math.random() * tam);
        }
        var x = Math.abs( Math.trunc( particulas[rand1][0] + ( f * ( particulas[rand2][0] - particulas[rand3][0] ) ) ) );	//V[X]
        var y = Math.abs( Math.trunc( particulas[rand1][1] + ( f * ( particulas[rand2][1] - particulas[rand3][1] ) ) ) );	//V[Y]
        if(x > size[0] - sizeTem[0]){
          var x = Math.trunc( limL[0] + ( (limU[0] - limL[0])*Math.random() ) );
        }
        if(y > size[1] - sizeTem[1]){
          var y = Math.trunc( limL[1] + ( (limU[1] - limL[1])*Math.random() ) );
        }

        v = [x, y];

        var c = 0;
        while(c < d){
          if(Math.random() <= cr){
            particula.push(v[c]);
          }
          else{
            particula.push(particulas[b][c]);
          }
          c = c + 1;
        }
        if( ncc(particula[0], particula[1]) > ncc(particulas[b][0], particulas[b][1]) ){
          particulas[b] = particula;
          fitness[b] = ncc(particulas[b][0], particulas[b][1]);
        }
      }
    }
    solution();
  }

  function initSol(){
    limL = [0, 0];
    limU = [size[0]-sizeTem[0], size[1]-sizeTem[1]];
    for(var i = 0; i < tam; i++){
      var x = Math.trunc( limL[0] + ( (limU[0] - limL[0])*Math.random() ) );
      var y = Math.trunc( limL[1] + ( (limU[1] - limL[1])*Math.random() ) );
      var particula = [x, y];
      particulas.push(particula);
      var fit = ncc(x, y);
      fitness.push(fit);
      if(fit > bestNCC){
        bestNCC = fit;
        bestCoor = particula;
        printFitness(bestCoor[0], bestCoor[1]);
      }
    }
    diferencial();
  }

  function solution(){

    for(var b = 0; b < tam; b++){
      if(fitness[b] == Math.max(fitness)){
        bestNCC = fitness[b];
        bestCoor = particulas[b];
        printFitness(particulas[b][0], particulas[b][1]);
      }
    }
  }

  function validar(){
    tam = parseInt($("#tam").val());
    gen = parseInt($("#gen").val());

    if(gen > 0 && tam > 0){
      $(".btn").css("display", "block");
    }
    else{
      $(".btn").css("display", "none");
    }
  }

  imagen("img/image1.jpg");
  plantilla("img/template3.jpg");
