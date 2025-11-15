// ---------- Config ----------
const BASE_URL =
  "https://app-a01id9h3o-mtts-projects-2bc0f0d7.vercel.app";

// Utility: แสดง raw response ด้านล่าง
function showRawResponse(status, data) {
  const box = document.getElementById("rawResponse");
  box.textContent = JSON.stringify({ status, data }, null, 2);
}

// Utility: แสดงข้อความใน result-box
function setResult(elementId, status, text) {
  const el = document.getElementById(elementId);
  el.classList.remove("result-success", "result-error");
  if (status === "success") el.classList.add("result-success");
  if (status === "error") el.classList.add("result-error");
  el.textContent = text;
}

// ---------- Health Check ----------
async function checkHealth() {
  const url = `${BASE_URL}/health`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    showRawResponse(res.status, data);
    setResult(
      "healthResult",
      res.ok ? "success" : "error",
      `Status: ${res.status}\n${JSON.stringify(data, null, 2)}`
    );
  } catch (err) {
    showRawResponse("NETWORK_ERROR", { error: err.message });
    setResult(
      "healthResult",
      "error",
      `Network error: ${err.message}`
    );
  }
}

// ---------- GET /api/users ----------
async function fetchUsers() {
  const url = `${BASE_URL}/api/users`;
  const usersList = document.getElementById("usersList");
  usersList.classList.remove("empty-state");

  try {
    const res = await fetch(url);
    const data = await res.json();
    showRawResponse(res.status, data);

    if (!res.ok) {
      usersList.innerHTML = `<div>❌ Error: ${res.status} ${JSON.stringify(
        data
      )}</div>`;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      usersList.classList.add("empty-state");
      usersList.textContent =
        "ยังไม่มีผู้ใช้ในระบบ ลองสร้างด้วย POST ด้านบนก่อนนะคะ 💗";
      return;
    }

    // สร้างตาราง
    const table = document.createElement("table");
    table.className = "users-list-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (u) => `
          <tr>
            <td>${u.id ?? ""}</td>
            <td>${u.name ?? ""}</td>
            <td>${u.email ?? ""}</td>
            <td>${u.role ?? ""}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    `;
    usersList.innerHTML = "";
    usersList.appendChild(table);
  } catch (err) {
    showRawResponse("NETWORK_ERROR", { error: err.message });
    usersList.innerHTML = `<div>❌ Network error: ${err.message}</div>`;
  }
}

// ---------- POST /api/users ----------
async function handleCreateUser(event) {
  event.preventDefault();
  const form = event.target;

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    role: form.role.value.trim()
  };
  const customId = form.id.value.trim();
  if (customId) {
    payload.id = customId;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    showRawResponse(res.status, data);

    if (res.ok) {
      setResult(
        "createResult",
        "success",
        `✅ Created (status ${res.status})\n${JSON.stringify(
          data,
          null,
          2
        )}`
      );
      form.reset();
      // refresh list
      fetchUsers();
    } else {
      setResult(
        "createResult",
        "error",
        `❌ Error (status ${res.status})\n${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    }
  } catch (err) {
    showRawResponse("NETWORK_ERROR", { error: err.message });
    setResult(
      "createResult",
      "error",
      `Network error: ${err.message}`
    );
  }
}

// ---------- GET /api/users/:id ----------
async function handleGetOne(event) {
  event.preventDefault();
  const form = event.target;
  const id = form.id.value.trim();
  if (!id) return;

  try {
    const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(id)}`);
    const data = await res.json();
    showRawResponse(res.status, data);

    if (res.ok) {
      setResult(
        "getOneResult",
        "success",
        `✅ Found (status ${res.status})\n${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    } else {
      setResult(
        "getOneResult",
        "error",
        `❌ Error (status ${res.status})\n${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    }
  } catch (err) {
    showRawResponse("NETWORK_ERROR", { error: err.message });
    setResult(
      "getOneResult",
      "error",
      `Network error: ${err.message}`
    );
  }
}

// ---------- PUT /api/users/:id ----------
async function handleUpdateUser(event) {
  event.preventDefault();
  const form = event.target;
  const id = form.id.value.trim();
  if (!id) return;

  const payload = {};
  if (form.name.value.trim()) payload.name = form.name.value.trim();
  if (form.email.value.trim()) payload.email = form.email.value.trim();
  if (form.role.value.trim()) payload.role = form.role.value.trim();

  if (Object.keys(payload).length === 0) {
    setResult(
      "updateResult",
      "error",
      "โปรดกรอกอย่างน้อย 1 ฟิลด์ที่จะอัปเดตค่ะ"
    );
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    showRawResponse(res.status, data);

    if (res.ok) {
      setResult(
        "updateResult",
        "success",
        `✅ Updated (status ${res.status})\n${JSON.stringify(
          data,
          null,
          2
        )}`
      );
      // refresh list
      fetchUsers();
    } else {
      setResult(
        "updateResult",
        "error",
        `❌ Error (status ${res.status})\n${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    }
  } catch (err) {
    showRawResponse("NETWORK_ERROR", { error: err.message });
    setResult(
      "updateResult",
      "error",
      `Network error: ${err.message}`
    );
  }
}

// ---------- DELETE /api/users/:id ----------
async function handleDeleteUser(event) {
  event.preventDefault();
  const form = event.target;
  const id = form.id.value.trim();
  if (!id) return;

  if (!confirm(`ยืนยันการลบ user: ${id} ?`)) return;

  try {
    const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    const data = await res.json().catch(() => ({}));
    showRawResponse(res.status, data);

    if (res.ok) {
      setResult(
        "deleteResult",
        "success",
        `✅ Deleted (status ${res.status})\n${JSON.stringify(
          data,
          null,
          2
        )}`
      );
      form.reset();
      // refresh list
      fetchUsers();
    } else {
      setResult(
        "deleteResult",
        "error",
        `❌ Error (status ${res.status})\n${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    }
  } catch (err) {
    showRawResponse("NETWORK_ERROR", { error: err.message });
    setResult(
      "deleteResult",
      "error",
      `Network error: ${err.message}`
    );
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  // show base URL
  const baseUrlText = document.getElementById("baseUrlText");
  if (baseUrlText) baseUrlText.textContent = BASE_URL;

  // bind buttons
  document
    .getElementById("btnHealth")
    .addEventListener("click", checkHealth);
  document
    .getElementById("btnRefresh")
    .addEventListener("click", fetchUsers);

  // bind forms
  document
    .getElementById("formCreate")
    .addEventListener("submit", handleCreateUser);
  document
    .getElementById("formGetOne")
    .addEventListener("submit", handleGetOne);
  document
    .getElementById("formUpdate")
    .addEventListener("submit", handleUpdateUser);
  document
    .getElementById("formDelete")
    .addEventListener("submit", handleDeleteUser);

  // load users list once
  fetchUsers();
  // optional: auto health check on load
  checkHealth();
});
