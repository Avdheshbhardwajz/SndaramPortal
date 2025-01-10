interface DecodedToken {
  user_id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const decodeToken = (): DecodedToken | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // Split the token and get the payload part
    const payloadBase64 = token.split('.')[1];
    // Decode the base64 payload
    const payload = atob(payloadBase64);
    // Parse the JSON
    return JSON.parse(payload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserIdFromToken = (): string | null => {
  const decoded = decodeToken();
  return decoded?.user_id || null;
};
