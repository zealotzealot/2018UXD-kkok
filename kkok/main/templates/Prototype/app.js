const DAY_MILLIS = 1000 * 60 * 60 * 24;
const FAMILY_COLORS = ["EE66DD", "22CCEE", "EEDD11", "55CC33"];

const DEVICE_SIZE = 500;
const BUTTON_SIZE = 30;
const PADDING = 16;

const AUTO_PERIOD = 1000 * 60 * 4;

const STYLE_MODE = 0;

let prevNow = 0;
let currentTime = 0;
let lastLoaded = 0;



// Disable double tap zooming
$(this).bind('touchend', function(e) {
  e.preventDefault();
  $(this).click();
});



// Initialize time

if (!IS_TEST){
  currentTime = (new Date()).getTime() - new Date(2000, 0, 1, 0, 0).getTime();
  lastLoaded = currentTime;
}



// Initialize time area

let timeAreas = [];
for (let i=0; i<8; i++) {
  timeAreas.push({
    time: DAY_MILLIS * Math.random(),
    familyAvailable: FAMILY_COLORS.map(x => (Math.random()<0.15))
  });
}
timeAreas.sort((a, b) => (a.time - b.time));



// Style mode functions

let styleKkokList = [
  function(kkok) {
    kkok.width = 2;
    kkok.height = DEVICE_SIZE / 2 / 4;
    kkok.x = Align.center;
    kkok.y = Align.top(DEVICE_SIZE / 2 / 6);
    kkok.originX = 0.5;
    kkok.originY = 4 - (4 / 6);
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
  function(device, deviceReceiveArea, deviceKkokArea, deviceSendArea) {
    device.borderRadius = DEVICE_SIZE/2;

    deviceReceiveArea.width = DEVICE_SIZE;
    deviceReceiveArea.height = DEVICE_SIZE;
    deviceReceiveArea.x = Align.center;
    deviceReceiveArea.y = Align.center;
    deviceReceiveArea.borderRadius = DEVICE_SIZE / 2;

    deviceKkokArea.width = DEVICE_SIZE * (1 - 1/6);
    deviceKkokArea.height = DEVICE_SIZE * (1 - 1/6);
    deviceKkokArea.x = Align.center;
    deviceKkokArea.y = Align.center;
    deviceKkokArea.borderRadius = DEVICE_SIZE * (1 - 1/6) / 2;

    deviceSendArea.width = DEVICE_SIZE * (1 - 1/6 - 1/4);
    deviceSendArea.height = DEVICE_SIZE * (1 - 1/6 - 1/4);
    deviceSendArea.x = Align.center;
    deviceSendArea.y = Align.center;
    deviceSendArea.borderRadius = DEVICE_SIZE * (1 - 1/6 - 1/4) / 2;
  },
  function(device, deviceReceiveArea, deviceKkokArea, deviceSendArea) {
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

  let scale;
  if (IS_TEST || colorIdx == FAMILY_ID) {
    kkok.scale = 0;
  }
  else {
    kkok.scale = 1 / (1 - 1/6);
  }
  kkok.animate({
    scale: 1,
    options: {
      time: 0.5 / Math.pow(10, speedSlider.value),
    }
  })

  let targetArea;
  if (IS_TEST || colorIdx == FAMILY_ID) {
    targetArea = deviceSendArea;
  }
  else {
    targetArea = deviceReceiveArea;
  }
  targetArea.backgroundColor = FAMILY_COLORS[colorIdx];
  targetArea.animate({
    backgroundColor: "FFFFFF",
    options: {
      time: 0.5 / Math.pow(10, speedSlider.value),
    }
  });
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
  shadowY: 4,
  shadowBlur: 12,
});
let deviceReceiveArea = new Layer({
  parent: device,
  backgroundColor: "#FFFFFF",
});
let deviceKkokArea = new Layer({
  parent: device,
  backgroundColor: "#FFFFFF",
});
let deviceSendArea = new Layer({
  parent: device,
  backgroundColor: "#FFFFFF",
});
styleDevice(device, deviceReceiveArea, deviceKkokArea, deviceSendArea);
if (!IS_TEST) {
  device.onClick(function() {
    createKkok(FAMILY_ID, currentTime);
    $.ajax({
      type: "POST",
      url: "/ajax/kkoks/create/",
      data: {
        session_id: SESSION_ID,
        family_id: FAMILY_ID,
        time: currentTime,
      },
    });
  });
}

let bar = new Layer({
  parent: device,
  backgroundColor: "#EEEEEE",
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



// Key press function

document.addEventListener("keypress", function(event) {
  if (event.keyCode == 32) {
    createKkok(FAMILY_ID, currentTime);
    $.ajax({
      type: "POST",
      url: "/ajax/kkoks/create/",
      data: {
        session_id: SESSION_ID,
        family_id: FAMILY_ID,
        time: currentTime,
      },
    });
  }

});



// Interval functions

let randomKkok = function(startTime, endTime) {
  let targetFamily = Math.floor(Math.random() * FAMILY_COLORS.length);
  let targetTime = startTime + (endTime - startTime) * Math.random();

  let i;
  for (i=0; i<timeAreas.length; i++) {
    if (timeAreas[i].time > targetTime%DAY_MILLIS)
      break;
  }

  if ((timeAreas[i%timeAreas.length].familyAvailable[targetFamily] == false)
    && (Math.random() > 0.02))
    return;

  createKkok(targetFamily, targetTime);
};
Utils.interval(1.0/60, function() {
  let now = performance.now();
  let timeDiff = (now - prevNow) * Math.pow(10, speedSlider.value);
  prevNow = now;

  currentTime += timeDiff;

  moveBar(bar);

  if (autoOn) {
    let t;
    for (t=currentTime-timeDiff; t+AUTO_PERIOD<currentTime; t+=AUTO_PERIOD)
      randomKkok(t, t+AUTO_PERIOD);
    if (Math.random()*AUTO_PERIOD < currentTime-t)
      randomKkok(t, currentTime);
  }
});

let updateCount = 0;
Utils.interval(1.0/10, function() {
  updateCount++;

  for (let i=0; i<kkoks.length; i++) {
    let k = kkoks[i];

    if (k.opacity<0.1 && i%5!=updateCount%5)
      continue;

    let timeDiff = (currentTime - k._data_time) / DAY_MILLIS * 24;
    k.opacity = Math.max(Math.pow(0.9, timeDiff), 0.1*Math.pow(0.995, timeDiff));
  }
  while (kkoks.length > 0) {
    if (kkoks[0].opacity < 0.01) {
      kkoks[0].destroy();
      kkoks.shift();
    }
    else
      break;
  }
});

if (!IS_TEST) {
  Utils.interval(1.0 / 5, function() {
    $.ajax({
      type: "POST",
      url: "/ajax/kkoks/load/",
      data: {
        session_id: SESSION_ID,
        family_id: FAMILY_ID,
        time: lastLoaded,
      },
      success: function(data) {
        for (let i=0; i<data.length; i++) {
          let d = data[i];
          createKkok(d.family_id, d.time);
          if (d.time > lastLoaded)
            lastLoaded = d.time+1;
        }
      }
    });
  });
}
