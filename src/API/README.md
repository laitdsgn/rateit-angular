# API Testing Guide with Insomnia

## Base URL

`http://localhost/API/api.php`

## Note About Implementation

This API uses mysqli for database operations. It is designed for simplicity rather than security.

## Request Formats

You can use either of these formats:

### Option 1: Form URL Encoded

- Content-Type: application/x-www-form-urlencoded
- Body: Form URL Encoded

### Option 2: JSON (Recommended)

- Content-Type: application/json
- Body: Raw JSON

## Endpoints

### Users

1. Create User

   - Method: POST
   - URL: `http://localhost/API/api.php?action=createUser`
   - JSON Body Example:

   ```json
   {
     "username": "testuser",
     "pass": "yourpassword"
   }
   ```

   - Body: x-www-form-urlencoded

   ```
   username: testuser
   pass: yourpassword
   ```

2. Get Users
   - Method: GET
   - URL: `http://localhost/API/api.php?action=getUsers`

### Products

1. Create Product

   - Method: POST
   - URL: `http://localhost/API/api.php?action=createProduct`
   - Body: x-www-form-urlencoded

   ```
   name: Test Product
   category: Electronics
   description: This is a test product
   ```

2. Get Products
   - Method: GET
   - URL: `http://localhost/API/api.php?action=getProducts`

### Reviews

1. Create Review

   - Method: POST
   - URL: `http://localhost/API/api.php?action=createReview`
   - Body: x-www-form-urlencoded

   ```
   user_id: 1
   product_id: 1
   rating: 5
   ```

2. Get Reviews
   - Method: GET
   - URL: `http://localhost/API/api.php?action=getReviews`

## Testing Steps in Insomnia

1. Install and open Insomnia
2. Create a new Collection (e.g., "API Testing")
3. Create new requests for each endpoint
4. For POST requests:
   - Select POST method
   - Set Content-Type to "application/json"
   - Add raw JSON in the "JSON" tab
   - Or use Form URL Encoded in the "Form" tab
5. For GET requests:
   - Simply enter the URL with the appropriate action parameter
6. Send the request and check the JSON response

## Testing Flow

1. Create a user
2. Create a product
3. Create a review using the user_id and product_id
4. Fetch all reviews to see the combined data
