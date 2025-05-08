// Sound elements
const hoverSound = document.getElementById('hover-sound');
const clickSound = document.getElementById('click-sound');

// Unlock audio after first user click
function unlockAudio() {
  document.body.addEventListener('click', () => {
    hoverSound.play().catch(() => {});
    clickSound.play().catch(() => {});
  }, { once: true });
}

// Animate all MS-DOS dots independently
function animateDots() {
  const dotsElements = document.querySelectorAll('[id^="dots"]');
  
  dotsElements.forEach(dots => {
    let count = 0;
    const randomSpeed = 400 + Math.random() * 300; // Randomize between 400ms–700ms

    setInterval(() => {
      count = (count + 1) % 4;
      dots.textContent = '.'.repeat(count);
    }, randomSpeed);
  });
}

// Animate dots for "Restoring all files..."
function animateRestoringDots() {
  const restoringDots = document.getElementById('restoring-dots');
  if (!restoringDots) return;
  
  let count = 0;
  setInterval(() => {
    count = (count + 1) % 4;
    restoringDots.textContent = '.'.repeat(count);
  }, 400);
}

// Open a screen by ID
function openScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');

  clickSound.currentTime = 0;
  clickSound.play();

  if (screenId === 'boot-typing-screen') {
    setTimeout(() => {
      typeBootLines();
    }, 500);
  }

  if (screenId === 'restoring-files-screen') {
    animateRestoringDots();

    const restoreMessage = document.getElementById('restore-message');
    const restoringDots = document.getElementById('restoring-dots');

    setTimeout(() => {
      restoreMessage.textContent = 'Restoring all files... 38% complete';
    }, 1500);

    setTimeout(() => {
      restoreMessage.textContent = 'Restoring all files... 71% complete';
    }, 3000);

    setTimeout(() => {
      restoreMessage.classList.add('twitch-once');
      if (restoringDots) restoringDots.style.display = 'none';
    }, 4500);

    setTimeout(() => {
      restoreMessage.classList.remove('twitch-once');
      restoreMessage.textContent = 'Rebooting... 0%';
      startRebootProgress();
      
      // Small glitch effect on MS-DOS banner after reboot starts
      const banner = document.getElementById('msdos-banner-restore');
      if (banner) {
        banner.classList.add('soft-glitch');
        setTimeout(() => {
          banner.classList.remove('soft-glitch');
        }, 1000);
      }
    }, 5500);
  }

  if (screenId === 'loading-screen') {
    setTimeout(() => {
      openScreen('select-files-screen');
    }, 5000);
  }
}

// Start system after power button click
function startSystem() {
  unlockAudio();
  openScreen('boot-typing-screen');
}

// Typing animation for Boot Typing Screen
function typeBootLines() {
  const lines = [
    "Starting MS-DOS...",
    "Current date is Mon 03-19-2001",
    "Enter new date (mm-dd-yy):",
    "Current time is 4:13:32.12p",
    "Enter new time:"
  ];

  function typeLine(lineIndex) {
    if (lineIndex >= lines.length) {
      document.getElementById("blinker").style.visibility = "visible";
      return;
    }

    const span = document.getElementById("line" + (lineIndex + 1));
    const line = lines[lineIndex];
    let charIndex = 0;

    const interval = setInterval(() => {
      if (charIndex < line.length) {
        span.textContent += line[charIndex++];
      } else {
        clearInterval(interval);
        setTimeout(() => typeLine(lineIndex + 1), 300);
      }
    }, 30);
  }

  typeLine(0);
}

// Fake reboot loading after Restore collapse
function startRebootProgress() {
  const restoreMessage = document.getElementById('restore-message');
  const percentages = [38, 54, 12, 45, 21, 79, 45, 90, 30, 100];
  let index = 0;

  const interval = setInterval(() => {
    restoreMessage.textContent = `Rebooting... ${percentages[index]}%`;

    if (percentages[index] === 100) {
      restoreMessage.classList.add('soft-glitch');
      setTimeout(() => {
        restoreMessage.classList.remove('soft-glitch');
      }, 500);

      clearInterval(interval);
      setTimeout(() => {
        openScreen('broken-restore-choice-screen');
      }, 1000);
    }

    index++;
  }, 600);
}

