document.addEventListener('DOMContentLoaded', () => {

  const sectionIds = [
    'introSection',
    'section1', 'section2', 'section3', 'section4', 'section5',
    'section6', 'section7', 'section8', 'section9',
    'finalSection',
    'chatContainer'
  ];

  showSection('introSection');

  const sectionScores = {};

  const nextButtons = document.querySelectorAll('.next-btn');
  nextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextId = btn.getAttribute('data-next');
      showSection(nextId);
    });
  });

  const calcButtons = document.querySelectorAll('.calc-section-btn');
  calcButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionNumber = btn.getAttribute('data-section');
      calculateSectionScore(sectionNumber);
    });
  });

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

  function showSection(id) {
    sectionIds.forEach(secId => {
      const sec = document.getElementById(secId);
      if (sec) sec.style.display = 'none';
    });

    const target = document.getElementById(id);
    if (target) target.style.display = 'block';

    if (id === 'finalSection') {
      computeFinalReadiness();
    }
  }

  function calculateSectionScore(sectionNumber) {
    const form = document.getElementById(`formSection${sectionNumber}`);
    const scoreDiv = document.getElementById(`scoreSection${sectionNumber}`);
    const parentSec = document.getElementById(`section${sectionNumber}`);

    if (!form || !scoreDiv || !parentSec) return;

    const checkedInputs = form.querySelectorAll('input[type=radio]:checked');
    let score = 0;
    let totalQuestions = 0;

    checkedInputs.forEach(input => {
      totalQuestions++;
      if (input.value === 'Yes') score += 1;
      else if (input.value === 'Partial') score += 0.5;
      // No = 0
    });

    let normalized = 0;
    let message = '';
    if (totalQuestions > 0) {
      normalized = score / totalQuestions;
      message = `Section Score: ${(normalized * 100).toFixed(1)}%`;
    } else {
      normalized = 0;
      message = 'No questions found for this section. Defaulting to 0%.';
    }

    sectionScores[sectionNumber] = normalized;

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

    const nextBtn = parentSec.querySelector('.next-btn');
    if (nextBtn) {
      nextBtn.style.display = 'inline-block';
    }
  }

  function computeFinalReadiness() {
    let sum = 0;
    for (let i = 1; i <= 9; i++) {
      sum += sectionScores[i] || 0;
    }
    const composite = sum / 9;
    const pct = composite * 100;

    document.getElementById('compositeScoreDisplay').textContent = pct.toFixed(1) + '%';

    const indicatorDisplay = document.getElementById('indicatorDisplay');
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

    createRadarChart();
  }

  function createRadarChart() {
    const ctx = document.getElementById('radarChart');
    if (!ctx) return;

    // Labels for the 9 sections
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

    const dataPoints = [];
    for (let i = 1; i <= 9; i++) {
      dataPoints.push(sectionScores[i] || 0);
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
          data: dataPoints,
          backgroundColor: 'rgba(0,31,63,0.2)', // Navy semi-transparent
          borderColor: 'rgba(0,31,63,1)',       // Navy
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
