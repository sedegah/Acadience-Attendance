const qrInput = $("#qr-token");
const statusEl = $("#student-status");

const urlParams = new URLSearchParams(window.location.search);
const qrFromUrl = urlParams.get("qr");
if (qrFromUrl) {
  qrInput.value = qrFromUrl;
}

$("#student-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus(statusEl, "Requesting location...");

  if (!navigator.geolocation) {
    setStatus(statusEl, "Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const payload = {
      qr_token: qrInput.value.trim(),
      student_id: $("#student-id").value.trim(),
      student_name: $("#student-name").value.trim(),
      course_code: $("#course-code").value.trim(),
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      device: {
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      }
    };

    try {
      const data = await apiFetch("/api/student/submit", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setStatus(statusEl, `Attendance ${data.status || "recorded"}. Flags: ${(data.flags || []).join(", ")}`);
    } catch (err) {
      setStatus(statusEl, `Error: ${err.message}`);
    }
  }, (error) => {
    setStatus(statusEl, `Location error: ${error.message}`);
  });
});
