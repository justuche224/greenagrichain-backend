### **1\. Get All Users**

**Endpoint:** `/api/users`**Method:** GET **Response:**

- **200 OK:**
  - **Body:** An array of user objects, each containing:
    - `id` (number): The unique ID of the user.
    - `email` (string): The user's email address.
    - `firstname` (string): The user's first name.
    - `lastname` (string): The user's last name.
    - `role` (string): The user's role (e.g., "ADMIN", "USER").
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

### **2\. Get a User by ID**

**Endpoint:** `/api/users/:id`**Method:** GET **Path Parameters:**

- `id` (number): The ID of the user to retrieve.**Response:**
- **200 OK:**
  - **Body:** A user object containing detailed information, including:
    - `id` (number): The unique ID of the user.
    - `email` (string): The user's email address.
    - `firstname` (string): The user's first name.
    - `lastname` (string): The user's last name.
    - `number` (string): The user's phone number.
    - `role` (string): The user's role (e.g., "ADMIN", "USER").
    - `emailVerified` (boolean): Indicates if the user's email is verified.
    - `kycVerified` (boolean): Indicates if the user's KYC is verified.
    - `image` (string): The URL or path to the user's profile image.
    - `address` (string): The user's address.
    - `nationality` (string): The user's nationality.
    - `gender` (string): The user's gender.
- **400 Bad Request:**
  - **Body:** `{ message: "Id is required" }` (if `id` is missing in the request)
- **404 Not Found:**
  - **Body:** `{ message: "User not found" }` (if the user with the given `id` does not exist)
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`
