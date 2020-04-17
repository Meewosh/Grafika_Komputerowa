var gl;
var shaderProgram;
var uPMatrix;
var vertexPositionBuffer;
var vertexColorBuffer;
function MatrixMul(a,b) //Mnożenie macierzy
{
    c = [
        0,0,0,0,
        0,0,0,0,
        0,0,0,0,
        0,0,0,0
    ]
    for(let i=0;i<4;i++)
    {
        for(let j=0;j<4;j++)
        {
            c[i*4+j] = 0.0;
            for(let k=0;k<4;k++)
            {
                c[i*4+j]+= a[i*4+k] * b[k*4+j];
            }
        }
    }
    return c;
}

function startGL()
{
    //alert("StartGL");
    let canvas = document.getElementById("canvas3D"); //wyszukanie obiektu w strukturze strony
    gl = canvas.getContext("experimental-webgl"); //pobranie kontekstu OpenGL'u z obiektu canvas
    gl.viewportWidth = canvas.width; //przypisanie wybranej przez nas rozdzielczości do systemu OpenGL
    gl.viewportHeight = canvas.height;

    //Kod shaderów
    const vertextShaderSource = ` //Znak akcentu z przycisku tyldy - na lewo od przycisku 1 na klawiaturze
    precision highp float;
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexColor;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vColor;
    void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); //Dokonanie transformacji położenia punktów z przestrzeni 3D do przestrzeni obrazu (2D)
      vColor = aVertexColor;
    }
  `;
    const fragmentShaderSource = `
    precision highp float;
    varying vec3 vColor;
    void main(void) {
      gl_FragColor = vec4(vColor,1.0); //Ustalenie stałego koloru wszystkich punktów sceny
    }
  `;
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //Stworzenie obiektu shadera
    let vertexShader   = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource); //Podpięcie źródła kodu shader
    gl.shaderSource(vertexShader, vertextShaderSource);
    gl.compileShader(fragmentShader); //Kompilacja kodu shader
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) { //Sprawdzenie ewentualnych błedów kompilacji
        alert(gl.getShaderInfoLog(fragmentShader));
        return null;
    }
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader));
        return null;
    }

    shaderProgram = gl.createProgram(); //Stworzenie obiektu programu
    gl.attachShader(shaderProgram, vertexShader); //Podpięcie obu shaderów do naszego programu wykonywanego na karcie graficznej
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) alert("Could not initialise shaders");  //Sprawdzenie ewentualnych błedów

    //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z
    let vertexPosition = [
        //podloga
        -5.0,  0.0,  5.0, -5.0,  0.0, -5.0,  5.0,  0.0,  5.0,
        -5.0,  0.0, -5.0,  5.0,  0.0,  5.0,  5.0,  0.0, -5.0,

    /*
        //sufit

        -5.0,  1.0,  3.0, -5.0,  1.0, -5.0, -4.0,  1.0,  3.0,   // lewa ściana labiryntu
        -4.0,  1.0, -5.0, -5.0,  1.0, -5.0, -4.0,  1.0,  3.0,

        -5.0,  1.0,  5.0, -5.0,  1.0,  4.0, -3.0,  1.0,  5.0,   // lewy dół prostokat mały
        -3.0,  1.0,  4.0, -5.0,  1.0,  4.0, -3.0,  1.0,  5.0,

        -3.0,  1.0,  2.0, -3.0,  1.0,  5.0, -1.0,  1.0,  5.0,   // lewy dół I prostokąt duzy
        -3.0,  1.0,  2.0, -1.0,  1.0,  2.0, -1.0,  1.0,  5.0,

        -1.0,  1.0,  4.0, -1.0,  1.0,  5.0,  0.0,  1.0,  5.0,   // mały kwadrat dól lewo
        -1.0,  1.0,  4.0,  0.0,  1.0,  4.0,  0.0,  1.0,  5.0,

         0.0,  1.0,  2.0,  0.0,  1.0,  5.0,  2.0,  1.0,  5.0,   // środek dół II prostokąt duzy
         0.0,  1.0,  2.0,  2.0,  1.0,  2.0,  2.0,  1.0,  5.0,

         2.0,  1.0,  4.0,  2.0,  1.0,  5.0,  3.0,  1.0,  5.0,   // mały kwadrat dól prawo
         2.0,  1.0,  4.0,  3.0,  1.0,  4.0,  3.0,  1.0,  5.0,

         3.0,  1.0, -1.0,  3.0,  1.0,  5.0,  5.0,  1.0,  5.0,   // prawy dół III prostokąt duzy
         3.0,  1.0, -1.0,  5.0,  1.0, -1.0,  5.0,  1.0,  5.0,

         0.0,  1.0, -1.0,  0.0,  1.0,  1.0,  2.0,  1.0,  1.0,   // kwadrat na środku
         0.0,  1.0, -1.0,  2.0,  1.0, -1.0,  2.0,  1.0,  1.0,

        -2.0,  1.0, -1.0, -2.0,  1.0,  1.0, -1.0,  1.0,  1.0,   // prostokat lewo nad lewy dół I prostokąt duzy
        -2.0,  1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,  1.0,

        -4.0,  1.0, -1.0, -4.0,  1.0,  0.0, -2.0,  1.0,  0.0,   // połączenie tego powyżej z lewą dugą scianą
        -4.0,  1.0, -1.0, -2.0,  1.0, -1.0, -2.0,  1.0,  0.0,

        -4.0,  1.0, -5.0, -4.0,  1.0, -4.0, -3.0,  1.0, -4.0,   // góra lewo mały kwadrat
        -4.0,  1.0, -5.0, -3.0,  1.0, -5.0, -3.0,  1.0, -4.0,

        -2.0,  1.0, -5.0, -2.0,  1.0, -4.0,  5.0,  1.0, -4.0,   // góra długi
        -2.0,  1.0, -5.0,  5.0,  1.0, -5.0,  5.0,  1.0, -4.0,

         0.0,  1.0, -3.0,  0.0,  1.0, -2.0,  4.0,  1.0, -2.0,   // długi prostokąt w środku
         0.0,  1.0, -3.0,  4.0,  1.0, -3.0,  4.0,  1.0, -2.0,

         4.0,  1.0, -4.0,  4.0,  1.0, -1.0,  5.0,  1.0, -1.0,   // prawy protokąt łączeniowy III prostokąt duzy z góra długi
         4.0,  1.0, -4.0,  5.0,  1.0, -4.0,  5.0,  1.0, -1.0,

        -2.0,  1.0, -4.0, -2.0,  1.0, -2.0, -1.0,  1.0, -2.0,   // prostokąt góra nad prostokat lewo nad lewy dół I prostokąt duzy
        -2.0,  1.0, -4.0, -1.0,  1.0, -4.0, -1.0,  1.0, -2.0,

        -3.0,  1.0, -3.0, -3.0,  1.0, -2.0, -2.0,  1.0, -2.0,   // prostokąt góra nad prostokat lewo nad lewy dół I prostokąt duzy
        -3.0,  1.0, -3.0, -2.0,  1.0, -3.0, -2.0,  1.0, -2.0,



     */


        // ściany

        // lewa sciana labiryntu

        -5.0,  1.0,  3.0, -5.0,  0.0,  3.0, -5.0,  0.0, -5.0, // lewa sciana
        -5.0,  1.0,  3.0, -5.0,  1.0, -5.0, -5.0,  0.0, -5.0,

        -4.0,  1.0,  3.0, -4.0,  0.0,  3.0, -4.0,  0.0, -5.0, // prawa sciana
        -4.0,  1.0,  3.0, -4.0,  1.0, -5.0, -4.0,  0.0, -5.0,

        -5.0,  1.0,  3.0, -5.0,  0.0,  3.0, -4.0,  0.0,  3.0, // dół sciana
        -5.0,  1.0,  3.0, -4.0,  1.0,  3.0, -4.0,  0.0,  3.0,

        -5.0,  1.0, -5.0, -5.0,  0.0, -5.0, -4.0,  0.0, -5.0, // góra sciana
        -5.0,  1.0, -5.0, -4.0,  1.0, -5.0, -4.0,  0.0, -5.0,


        // dolna ściana labiryntu

        -5.0,  1.0,  5.0, -5.0,  0.0,  5.0,  5.0,  0.0,  5.0, // dół sciana
        -5.0,  1.0,  5.0,  5.0,  1.0,  5.0,  5.0,  0.0,  5.0,

        -5.0,  1.0,  4.0, -5.0,  0.0,  4.0,  5.0,  0.0,  4.0, // góra sciana
        -5.0,  1.0,  4.0,  5.0,  1.0,  4.0,  5.0,  0.0,  4.0,

        -5.0,  1.0,  5.0, -5.0,  0.0,  5.0, -5.0,  0.0,  4.0, // lewa sciana
        -5.0,  1.0,  5.0, -5.0,  1.0,  4.0, -5.0,  0.0,  4.0,

         5.0,  1.0,  5.0,  5.0,  0.0,  5.0,  5.0,  0.0,  4.0, // prawa sciana
         5.0,  1.0,  5.0,  5.0,  1.0,  4.0,  5.0,  0.0,  4.0,

        // kwadrat lewo dół I
        -3.0,  1.0,  4.0, -3.0,  0.0,  4.0, -1.0,  0.0,  4.0, // dół sciana
        -3.0,  1.0,  4.0, -1.0,  1.0,  4.0, -1.0,  0.0,  4.0,

        -3.0,  1.0,  2.0, -3.0,  0.0,  2.0, -1.0,  0.0,  2.0, // góra sciana
        -3.0,  1.0,  2.0, -1.0,  1.0,  2.0, -1.0,  0.0,  2.0,

        -3.0,  1.0,  4.0, -3.0,  0.0,  4.0, -3.0,  0.0,  2.0, // lewa sciana
        -3.0,  1.0,  4.0, -3.0,  1.0,  2.0, -3.0,  0.0,  2.0,

        -1.0,  1.0,  4.0, -1.0,  0.0,  4.0, -1.0,  0.0,  2.0, // prawa sciana
        -1.0,  1.0,  4.0, -1.0,  1.0,  2.0, -1.0,  0.0,  2.0,


        // kwadrat środek dół II
         0.0,  1.0,  4.0,  0.0,  0.0,  4.0,  2.0,  0.0,  4.0, // dół sciana
         0.0,  1.0,  4.0,  2.0,  1.0,  4.0,  2.0,  0.0,  4.0,

         0.0,  1.0,  2.0,  0.0,  0.0,  2.0,  2.0,  0.0,  2.0, // góra sciana
         0.0,  1.0,  2.0,  2.0,  1.0,  2.0,  2.0,  0.0,  2.0,

         0.0,  1.0,  4.0,  0.0,  0.0,  4.0,  0.0,  0.0,  2.0, // lewa sciana
         0.0,  1.0,  4.0,  0.0,  1.0,  2.0,  0.0,  0.0,  2.0,

         2.0,  1.0,  4.0,  2.0,  0.0,  4.0,  2.0,  0.0,  2.0, // prawa sciana
         2.0,  1.0,  4.0,  2.0,  1.0,  2.0,  2.0,  0.0,  2.0,


        // kwadrat środek III nad  dół II
         0.0,  1.0,  1.0,  0.0,  0.0,  1.0,  2.0,  0.0,  1.0, // dół sciana
         0.0,  1.0,  1.0,  2.0,  1.0,  1.0,  2.0,  0.0,  1.0,

         0.0,  1.0, -1.0,  0.0,  0.0, -1.0,  2.0,  0.0, -1.0, // góra sciana
         0.0,  1.0, -1.0,  2.0,  1.0, -1.0,  2.0,  0.0, -1.0,

         0.0,  1.0,  1.0,  0.0,  0.0,  1.0,  0.0,  0.0, -1.0, // lewa sciana
         0.0,  1.0,  1.0,  0.0,  1.0, -1.0,  0.0,  0.0, -1.0,

         2.0,  1.0,  1.0,  2.0,  0.0,  1.0,  2.0,  0.0, -1.0, // prawa sciana
         2.0,  1.0,  1.0,  2.0,  1.0, -1.0,  2.0,  0.0, -1.0,

        // prawa prostokąt duzy

         3.0,  1.0, -1.0,  3.0,  0.0, -1.0,  5.0,  0.0, -1.0, // góra sciana
         3.0,  1.0, -1.0,  5.0,  1.0, -1.0,  5.0,  0.0, -1.0,

         3.0,  1.0,  4.0,  3.0,  0.0,  4.0,  3.0,  0.0, -1.0, // lewa sciana
         3.0,  1.0,  4.0,  3.0,  1.0, -1.0,  3.0,  0.0, -1.0,

         5.0,  1.0,  4.0,  5.0,  0.0,  4.0,  5.0,  0.0, -1.0, // prawa sciana
         5.0,  1.0,  4.0,  5.0,  1.0, -1.0,  5.0,  0.0, -1.0,


        // kwadrat środek III nad  dół II
        -4.0,  1.0,  0.0, -4.0,  0.0,  0.0, -1.0,  0.0,  0.0, // góra sciana
        -4.0,  1.0,  0.0, -1.0,  1.0,  0.0, -1.0,  0.0,  0.0,

        -4.0,  1.0, -1.0, -4.0,  0.0, -1.0, -1.0,  0.0, -1.0, // góra sciana
        -4.0,  1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  0.0, -1.0,

        -2.0,  1.0,  1.0, -2.0,  0.0,  1.0, -2.0, -1.0, -1.0, // lewa sciana
        -2.0,  1.0,  1.0, -2.0,  1.0, -1.0, -2.0, -1.0, -1.0,

        -1.0,  1.0,  1.0, -1.0,  0.0,  1.0, -1.0, -1.0, -1.0, // prawa sciana
        -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0, -1.0, -1.0,

        -2.0,  1.0,  1.0, -2.0,  0.0,  1.0, -1.0,  0.0,  1.0, // góra sciana
        -2.0,  1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  0.0,  1.0,

        //

        -5.0,  1.0,  5.0, -5.0,  0.0,  5.0,  5.0,  0.0,  5.0, // dół sciana
        -5.0,  1.0,  5.0,  5.0,  1.0,  5.0,  5.0,  0.0,  5.0,

        -5.0,  1.0,  4.0, -5.0,  0.0,  4.0,  5.0,  0.0,  4.0, // góra sciana
        -5.0,  1.0,  4.0,  5.0,  1.0,  4.0,  5.0,  0.0,  4.0,

        -5.0,  1.0,  5.0, -5.0,  0.0,  5.0, -5.0,  0.0,  4.0, // lewa sciana
        -5.0,  1.0,  5.0, -5.0,  1.0,  4.0, -5.0,  0.0,  4.0,

         5.0,  1.0,  5.0,  5.0,  0.0,  5.0,  5.0,  0.0,  4.0, // prawa sciana
         5.0,  1.0,  5.0,  5.0,  1.0,  4.0,  5.0,  0.0,  4.0,


    ]

    vertexPositionBuffer = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
    vertexPositionBuffer.numItems = 106; //Zdefinoiowanie liczby punktów w naszym buforze

    //Opis sceny 3D, kolor każdego z wierzchołków
    let vertexColor = [
        // podloga
        0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,

        // sufit
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,

        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,



    ]
    vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
    vertexColorBuffer.itemSize = 3;
    vertexColorBuffer.numItems = 106;


    //Macierze opisujące położenie wirtualnej kamery w przestrzenie 3D
    let aspect = gl.viewportWidth/gl.viewportHeight;
    let fov = 45.0 * Math.PI / 180.0; //Określenie pola widzenia kamery
    let zFar = 100.0; //Ustalenie zakresów renderowania sceny 3D (od obiektu najbliższego zNear do najdalszego zFar)
    let zNear = 0.1;
    uPMatrix = [
        1.0/(aspect*Math.tan(fov/2)),0                           ,0                         ,0                            ,
        0                         ,1.0/(Math.tan(fov/2))         ,0                         ,0                            ,
        0                         ,0                           ,-(zFar+zNear)/(zFar-zNear)  , -1,
        0                         ,0                           ,-(2*zFar*zNear)/(zFar-zNear) ,0.0,
    ];
    Tick();
}
//let angle = 45.0; //Macierz transformacji świata - określenie położenia kamery
var angleZ = 0.0;
var angleY = 0.0;
var angleX = 70.0;
var tz = -7.0;
var tx = 0.0;
var ty = -20.0;

