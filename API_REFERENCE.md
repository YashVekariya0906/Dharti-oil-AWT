# API Endpoints Reference - Dharti Oil AWT

## Base URL
```
http://localhost:5000
```

## Authentication Endpoints

### User Registration & Login
```
POST /api/register
Body: { username, emali, moblie_no, address, pincode, password }
Response: { user_id, username, role: 'user' }

POST /api/login
Body: { username/email, password }
Response: { user_id, username, role: 'user' }

POST /api/broker/login
Body: { email, password }
Response: { user_id: broker_id, username: broker_name, role: 'broker' }
```

## Broker Management Endpoints

### Create Broker (Admin)
```
POST /api/admin/brokers
Body: {
  name,
  email,
  password,
  mobile_no,
  address,
  pincode,
  commission_percent,
  status: 'Active'
}
Response: { broker_id, email, otp_code, message }
```

### Verify Broker OTP
```
POST /api/admin/brokers/verify-otp
Body: { email, otp_code }
Response: { message: 'OTP verified successfully' }
```

### Filter Brokers by Pincode
```
GET /api/brokers/by-pincode/:pincode
Response: [
  {
    broker_id,
    name,
    email,
    mobile_no,
    address,
    pincode,
    commission_percent,
    status
  }
]
```

### Get Broker's Selling Requests
```
GET /api/brokers/:broker_id/selling-requests
Response: [
  {
    request_id,
    user_id,
    broker_id,
    stock_per_mound,
    our_price,
    customer_price,
    status,
    visit_date,
    visit_time,
    user: { username, emali, moblie_no, address, pincode }
  }
]
```

### Schedule Broker Visit
```
PUT /api/brokers/selling-requests/:request_id/schedule
Body: {
  broker_id,
  visit_date: 'YYYY-MM-DD',
  visit_time: 'HH:mm'
}
Response: {
  request_id,
  status: 'Scheduled',
  visit_date,
  visit_time,
  message
}
```

## User Profile Endpoints

### Get User Profile
```
GET /api/users/:user_id/profile
Response: {
  user_id,
  username,
  emali,
  moblie_no,
  address,
  pincode,
  role
}
```

### Update User Profile
```
PUT /api/users/profile
Body: {
  user_id,
  username,
  moblie_no,
  address,
  pincode,
  emali  # Include new email if changing
}
Response: {
  message,
  otp_sent?: true  # If email changed
}
```

### Send OTP for Email Verification
```
POST /api/users/send-otp
Body: {
  user_id,
  new_email
}
Response: {
  message: 'OTP sent to email',
  otp_sent: true
}
```

### Verify OTP & Update Email
```
POST /api/users/verify-otp
Body: {
  user_id,
  new_email,
  otp_code
}
Response: {
  message: 'Email updated successfully',
  user: { ...updated_user_data }
}
```

## Selling Request Endpoints

### Create Selling Request (User)
```
POST /api/users/selling-requests
Body: {
  user_id,
  stock_per_mound,
  our_price,
  customer_price,
  seller_id: user_id  # Alternative field name
}
Response: {
  request_id,
  user_id,
  status: 'Pending',
  message: 'Request submitted successfully'
}
```

### Get All Selling Requests (Admin)
```
GET /api/admin/selling-requests
Response: [
  {
    request_id,
    user_id,
    broker_id,
    stock_per_mound,
    our_price,
    customer_price,
    status,
    created_at,
    updated_at
  }
]
```

### Get Selling Requests with Full Details (Admin)
```
GET /api/admin/selling-requests-full
Response: [
  {
    request_id,
    status,
    stock_per_mound,
    our_price,
    customer_price,
    visit_date,
    visit_time,
    user: {
      user_id,
      username,
      emali,
      moblie_no,
      address,
      pincode
    },
    broker: {
      broker_id,
      name,
      email,
      mobile_no,
      commission_percent
    }
  }
]
```

### Accept Selling Request (Admin - with Broker Assignment)
```
PUT /api/admin/selling-requests/:request_id/accept
Body: {
  broker_id
}
Response: {
  request_id,
  broker_id,
  status: 'Accepted',
  message
}
```

## Global Price Endpoints

