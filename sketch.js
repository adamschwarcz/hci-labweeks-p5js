/* P5.JS SIRI ANIMATION
 *
 * Inspired by two tutorials:
 * LED Strip –> https://www.youtube.com/watch?v=2O3nm0Nvbi4&t=12s
 * Bolbs -> https://www.youtube.com/watch?v=rX5p-QRP6R4
 *
 * GitHub Repo:
 * https://github.com/adamschwarcz/hci-labweeks-p5js
 */

// Initializes sensor/serial variables
let sensor;
let sensorValue;

// Initializes sound/equalizer variables
let song;
let fft;

/*
 * This is where we define some initial functions for receiving the data
 * from our serial output. In order the to see the code that controls
 * our sensors, follow the GitHub repository with Arduino (.ino) file below:
 *
 * –> GITHUB REPO: https://github.com/adamschwarcz/hci-labweeks-arduino
 */

// Prints a confirmation line in the console if connection was established
function connected() {
  print("Connected serial server");
}

// Prints the list of recognized serial ports in console
function list(val) {
  print("Available ports:");

  for (let i = 0; i < val.length; i++) {
    print(i + " " + val[i]);
  }
}

// Prints a line in console if serial port is open
function open() {
  print("Serial port open");
}

// Prints a line in console if serial port is closed
function close() {
  print("Serial port closed");
  sensorValue = "Serial port closed";
}

// Prints a line in console if error occurs with corresponding message
function error(theerror) {
  print(theerror);
}

// Reads all values received from serial port & prints them into console
function data() {
  let string = serial.readLine();
  trim(string);
  if (!string) return;
  sensorValue = string;
  console.log(sensorValue);
}

/* P5.JS PRELOAD: */
// A built-in function that helps us preload assets like images, sounds etc...
// This is where we define a reusable variable for our soundtrack / song.
function preload() {
  soundFormats("mp3", "ogg");
  song = loadSound("track.mp3");
}

/* P5.JS SETUP: */
// Initial canvas settings and commands that run on first render
function setup() {
  createCanvas(windowWidth, windowHeight); // Creates a canvas equal to your window size
  angleMode(DEGREES); // This helps us work with circular motion
  fft = new p5.FFT(0, 64); // Defines a variable through which we access our audio frequencies

  // Initializes our serial port on first render and makes sure
  // that we get our data correctly. Otherwise throws an error in console.
  serial = new p5.SerialPort();
  serial.list();
  serial.open("/dev/tty.usbmodem1442301");
  serial.on("connected", connected);
  serial.on("list", list);
  serial.on("open", open);
  serial.on("close", close);
  serial.on("error", error);
  serial.on("data", data);
}

/* P5.JS SETUP: */
// Commands that are executed with each new render
function draw() {
  blendMode(BURN); // Helps us saturates colors
  background(0); // Sets blackground to black
  blendMode(SCREEN); // Helps us make overlapping colors blend into each other
  togglePlay(); // Checks for certain serial value to toggle the song

  let spectrum = fft.analyze(); // Analyzes the song frequencies & generates an array

  // A for loop that helps us generate a non-static relative to the sound spectrum
  for (let i = spectrum.length; i > 0; i--) {
    let amp = spectrum[i];
    let freq = map(amp, 0, 255, 0, 30); // Remaps each value of our spectrum to a different range
    let xPos = width / 2; // Places shape in the middle of X axis
    let yPos = height / 2; // Places shape in the middle of Y axis
    let size = 0 + i * 0.1 * freq; // Determines the size of our shapes based on the song frequency
    let volume = i * 5; // Determines the size of our shape regardless of the song frequency
    let speed = frameCount / 150; // Determines the movement speed
    let fade = pow(1 - i / 80, 3); // Helps us gradually fade the shapes with each iteration
    let root = sqrt(i / 80); // Helps us get rid off any negative values for each iteration

    // Generates shapes
    fill(0, 0, 255, fade * 250);
    shape(size, xPos, yPos, root, speed + i * 0, volume);
    fill(0, 255, 0, fade * 250);
    shape(size, xPos, yPos, root, speed + i * 0 + 1, volume);
    fill(255, 0, 0, fade * 250);
    shape(size, xPos, yPos, root, speed + i * 0 + 2, volume);
  }
}

// Toggles the song based on sensor values
function togglePlay() {
  if (sensorValue < 10) {
    if (song.isPlaying()) {
    } else {
      song.play();
    }
  } else {
    song.stop();
  }
}

// This is where we define our custom bolb-ish shape
function shape(size, xPos, yPos, root, speed, volume) {
  beginShape();
  for (let i = 0; i <= 360 + (5 * 360) / 5; i += 360 / 5) {
    let cosinus = cos(i) + 0.5; // Calculates cosine of an angle for each iteration (the "0.5" addition achieves more circular shape)
    let sinus = sin(i) + 0.5; // Calculates sine of an angle for each iteration (the "0.5" addition achieves more circular shape)
    let r = size + noise(root * cosinus, root * sinus, speed) * volume; // Determines the size of our shape
    let x = xPos + r * cos(i); // Determines the x position
    let y = yPos + r * sin(i); // Determines the y position
    curveVertex(x, y); // Specifies shape curve coordinates
  }
  endShape();
}