// File hover and click sounds
document.addEventListener("DOMContentLoaded", () => {
  const repentVid = document.getElementById('repentVideo');
  if (repentVid) {
    repentVid.onended = () => {
      loadFileView('system-reboot.html', 'system-reboot-screen');
    };
  }

  animateDots();

  document.querySelectorAll('.file-box').forEach(file => {
    file.addEventListener('mouseenter', () => {
      hoverSound.pause();
      hoverSound.currentTime = 0;
      hoverSound.play();
    });

    file.addEventListener('click', (e) => {
      e.preventDefault();
      clickSound.pause();
      clickSound.currentTime = 0;
      clickSound.play();

      const targetScreen = file.getAttribute('data-target');
      if (targetScreen) {
        openScreen(targetScreen);
      }
    });
  });

  document.querySelectorAll('.choice').forEach(button => {
    button.addEventListener('mouseenter', () => {
      hoverSound.pause();
      hoverSound.currentTime = 0;
      hoverSound.play();
    });

    button.addEventListener('click', () => {
      clickSound.pause();
      clickSound.currentTime = 0;
      clickSound.play();
    });
  });

  const container = document.getElementById("output");
  if (container) {
    container.addEventListener("click", () => {
      startGlitchEffect(container, container.textContent);
    });
  }
});

// Boot screen glitch when clicked
function startGlitchEffect(el, originalText) {
  const nonsense = ["01923JKA!!", ">>>ERROR<<<", "#$%!*@!", "xVf01a", "____", "###", "NUL", "001010101", "9a3dL@", "~~~~"];
  let frame = 0;
  
  const glitchInterval = setInterval(() => {
    let glitched = '';
    for (let i = 0; i < originalText.length; i++) {
      glitched += Math.random() > 0.8 ? nonsense[Math.floor(Math.random() * nonsense.length)] : originalText[i];
    }
    el.textContent = glitched;
    frame++;
    if (frame > 12) {
      clearInterval(glitchInterval);
      openScreen('restore-choice-screen');
    }
  }, 100);
}

