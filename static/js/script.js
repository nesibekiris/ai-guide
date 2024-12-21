document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklistForm');
  const chatBtn = document.getElementById('chatBtn');
  const chatInput = document.getElementById('chatInput');
  const chatResponse = document.getElementById('chatResponse');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch('/submit', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      // data contains section scores
      renderRadarChart(data);
    });
  });

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
      chatResponse.textContent = data.answer;
    });
  });
});

function renderRadarChart(scores) {
  const ctx = document.getElementById('radarChart');
  const labels = Object.keys(scores);
  const values = Object.values(scores);

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'AI Readiness',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 2, // Adjust based on number of questions per section
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
