document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklistForm');
  const chatBtn = document.getElementById('chatBtn');
  const chatInput = document.getElementById('chatInput');
  const chatResponse = document.getElementById('chatResponse');

  const compositeScoreDisplay = document.getElementById('compositeScoreDisplay');
  const indicatorDisplay = document.getElementById('indicatorDisplay');

  // Submitting the checklist
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
      const { section_scores, composite_score, indicator } = data;

      compositeScoreDisplay.textContent = composite_score.toFixed(1) + '%';
      indicatorDisplay.textContent = `Indicator: ${indicator}`;
      if (indicator === 'Green') {
        indicatorDisplay.style.color = 'green';
      } else if (indicator === 'Yellow') {
        indicatorDisplay.style.color = 'goldenrod';
      } else {
        indicatorDisplay.style.color = 'red';
      }

      renderRadarChart(section_scores);
    })
    .catch(err => {
      console.error('Error fetching scores:', err);
    });
  });

  // Sending a chat message
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
      chatResponse.textContent = data.answer || 'No response';
    })
    .catch(err => {
      console.error('Error fetching chat response:', err);
      chatResponse.textContent = 'Chat error.';
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