function Tick()
{
    let uMVMatrix = [
        1,0,0,0, //Macierz jednostkowa
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ];

    let uMVRotZ = [
        +Math.cos(angleZ*Math.PI/180.0),+Math.sin(angleZ*Math.PI/180.0),0,0,
        -Math.sin(angleZ*Math.PI/180.0),+Math.cos(angleZ*Math.PI/180.0),0,0,
        0,0,1,0,
        0,0,0,1
    ];

    let uMVRotY = [
        +Math.cos(angleY*Math.PI/180.0),0,-Math.sin(angleY*Math.PI/180.0),0,
        0,1,0,0,
        +Math.sin(angleY*Math.PI/180.0),0,+Math.cos(angleY*Math.PI/180.0),0,
        0,0,0,1
    ];

    let uMVRotX = [
        1,0,0,0,
        0,+Math.cos(angleX*Math.PI/180.0),+Math.sin(angleX*Math.PI/180.0),0,
        0,-Math.sin(angleX*Math.PI/180.0),+Math.cos(angleX*Math.PI/180.0),0,
        0,0,0,1
    ];

    let uMVTranslateZ = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,tz,1
    ];

    let uMVTranslateX = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        tx,0,0,1
    ];

    let uMVTranslateY = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,ty,0,1
    ];

    uMVMatrix = MatrixMul(uMVMatrix,uMVTranslateZ);
    uMVMatrix = MatrixMul(uMVMatrix,uMVTranslateX);
    uMVMatrix = MatrixMul(uMVMatrix,uMVTranslateY);

    uMVMatrix = MatrixMul(uMVMatrix,uMVRotX);
    uMVMatrix = MatrixMul(uMVMatrix,uMVRotY);
    uMVMatrix = MatrixMul(uMVMatrix,uMVRotZ);


    //alert(uPMatrix);

    //Render Scene
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(1.0,0.0,0.0,1.0); //Wyczyszczenie obrazu kolorem czerwonym
    gl.clearDepth(1.0);             //Wyczyścienie bufora głebi najdalszym planem
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shaderProgram)   //Użycie przygotowanego programu shaderowego

    gl.enable(gl.DEPTH_TEST);           // Włączenie testu głębi - obiekty bliższe mają przykrywać obiekty dalsze
    gl.depthFunc(gl.LEQUAL);            //

    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix));

    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));  //Przekazanie położenia
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexPosition"), vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexColor"));  //Przekazanie kolorów
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexColor"), vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania

    setTimeout(Tick,100);
}
function handlekeydown(e)
{
    if(e.keyCode==87) angleX=angleX+1.0; //W
    if(e.keyCode==83) angleX=angleX-1.0; //S
    if(e.keyCode==68) angleY=angleY+1.0;
    if(e.keyCode==65) angleY=angleY-1.0;
    if(e.keyCode==81) angleZ=angleZ+1.0;
    if(e.keyCode==69) angleZ=angleZ-1.0;
    if(e.keyCode==73) tz = tz+0.2; //i forward
    if(e.keyCode==75) tz = tz-0.2;
    if(e.keyCode==74) tx = tx+0.2;
    if(e.keyCode==76) tx = tx-0.2;
    if(e.keyCode==85) ty = ty-0.2;
    if(e.keyCode==79) ty = ty+0.2;
    //alert(e.keyCode);
    //alert(angleX);
}