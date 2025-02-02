export const API_URL = "http://localhost:8080";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    VERIFY_OTP: "/auth/verify-otp",
    LOGOUT: "/auth/logout",
  },
  NOTIFICATIONS: {
    MAKER: "/maker-notification",
    CHECKER: "/checker-notification",
    ADMIN: "/admin-notification",
  },
  TABLE: {
    FETCH_COLUMN_STATUS: "/fetchColumnStatus",
    REQUEST_DATA: "/requestdata",
    FETCH_DROPDOWN_OPTIONS: "/fetchDropdownOptions",
    FETCH_COLUMN_DROPDOWN: "/fetchColumnDropDown",
  },
};
