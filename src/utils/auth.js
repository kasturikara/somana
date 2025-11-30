/**
 * Decode JWT token tanpa verifikasi signature
 * (untuk cek payload dan expiry)
 */
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Cek apakah token masih valid (belum expired)
 */
export const isTokenValid = (token) => {
  if (!token) return false;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return false;

  // exp dalam JWT adalah timestamp dalam detik
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp > currentTime;
};

/**
 * Cek apakah user sudah login dan token valid
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return isTokenValid(token);
};

/**
 * Logout - hapus token dan user data
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Get user data dari localStorage
 */
export const getUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};
