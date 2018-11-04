const DAY_MILLIS = 1000 * 60 * 60 * 24;
const FAMILY_COLORS = ["FF0000", "00FF00", "0000FF"];

const DEVICE_SIZE = 400;
const BUTTON_SIZE = 30;
const PADDING = 16;

const AUTO_PERIOD = 1000 * 60 * 20;

const STYLE_MODE = 0;

Screen.backgroundColor = "#ff0";

let prevNow = 0;
let currentTime = 0;



// Style mode functions

let styleKkokList = [
  function(kkok) {
    kkok.width = 2;
    kkok.height = DEVICE_SIZE / 2 / 4;
    kkok.x = Align.center;
    kkok.y = Align.top;
    kkok.originX = 0.5;
    kkok.originY = 4;
    kkok.rotation = 360 * (kkok._data_time % DAY_MILLIS) / DAY_MILLIS;
  },
  function(kkok) {
    kkok.width = 2;
    kkok.height = DEVICE_SIZE / 2;
    kkok.x = Align.left(DEVICE_SIZE * (kkok._data_time % DAY_MILLIS) / DAY_MILLIS);
    kkok.y = Align.center;
    kkok.originX = 0.5;
    kkok.originY = 4;
    kkok.rotation = 0;
  },
];
let styleKkok = styleKkokList[STYLE_MODE];

let styleDeviceList = [
  function(device) {
    device.borderRadius = DEVICE_SIZE/2;
  },
  function(device) {
    device.borderRadius = DEVICE_SIZE/20;
  },
]
let styleDevice = styleDeviceList[STYLE_MODE];

let styleBarList = [
  function(bar) {
    bar.width = 2;
    bar.height = DEVICE_SIZE / 2;
    bar.x = Align.center;
    bar.y = Align.top;
    bar.originX = 0.5;
    bar.originY = 1;
  },
  function(bar) {
    bar.width = 2;
    bar.height = DEVICE_SIZE / 1.8;
    bar.y = Align.center;
    bar.originX = 0.5;
    bar.originY = 1;
    bar.rotation = 0;
  },
]
let styleBar = styleBarList[STYLE_MODE];

let moveBarList = [
  function(bar) {
    bar.rotation = 360 * (currentTime % DAY_MILLIS) / DAY_MILLIS;
  },
  function(bar) {
    bar.x = Align.left(DEVICE_SIZE * (currentTime % DAY_MILLIS) / DAY_MILLIS);
  },
]
let moveBar = moveBarList[STYLE_MODE];



// Create kkok function

let createKkok = function(colorIdx, time) {
  let kkok = new Layer({
    parent: device,
    backgroundColor: FAMILY_COLORS[colorIdx],
  });

  kkok._data_time = time;
  styleKkok(kkok);
  kkoks.push(kkok);
};



// Device

let device = new Layer({
  width: DEVICE_SIZE,
  height: DEVICE_SIZE,
  x: Align.center,
  y: Align.center,
  backgroundColor: "#FFFFFF",
  shadowColor: "#DDDDDD",
  shadowX: 0,
  shadowY: 6,
  shadowBlur: 12,
});
styleDevice(device);
if (!IS_TEST) {
  device.onClick(function() {
    createKkok(0, currentTime);
  });
}

let bar = new Layer({
  parent: device,
  backgroundColor: "#AAAAAA",
})
styleBar(bar);



// UI elements

let speedSlider = new SliderComponent({
  width: 200,
  x: Align.right(-PADDING),
  y: Align.bottom(-PADDING),
  min: 0,
  max: 5.4,
});

let autoOn = false;
let autoButton = new Layer({
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  x: Align.center,
  y: Align.bottom(-PADDING),
  backgroundColor: "#555555",
  opacity: 0.3,
});
autoButton.onClick(function() {
  if (autoOn == false) {
    autoOn = true;
    autoButton.opacity = 1;
    for (let i=0; i<kkokButtons.length; i++) {
      kkokButtons[i].opacity = 0.3;
    }
  }
  else {
    autoOn = false;
    autoButton.opacity = 0.3;
    for (let i=0; i<kkokButtons.length; i++) {
      kkokButtons[i].opacity = 1
    };
  }
});

let kkoks = [];
let kkokButtons = [];
for (let i=0; i<FAMILY_COLORS.length; i++) {

  let b = new Layer({
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    x: Align.left(PADDING + (PADDING+BUTTON_SIZE)*i),
    y: Align.bottom(-PADDING),
    borderRadius: BUTTON_SIZE/2,
    backgroundColor: FAMILY_COLORS[i],
  });

  b.onClick(function() {
    if (autoOn)
      return;
    let kkok = createKkok(i, currentTime);
  });

  kkokButtons.push(b);
}

if (!IS_TEST) {
  speedSlider.visible = false;
  autoButton.visible = false;
  for (let i=0; i<kkokButtons.length; i++)
    kkokButtons[i].visible = false;
}



// Interval functions

Utils.interval(1.0/1000, function() {
  let now = performance.now();
  let timeDiff = (now - prevNow) * Math.pow(10, speedSlider.value);
  prevNow = now;

  currentTime += timeDiff;

  moveBar(bar);

  if (autoOn) {
    let number = Math.floor(timeDiff / AUTO_PERIOD);
    if (Math.random() < (timeDiff % AUTO_PERIOD) / AUTO_PERIOD)
      number += 1;
    for (let i=0; i<number; i++) {
      let targetFamily = Math.floor(Math.random() * FAMILY_COLORS.length)
      let targetTime = currentTime - timeDiff * Math.random();
      createKkok(targetFamily, targetTime);
    }
  }
});

Utils.interval(1.0/30, function() {
  for (let i=0; i<kkoks.length; i++) {
    let k = kkoks[i];
    let timeDiff = (currentTime - k._data_time) / DAY_MILLIS * 24;
    k.opacity = Math.max(Math.pow(0.85, timeDiff), 0.1*Math.pow(0.995, timeDiff));
  }
  while (kkoks.length > 0) {
    if (kkoks[0].opacity < 0.01) {
      kkoks[0].destroy();
      kkoks.shift();
    }
    else
      break;
  }
  console.log(kkoks.length);
});
