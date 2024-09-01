### **1\. Get Wallets**

**Endpoint:** `/api/wallets`**Method:** GET **Query Parameters (optional):**

- `currency` (string): Filter wallets by currency (e.g., "USD", "EUR").**Response:**
- **200 OK:**
  - **Body:** An array of wallet objects if `currency` is provided, or an array of all wallets otherwise.
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

### **2\. Get Wallet Address by Currency**

**Endpoint:** `/api/wallets/:currency`**Method:** GET **Path Parameters:**

- `currency` (string): The currency of the wallet to retrieve.**Response:**
- **200 OK:**
  - **Body:** The wallet object for the specified currency.
- **404 Not Found:**
  - **Body:** `{ message: "Wallet for ${currency} not found" }` (if the wallet for the given currency does not exist)
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

### **3\. Update Wallet Address**

**Endpoint:** `/api/wallets/:currency`**Method:** PUT **Path Parameters:**

- `currency` (string): The currency of the wallet to update.**Request Body:**
- `address` (string): The new address for the wallet.**Response:**
- **200 OK:**
  - **Body:** `{ message: "Wallet address updated successfully", wallet: <updatedWalletObject> }`
- **400 Bad Request:**
  - **Body:** `{ message: "Address is required." }` (if `address` is missing in the request body)
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`

### **4\. Add a New Wallet**

**Endpoint:** `/api/wallets`**Method:** POST **Request Body:**

- `currency` (string): The currency of the new wallet.
- `address` (string): The address for the new wallet.**Response:**
- **201 Created:**
  - **Body:** `{ message: "New wallet added successfully", wallet: <newWalletObject> }`
- **400 Bad Request:**
  - **Body:** `{ message: "Currency and address are required." }` (if `currency` or `address` is missing in the request body)
- **500 Internal Server Error:**
  - **Body:** `{ message: "Internal server error" }`