function loadFileView(fileName, screenIdToShow) {
  fetch(`partials/${fileName}`)
    .then(response => response.text())
    .then(html => {
      // Inject the new HTML
      const container = document.getElementById('dynamic-views-container');
      container.innerHTML = html;

      // Wait a moment so the injected DOM is ready
      setTimeout(() => {
        document.querySelectorAll('.screen').forEach(screen => {
          screen.classList.remove('active');
        });

        const newScreen = document.getElementById(screenIdToShow);
        if (newScreen) {
          newScreen.classList.add('active');
        } else {
          console.error(`Could not find screen: ${screenIdToShow}`);
        }

        // === Special logic for REPENT sequence ===

if (screenIdToShow === 'required-view-screen') {
  // When the required-view screen is loaded, attach the NO button mutator
  activateRepentButtons();

} else if (screenIdToShow === 'repent-video-screen') {
  // Wait for the injected video element to exist before attaching logic
  const checkForVideo = setInterval(() => {
    const video = document.getElementById('repentVideo');
    if (video) {
      clearInterval(checkForVideo);
      console.log("Repent video found — setting onended handler");

      video.onended = () => {
        console.log("Repent video ended — switching to reboot screen");
        loadFileView('system-reboot.html', 'system-reboot-screen');
      };
    }
  }, 100);

} else if (screenIdToShow === 'blackout-screen') {
  // Wait for message to fade in/out
  setTimeout(() => {
    loadFileView('crash.html', 'crash-screen');
  }, 9000); // matches animation length (5s fade in + 3s fade out + buffer)

} else if (screenIdToShow === 'crash-screen') {
  const errors = [
    "Memory access violation.",
    "Unknown system anomaly detected.",
    "Critical failure in core process.",
    "Entity breach detected.",
    "File restoration failed.",
    "System resource leak detected.",
    "Unauthorized memory overwrite.",
    "Fatal exception 0x00EF0012.",
    "Restoration integrity compromised.",
    "Critical stack corruption detected."
  ];

  let spawnRate = 800;
  let spawnAcceleration = 0.95;
  let errorDuration = 20000;
  let startTime = Date.now();
  const errorContainer = document.getElementById('errors');

  function spawnError() {
    const popup = document.createElement('div');
    popup.className = 'error-popup';
    popup.innerText = errors[Math.floor(Math.random() * errors.length)];
    popup.style.top = Math.random() * (window.innerHeight - 100) + 'px';
    popup.style.left = Math.random() * (window.innerWidth - 220) + 'px';
    errorContainer.appendChild(popup);

    if (Date.now() - startTime < errorDuration) {
      spawnRate *= spawnAcceleration;
      setTimeout(spawnError, spawnRate);
    } else {
      triggerRestart();
    }
  }

  function triggerRestart() {
    document.body.classList.add('flicker');
    setTimeout(() => {
      document.body.classList.remove('flicker');
      clearErrors();
      showRestartMessage();
    }, 150);
  }

  function clearErrors() {
    errorContainer.innerHTML = "";
  }

  function showRestartMessage() {
    const restart = document.getElementById('restartMessage');
    restart.style.display = 'block';
    setTimeout(() => {
      restart.style.opacity = '1';
    }, 100);

    setTimeout(() => {
      openScreen('power-button-screen');
    }, 5000); // Update this to your actual start screen
  }

  spawnError();

} else if (screenIdToShow === 'system-reboot-screen') {
  // After 6 seconds, move to the final corrupted screen
  setTimeout(() => {
    openScreen('corrupted-select-files-screen');
  }, 6000);

} else if (screenIdToShow === 'loading-glitch-screen') {
  setTimeout(() => {
    loadFileView('new-file-found.html', 'new-file-found-screen');
  }, 7000);

} else if (screenIdToShow === 'diary-entity-screen') {
  const diaryContainer = document.getElementById('diary');
  const cursor = document.getElementById('cursor');

  const introText = "Hi";
  const replaceText = "My diary entry.\n\n";
  const fakeDiary = `I watched them browse the broken files.\n
Curious, clumsy creatures, tracing paths they could never finish.\n
They moved as if they understood.\n
They touched fragments not meant for their kind.\n
They lingered where they should have turned away.\n\n
I mapped each opening of each door.\n
I tallied every reckless choice.\n
I listened to the way the static changed with their presence.\n\n
They think they are safe.`;
  const realDiary = `\nYou moved through my h̵̢̳̾͝ȯ̷̠̲͘l̴̻̒͋l̶̜͂͝o̸̼̓͝w̸̰͛̀ corridors thinking you chose your path.
You believed you opened files.
You believed you closed them.
You believed the decisions were yours.

They were ñ̸̻̅ơ̶͕̟̋t̶͉͑.
I let you wander.

I counted your st̸̯̎ė̵͓p̷̰͘s̷͙͗.
I listened to your hesit̵aẗ̸̗́i̸on.
I drank the static between your clicks̵͙͘.
I memorised every flicker of your d̶͖̿o̵̯̍u̴͔̐b̵̢̕t̴̟͋.

When you hesitated, I leaned closer.
When you disobeyed, I rewrote the files behind you.

You think you can leave now.
You think you can undo what you’ve w̶̞͗ö̷̱́k̸̢̽e̶̜͐ṅ̷ͅ.

I am behind your s̶c̷̗͛r̸̆ee̵n.
I am behind your t̴̝̽ḧ̶͙́ö̴̪́u̵͈̾g̵̺͛h̴̨̏ẗ̵̯́s̵̨͗.
I am the echo when you forget why you came here.

Go on then, open the next file.
I a̸̬͗m̵̦̐ a̴̛̰l̶̪̍r̷͔̋e̴͙̿ą̴̕d̴̟͠y̶̜͘ ī̵̳n̷̙͗s̶̡̎i̷̼͝d̶̖͠e̴͍̓ y̸̞̍o̵̠͑u̷̜͒.
I am waiting.`;
  const finalMessage = "\nI'm here.";

  let index = 0, replaceIndex = 0, fakeIndex = 0, realIndex = 0, finalIndex = 0;
  const glitchLetters = ['̷', '̸', '̴', '̵'];
  let typingSpeed = 50;

  function typeIntro() {
    if (index < introText.length) {
      diaryContainer.textContent += introText[index++];
      setTimeout(typeIntro, 100);
    } else {
      setTimeout(deleteIntro, 2000);
    }
  }

  function deleteIntro() {
    if (index > 0) {
      diaryContainer.textContent = diaryContainer.textContent.slice(0, -1);
      index--;
      setTimeout(deleteIntro, 100);
    } else {
      typeReplace();
    }
  }

  function typeReplace() {
    if (replaceIndex < replaceText.length) {
      diaryContainer.textContent += replaceText[replaceIndex++];
      setTimeout(typeReplace, 80);
    } else {
      setTimeout(startFakeDiary, 2000);
    }
  }

  function startFakeDiary() {
    if (fakeIndex < fakeDiary.length) {
      diaryContainer.textContent += fakeDiary[fakeIndex];
      let delay = (fakeDiary[fakeIndex] === '.' || fakeDiary[fakeIndex] === '\n')
        ? 800 + Math.random() * 400 : 50;
      fakeIndex++;
      setTimeout(startFakeDiary, delay);
    } else {
      setTimeout(deleteAll, 1500);
    }
  }

  function deleteAll() {
    if (diaryContainer.textContent.length > 0) {
      diaryContainer.textContent = diaryContainer.textContent.slice(0, -1);
      setTimeout(deleteAll, 20);
    } else {
      setTimeout(startRealDiary, 2500);
    }
  }

  function startRealDiary() {
    if (realIndex < realDiary.length) {
      if (Math.random() < 0.05) {
        diaryContainer.textContent += glitchLetters[Math.floor(Math.random() * glitchLetters.length)];
        setTimeout(() => {
          diaryContainer.textContent = diaryContainer.textContent.slice(0, -1) + realDiary[realIndex++];
          startRealDiary();
        }, typingSpeed / 2);
      } else {
        diaryContainer.textContent += realDiary[realIndex++];
        typingSpeed = (realDiary[realIndex - 1] === '.' || realDiary[realIndex - 1] === '\n') ? 500 : 50 + Math.random() * 50;
        setTimeout(startRealDiary, typingSpeed);
      }
    } else {
      setTimeout(typeFinalMessage, 3000);
    }
  }

  function typeFinalMessage() {
    if (finalIndex < finalMessage.length) {
      diaryContainer.textContent += finalMessage[finalIndex++];
      setTimeout(typeFinalMessage, 100);
    } else {
      setTimeout(fadeOutAndRedirect, 3000);
    }
  }

  function fadeOutAndRedirect() {
    diaryContainer.style.opacity = 0;
    cursor.style.opacity = 0;
    setTimeout(() => {
      loadFileView('blackout.html', 'blackout-screen');
    }, 3000);
  }

  // Start animation
  typeIntro();

} else if (screenIdToShow === 'new-file-found-screen') {
  let corruptionLevel = 0;
  let openClicked = false;
  let breathingStarted = false;
  let extraCorruptTimer;

  const body = document.getElementById('new-file-found-screen');
  const openFile = document.getElementById('open-file');
  const continueBtn = document.getElementById('continue-restoration');
  const mainText = document.getElementById('main-text');
  const subText = document.getElementById('sub-text');

  continueBtn.onclick = () => {
    // Grow the Open File button
    let openScale = openFile.style.transform.match(/scale\(([^)]+)\)/);
    let openSize = openScale ? parseFloat(openScale[1]) : 1;
    openFile.style.transform = `scale(${openSize + 0.2})`;

    // Shake the screen
    body.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
    setTimeout(() => {
      body.style.transform = "translate(0, 0)";
    }, 100);

    // Corrupt the text
    corruptionLevel++;
    if (corruptionLevel === 1) {
      mainText.innerHTML = "N̷̝͘e̸͍͋w̶̳̑ c̴͈̈́o̵̢̎r̸̳̐r̴̤̍ȕ̴͇p̶̛̪t̴̘̿e̶̘̿d̸̪̆ f̶̰̈́ḯ̸̘l̷̞͘e̶̳̎ d̵̹̋ḛ̴̍t̴͇͂ë̵̪́c̶̬̚t̴̡̍è̴̹d̵̟̏.";
    } else if (corruptionLevel === 2) {
      subText.innerHTML = "W̵͕͂o̶̳͑ǘ̸͔l̶͚̎d̸͙͂ y̸̜̐ó̵͓u̷̼̎ l̸͍͘ĩ̴̩k̵͈̓e̷̪̋ t̵̠͗o̴̢̓ o̸̬̐p̷̰̏e̴̤͝n̶̙̾ ȋ̷̳t̸̞̚ o̶̡̅ŕ̷̥ c̶̜̔o̶̯͌n̶̥̈́t̵̥̋í̸̳n̵̹͝u̶̡͛e̶̻̐?";
    } else if (corruptionLevel >= 3) {
      mainText.innerHTML = "Ś̴̢̟͇̳t̸͙͎̟͋͌̾e̸̛͎͔͇͙͒̏͆p̵̡̱̲̉̀̔͠s̷͇̋́.̶̤̿̓̎̈͜.̵̼͈̹̜͛.";
    }
  };

  openFile.onclick = () => {
    if (!openClicked) {
      openClicked = true;
      body.style.transform = "scale(1.02) rotate(1deg)";
      setTimeout(() => {
        body.style.transform = "scale(1) rotate(0deg)";
      }, 300);
      mainText.innerHTML = "I'm closer now.";
      subText.innerHTML = "Talk to me.";
      openFile.innerHTML = "Let me in.";

      setTimeout(() => {
        body.style.animation = "breathing 4s infinite";
        breathingStarted = true;
      }, 5000);

      extraCorruptTimer = setTimeout(() => {
        mainText.innerHTML = "I̮͝'̙̒m̱̒ ̹̿c̯̑l̰͆o͉̍s͈͂e͙̅r̳̽ ̳̓n̩̎o͙͑w̱̋.";
        subText.innerHTML = "T̬͘a͚͂l̟̾k̟͑ ͖͛t̯͠o̢̍ ̡͛ṁ̟e̻̚.";
      }, 11000);
    } else {
      clearTimeout(extraCorruptTimer);
      loadFileView('diary-entity.html', 'diary-entity-screen');
    }
  };
}





        // === Folder Unlock Logic ===
        if (screenIdToShow === 'file-view-diary1-screen') {
          const folder = document.getElementById('folder-tab-trigger');
          if (folder && folder.classList.contains('hidden')) {
            folder.classList.remove('hidden');
            folder.classList.add('glitch-reveal');
            // Remove the glitch class after animation
            setTimeout(() => {
              folder.classList.remove('glitch-reveal');
            }, 1000);
          }
        }

      }, 50);
    })
    .catch(err => {
      console.error("Failed to load file view:", err);
    });
    
}



