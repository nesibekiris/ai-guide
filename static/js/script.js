document.addEventListener('DOMContentLoaded', () => {
  // Section navigation
  const nextButtons = document.querySelectorAll('.next-btn');
  const calcButtons = document.querySelectorAll('.calc-section-btn');

  // Track scores per section
  const sectionScores = {}; // e.g. sectionScores[1] = {score: 0.8, ...}

  // The order of sections (IDs must match your HTML):
  const sectionIds = [
    'introSection',
    'section1', 'section2', 'section3', 'section4', 'section5', 
    'section6', 'section7', 'section8', 'section9',
    'finalSection', 'chatContainer'
  ];

  // Initially show only introSection
  showSection('introSection');

  nextButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const nextId = btn.getAttribute('data-next');
      showSection(nextId);
    });
  });

  calcButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sectionNumber = btn.getAttribute('data-section');
      calculateSectionScore(sectionNumber);
    });
  });

  const chatBtn = document.getElementById('chatBtn');
  const chatInput = document.getElementById('chatInput');
  const chatResponse = document.getElementById('chatResponse');

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

  // Show a particular section and hide others
  function showSection(id) {
    sectionIds.forEach(secId => {
      const sec = document.getElementById(secId);
      if (sec) {
        if (secId === id) {
          sec.style.display = 'block';
        } else {
          sec.style.display = 'none';
        }
      }
    });

    // If the finalSection is shown, that means all sections done
    if (id === 'finalSection') {
      computeFinalReadiness();
    }
  }

  function calculateSectionScore(sectionNumber) {
    // Example: sectionNumber = '1' means formSection1
    const form = document.getElementById(`formSection${sectionNumber}`);
    const inputs = form.querySelectorAll('input[type=radio]:checked');

    let score = 0;
    let totalQuestions = 0;

    inputs.forEach(input => {
      totalQuestions++;
      if (input.value === 'Yes') score += 1;
      else if (input.value === 'Partial') score += 0.5;
      // No = 0, so no addition
    });

    // Normalize score
    const normalized = totalQuestions > 0 ? (score / totalQuestions) : 0;
    sectionScores[sectionNumber] = normalized;

    // Display partial score + R/Y/G indicator
    const scoreDiv = document.getElementById(`scoreSection${sectionNumber}`);
    scoreDiv.style.display = 'block';
    scoreDiv.innerHTML = `
      <p>Section Score: ${(normalized*100).toFixed(1)}%</p>
    `;
    const indicator = document.createElement('span');
    indicator.classList.add('score-indicator');
    const pct = normalized*100;
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

    // After calculation, show next button for this section
    const parentSec = document.getElementById(`section${sectionNumber}`);
    const nextBtn = parentSec.querySelector('.next-btn');
    if (nextBtn) {
      nextBtn.style.display = 'inline-block';
    }

    // If the sectionNumber = 9 and user clicks next, we show finalSection
    // handled by next button data-next attr
  }

  function computeFinalReadiness() {
    // sections 1 to 9
    let totalWeight = 9; // if each section is equally weighted
    // If you had different weights, you'd sum them accordingly.
    // For simplicity, let's assume equal weighting.
    let sum = 0;
    for (let i=1; i<=9; i++) {
      sum += sectionScores[i] || 0;
    }
    const composite = sum / 9;
    const pct = composite * 100;

    const compositeScoreDisplay = document.getElementById('compositeScoreDisplay');
    const indicatorDisplay = document.getElementById('indicatorDisplay');

    compositeScoreDisplay.textContent = pct.toFixed(1) + '%';

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

    // Create Radar Chart
    createRadarChart();
  }

  function createRadarChart() {
    const ctx = document.getElementById('radarChart');
    const labels = [
      'Org. Strategy',
      'Data Prep.',
      'Tech & Infra.',
      'Gov. & Ethics',
      'Workforce & Culture',
      'Impl. & Ops',
      'Risk & Security',
      'Finance & ROI',
      'Cont. Learning & Innov.'
    ];

    const values = [];
    for (let i=1; i<=9; i++) {
      values.push(sectionScores[i] || 0);
    }

    if (window.radarChart) {
      window.radarChart.destroy();
    }

    window.radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'AI Readiness (Normalized)',
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)'
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
