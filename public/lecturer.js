const courseList = $("#course-list");
const courseSelect = $("#session-course");
const enrollCourse = $("#enroll-course");
const enrollStatus = $("#enroll-status");
const qrCard = $("#qr-card");
const qrCanvas = $("#qr-canvas");
const qrExpiry = $("#qr-expiry");
const qrLink = $("#qr-link");
const attendanceList = $("#attendance-list");
let activeSessionId = null;
let currentLecturerEmail = null;

// Check authentication on page load
function checkAuth() {
  const token = localStorage.getItem('lecturer_token');
  
  if (!token) {
    window.location.href = '/login.html';
    return false;
  }
  
  // Try to decode JWT to get email
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    currentLecturerEmail = payload.email || 'Lecturer';
    const emailEl = $('#lecturer-email');
    if (emailEl) {
      emailEl.textContent = currentLecturerEmail;
    }
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem('lecturer_token');
      localStorage.removeItem('lecturer_email');
      window.location.href = '/login.html';
      return false;
    }
  } catch (e) {
    console.error('Invalid JWT', e);
    localStorage.removeItem('lecturer_token');
    window.location.href = '/login.html';
    return false;
  }
  
  return true;
}

$('#logout-btn')?.addEventListener('click', () => {
  localStorage.removeItem('lecturer_token');
  localStorage.removeItem('lecturer_email');
  window.location.href = '/login.html';
});

if (!checkAuth()) {
  throw new Error('Authentication required');
}

async function loadCourses() {
  try {
    const data = await apiFetch("/api/lecturer/courses");
    renderCourses(data.courses || []);
  } catch (err) {
    courseList.textContent = "Unable to load courses. Ensure Cloudflare Access is active.";
  }
}

function renderCourses(courses) {
  courseList.innerHTML = "";
  courseSelect.innerHTML = "";
  enrollCourse.innerHTML = "";

  if (!courses.length) {
    courseList.textContent = "No courses yet.";
    return;
  }

  courses.forEach((course) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<strong>${course.course_code}</strong><span>${course.title}</span>`;
    courseList.appendChild(item);

    const option = document.createElement("option");
    option.value = course.course_id;
    option.textContent = `${course.course_code} - ${course.title}`;
    courseSelect.appendChild(option);

    const option2 = option.cloneNode(true);
    enrollCourse.appendChild(option2);
  });
}

$("#course-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const courseCode = $("#course-code").value.trim();
  const courseTitle = $("#course-title").value.trim();

  try {
    await apiFetch("/api/lecturer/courses", {
      method: "POST",
      body: JSON.stringify({ course_code: courseCode, title: courseTitle })
    });
    event.target.reset();
    await loadCourses();
  } catch (err) {
    alert(err.message);
  }
});

$("#student-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const indexNumber = $("#student-index").value.trim();
  const fullName = $("#student-name").value.trim();
  const programme = $("#student-programme").value.trim();

  try {
    await apiFetch("/api/lecturer/students", {
      method: "POST",
      body: JSON.stringify({ index_number: indexNumber, full_name: fullName, programme })
    });
    event.target.reset();
    enrollStatus.textContent = "Student added.";
  } catch (err) {
    alert(err.message);
  }
});

$("#enroll-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const courseId = enrollCourse.value;
  const studentIndex = $("#enroll-index").value.trim();

  try {
    await apiFetch("/api/lecturer/enrollments", {
      method: "POST",
      body: JSON.stringify({ course_id: Number(courseId), student_index: studentIndex })
    });
    event.target.reset();
    enrollStatus.textContent = "Enrollment saved.";
  } catch (err) {
    alert(err.message);
  }
});

$("#use-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported on this device.");
    return;
  }
  navigator.geolocation.getCurrentPosition((position) => {
    $("#location-lat").value = position.coords.latitude.toFixed(6);
    $("#location-lon").value = position.coords.longitude.toFixed(6);
  }, () => {
    alert("Unable to get location. Check browser permissions.");
  });
});

$("#session-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    course_id: Number(courseSelect.value),
    geofence_radius: Number($("#session-radius").value),
    session_minutes: Number($("#session-minutes").value),
    qr_minutes: Number($("#qr-minutes").value),
    location_lat: Number($("#location-lat").value),
    location_lon: Number($("#location-lon").value)
  };

  try {
    const data = await apiFetch("/api/lecturer/sessions", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    activeSessionId = data.session_id;
    $("#attendance-session").value = data.session_id;
    renderQr(data.qr_token, data.qr_expires_at);
    await loadAttendance();
  } catch (err) {
    alert(err.message);
  }
});

$("#refresh-qr").addEventListener("click", async () => {
  if (!activeSessionId) return;
  try {
    const data = await apiFetch(`/api/lecturer/sessions/${activeSessionId}/refresh-qr`, {
      method: "POST"
    });
    renderQr(data.qr_token, data.qr_expires_at);
  } catch (err) {
    alert(err.message);
  }
});

$("#load-attendance").addEventListener("click", loadAttendance);
$("#download-attendance").addEventListener("click", downloadAttendance);

async function loadAttendance() {
  const sessionId = Number($("#attendance-session").value);
  if (!sessionId) return;
  try {
    const data = await apiFetch(`/api/lecturer/sessions/${sessionId}`);
    renderAttendance(data.attendance || []);
  } catch (err) {
    alert(err.message);
  }
}

function renderQr(token, expiry) {
  const url = new URL("/student.html", window.location.origin);
  url.searchParams.set("qr", token);

  qrCard.classList.remove("hidden");
  qrExpiry.textContent = `Expires: ${new Date(expiry).toLocaleTimeString()}`;
  qrLink.textContent = url.toString();

  QRCode.toCanvas(qrCanvas, url.toString(), { width: 220 }, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

function renderAttendance(list) {
  attendanceList.innerHTML = "";
  if (!list.length) {
    attendanceList.textContent = "No attendance records yet.";
    return;
  }

  list.forEach((item) => {
    const node = document.createElement("div");
    node.className = "list-item";
    node.innerHTML = `<div>
        <strong>${item.student_index}</strong>
        <span style="color: var(--text-secondary); margin-left: 8px;">${item.full_name || ""}</span>
      </div>
      <span>${item.programme || ""}</span>
      <span>${new Date(item.timestamp).toLocaleTimeString()}</span>
      <span style="color: ${item.status === 'valid' ? 'var(--spotify-green)' : item.status === 'flagged' ? '#ffa500' : '#e22134'}">${item.status}</span>
      <span>${item.reason || ""}</span>`;
    attendanceList.appendChild(node);
  });
}

let currentAttendanceData = [];

async function downloadAttendance() {
  const sessionId = Number($("#attendance-session").value);
  if (!sessionId) {
    alert("Enter a session ID first");
    return;
  }
  
  try {
    const data = await apiFetch(`/api/lecturer/sessions/${sessionId}`);
    const list = data.attendance || [];
    
    if (!list.length) {
      alert("No attendance records to download");
      return;
    }
    
    const csv = [
      ["Student ID", "Name", "Course", "Timestamp", "Status", "Flags"],
      ...list.map(item => [
        item.student_index,
        item.full_name || "",
        item.programme || "",
        new Date(item.timestamp).toLocaleString(),
        item.status,
        item.reason || ""
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-session-${sessionId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.message);
  }
}

loadCourses();
