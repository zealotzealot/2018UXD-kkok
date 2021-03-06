const DAY_MILLIS = 1000 * 60 * 60 * 24;
const SMALL_MILLIS = 1000 * 60 * 3;
const FAMILY_COLORS = ["EE66DD", "22CCEE", "EEDD11", "55CC33"];

const DEVICE_SIZE = 504;
const BUTTON_SIZE = 30;
const PADDING = 16;

const OUTSIDE_PORTION = 6;
const KKOK_PORTION = 9;
const SMALL_KKOK_PORTION = 6;

const AUTO_PERIOD = 1000 * 60 * 4;

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



// Create kkok function

let kkoks = [];
let smallKkoks = [];
let createKkok = function(colorIdx, time, initial=false) {
  let kkok = new Layer({
    parent: kkokParent,
    width: 2,
    height: DEVICE_SIZE / 2 / KKOK_PORTION,
    x: Align.center,
    y: Align.top(DEVICE_SIZE / 2 / OUTSIDE_PORTION + DEVICE_SIZE / 2 / SMALL_KKOK_PORTION),
    originX: 0.5,
    originY: KKOK_PORTION - (KKOK_PORTION / OUTSIDE_PORTION + KKOK_PORTION / SMALL_KKOK_PORTION),
    rotation: 360 * (time % DAY_MILLIS) / DAY_MILLIS,
    backgroundColor: FAMILY_COLORS[colorIdx],
  });
  kkok._data_time = time;
  kkoks.push(kkok);

  let smallKkok = new Layer({
    parent: smallKkokParent,
    width: 2,
    height: DEVICE_SIZE / 2 / SMALL_KKOK_PORTION,
    x: Align.center,
    y: Align.top(DEVICE_SIZE / 2 / OUTSIDE_PORTION),
    originX: 0.5,
    originY: SMALL_KKOK_PORTION - (SMALL_KKOK_PORTION / OUTSIDE_PORTION),
    rotation: 360 * (time % SMALL_MILLIS) / SMALL_MILLIS,
    backgroundColor: FAMILY_COLORS[colorIdx],
  })
  smallKkok._data_time = time;
  smallKkoks.push(smallKkok);

  if (initial)
    return;

  let scale;
  if (IS_TEST || colorIdx == FAMILY_ID) {
    kkok.scale = 0;
    smallKkok.scale = 0;
  }
  else {
    kkok.scale = 1 / (1 - 1/OUTSIDE_PORTION);
    smallKkok.scale = 1 / (1 - 1/OUTSIDE_PORTION);
  }
  kkok.animate({
    scale: 1,
    options: {
      time: 0.5 / Math.pow(10, speedSlider.value),
    }
  })
  smallKkok.animate({
    scale: 1,
    options: {
      time: 0.5 / Math.pow(10, speedSlider.value),
    }
  })

  let audio = new Audio("/static/light.mp3");
  if (kkoks[kkoks.length-2]!==undefined && kkoks[kkoks.length-2].backgroundColor.color===kkok.backgroundColor.color) {
    audio.volume = 0.1;
  }
  audio.play();

  let targetArea;
  if (IS_TEST || colorIdx == FAMILY_ID) {
    targetArea = deviceSendArea;
    nonTargetArea = deviceReceiveArea;
  }
  else {
    targetArea = deviceReceiveArea;
    nonTargetArea = deviceSendArea;
  }
  while (targetArea.animations().length > 0) {
    targetArea.animations()[0].stop();
  }
  while (nonTargetArea.animations().length > 0) {
    nonTargetArea.animations()[0].stop();
  }
  targetArea.backgroundColor = FAMILY_COLORS[colorIdx];
  targetArea.animate({
    backgroundColor: "FFFFFF",
    options: {
      time: 30 / Math.pow(10, speedSlider.value),
    }
  });
  nonTargetArea.animate({
    backgroundColor: "FFFFFF",
    options: {
      time: 0.5 / Math.pow(10, speedSlider.value),
    }
  })
};



// Device

