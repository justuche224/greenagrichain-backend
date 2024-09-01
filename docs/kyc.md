### **1\. Submit KYC Information**

**Endpoint:** `/api/kyc`**Method:** POST **Request Body:**

- `userId` (number): The ID of the user submitting the KYC information.
- `image` (string): The URL or path to the KYC image (e.g., passport, ID card).
- `address` (string): The user's residential address.
- `nationality` (string): The user's nationality.
- `identification` (string): The identification document number (e.g., passport number, ID number).
- `gender` (string): The user's gender.**Response:**
- **201 Created:**
  - **Body:** `{ message: "KYC submitted successfully", kyc: <kycObject>, user: <userObject> }` (includes created KYC record and updated user information)
- **400 Bad Request:**
  - **Body:** `{ message: "All fields are required." }` (if any required field is missing)
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

### **2\. Get KYC Records (with optional filtering)**

**Endpoint:** `/api/kyc`**Method:** GET **Query Parameters (optional):**

- `status` (string): Filter KYC records by status ("pending", "approved", "declined").
- `nationality` (string): Filter records by user's nationality.
- `gender` (string): Filter records by user's gender.
- `userId` (number): Filter records by specific user ID.**Response:**
- **200 OK:**
  - **Body:** `{ message: "KYC records fetched successfully", data: [<kycObject1>, <kycObject2>, ...] }` (array of KYC records with user details)
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

### **3\. Update KYC Status (Admin Only)**

**Endpoint:** `/api/kyc/:id/status`**Method:** PUT **Path Parameters:**

- `id` (number): The ID of the KYC record to update.**Request Body:**
- `status` (string): The new status for the KYC record ("pending", "approved", or "declined").**Response:**
- **200 OK:**
  - **Body:** `{ message: "KYC status updated successfully", kyc: <updatedKycObject> }`
- **400 Bad Request:**
  - **Body:** `{ message: "Invalid status provided" }` (if `status` is not a valid option)
- **404 Not Found:**
  - **Body:** `{ message: "KYC record not found" }` (if the KYC record with the given `id` is not found)
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

**Notes:**

- Only admins can update the status of a KYC record.
- When the KYC status is set to "approved", the user's KYC verification date is updated.
