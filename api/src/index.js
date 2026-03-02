const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8"
};

const MAX_BODY_SIZE = 8192; // 8 KB max request body
const MAX_INPUT_LEN = 200; // Max length for any text input field

let accessCertCache = { expiresAt: 0, keys: [] };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return handleOptions(request, env);
    }

    try {
      // ── Security: enforce content-length on POST requests ──
      if (request.method === "POST") {
        const contentLength = request.headers.get("content-length");
        if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
          return jsonResponse({ error: "Request body too large" }, 413, env, request);
        }
      }

      if (request.method !== "GET" && request.method !== "POST" && request.method !== "DELETE") {
        return jsonResponse({ error: "Method not allowed" }, 405, env, request);
      }

      if (url.pathname === "/api/health") {
        return jsonResponse({ ok: true, time: new Date().toISOString() }, 200, env, request);
      }

      // Public endpoint: decode QR token and return session info for students
      if (url.pathname === "/api/student/session-info" && request.method === "GET") {
        const token = url.searchParams.get("token") || "";
        assert(token, "token query parameter is required", 400);

        const qrPayload = await verifyQrToken(token, env);
        assert(qrPayload, "Invalid or expired QR token", 401);

        const session = await env.DB.prepare(
          `SELECT s.session_id, s.course_id, s.start_time, s.end_time, s.geofence_radius,
                  s.location_lat, s.location_lon, s.qr_nonce, s.qr_expiry, c.course_code, c.title as course_title
           FROM sessions s
           JOIN courses c ON c.course_id = s.course_id
           WHERE s.session_id = ?`
        ).bind(qrPayload.sid).first();
        assert(session, "Session not found", 404);

        // Check nonce + expiry
        const now = new Date();
        if (qrPayload.nonce !== session.qr_nonce || now > new Date(session.qr_expiry)) {
          return jsonResponse({ error: "QR code has expired. Ask your lecturer to refresh." }, 401, env, request);
        }
        if (now > new Date(session.end_time)) {
          return jsonResponse({ error: "This session has ended." }, 410, env, request);
        }

        return jsonResponse({
          session_id: session.session_id,
          course_code: session.course_code,
          course_title: session.course_title,
          start_time: session.start_time,
          end_time: session.end_time,
          geofence_radius: session.geofence_radius,
        }, 200, env, request);
      }


      if (url.pathname === "/api/lecturer/register" && request.method === "POST") {
        const body = await readJsonSafe(request);
        const email = sanitize(body.email);
        const fullName = sanitize(body.full_name);
        const password = body.password || "";

        assert(email && fullName && password, "email, full_name, and password are required", 400);
        assert(isValidEmail(email), "invalid email format", 400);
        assert(password.length >= 8, "password must be at least 8 characters", 400);
        assert(password.length <= 128, "password too long", 400);
        assert(fullName.length <= MAX_INPUT_LEN, "full_name too long", 400);

        const existing = await env.DB.prepare(
          "SELECT lecturer_id FROM lecturers WHERE email = ?"
        ).bind(email).first();
        assert(!existing, "email already registered", 409);

        const passwordHash = await hashPassword(password);
        await env.DB.prepare(
          "INSERT INTO lecturers (email, full_name, password_hash) VALUES (?, ?, ?)"
        ).bind(email, fullName, passwordHash).run();

        return jsonResponse({ ok: true, message: "Registration successful" }, 201, env, request);
      }

      if (url.pathname === "/api/lecturer/login" && request.method === "POST") {
        const body = await readJsonSafe(request);
        const email = sanitize(body.email);
        const password = body.password || "";

        assert(email && password, "email and password are required", 400);
        assert(isValidEmail(email), "invalid email format", 400);

        const lecturer = await env.DB.prepare(
          "SELECT lecturer_id, email, full_name, password_hash FROM lecturers WHERE email = ?"
        ).bind(email).first();
        assert(lecturer, "invalid credentials", 401);

        const valid = await verifyPassword(password, lecturer.password_hash);
        assert(valid, "invalid credentials", 401);

        const token = await signLecturerToken({
          lecturer_id: lecturer.lecturer_id,
          email: lecturer.email,
          name: lecturer.full_name,
          exp: Math.floor(Date.now() / 1000) + 86400 * 7
        }, env);

        return jsonResponse({
          token,
          lecturer: {
            email: lecturer.email,
            full_name: lecturer.full_name
          }
        }, 200, env, request);
      }

      if (url.pathname === "/api/lecturer/courses" && request.method === "GET") {
        const lecturer = await requireLecturer(request, env, ctx);
        const rows = await env.DB.prepare(
          "SELECT course_id as id, course_code, title, created_at FROM courses WHERE lecturer_email = ? ORDER BY course_code"
        ).bind(lecturer.email).all();
        return jsonResponse({ courses: rows.results }, 200, env, request);
      }

      if (url.pathname === "/api/lecturer/courses" && request.method === "POST") {
        const lecturer = await requireLecturer(request, env, ctx);
        const body = await readJsonSafe(request);
        const courseCode = sanitize(body.course_code);
        const title = sanitize(body.title);
        assert(courseCode && title, "course_code and title are required", 400);
        assert(courseCode.length <= 20, "course_code too long (max 20 chars)", 400);
        assert(title.length <= MAX_INPUT_LEN, "title too long", 400);
        assert(/^[A-Z0-9\-_ ]+$/i.test(courseCode), "course_code contains invalid characters", 400);

        const result = await env.DB.prepare(
          "INSERT INTO courses (course_code, title, lecturer_email) VALUES (?, ?, ?)"
        ).bind(courseCode, title, lecturer.email).run();

        const inserted = await env.DB.prepare(
          "SELECT course_id as id, course_code, title, created_at FROM courses WHERE rowid = ?"
        ).bind(result.meta.last_row_id).first();

        return jsonResponse({ ok: true, course: inserted }, 201, env, request);
      }

      if (url.pathname.startsWith("/api/lecturer/courses/") && request.method === "DELETE") {
        const lecturer = await requireLecturer(request, env, ctx);
        const courseId = Number(url.pathname.split("/")[4]);
        assert(courseId, "invalid course id", 400);

        const course = await env.DB.prepare(
          "SELECT course_id FROM courses WHERE course_id = ? AND lecturer_email = ?"
        ).bind(courseId, lecturer.email).first();
        assert(course, "course not found", 404);

        await env.DB.prepare("DELETE FROM courses WHERE course_id = ?").bind(courseId).run();
        return jsonResponse({ ok: true }, 200, env, request);
      }

      if (url.pathname === "/api/lecturer/students" && request.method === "POST") {
        await requireLecturer(request, env, ctx);
        const body = await readJsonSafe(request);
        const indexNumber = sanitize(body.index_number);
        const fullName = sanitize(body.full_name);
        const programme = sanitize(body.programme || "");
        assert(indexNumber && fullName, "index_number and full_name are required", 400);
        assert(indexNumber.length <= 30, "index_number too long", 400);
        assert(fullName.length <= MAX_INPUT_LEN, "full_name too long", 400);

        await env.DB.prepare(
          "INSERT INTO students (index_number, full_name, programme) VALUES (?, ?, ?)"
        ).bind(indexNumber, fullName, programme).run();

        return jsonResponse({ ok: true }, 201, env, request);
      }

      if (url.pathname === "/api/lecturer/enrollments" && request.method === "POST") {
        await requireLecturer(request, env, ctx);
        const body = await readJsonSafe(request);
        const courseId = Number(body.course_id);
        const studentIndex = sanitize(body.student_index);
        assert(courseId && studentIndex, "course_id and student_index are required", 400);

        await env.DB.prepare(
          "INSERT INTO enrollments (course_id, student_index) VALUES (?, ?)"
        ).bind(courseId, studentIndex).run();

        return jsonResponse({ ok: true }, 201, env, request);
      }

      if (url.pathname === "/api/lecturer/sessions" && request.method === "POST") {
        const lecturer = await requireLecturer(request, env, ctx);
        const body = await readJsonSafe(request);
        const courseId = Number(body.course_id);
        const geofenceRadius = Number(body.geofence_radius || 300);
        const sessionMinutes = Number(body.session_minutes || 60);
        const qrMinutes = Number(body.qr_minutes || 20);
        const locationLat = body.location_lat !== undefined ? Number(body.location_lat) : 0;
        const locationLon = body.location_lon !== undefined ? Number(body.location_lon) : 0;

        assert(courseId && geofenceRadius > 0 && sessionMinutes > 0 && qrMinutes > 0,
          "course_id, geofence_radius, session_minutes, and qr_minutes are required",
          400
        );
        assert(geofenceRadius <= 10000, "geofence_radius must be <= 10 km", 400);
        assert(sessionMinutes <= 480, "session_minutes must be <= 8 hours", 400);
        assert(qrMinutes <= 120, "qr_minutes must be <= 2 hours", 400);
        if (locationLat !== 0 || locationLon !== 0) {
          assert(Math.abs(locationLat) <= 90 && Math.abs(locationLon) <= 180, "invalid coordinates", 400);
        }

        const course = await env.DB.prepare(
          "SELECT course_id FROM courses WHERE course_id = ? AND lecturer_email = ?"
        ).bind(courseId, lecturer.email).first();
        assert(course, "course not found", 404);

        const now = new Date();
        const end = new Date(now.getTime() + sessionMinutes * 60 * 1000);
        const qrExpiry = new Date(now.getTime() + qrMinutes * 60 * 1000);
        const qrNonce = randomToken(16);

        const result = await env.DB.prepare(
          "INSERT INTO sessions (course_id, start_time, end_time, geofence_radius, location_lat, location_lon, qr_nonce, qr_expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(courseId, now.toISOString(), end.toISOString(), geofenceRadius, locationLat, locationLon, qrNonce, qrExpiry.toISOString()).run();

        const sessionId = result.meta.last_row_id;
        const qrToken = await signQrToken({
          sid: sessionId,
          nonce: qrNonce,
          exp: Math.floor(qrExpiry.getTime() / 1000),
          iat: Math.floor(now.getTime() / 1000)
        }, env);

        return jsonResponse({
          session_id: sessionId,
          qr_token: qrToken,
          qr_expires_at: qrExpiry.toISOString()
        }, 201, env, request);
      }

      if (url.pathname.startsWith("/api/lecturer/sessions/") && request.method === "GET") {
        const lecturer = await requireLecturer(request, env, ctx);
        const sessionId = Number(url.pathname.split("/")[4]);
        assert(sessionId, "invalid session id", 400);

        const session = await env.DB.prepare(
          `SELECT s.session_id, s.course_id, s.start_time, s.end_time, s.geofence_radius, s.qr_expiry, c.course_code
           FROM sessions s
           JOIN courses c ON c.course_id = s.course_id
           WHERE s.session_id = ? AND c.lecturer_email = ?`
        ).bind(sessionId, lecturer.email).first();
        assert(session, "session not found", 404);

        const attendance = await env.DB.prepare(
          `SELECT a.attendance_id, a.student_index, st.full_name, st.programme, a.timestamp, a.latitude, a.longitude, a.accuracy, a.status, a.reason, a.flags
           FROM attendance a
           LEFT JOIN students st ON st.index_number = a.student_index
           WHERE a.session_id = ?
           ORDER BY a.timestamp DESC`
        ).bind(sessionId).all();

        return jsonResponse({ session, attendance: attendance.results }, 200, env, request);
      }

      if (url.pathname.startsWith("/api/lecturer/sessions/") && request.method === "POST") {
        const lecturer = await requireLecturer(request, env, ctx);
        const parts = url.pathname.split("/");
        const sessionId = Number(parts[4]);
        const action = parts[5];
        assert(sessionId && action === "refresh-qr", "invalid request", 400);

        const session = await env.DB.prepare(
          `SELECT s.session_id, s.course_id
           FROM sessions s
           JOIN courses c ON c.course_id = s.course_id
           WHERE s.session_id = ? AND c.lecturer_email = ?`
        ).bind(sessionId, lecturer.email).first();
        assert(session, "session not found", 404);

        const qrMinutes = 20;
        const now = new Date();
        const qrExpiry = new Date(now.getTime() + qrMinutes * 60 * 1000);
        const qrNonce = randomToken(16);

        await env.DB.prepare(
          "UPDATE sessions SET qr_nonce = ?, qr_expiry = ? WHERE session_id = ?"
        ).bind(qrNonce, qrExpiry.toISOString(), sessionId).run();

        const qrToken = await signQrToken({
          sid: sessionId,
          nonce: qrNonce,
          exp: Math.floor(qrExpiry.getTime() / 1000),
          iat: Math.floor(now.getTime() / 1000)
        }, env);

        return jsonResponse({ qr_token: qrToken, qr_expires_at: qrExpiry.toISOString() }, 200, env, request);
      }

      if (url.pathname === "/api/student/submit" && request.method === "POST") {
        const body = await readJsonSafe(request);
        const studentId = sanitize(body.student_id);
        const studentName = sanitize(body.student_name);
        const courseCode = sanitize(body.course_code);
        const qrToken = body.qr_token || "";
        const latitude = Number(body.latitude);
        const longitude = Number(body.longitude);
        const accuracy = body.accuracy === undefined ? null : Number(body.accuracy);
        const device = body.device || {};

        assert(studentId && studentName && courseCode && qrToken, "student_id, student_name, course_code and qr_token are required", 400);
        assert(studentId.length <= 30 && studentName.length <= MAX_INPUT_LEN, "input too long", 400);
        assert(Number.isFinite(latitude) && Number.isFinite(longitude), "latitude and longitude required", 400);
        assert(Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180, "invalid coordinates", 400);

        const qrPayload = await verifyQrToken(qrToken, env);
        assert(qrPayload, "invalid QR token", 401);

        const session = await env.DB.prepare(
          "SELECT session_id, course_id, start_time, end_time, geofence_radius, location_lat, location_lon, qr_nonce, qr_expiry FROM sessions WHERE session_id = ?"
        ).bind(qrPayload.sid).first();
        assert(session, "session not found", 404);

        const now = new Date();
        const qrExpiry = new Date(session.qr_expiry);
        const sessionEnd = new Date(session.end_time);
        const sessionStart = new Date(session.start_time);

        if (qrPayload.nonce !== session.qr_nonce || now > qrExpiry) {
          return jsonResponse({ status: "rejected", reason: "qr_expired" }, 401, env);
        }

        if (now < sessionStart || now > sessionEnd) {
          return jsonResponse({ status: "rejected", reason: "outside_session_window" }, 401, env);
        }

        const distance = haversineMeters(latitude, longitude, session.location_lat, session.location_lon);
        if (Number.isFinite(distance) && distance > Number(session.geofence_radius)) {
          return jsonResponse({ status: "rejected", reason: "outside_geofence" }, 401, env);
        }

        const deviceHash = await hashDevice(device, request.headers.get("user-agent") || "");
        const flags = [];

        const student = await env.DB.prepare(
          "SELECT index_number FROM students WHERE index_number = ?"
        ).bind(studentId).first();

        if (!student) {
          await env.DB.prepare(
            "INSERT OR IGNORE INTO students (index_number, full_name, programme) VALUES (?, ?, ?)"
          ).bind(studentId, studentName, courseCode).run();
        }

        const enrollmentOk = await isEnrollmentValid(studentId, session.course_id, env);
        if (!enrollmentOk) {
          if ((env.ALLOW_UNENROLLED || "false") === "true") {
            flags.push("unenrolled");
          } else {
            return jsonResponse({ status: "rejected", reason: "unenrolled" }, 401, env);
          }
        }

        if (accuracy && accuracy > 100) {
          flags.push("low_gps_accuracy");
        }

        const coordLat = Number(latitude.toFixed(5));
        const coordLon = Number(longitude.toFixed(5));
        const coordCount = await env.DB.prepare(
          "SELECT COUNT(*) as total FROM attendance WHERE session_id = ? AND ROUND(latitude, 5) = ? AND ROUND(longitude, 5) = ?"
        ).bind(session.session_id, coordLat, coordLon).first();

        if (coordCount && coordCount.total >= 3) {
          flags.push("clustered_location");
        }

        let status = flags.length ? "flagged" : "valid";
        let reason = flags.length ? flags.join(",") : "";

        try {
          await env.DB.prepare(
            `INSERT INTO attendance
             (student_index, session_id, timestamp, latitude, longitude, accuracy, device_hash, status, reason, flags)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            studentId,
            session.session_id,
            now.toISOString(),
            latitude,
            longitude,
            accuracy,
            deviceHash,
            status,
            reason,
            JSON.stringify(flags)
          ).run();
        } catch (err) {
          const message = String(err && err.message || "");
          if (message.includes("UNIQUE")) {
            return jsonResponse({ status: "rejected", reason: "duplicate_submission" }, 409, env);
          }
          throw err;
        }

        return jsonResponse({ status, flags }, status === "valid" ? 201 : 202, env, request);
      }

      return jsonResponse({ error: "Not Found" }, 404, env, request);
    } catch (err) {
      const status = err.status || 500;
      const message = err.expose ? err.message : "Server error";
      return jsonResponse({ error: message }, status, env, request);
    }
  }
};

function handleOptions(request, env) {
  const headers = corsHeaders(request, env);
  headers.set("access-control-max-age", "86400");
  headers.set("access-control-allow-methods", "GET, POST, DELETE, OPTIONS");
  headers.set("access-control-allow-headers", "content-type, authorization, cf-access-jwt-assertion");
  return new Response(null, { status: 204, headers });
}

function corsHeaders(request, env) {
  const origin = request ? request.headers.get("origin") : null;
  const allowed = env.APP_ORIGIN || "";
  const headers = new Headers();

  if (allowed === "*") {
    headers.set("access-control-allow-origin", "*");
  } else if (origin && (
    origin.endsWith(".acadience.pages.dev") ||
    origin.endsWith(".acadience-attendance.pages.dev") ||
    origin === "https://acadience-attendance.pages.dev"
  )) {
    headers.set("access-control-allow-origin", origin);
  } else if (allowed && origin === allowed) {
    headers.set("access-control-allow-origin", allowed);
  } else if (origin) {
    headers.set("access-control-allow-origin", origin);
  }

  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  headers.set("access-control-allow-headers", "content-type, authorization, cf-access-jwt-assertion");
  headers.set("vary", "origin");
  headers.set("access-control-allow-credentials", "true");
  return headers;
}

function jsonResponse(payload, status, env, request) {
  const headers = new Headers(JSON_HEADERS);
  const cors = corsHeaders(request, env);
  cors.forEach((value, key) => headers.set(key, value));
  // Security headers
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  return new Response(JSON.stringify(payload), { status, headers });
}

function assert(condition, message, status) {
  if (!condition) {
    const err = new Error(message);
    err.status = status || 400;
    err.expose = true;
    throw err;
  }
}

function sanitize(value) {
  if (!value) return "";
  return String(value).trim().replace(/[<>"']/g, "").substring(0, MAX_INPUT_LEN);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

async function readJsonSafe(request) {
  const text = await request.text();
  if (!text) return {};
  assert(text.length <= MAX_BODY_SIZE, "Request body too large", 413);
  try {
    return JSON.parse(text);
  } catch {
    const err = new Error("Invalid JSON body");
    err.status = 400;
    err.expose = true;
    throw err;
  }
}

async function requireLecturer(request, env, ctx) {
  const assertion = request.headers.get("cf-access-jwt-assertion");
  const authHeader = request.headers.get("authorization");

  // Try local JWT first
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = await verifyLecturerToken(token, env);
    if (payload && payload.email) {
      return payload;
    }
  }

  // Fall back to Cloudflare Access
  if (assertion) {
    const payload = await verifyAccessJwt(assertion, env, ctx);
    if (payload && payload.email) {
      await env.DB.prepare(
        "INSERT OR IGNORE INTO lecturers (email, full_name, password_hash) VALUES (?, ?, ?)"
      ).bind(payload.email, payload.name || "", "cloudflare-access").run();
      return payload;
    }
  }

  const err = new Error("Missing or invalid lecturer token");
  err.status = 401;
  err.expose = true;
  throw err;
}

async function verifyAccessJwt(token, env, ctx) {
  const parts = token.split(".");
  assert(parts.length === 3, "Malformed token", 401);

  const header = JSON.parse(atobUrl(parts[0]));
  const payload = JSON.parse(atobUrl(parts[1]));
  const signature = base64UrlToBytes(parts[2]);

  const aud = env.ACCESS_AUD;
  if (aud && payload.aud !== aud) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    return null;
  }

  const key = await getAccessKey(header.kid, env, ctx);
  if (!key) return null;

  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    data
  );

  return valid ? payload : null;
}

async function getAccessKey(kid, env, ctx) {
  const now = Date.now();
  if (accessCertCache.expiresAt > now && accessCertCache.keys.length) {
    return accessCertCache.keys.find((entry) => entry.kid === kid)?.key || null;
  }

  const team = env.ACCESS_TEAM_DOMAIN;
  assert(team, "ACCESS_TEAM_DOMAIN not configured", 500);
  const resp = await fetch(`https://${team}.cloudflareaccess.com/cdn-cgi/access/certs`);
  assert(resp.ok, "Unable to fetch access certs", 502);
  const json = await resp.json();
  const keys = [];

  for (const jwk of json.keys || []) {
    if (!jwk.x5c || !jwk.x5c.length) continue;
    const der = base64ToBytes(jwk.x5c[0]);
    const key = await crypto.subtle.importKey(
      "spki",
      der.buffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
    keys.push({ kid: jwk.kid, key });
  }

  accessCertCache = { keys, expiresAt: now + 60 * 60 * 1000 };
  return keys.find((entry) => entry.kid === kid)?.key || null;
}

async function signQrToken(payload, env) {
  const header = { alg: "HS256", typ: "JWT" };
  const headerPart = btoaUrl(JSON.stringify(header));
  const payloadPart = btoaUrl(JSON.stringify(payload));
  const data = `${headerPart}.${payloadPart}`;
  const signature = await hmacSign(data, env.QR_HMAC_SECRET);
  return `${data}.${signature}`;
}

async function verifyQrToken(token, env) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const data = `${parts[0]}.${parts[1]}`;
  const signature = parts[2];
  const expected = await hmacSign(data, env.QR_HMAC_SECRET);
  if (!timingSafeEqual(signature, expected)) return null;
  const payload = JSON.parse(atobUrl(parts[1]));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return null;
  return payload;
}

async function hmacSign(data, secret) {
  assert(secret, "QR_HMAC_SECRET not configured", 500);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

async function hashDevice(device, userAgent) {
  const payload = {
    ua: userAgent,
    platform: device.platform || "",
    screen: device.screen || "",
    tz: device.timezone || "",
    lang: device.language || ""
  };
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return base64UrlEncode(new Uint8Array(digest));
}

async function isEnrollmentValid(indexNumber, courseId, env) {
  const student = await env.DB.prepare(
    "SELECT index_number FROM students WHERE index_number = ?"
  ).bind(indexNumber).first();
  if (!student) return false;

  const enrollment = await env.DB.prepare(
    "SELECT enrollment_id FROM enrollments WHERE course_id = ? AND student_index = ?"
  ).bind(courseId, indexNumber).first();
  return Boolean(enrollment);
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every((n) => Number.isFinite(Number(n)))) return NaN;
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function randomToken(size) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function base64UrlEncode(bytes) {
  let binary = "";
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function btoaUrl(text) {
  return base64UrlEncode(new TextEncoder().encode(text));
}

function atobUrl(text) {
  const bytes = base64UrlToBytes(text);
  return new TextDecoder().decode(bytes);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function timingSafeEqualBytes(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    256
  );
  const hash = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt);
  combined.set(hash, salt.length);
  return base64UrlEncode(combined);
}

async function verifyPassword(password, storedHash) {
  try {
    const combined = base64UrlToBytes(storedHash);
    const salt = combined.slice(0, 16);
    const existingHash = combined.slice(16);

    const passwordKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      passwordKey,
      256
    );
    const computedHash = new Uint8Array(derivedBits);

    return timingSafeEqualBytes(computedHash, existingHash);
  } catch (err) {
    return false;
  }
}

async function signLecturerToken(payload, env) {
  const header = { alg: "HS256", typ: "JWT" };
  const headerPart = btoaUrl(JSON.stringify(header));
  const payloadPart = btoaUrl(JSON.stringify(payload));
  const data = `${headerPart}.${payloadPart}`;
  const signature = await hmacSign(data, env.QR_HMAC_SECRET);
  return `${data}.${signature}`;
}

async function verifyLecturerToken(token, env) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const data = `${parts[0]}.${parts[1]}`;
  const signature = parts[2];
  const expected = await hmacSign(data, env.QR_HMAC_SECRET);
  if (!timingSafeEqual(signature, expected)) return null;
  const payload = JSON.parse(atobUrl(parts[1]));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return null;
  return payload;
}