let device = new Layer({
  width: DEVICE_SIZE,
  height: DEVICE_SIZE,
  x: Align.center,
  y: Align.center,
  borderRadius: DEVICE_SIZE/2,
  backgroundColor: "#FFFFFF",
  shadowColor: "#DDDDDD",
  shadowX: 0,
  shadowY: 4,
  shadowBlur: 12,
});
let deviceReceiveArea = new Layer({
  parent: device,
  index: 10,
  width: DEVICE_SIZE,
  height: DEVICE_SIZE,
  x: Align.center,
  y: Align.center,
  borderRadius: DEVICE_SIZE / 2,
  backgroundColor: "#FFFFFF",
});
let deviceMiddleArea = new Layer({
  parent: device,
  index: 11,
  width: DEVICE_SIZE * (1 - 1/OUTSIDE_PORTION),
  height: DEVICE_SIZE * (1 - 1/OUTSIDE_PORTION),
  x: Align.center,
  y: Align.center,
  borderRadius: DEVICE_SIZE * (1 - 1/OUTSIDE_PORTION) / 2,
  backgroundColor: "#FFFFFF",
});
let deviceSendArea = new Layer({
  parent: device,
  index: 12,
  width: DEVICE_SIZE * (1 - 1/OUTSIDE_PORTION - 1/KKOK_PORTION - 1/SMALL_KKOK_PORTION),
  height: DEVICE_SIZE * (1 - 1/OUTSIDE_PORTION - 1/KKOK_PORTION - 1/SMALL_KKOK_PORTION),
  x: Align.center,
  y: Align.center,
  borderRadius: DEVICE_SIZE * (1 - 1/OUTSIDE_PORTION - 1/KKOK_PORTION - 1/SMALL_KKOK_PORTION) / 2,
  backgroundColor: "#FFFFFF",
});
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
  index: 20,
  width: 2,
  height: DEVICE_SIZE / 2,
  x: Align.center,
  y: Align.top,
  originX: 0.5,
  originY: 1,
  backgroundColor: "#EEEEEE",
})

let kkokParent = new Layer({
  parent: device,
  index: 30,
  width: DEVICE_SIZE,
  height: DEVICE_SIZE,
  x: Align.center,
  y: Align.center,
  backgroundColor: "transparent",
})

let smallKkokParent = new Layer({
  parent: device,
  index: 31,
  width: DEVICE_SIZE,
  height: DEVICE_SIZE,
  x: Align.center,
  y: Align.center,
  backgroundColor: "transparent",
})



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

  kkokParent.rotation = -360 * (currentTime % DAY_MILLIS) / DAY_MILLIS;
  smallKkokParent.rotation = -360 * (currentTime % SMALL_MILLIS) / SMALL_MILLIS;

  if (autoOn) {
    let t;
    for (t=currentTime-timeDiff; t+AUTO_PERIOD<currentTime; t+=AUTO_PERIOD)
      randomKkok(t, t+AUTO_PERIOD);
    if (Math.random()*AUTO_PERIOD < currentTime-t)
      randomKkok(t, currentTime);
  }
});

let updateCount = 0;
let UPDATE_PERIOD = 500;
let UPDATE_GROUPS = 20;
Utils.interval(UPDATE_PERIOD/1000, function() {
  updateCount++;

  for (let i=0; i<kkoks.length; i++) {
    let k = kkoks[i];
    let nextUpdate;

    if (k.scale == 1
        && kkoks[i-1]
        && kkoks[i-1].scale == 1
        && k._data_time - kkoks[i-1]._data_time < 1000 * 10) {
      kkoks[i-1].destroy();
      kkoks.splice(i-1, 1);
      i -= 2;
      continue;
    }

    if (k.opacity>=0.1)
      nextUpdate = 1;
    else if (i%UPDATE_GROUPS == updateCount%UPDATE_GROUPS)
      nextUpdate = UPDATE_GROUPS;
    else
      continue;

    let timeDiff = (currentTime - k._data_time) / DAY_MILLIS * 24;
    timeDiff +=  (UPDATE_PERIOD * nextUpdate * Math.pow(10, speedSlider.value)) / DAY_MILLIS * 24;
    let opacity = Math.max(Math.pow(0.9, timeDiff), 0.1*Math.pow(0.995, timeDiff));

    if (opacity < 0.01) {
      k.destroy();
      kkoks.splice(i, 1);
      i--;
      continue;
    }
    k.animate({
      opacity: opacity,
      options: {
        time: UPDATE_PERIOD * nextUpdate / 1000,
      },
    });
  }

  for (let i=0; i<smallKkoks.length; i++) {
    let k = smallKkoks[i];

    let timeDiff = (currentTime - k._data_time) / SMALL_MILLIS * 24;
    timeDiff +=  (UPDATE_PERIOD * Math.pow(10, speedSlider.value)) / SMALL_MILLIS * 24;
    let opacity = Math.pow(0.85, timeDiff);

    if (opacity < 0.01) {
      k.destroy();
      smallKkoks.splice(i, 1);
      i--;
      continue;
    }
    k.animate({
      opacity: opacity,
      options: {
        time: UPDATE_PERIOD / 1000,
      },
    });
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
          createKkok(d.family_id, currentTime);
          if (d.time > lastLoaded)
            lastLoaded = d.time+1;
        }
      }
    });
  });
}
