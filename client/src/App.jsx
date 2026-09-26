import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [capsules, setCapsules] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    project_name: "",
    prompt_title: "",
    prompt_version: "",
    prompt_text: "",
    response_summary: "",
    category: "",
    usefulness: "",
    reviewed: false,
    improved: false,
    screenshot_url: "",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  // Load capsules
  const loadCapsules = async () => {
    try {
      const response = await fetch("/api/capsules");

      if (response.status === 401) {
        setCapsules([]);
        return;
      }

      const data = await response.json();
      setCapsules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading capsules:", error);
      setCapsules([]);
    }
  };

  useEffect(() => {
    loadCapsules();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Create capsule
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/capsules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.status === 401) {
        alert("Please log in with GitHub first.");
        return;
      }

      if (!response.ok) {
        alert("Failed to create capsule.");
        return;
      }

      setForm(emptyForm);
      await loadCapsules();
    } catch (error) {
      console.error("Error creating capsule:", error);
    }
  };

  // Start editing
  const handleEdit = (capsule) => {
    setEditingId(capsule.id);

    setForm({
      project_name: capsule.project_name || "",
      prompt_title: capsule.prompt_title || "",
      prompt_version: capsule.prompt_version || "",
      prompt_text: capsule.prompt_text || "",
      response_summary: capsule.response_summary || "",
      category: capsule.category || "",
      usefulness: capsule.usefulness || "",
      reviewed: Boolean(capsule.reviewed),
      improved: Boolean(capsule.improved),
      screenshot_url: capsule.screenshot_url || "",
      notes: capsule.notes || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Update capsule
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/capsules/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.status === 401) {
        alert("Please log in with GitHub first.");
        return;
      }

      if (!response.ok) {
        alert("Failed to update capsule.");
        return;
      }

      setEditingId(null);
      setForm(emptyForm);
      await loadCapsules();
    } catch (error) {
      console.error("Error updating capsule:", error);
    }
  };

  // Delete capsule
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this capsule?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/capsules/${id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        alert("Please log in with GitHub first.");
        return;
      }

      if (!response.ok) {
        alert("Failed to delete capsule.");
        return;
      }

      await loadCapsules();
    } catch (error) {
      console.error("Error deleting capsule:", error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="app">
      <h1>AI Capsule</h1>
      <p>Cloud-Deployed AI Prompt Manager</p>

      <div>
        <a href="/login">
          <button type="button">Login with GitHub</button>
        </a>
      </div>

      <hr />

      <h2>{editingId ? "Edit Prompt" : "Add Prompt"}</h2>

      <form onSubmit={editingId ? handleUpdate : handleSubmit}>
        <div>
          <label>Project Name</label>
          <br />
          <input
            type="text"
            name="project_name"
            value={form.project_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Prompt Title</label>
          <br />
          <input
            type="text"
            name="prompt_title"
            value={form.prompt_title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Prompt Version</label>
          <br />
          <input
            type="text"
            name="prompt_version"
            value={form.prompt_version}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Prompt Text</label>
          <br />
          <textarea
            name="prompt_text"
            value={form.prompt_text}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Response Summary</label>
          <br />
          <textarea
            name="response_summary"
            value={form.response_summary}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Category</label>
          <br />
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Usefulness</label>
          <br />
          <input
            type="text"
            name="usefulness"
            value={form.usefulness}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              name="reviewed"
              checked={form.reviewed}
              onChange={handleChange}
            />
            Reviewed
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              name="improved"
              checked={form.improved}
              onChange={handleChange}
            />
            Improved
          </label>
        </div>

        <div>
          <label>Screenshot URL</label>
          <br />
          <input
            type="text"
            name="screenshot_url"
            value={form.screenshot_url}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Notes</label>
          <br />
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <br />

        <button type="submit">
          {editingId ? "Update Prompt" : "Save Prompt"}
        </button>

        {editingId && (
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      <hr />

      <h2>Saved Prompts</h2>

      {capsules.length === 0 ? (
        <p>No prompts saved yet.</p>
      ) : (
        capsules.map((capsule) => (
          <div key={capsule.id}>
            <h3>{capsule.prompt_title}</h3>

            <p>
              <strong>Project:</strong> {capsule.project_name}
            </p>

            <p>
              <strong>Version:</strong> {capsule.prompt_version}
            </p>

            <p>
              <strong>Prompt:</strong> {capsule.prompt_text}
            </p>

            <p>
              <strong>Response Summary:</strong>{" "}
              {capsule.response_summary}
            </p>

            <p>
              <strong>Category:</strong> {capsule.category}
            </p>

            <p>
              <strong>Usefulness:</strong> {capsule.usefulness}
            </p>

            <p>
              <strong>Reviewed:</strong>{" "}
              {capsule.reviewed ? "Yes" : "No"}
            </p>

            <p>
              <strong>Improved:</strong>{" "}
              {capsule.improved ? "Yes" : "No"}
            </p>

            <p>
              <strong>Screenshot:</strong>{" "}
              {capsule.screenshot_url || "None"}
            </p>

            <p>
              <strong>Notes:</strong> {capsule.notes}
            </p>

            <button
              type="button"
              onClick={() => handleEdit(capsule)}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => handleDelete(capsule.id)}
            >
              Delete
            </button>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default App;