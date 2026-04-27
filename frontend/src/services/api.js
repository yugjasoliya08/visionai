// Helper to get the base URL dynamically based on where the app is running
const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:8000"
  : "https://visionai-backend-4.onrender.com";

export async function getDocument(docId) {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${docId}`);
    if (!response.ok) throw new Error("Document not found");
    return await response.json();
  } catch (error) {
    console.error("Error fetching document:", error);
    return null;
  }
}

export async function restoreVersion(docId, index) {
  try {
    const response = await fetch(`${API_BASE_URL}/versions/restore/${docId}/${index}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error("Error restoring version:", error);
    return null;
  }
}

export async function compareVersions(docId, v1, v2) {
  try {
    const response = await fetch(`${API_BASE_URL}/versions/compare/${docId}/${v1}/${v2}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error("Error comparing versions:", error);
    return null;
  }
}

export async function getVersions(docId) {
  try {
    const response = await fetch(`${API_BASE_URL}/versions/${docId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching versions:", error);
    return { versions: [] };
  }
}