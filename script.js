// Global Variables
var questionCount = 0;
// Consolidated scores into a single array for easier handling (indices 0..7 map to results 1..8)
var scores = [0, 0, 0, 0, 0, 0, 0, 0];

// Initialize UI and event wiring after DOM loads (script is deferred but DOMContentLoaded is safe)
document.addEventListener('DOMContentLoaded', function () {
  var result = document.getElementById('result');

  const questions = Array.from(document.querySelectorAll('.question'));
  const totalQuestions = questions.length;
  let currentIndex = 0;
  // track which answer was chosen for each question (null = unanswered)
  const chosen = new Array(totalQuestions).fill(null);
  const backBtn = document.getElementById('back-btn');
  const startScreen = document.getElementById('start-screen');
  const startBtn = document.getElementById('start-btn');

  // Handle start button click
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      if (startScreen) startScreen.classList.add('hidden');
      const header = document.querySelector('main header');
      if (header) header.style.display = 'none';
      const controlsBottom = document.getElementById('controls-bottom');
      if (controlsBottom) controlsBottom.style.display = 'flex';
      // Hide start-only decorative images
      const startOnlyDecor = document.querySelectorAll('.start-only-decor');
      startOnlyDecor.forEach(img => img.style.display = 'none');
      if (questions.length) showQuestion(0);
    });
  }

  function showQuestion(i) {
    if (i < 0 || i >= totalQuestions) return;
    questions.forEach((q, idx) => q.classList.toggle('active', idx === i));
    currentIndex = i;
    const btn = questions[i].querySelector('.button');
    if (btn) btn.focus();
    // hide back button on first question, show and enable on others
    if (backBtn) {
      if (i === 0) {
        backBtn.style.display = 'none';
      } else {
        backBtn.style.display = 'inline-block';
        backBtn.disabled = false;
      }
    }
    // Show progress bar and main heading when on questions
    const progressEl = document.getElementById('progress');
    if (progressEl) progressEl.style.display = 'block';
    const mainHeading = document.querySelector('main header h1');
    if (mainHeading) mainHeading.classList.remove('hidden');
    // hide result screen if visible
    const resultSection = document.getElementById('result-section');
    if (resultSection) resultSection.classList.remove('active');
    // Update progress indicator
    const progressText = document.getElementById('progress-text');
    if (progressText) progressText.textContent = `Question ${i + 1} / ${totalQuestions}`;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      const pct = Math.round(((i + 1) / totalQuestions) * 100);
      progressFill.style.width = pct + '%';
    }
  }

  // Don't show questions initially - wait for start button
  // if (questions.length) showQuestion(0);

  // Wire answer buttons by data-result attribute
  const allButtons = document.querySelectorAll('.question .button');
  allButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      // prevent double handling if this question was already answered
      const qEl = this.closest('.question');
      if (!qEl || qEl.dataset.answered === 'true') return;
      qEl.dataset.answered = 'true';
      // disable all buttons in this question and remove previous selection styling
      qEl.querySelectorAll('.button').forEach(b => {
        b.disabled = true;
        b.classList.remove('previously-selected');
      });

      const r = parseInt(this.dataset.result, 10);
      if (!isNaN(r) && r >= 1 && r <= scores.length) {
        scores[r - 1] = (scores[r - 1] || 0) + 1;
        // remember this choice so Back can revert it
        chosen[currentIndex] = r;
      }

      // advance to next question
      questionCount++;
      if (questionCount >= totalQuestions) {
        updateResult();
      } else {
        showQuestion(currentIndex + 1);
      }
    });
  });

  // Back button: go to previous question and revert its recorded answer so the user can change it
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (currentIndex <= 0) return;
      const target = currentIndex - 1;
      // if the target question was answered, revert its score and mark unanswered
      if (chosen[target] != null) {
        const prevR = chosen[target];
        if (!isNaN(prevR) && prevR >= 1 && prevR <= scores.length) {
          scores[prevR - 1] = Math.max(0, scores[prevR - 1] - 1);
        }
        // Don't clear chosen[target] - keep it to show which answer was selected
        questionCount = Math.max(0, questionCount - 1);
        const qEl = questions[target];
        if (qEl) {
          qEl.querySelectorAll('.button').forEach(b => {
            b.disabled = false;
            // Highlight the previously selected answer
            const btnResult = parseInt(b.getAttribute('data-result'));
            if (btnResult === prevR) {
              b.classList.add('previously-selected');
            } else {
              b.classList.remove('previously-selected');
            }
          });
          delete qEl.dataset.answered;
        }
      }
      showQuestion(target);
    });
  }

  function updateResult() {
    const maxScore = Math.max(...scores);
    const winnerIndex = scores.indexOf(maxScore);

    const resData = [
      {
        title: 'Blood Bee',
        subtitle: 'The Bold Leader',
        desc: 'You are the first to take charge of a situation, leading with confidence and courage that does not waver. When you speak, you make sure your voice is heard. That does not mean you are arrogant and careless though. You are responsible and more than capable, having proven yourself many times. When you are involved, people know that they can rely on you because you plan ahead and you are honest about what you can and cannot do. You have a strong charisma that seems to command respect and influence others. You\’re not afraid to back down from a challenge.',
        extra: 'Blood bees are known for their striking red coloration and their solitary nature. They are often found in arid environments and are important pollinators for many desert plants.',
        img: 'images/blood-bee.png',
        background: 'linear-gradient(180deg, #cc6969ff, #be6161ff)',
        borderLeft: 'images/border-left-blood.png',
        borderRight: 'images/border-right-blood.png'
      },
      {
        title: 'Stingless Bee',
        subtitle: 'The Peaceful Harmonizer',
        desc: 'You are calm, gentle and highly sensitive to others\' emotions. You avoid conflict and strive to find peaceful solutions to problems. You hate the thought of hurting someone. Your empathetic nature allows you to understand others\' perspectives, making you a great ally and friend. People appreciate your ability to listen and provide comfort in times of need. You are affectionate and caring, often putting others\' needs before your own. You cherish your loved ones greatly and they value you in turn. You are always looking on the positive side of things, even when it\’s hard to do so.',
        extra: 'Stingless bees do have a stinger, but they are so small that they cannot pierce human skin, making them harmless. They play a crucial role in pollination and are often kept by beekeepers for their honey.',
        img: 'images/stingless.png',
        background: 'linear-gradient(180deg, #b2a6c9ff, #9285aaff)',
        borderLeft: 'images/border-left-stingless.png',
        borderRight: 'images/border-right-stingless.png',
        borderBottom: 'images/border-bottom-stingless.png'
      },
      {
        title: 'Honeybee',
        subtitle: 'The Socialite',
        desc: 'You are a people person through and through. You thrive in social settings and are seemingly surrounded by friends. Your outgoing nature makes you approachable and easy to talk to, making you a great communicator that can easily connect with people from all walks of life. You value relationships and prioritize spending time with friends and family. You enjoy working with others and are a team player who contributes positively to group dynamics. Some may even call you charming. You talk so smoothly and with such ease that it is captivating.',
        extra: 'Honeybees are known for their complex social structures and their ability to produce honey. They communicate with each other through a series of dances and are essential pollinators for many crops.',
        img: 'images/honeybee.png',
        background: 'linear-gradient(180deg, #fadc98ff, #eecb78ff)',
        borderLeft: 'images/border-left-honey.png',
        borderRight: 'images/border-right-honey.png',
        borderBottom: 'images/border-bottom-honey.png'
      },
      {
        title: 'Bumblebee',
        subtitle: 'The Energetic Explorer',
        desc: 'You are the goofball of your friend group, always able to bring laughter to any situation. Fun and adventure is your specialty, while boredom is your mortal enemy. You hate sitting still. You have a contagious energy that inspires those around you to embrace life with enthusiasm. Your playful nature allows you to find joy in the little things, and you have a knack for turning mundane moments into memorable ones. People are drawn to your positive outlook and zest for life. You may have been told you don\’t take enough things seriously but you don\’t let that dull your sparkle.',
        extra: 'Bumblebees are known for their large, fuzzy bodies and their ability to buzz pollinate. They are important pollinators for many wildflowers and crops.',
        img: 'images/bumblebee.png',
        background: 'linear-gradient(180deg, #e29e5fff, #d68f4cff)',
        borderLeft: 'images/border-left-bumble.png',
        borderRight: 'images/border-right-bumble.png',
        borderBottom: 'images/border-bottom-bumble.png'
      },
      {
        title: 'Carpenter Bee',
        subtitle: 'The Busy Bee',
        desc: 'You\'re hardworking and diligent, always focused on getting the job done. You take pride in your work and are committed to achieving your goals no matter how hard they may seem. You are organized and efficient, able to manage your time effectively and effortlessly. While you may not be the most outgoing person, you make up for it with your work ethic and detail-oriented approach. You love coming up with new ideas and getting to see them come to fruition through your efforts. Success drives you forward, unfortunately it means you rarely have any free time.',
        extra: 'Carpenter bees are known for their ability to bore into wood to create nests. They are solitary bees so they do not live in colonies like honeybees or bumblebees.',
        img: 'images/carpenter2.png',
        background: 'linear-gradient(180deg, #815d51ff, #795548ff)',
        borderLeft: 'images/border-left-carpenter.png',
        borderRight: 'images/border-right-carpenter.png',
        borderBottom: 'images/border-bottom-carpenter.png'
      },
      {
        title: 'Ashy Mining Bee',
        subtitle: 'The Intelligent Individual',
        desc: 'You are self-reliant and a bit of a lone wolf, preferring to carve your own path rather than follow others. You value smarts in yourself and others, such as problem solving and critical thinking. Your grades were always top notch, weren\’t they? You might be a little anti-social but that\’s because you only put your trust in those you believe have earned it. You have high standards and you think other people should too. You\'re perceptive and perhaps a bit of a perfectionist. You can be quite stubborn because you like things being done correctly.',
        extra: 'Ashy mining bees are solitary bees that nest in the ground. They are known for their distinctive gray coloration and their ability to dig tunnels in soil to create nests.',
        img: 'images/ashy-bee.png',
        background: 'linear-gradient(180deg, #e5e9ebff, #b6bcbeff)',
        borderLeft: 'images/border-left-ashy.png',
        borderRight: 'images/border-right-ashy.png',
        borderBottom: 'images/border-bottom-ashy.png'
      },
      {
        title: 'Blue Orchard Bee',
        subtitle: 'The Introverted Thinker',
        desc: 'You are a quiet person, sometimes leaning towards timid. You prefer to observe and analyze situations before jumping in, for you hate the thought of being in the way of others. You are introspective and enjoy spending time alone to reflect on your thoughts and feelings. You have a rich inner world and are often lost in thought. You might be a little hard on yourself because you don’t want to let anyone down. You have a very curious mind and you love to learn more about other people and the world as a whole.',
        extra: 'Blue orchard bees are solitary bees that are important pollinators for fruit trees. They are known for their striking blue coloration and their docile behaviour, making them safe around children and pets',
        img: 'images/blue-bee.png',
        background: 'linear-gradient(180deg, #b9dee4ff, #92c7caff)',
        borderLeft: 'images/border-left-blue.png',
        borderRight: 'images/border-right-blue.png',
        borderBottom: 'images/border-bottom-blue.png'
      },
      {
        title: 'Green Metallic Sweat Bee',
        subtitle: 'The Quirky Creative',
        desc: 'People just don\'t understand you, and that\'s okay! Your creativity knows no bounds and you love to spend your time in artistic ways. You may be strange to some, but to those who get you, you are a breath of fresh air. Not only that but you are an extremely loyal and dedicated friend to those who withhold judgment. You embrace your oddities and see them as strengths rather than weaknesses which help you along your creative journey. This was also most of the joke-y answers so you\'re definitely the funny one.',
        extra: 'Green metallic sweat bees are solitary bees known for their vibrant green coloration. They will often land on humans and drink their sweat due to the salt content.',
        img: 'images/green-bee.png',
        background: 'linear-gradient(180deg, #afcfa6ff, #97be8dff)',
        borderLeft: 'images/border-left.png',
        borderRight: 'images/border-right.png',
        borderBottom: 'images/border-bottom-green.png'
      }
    ];

    const data = resData[winnerIndex] || { title: 'No result', subtitle: '', desc: '', img: '' };
    console.log('Result data:', data);
    result.innerHTML = data.title;
    const imgEl = document.getElementById('result-img');
    console.log('Image element:', imgEl);
    if (imgEl) {
      imgEl.src = data.img || '';
      imgEl.alt = data.title;
      console.log('Image src set to:', imgEl.src);
      imgEl.style.display = 'block';
    }
    const subtitleEl = document.getElementById('result-subtitle');
    if (subtitleEl) subtitleEl.textContent = data.subtitle || '';
    const descEl = document.getElementById('result-desc');
    if (descEl) descEl.textContent = data.desc || '';
    const extraEl = document.getElementById('result-extra');
    if (extraEl) extraEl.textContent = data.extra || '';

    // Hide back button, progress bar, and main heading on result screen
    if (backBtn) backBtn.style.display = 'none';
    const progressEl = document.getElementById('progress');
    if (progressEl) progressEl.style.display = 'none';
    const mainHeading = document.querySelector('main header h1');
    if (mainHeading) mainHeading.classList.add('hidden');

    // Prepare share links
    const shareText = `${data.title} — ${data.desc}`;
    const pageUrl = window.location.href;
    const twitter = document.getElementById('share-twitter');
    if (twitter) twitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
    const email = document.getElementById('share-email');
    if (email) email.href = `mailto:?subject=${encodeURIComponent('My quiz result: ' + data.title)}&body=${encodeURIComponent(shareText + '\n\n' + pageUrl)}`;
    const copyBtn = document.getElementById('copy-link');
    if (copyBtn) {
      copyBtn.onclick = function () {
        const toCopy = `${data.title} — ${data.desc} \n${pageUrl}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(toCopy).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy result link', 1200);
          });
        } else {
          prompt('Copy this text', toCopy);
        }
      };
    }
    // hide all questions
    questions.forEach(q => q.classList.remove('active'));
    // show result section as its own screen
    const resultSection = document.getElementById('result-section');
    if (resultSection) {
      // Remove any previous result classes
      resultSection.className = resultSection.className.replace(/result-\d+/g, '').trim();
      // Add unique class for this result
      resultSection.classList.add('active');
      resultSection.classList.add(`result-${winnerIndex}`);
      if (data.background) {
        resultSection.style.background = data.background;
      }
    }
    
    // Update result-specific border images
    let borderLeftImg = document.getElementById('result-border-left');
    let borderRightImg = document.getElementById('result-border-right');
    let borderBottomImg = document.getElementById('result-border-bottom');
    
    if (!borderLeftImg) {
      borderLeftImg = document.createElement('img');
      borderLeftImg.id = 'result-border-left';
      borderLeftImg.className = 'result-border-img result-border-left';
      borderLeftImg.alt = 'decorative border';
      document.querySelector('main').appendChild(borderLeftImg);
    }
    
    if (!borderRightImg) {
      borderRightImg = document.createElement('img');
      borderRightImg.id = 'result-border-right';
      borderRightImg.className = 'result-border-img result-border-right';
      borderRightImg.alt = 'decorative border';
      document.querySelector('main').appendChild(borderRightImg);
    }
    
    if (!borderBottomImg) {
      borderBottomImg = document.createElement('img');
      borderBottomImg.id = 'result-border-bottom';
      borderBottomImg.className = 'result-border-img result-border-bottom';
      borderBottomImg.alt = 'decorative border';
      document.querySelector('main').appendChild(borderBottomImg);
    }
    
    if (data.borderLeft) borderLeftImg.src = data.borderLeft;
    if (data.borderRight) borderRightImg.src = data.borderRight;
    if (data.borderBottom) borderBottomImg.src = data.borderBottom;
    borderLeftImg.style.display = 'block';
    borderRightImg.style.display = 'block';
    borderBottomImg.style.display = 'block';
    
    // Hide decorative images on result screen
    const decorImages = document.querySelectorAll('.persistent-decor');
    decorImages.forEach(img => img.style.display = 'none');
    
    // update progress to show 'Result' and fill bar
    const progressText = document.getElementById('progress-text');
    if (progressText) progressText.textContent = 'Result';
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) progressFill.style.width = '100%';
    // optionally disable Back while on result (leave enabled if you want to allow going back)
    if (backBtn) backBtn.disabled = false;
  }

  // Retake button resets state and shows first question
  const retakeBtn = document.getElementById('retake-btn');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', function () {
      // reset scores and tracking
      for (let i = 0; i < scores.length; i++) scores[i] = 0;
      questionCount = 0;
      for (let i = 0; i < chosen.length; i++) chosen[i] = null;
      // clear answered flags and re-enable buttons
      questions.forEach(q => {
        delete q.dataset.answered;
        q.querySelectorAll('.button').forEach(b => b.disabled = false);
      });
      // clear result text
      result.innerHTML = 'Your result is...';
      // hide result section and show first question
      const resultSection = document.getElementById('result-section');
      if (resultSection) resultSection.classList.remove('active');
      // Show decorative images again
      const decorImages = document.querySelectorAll('.persistent-decor');
      decorImages.forEach(img => img.style.display = 'block');
      // Show start-only decorative images
      const startOnlyDecor = document.querySelectorAll('.start-only-decor');
      startOnlyDecor.forEach(img => img.style.display = 'block');
      // Hide result border images
      const resultBorderLeft = document.getElementById('result-border-left');
      const resultBorderRight = document.getElementById('result-border-right');
      const resultBorderBottom = document.getElementById('result-border-bottom');
      if (resultBorderLeft) resultBorderLeft.style.display = 'none';
      if (resultBorderRight) resultBorderRight.style.display = 'none';
      if (resultBorderBottom) resultBorderBottom.style.display = 'none';
      // Show start screen
      if (startScreen) startScreen.classList.remove('hidden');
      showQuestion(0);
    });
  }
});
