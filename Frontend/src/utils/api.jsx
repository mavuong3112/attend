const BASE_URL = "http://127.0.0.1:1748"; // Địa chỉ mới của Flask Backend

export const collectData = async (name) => {
  const response = await fetch(`${BASE_URL}/collect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return response.json();
};

export const trainModel = async () => {
  const response = await fetch(`${BASE_URL}/train`);
  return response.json();
};

export const recognizeFace = async () => {
  const response = await fetch(`${BASE_URL}/recognize`);
  return response.json();
};
