function processFile(mode) {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Please upload a CSV file.");
  const reader = new FileReader();
  reader.onload = () => {
    const lines = reader.result.trim().split("\n").slice(1); // Skip header
    const processes = lines.map(line => {
      const [name, start, dur, need] = line.split(",");
      return { name, start: +start, duration: +dur, need: +need };
    });
    analyzeDeadlock(processes, mode);
  };
  reader.readAsText(file);
}

function analyzeDeadlock(processes, mode) {
  const resultDiv = document.getElementById("resultBlock");
  let log = "";
  const totalResources = 10;
  let available = totalResources;
  processes.forEach(p => available -= p.need);

  const deadlockProcesses = processes.filter(p => p.need > available);
  const safe = deadlockProcesses.length === 0;

  if (mode === "detect") {
    if (safe) {
      log += "✅ No deadlock detected.\nSystem in safe state.\n";
    } else {
      log += "⚠️ Deadlock Detected!\n";
      log += `Blocked Processes: ${deadlockProcesses.map(p => p.name).join(", ")}\n`;
      log += "🔄 Type: Circular Wait / Resource Exhaustion\n";
    }
  } else if (mode === "prevent") {
    const safeSeq = banker(processes, totalResources);
    if (safeSeq) {
      log += `✔️ Deadlock Prevented using Banker’s Algorithm.\nExecution Order: ${safeSeq.join(" → ")}\n`;
      processes = safeSeq.map(name => processes.find(p => p.name === name));
    } else {
      log += "❌ Deadlock could not be prevented. Unsafe state!\n";
    }
  }

  resultDiv.textContent = log;
  drawGanttChart(processes);
}

function banker(processes, total) {
  const finish = Array(processes.length).fill(false);
  const sequence = [];
  let avail = total;

  while (sequence.length < processes.length) {
    let found = false;
    for (let i = 0; i < processes.length; i++) {
      if (!finish[i] && processes[i].need <= avail) {
        avail += processes[i].need;
        finish[i] = true;
        sequence.push(processes[i].name);
        found = true;
      }
    }
    if (!found) break;
  }
  return sequence.length === processes.length ? sequence : null;
}

function drawGanttChart(processes) {
  const ctx = document.getElementById("ganttChart").getContext("2d");
  const labels = processes.map(p => p.name);
  const durations = processes.map(p => p.duration);
  const data = {
    labels,
    datasets: [{
      label: "Process Duration",
      data: durations,
      backgroundColor: "rgba(54,162,235,0.7)",
      barThickness: 30
    }]
  };
  const config = {
    type: "bar",
    data,
    options: {
      indexAxis: "y",
      scales: {
        x: { beginAtZero: true },
        y: { stacked: true }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Process Execution Timeline" }
      }
    }
  };

  if (window.ganttInstance) window.ganttInstance.destroy();
  window.ganttInstance = new Chart(ctx, config);
}

function submitFeedback() {
  const fb = document.getElementById("feedbackInput").value.trim();
  document.getElementById("feedbackAck").textContent = fb ? "✅ Feedback saved!" : "";
}

async function askZypher() {
  const q = document.getElementById("assistantInput").value.trim();
  if (!q) return;
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`);
  const data = await res.json();
  document.getElementById("assistantResponse").textContent = data.extract || "No info found.";
}
