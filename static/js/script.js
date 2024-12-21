document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklistForm');
  const chatBtn = document.getElementById('chatBtn');
  const chatInput = document.getElementById('chatInput');
  const chatResponse = document.getElementById('chatResponse');

  const compositeScoreDisplay = document.getElementById('compositeScoreDisplay');
  const indicatorDisplay = document.getElementById('indicatorDisplay');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    console.log('Submitting form data...');

    fetch('/submit', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      console.log('Received scores and composite:', data);
      // data: { section_scores: {...}, composite_score: number, indicator: string }

      const sectionScores = data.section_scores;
      const compositeScore = data.composite_score; // Already a percentage
      const indicator = data.indicator;

      // Update the composite score display
      compositeScoreDisplay.textContent = compositeScore.toFixed(1) + '%';
      indicatorDisplay.textContent = `Indicator: ${indicator}`;
      if (indicator === 'Green') {
        indicatorDisplay.style.color = 'green';
      } else if (indicator === 'Yellow') {
        indicatorDisplay.style.color = 'goldenrod';
      } else {
        indicatorDisplay.style.color = 'red';
      }

      // Render the chart using normalized scores (0 to 1 scale)
      renderRadarChart(sectionScores);
    })
    .catch(err => {
      console.error('Error fetching scores:', err);
    });
  });

  chatBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (!message) {
      console.warn('No message entered.');
      return;
    }

    const formData = new FormData();
    formData.append('message', message);
    console.log('Sending chat message:', message);

    fetch('/chat', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      console.log('Chat response:', data);
      chatResponse.textContent = data.answer;
    })
    .catch(err => {
      console.error('Error fetching chat response:', err);
    });
  });
});

function renderRadarChart(scores) {
  const ctx = document.getElementById('radarChart');
  const labels = Object.keys(scores);
  const values = Object.values(scores);

  if (!labels.length) {
    console.warn('No scores to display on the radar chart.');
    return;
  }

  // Radar chart expects values in 0-1 scale (already normalized)
  // Suggested max can be 1.0 for full readiness
  new Chart(ctx, {
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
