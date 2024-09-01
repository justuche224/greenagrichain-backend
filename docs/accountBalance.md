### **1\. Get All Users' Account Balances**

**Endpoint:** `/api/account-balances`**Method:** GET **Response:**

- **200 OK:**
  - **Body:** An array of account balance objects, each containing:
    - `id` (number): The unique ID of the account balance.
    - `balance` (number): The current balance.
    - `userId` (number): The ID of the user associated with the account balance.
    - `user`: A nested object containing user details:
      - `firstname` (string): The user's first name.
      - `lastname` (string): The user's last name.
      - `email` (string): The user's email address.
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

### **2\. Get a User's Account Balance by User ID**

**Endpoint:** `/api/account-balance/:userId`**Method:** GET **Path Parameters:**

- `userId` (number): The ID of the user whose account balance should be retrieved.**Response:**
- **200 OK:**
  - **Body:** An account balance object, similar to the response for `/api/account-balances`.
- **404 Not Found:**
  - **Body:** `{ message: "Account balance not found" }`
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

### **3\. Update a User's Account Balance**

**Endpoint:** `/api/account-balance/:userId`**Method:** PUT **Path Parameters:**

- `userId` (number): The ID of the user whose account balance should be updated.**Request Body:**
- `balance` (number): The new balance for the account.
- `adminId` (number): The ID of the admin user performing the update.**Response:**
- **200 OK:**
  - **Body:** `{ message: "Account balance updated successfully", accountBalance: <updatedAccountBalanceObject> }`
- **400 Bad Request:**
  - **Body:** `{ message: "Valid balance is required." }` (if `balance` is invalid)
  - **Body:** `{ message: "Admin ID is required." }` (if `adminId` is missing)
- **403 Forbidden:**
  - **Body:** `{ message: "Unauthorized" }` (if the admin user is not authorized to update balances)
- **404 Not Found:**
  - **Body:** `{ message: "Account balance not found" }`
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

### **4\. Increment a User's Account Balance**

**Endpoint:** `/api/account-balance/:userId/increment`**Method:** PUT **Path Parameters:**

- `userId` (number): The ID of the user whose account balance should be incremented.**Request Body:**
- `amount` (number): The amount to increment the balance by.
- `adminId` (number): The ID of the admin user performing the increment.**Response:**
- **200 OK:**
  - **Body:** `{ message: "Account balance incremented successfully", accountBalance: <updatedAccountBalanceObject> }`
- **400 Bad Request:**
  - **Body:** `{ message: "Valid increment amount is required." }` (if `amount` is invalid)
  - **Body:** `{ message: "Admin ID is required." }` (if `adminId` is missing)
- **403 Forbidden:**
  - **Body:** `{ message: "Unauthorized" }` (if the admin user is not authorized to increment balances)
- **404 Not Found:**
  - **Body:** `{ message: "Account balance not found" }`
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`
