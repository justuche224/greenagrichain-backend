**1\. Initiate Password Reset (POST /api/auth/forgot-password)**

- **Request Body:**
  - `email` (string): The user's email address for password reset.
- **Response:**
  - **200 OK:**
    - The request is successful, and a password reset link is sent to the user's email. The response body contains a message: `"Check your email for a reset link!"`
  - **400 Bad Request:**
    - Two types of errors can occur:
      - **Validation Error:** If the `email` field fails validation defined in `ResetSchema`. The response includes:
        - `message`: "Validation failed"
        - `errors`: An array containing details of each validation error
          - `field`: The name of the field with the error.
          - `message`: The specific error message for that field.
      - **User Not Found:** If the provided email doesn't match an existing user. The response body contains:
        - `message`: "User does not exist!"
  - **500 Internal Server Error:**
    - An unexpected error occurred during processing. The response body contains:
      - `message`: "An unexpected error occurred"

**2\. Reset Password with Reset Token (POST /api/auth/forgot-password)**

- **Request Body:**
  - `token` (string): The password reset token received via email.
  - `password` (string): The new password for the user.
- **Response:**
  - **200 OK:**
    - The password reset is successful. The response body contains:
      - `message`: "Password reset successful"
  - **400 Bad Request:**
    - Several errors can occur:
      - **Missing Token:** If the `token` field is missing. The response body contains:
        - `message`: "Missing"
      - **Validation Error:** If the `password` field fails validation defined in `ResetSchema`. The response includes:
        - `message`: "Validation failed"
        - `errors`: An array containing details of each validation error (same format as in case 1).
      - **Invalid Token:** If the provided `token` doesn't match a valid password reset token in the database. The response body contains:
        - `message`: "Invalid token"
      - **Expired Token:** If the provided `token` has expired. The response body contains:
        - `message`: "Token has expired"
  - **500 Internal Server Error:**
    - An unexpected error occurred during processing. The response body contains:
      - `message`: "An unexpected error occurred"

This code effectively handles various scenarios for password reset functionality, providing clear error messages to the user based on the encountered issue.
