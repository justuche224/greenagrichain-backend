### **1\. Create a Deposit**

**Endpoint:** `/api/deposit`**Method:** POST **Request Body:**

- `userId` (number): The ID of the user making the deposit.
- `walletAddress` (string): The wallet address from which the deposit was made.
- `amount` (number): The deposit amount.
- `currency` (string): The currency of the deposit (e.g., USD, EUR).**Response:**
- **201 Created:**
  - **Body:** `{ message: "Deposit created successfully. Balance will be updated when the admin verifies it.", deposit: <newDepositObject> }`
- **400 Bad Request:**
  - **Body:** `{ message: "All fields are required." }` (if any required field is missing)
  - **Body:** `{ message: "Amount must be greater than 0." }` (if `amount` is not positive)
  - **Body:** `{ message: "Invalid user" }` (if user with `userId` is not found)
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

### **2\. Get Deposits (with optional filtering)**

**Endpoint:** `/api/deposits`**Method:** GET **Query Parameters (optional):**

- `status` (string): Filter deposits by status (e.g., "pending", "reviewing", "verified").
- `userId` (number): Filter deposits by user ID.**Response:**
- **200 OK:**
  - **Body:** `{ deposits: [<depositObject1>, <depositObject2>, ...] }` (array of deposit objects)
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

### **3\. Update Deposit Status (Admin Only)**

**Endpoint:** `/api/deposit/:id/status`**Method:** PUT **Path Parameters:**

- `id` (number): The ID of the deposit to update.**Request Body:**
- `status` (string): The new status for the deposit ("pending", "reviewing", or "verified").
- `adminId` (number): The ID of the admin performing the update.**Response:**
- **200 OK:**
  - **Body:** `{ message: "Deposit status updated successfully", deposit: <updatedDepositObject> }`
- **400 Bad Request:**
  - **Body:** `{ message: "All fields are required." }` (if any required field is missing)
  - **Body:** `{ message: "Invalid status provided" }` (if `status` is not a valid option)
- **403 Forbidden:**
  - **Body:** `{ message: "Unauthorized" }` (if the user performing the update is not an admin)
- **404 Not Found:**
  - **Body:** `{ message: "Deposit not found" }` (if the deposit with the given `id` is not found)
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

**Notes:**

- Only admins can update the status of a deposit.
- When the deposit status is set to "verified", the user's account balance is automatically updated with the deposit amount.