### Get Global Price (Current Admin-Set Price)
```
GET /api/admin/global-price
Response: {
  id,
  current_price,
  updated_at
}
```

### Update Global Price (Admin)
```
POST /api/admin/global-price
Body: {
  current_price  # New price value
}
Response: {
  id,
  current_price,
  updated_at,
  message
}
```

## Product & Shop Endpoints

### Get All Products
```
GET /api/products
Response: [
  {
    product_id,
    product_name,
    product_price,
    product_discount,
    product_image
  }
]
```

## Navbar & Config Endpoints

### Get Navbar Configuration
```
GET /api/navbar
Response: {
  nav_logo_path,
  I1_path,
  I2_path,
  I3_path,
  I4_path,
  I5_path,
  intro_path
}
```

### Get Site Configuration
```
GET /api/config
Response: {
  logo_text,
  logo_highlight,
  welcome_message,
  discover_text
}
```

## Blog Endpoints

### Get All Blogs
```
GET /api/blogs
Response: [
  {
    blog_id,
    title,
    content,
    image,
    created_at
  }
]
```

## Contact Endpoints

### Submit Contact Inquiry
```
POST /api/contacts
Body: {
  name,
  email,
  message
}
Response: {
  message: 'Inquiry submitted successfully'
}
```

## Error Response Format

All endpoints return errors in this format:
```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

## Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (auth required)
- **403**: Forbidden (access denied)
- **404**: Not Found
- **500**: Server Error

## Request Headers

All requests should include:
```
Content-Type: application/json
```

For authenticated requests, include:
```
Authorization: Bearer <token>  # If token-based auth is implemented
```

## Authentication Flow

### User Authentication
1. User registers: `POST /api/register`
2. User logs in: `POST /api/login`
3. Returns: `{ user_id, username, role: 'user' }`
4. Frontend stores in localStorage or context
5. All user requests include `user_id` in body

### Broker Authentication
1. Admin creates broker: `POST /api/admin/brokers`
2. Broker receives OTP via email
3. Broker verifies OTP: `POST /api/admin/brokers/verify-otp`
4. Broker logs in: `POST /api/broker/login`
5. Returns: `{ user_id: broker_id, username, role: 'broker' }`
6. Redirects to BrokerDashboard

## Example API Calls (cURL)

### Broker Login
```bash
curl -X POST http://localhost:5000/api/broker/login \
  -H "Content-Type: application/json" \
  -d '{"email":"broker@test.com","password":"password123"}'
```

### Update User Profile
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "username": "John Doe",
    "moblie_no": "9876543210",
    "address": "123 Main St",
    "pincode": "12345",
    "emali": "john@example.com"
  }'
```

### Get Brokers by Pincode
```bash
curl http://localhost:5000/api/brokers/by-pincode/12345
```

### Create Selling Request
```bash
curl -X POST http://localhost:5000/api/users/selling-requests \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "stock_per_mound": 100,
    "our_price": 5000,
    "customer_price": 5500
  }'
```

### Get Selling Requests (Full Details)
```bash
curl http://localhost:5000/api/admin/selling-requests-full
```

### Assign Broker to Request
```bash
curl -X PUT http://localhost:5000/api/admin/selling-requests/5/accept \
  -H "Content-Type: application/json" \
  -d '{"broker_id": 2}'
```

### Schedule Broker Visit
```bash
curl -X PUT http://localhost:5000/api/brokers/selling-requests/5/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "broker_id": 2,
    "visit_date": "2024-02-15",
    "visit_time": "14:30"
  }'
```

## Database Field Mapping

| API Field | Database Field | Type | Notes |
|-----------|----------------|------|-------|
| emali | emali | VARCHAR | Note: Typo in schema (should be email) |
| moblie_no | moblie_no | VARCHAR | Note: Typo in schema (should be mobile_no) |
| our_price | our_price | DECIMAL | Admin sets this globally |
| customer_price | customer_price | DECIMAL | User decides this |
| stock_per_mound | stock_per_mound | INT | Amount of stock |
| visit_date | visit_date | DATE | When broker will visit |
| visit_time | visit_time | TIME | What time broker will arrive |
| pincode | pincode | VARCHAR | Service area identifier for pincode-based filtering |
