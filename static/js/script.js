document.addEventListener('DOMContentLoaded', () => {

  // All section IDs in the order they appear
  const sectionIds = [
    'introSection',        // 0
    'section1', 'section2', 'section3', 'section4', 'section5',
    'section6', 'section7', 'section8', 'section9',  // 1-9
    'finalSection',        // final
    'chatContainer'        // chat
  ];

  // Start with the intro section visible
  showSection('introSection');

  // We'll store each section's score in this object
  const sectionScores = {}; // e.g. sectionScores['1'] = 0.8, etc.

  // Next buttons navigate to subsequent sections
  const nextButtons = document.querySelectorAll('.next-btn');
  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextId = btn.getAttribute('data-next');
      showSection(nextId);
    });
  });

  // “Calculate Section Score” buttons
  const calcButtons = document.querySelectorAll('.calc-section-btn');
  calcButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionNumber = btn.getAttribute('data-section');
      calculateSectionScore(sectionNumber);
    });
  });

  // Chat functionality
  const chatBtn = document.getElementById('chatBtn');
  const chatInput = document.getElementById('chatInput');
  const chatResponse = document.getElementById('chatResponse');

  if (chatBtn) {
    chatBtn.addEventListener('click', () => {
      const message = chatInput.value.trim();
      if (!message) return;
      const formData = new FormData();
      formData.append('message', message);
      fetch('/chat', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        chatResponse.textContent = data.answer || 'No response';
      })
      .catch(err => {
        chatResponse.textContent = 'Chat error: ' + err;
      });
    });
  }

  /**
   * Shows the specified section by ID, hides all others.
   * If the final section is shown, compute overall readiness.
   */
  function showSection(id) {
    // Hide every section
    sectionIds.forEach(secId => {
      const sec = document.getElementById(secId);
      if (sec) sec.style.display = 'none';
    });

    // Show the chosen section
    const targetSec = document.getElementById(id);
    if (targetSec) targetSec.style.display = 'block';

    // If this is the final section, compute final readiness
    if (id === 'finalSection') {
      computeFinalReadiness();
    }
  }

  /**
   * Calculates the partial score for the specified section (1..9),
   * displays an R/Y/G indicator, and reveals the “Next” button.
   */
  function calculateSectionScore(sectionNumber) {
    const form = document.getElementById(`formSection${sectionNumber}`);
    const scoreDiv = document.getElementById(`scoreSection${sectionNumber}`);
    const parentSec = document.getElementById(`section${sectionNumber}`);

    if (!form || !scoreDiv || !parentSec) return;

    // Gather all checked radios
    const checkedInputs = form.querySelectorAll('input[type=radio]:checked');
    let score = 0;
    let totalQuestions = 0;

    checkedInputs.forEach(input => {
      totalQuestions++;
      if (input.value === 'Yes') {
        score += 1;
      } else if (input.value === 'Partial') {
        score += 0.5;
      }
      // “No” adds 0 points
    });

    let normalized = 0;
    let message = '';

    if (totalQuestions > 0) {
      normalized = score / totalQuestions;
      message = `Section Score: ${(normalized * 100).toFixed(1)}%`;
    } else {
      // If the user didn’t answer or the section has no questions
      normalized = 0;
      message = 'No questions found for this section. Defaulting to 0%.';
    }

    // Save the section’s normalized score
    sectionScores[sectionNumber] = normalized;

    // Display partial score & R/Y/G indicator
    scoreDiv.style.display = 'block';
    scoreDiv.innerHTML = `<p>${message}</p>`;

    const indicator = document.createElement('span');
    indicator.classList.add('score-indicator');

    const pct = normalized * 100;
    if (pct >= 80) {
      indicator.textContent = 'Indicator: Green (Strong Readiness)';
      indicator.classList.add('green');
    } else if (pct >= 50) {
      indicator.textContent = 'Indicator: Yellow (Moderate Readiness)';
      indicator.classList.add('yellow');
    } else {
      indicator.textContent = 'Indicator: Red (Needs Improvement)';
      indicator.classList.add('red');
    }
    scoreDiv.appendChild(indicator);

    // Reveal the “Next” button so the user can proceed
    const nextBtn = parentSec.querySelector('.next-btn');
    if (nextBtn) {
      nextBtn.style.display = 'inline-block';
    }
  }

  /**
   * Once the user reaches the final section, we compute the overall readiness
   * across sections 1..9, display an indicator, and create the radar chart.
   */
  function computeFinalReadiness() {
    // We have 9 main sections
    let sum = 0;
    for (let i = 1; i <= 9; i++) {
      sum += sectionScores[i] || 0; // if not defined, default 0
    }
    const composite = sum / 9;
    const pct = composite * 100;

    const compositeScoreDisplay = document.getElementById('compositeScoreDisplay');
    const indicatorDisplay = document.getElementById('indicatorDisplay');

    // Show numeric readiness
    compositeScoreDisplay.textContent = pct.toFixed(1) + '%';

    // Color-coded indicator
    if (pct >= 80) {
      indicatorDisplay.textContent = 'Green (Strong Overall Readiness)';
      indicatorDisplay.style.color = 'green';
    } else if (pct >= 50) {
      indicatorDisplay.textContent = 'Yellow (Moderate Overall Readiness)';
      indicatorDisplay.style.color = 'goldenrod';
    } else {
      indicatorDisplay.textContent = 'Red (Needs Improvement)';
      indicatorDisplay.style.color = 'red';
    }

    // Draw the radar chart
    createRadarChart();
  }

  function createRadarChart() {
    const ctx = document.getElementById('radarChart');
    if (!ctx) return; // just a safety check

    // Label each of the 9 sections
    const labels = [
      'Org. Strategy',
      'Data Prep.',
      'Tech & Infra.',
      'Gov. & Ethics',
      'Workforce & Culture',
      'Impl. & Ops',
      'Risk & Security',
      'Finance & ROI',
      'Cont. Learning'
    ];

    // gather the normalized scores
    const dataPoints = [];
    for (let i = 1; i <= 9; i++) {
      dataPoints.push(sectionScores[i] || 0);
    }

    // if there's an existing chart, destroy it
    if (window.radarChart) {
      window.radarChart.destroy();
    }

    window.radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'AI Readiness (Normalized)',
          data: dataPoints,
          backgroundColor: 'rgba(0,31,63,0.2)', // Navy background with some transparency
          borderColor: 'rgba(0,31,63,1)',       // Navy border
          borderWidth: 2,
          pointBackgroundColor: 'rgba(0,31,63,1)'
        }]
      },
      options: {
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: 1,
            angleLines: {
              display: true
            },
            grid: {
              display: true
            },
            pointLabels: {
              font: {
                size: 14
              }
            }
          }
        }
      }
    });
  }

});