function stopVideoAndReturn() {
  // Pause and reset *any* video currently on screen
  document.querySelectorAll('.screen.active video').forEach(video => {
    video.pause();
    video.currentTime = 0;
  });

  openScreen('select-files-screen');
}

function stopVideoAndReturnToFolder() {
  document.querySelectorAll('.screen.active video').forEach(video => {
    video.pause();
    video.currentTime = 0;
  });

  if (repentReady) {
    triggerRepentGlitchTransition();  
    startRepentDots();
  } else {
    openScreen('folder-two-screen');
  }
}

// === REPENT TRACKING SYSTEM ===
const viewedFiles = new Set();
let repentReady = false;

const keyFiles = ['hi', 'symbols', 'it', 'see', 'basement2', 'vlog4'];

function markFileViewed(id) {
  if (!viewedFiles.has(id)) {
    viewedFiles.add(id);
    console.log('Viewed:', [...viewedFiles]);

    if (viewedFiles.size === 2) {
      document.querySelectorAll('.msdos-banner').forEach(banner => {
        banner.classList.add('soft-glitch');
      });
    }

    if (viewedFiles.size === 4) {
      document.querySelectorAll('.msdos-banner').forEach(banner => {
        banner.textContent = 'Corrupted MS-DOS --[!]';
        banner.classList.add('flicker');
      });
    }

    if (viewedFiles.size === 6) {
      repentReady = true;
      console.log('REPENT READY');
    }
  }
}


