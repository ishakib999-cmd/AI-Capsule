import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [capsules, setCapsules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    project_name: "",
    prompt_title: "",
    prompt_version: "v1",
    prompt_text: "",
    response_summary: "",
    category: "Coding",
    usefulness: "Good",
    reviewed: false,
    improved: false,
    screenshot_url: "",
    notes: "",
  });

  const loadCapsules = () => {
    fetch("/api/capsules")
      .then((res) => res.json())
      .then((data) => setCapsules(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadCapsules();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

const handleEdit = (capsule) => {
  setEditingId(capsule.id);

  setForm({
    project_name: capsule.project_name || "",
    prompt_title: capsule.prompt_title || "",
    prompt_version: capsule.prompt_version || "",
    prompt_text: capsule.prompt_text || "",
    response_summary: capsule.response_summary || "",
    category: capsule.category || "Coding",
    usefulness: capsule.usefulness || "Good",
    reviewed: Boolean(capsule.reviewed),
    improved: Boolean(capsule.improved),
    screenshot_url: capsule.screenshot_url || "",
    notes: capsule.notes || "",
  });
};

const handleUpdate = async () => {
  await fetch(`/api/capsules/${editingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  setEditingId(null);

  setForm({
    project_name: "",
    prompt_title: "",
    prompt_version: "v1",
    prompt_text: "",
    response_summary: "",
    category: "Coding",
    usefulness: "Good",
    reviewed: false,
    improved: false,
    screenshot_url: "",
    notes: "",
  });

  loadCapsules();
};

  const handleDelete = async (id) => {
  await fetch(`/api/capsules/${id}`, {
    method: "DELETE",
  });

  loadCapsules();
};
  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("/api/capsules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        user_id: "test-user",
      }),
    });

    setForm({
      project_name: "",
      prompt_title: "",
      prompt_version: "v1",
      prompt_text: "",
      response_summary: "",
      category: "Coding",
      usefulness: "Good",
      reviewed: false,
      improved: false,
      screenshot_url: "",
      notes: "",
    });

    loadCapsules();
  };

  return (
    <div className="app">
      <h1>AI Capsule</h1>
      <p>Save, review and improve your AI prompts.</p>

      <h2>Add Prompt</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="project_name"
          placeholder="Project name"
          value={form.project_name}
          onChange={handleChange}
          required
        />

        <input
          name="prompt_title"
          placeholder="Prompt title"
          value={form.prompt_title}
          onChange={handleChange}
          required
        />

        <input
          name="prompt_version"
          placeholder="Version"
          value={form.prompt_version}
          onChange={handleChange}
        />

        <textarea
          name="prompt_text"
          placeholder="Prompt text"
          value={form.prompt_text}
          onChange={handleChange}
          required
        />

        <textarea
          name="response_summary"
          placeholder="Response summary"
          value={form.response_summary}
          onChange={handleChange}
        />

        <select name="category" value={form.category} onChange={handleChange}>
          <option>Coding</option>
          <option>Writing</option>
          <option>Research</option>
        </select>

        <select
          name="usefulness"
          value={form.usefulness}
          onChange={handleChange}
        >
          <option>Good</option>
          <option>Needs Improvement</option>
        </select>

        <label>
          <input
            type="checkbox"
            name="reviewed"
            checked={form.reviewed}
            onChange={handleChange}
          />
          Reviewed
        </label>

        <label>
          <input
            type="checkbox"
            name="improved"
            checked={form.improved}
            onChange={handleChange}
          />
          Improved
        </label>

        <input
          name="screenshot_url"
          placeholder="Screenshot URL (optional)"
          value={form.screenshot_url}
          onChange={handleChange}
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
        />

        {editingId ? (
  <button type="button" onClick={handleUpdate}>
    Update Prompt
  </button>
) : (
  <button type="submit">
    Save Prompt
  </button>
)}
      </form>

      <h2>My Prompt Capsules</h2>

      {capsules.length === 0 ? (
        <p>No prompts saved yet.</p>
      ) : (
        capsules.map((capsule) => (
          <div key={capsule.id}>
            <h3>{capsule.prompt_title}</h3>
            <p><strong>Project:</strong> {capsule.project_name}</p>
            <p><strong>Version:</strong> {capsule.prompt_version}</p>
            <p>{capsule.prompt_text}</p>
            <button onClick={() => handleEdit(capsule)}>
  Edit
</button>
            <button onClick={() => handleDelete(capsule.id)}>
  Delete
</button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;