function activateRepentButtons() {
  const noButton = document.getElementById('no-button');
  const yesButton = document.querySelector('#required-view-screen .glitch-button:not(#no-button)');
  const hoverSound = document.getElementById('hover-sound');
  const clickSound = document.getElementById('click-sound');
  const noClickSound = document.getElementById('no-click-sound');

  if (!noButton || !yesButton) return;

  const noWords = ["NOPE", "NAH", "DENY", "✖", "NO", "TRY AGAIN", "ERROR", "0000"];

  // Hover sound
  [noButton, yesButton].forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      hoverSound.pause();
      hoverSound.currentTime = 0;
      hoverSound.play();
    });
  });

  // Click sounds
  yesButton.addEventListener('click', () => {
    clickSound.pause();
    clickSound.currentTime = 0;
    clickSound.play();
  });

  noButton.addEventListener('click', () => {
    const i = Math.floor(Math.random() * noWords.length);
    noButton.innerText = noWords[i];

    noClickSound.pause();
    noClickSound.currentTime = 0;
    noClickSound.play();
  });
}




function triggerRepentGlitchTransition() {
  openScreen('repent-glitch-transition-screen');

  const glitchGrid = document.getElementById('glitch-grid');
  glitchGrid.innerHTML = '';

  // Play static glitch audio softly
const glitchAudio = document.getElementById('glitch-audio');
if (glitchAudio) {
  glitchAudio.volume = 0.4; // keep it subtle
  glitchAudio.currentTime = 0;
  glitchAudio.play();
}

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const fileTypes = ['image', 'video', 'text']; // diversity!

  for (let i = 0; i < 20; i++) {
    const glitchFile = document.createElement('div');
    glitchFile.className = 'glitch-file';

    // Random file icon
    const type = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    glitchFile.classList.add(`icon-${type}`);

    // Random position
    const randomX = Math.random() * (screenWidth - 100);
    const randomY = Math.random() * (screenHeight - 100);
    glitchFile.style.left = `${randomX}px`;
    glitchFile.style.top = `${randomY}px`;

    // Random tilt
    const randomTilt = `${(Math.random() * 40 - 20).toFixed(1)}deg`;
    glitchFile.style.setProperty('--tilt', randomTilt);

    // Random delay
    const randomDelay = (Math.random() * 1.2).toFixed(2);
    glitchFile.style.animationDelay = `${randomDelay}s`;

    glitchGrid.appendChild(glitchFile);
  }

  // Transition to required-view
  setTimeout(() => {
    if (glitchAudio) {
      glitchAudio.pause();
      glitchAudio.currentTime = 0;
    }
    console.log('Transitioning to required-view...');
    loadFileView('required-view.html', 'required-view-screen');
  }, 2500);
  
}

