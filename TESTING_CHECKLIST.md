# Testing Checklist - Dharti Oil AWT Multi-Feature System

## Pre-Testing Setup
- [ ] Backend running on port 5000 (`npm start` in server/)
- [ ] Frontend running on port 5173 (`npm run dev` in root)
- [ ] MySQL database connected and verified
- [ ] .env file configured with EMAIL_USER and EMAIL_PASS for Gmail
- [ ] Sample brokers created in database (via Admin Dashboard)

## Navigation & UI Updates
- [ ] Navbar displays correctly on home page
- [ ] When NOT logged in:
  - [ ] "Login" button visible
  - [ ] "Register" button visible
  - [ ] "🔑 Broker Portal" button visible
- [ ] When logged in as USER:
  - [ ] Welcome message shows username
  - [ ] "👤 Profile" button visible (purple gradient)
  - [ ] "Logout" button visible
- [ ] When logged in as ADMIN:
  - [ ] Redirected to AdminDashboard
  - [ ] Cannot see home page until logout
- [ ] When logged in as BROKER:
  - [ ] Redirected to BrokerDashboard
  - [ ] Cannot see home page until logout

## Broker Login Flow (🔑 Broker Portal)
- [ ] Click "🔑 Broker Portal" button opens BrokerLogin page
- [ ] Email field accepts valid email format
- [ ] Password field is masked
- [ ] "Back" button returns to home
- [ ] Submit with invalid credentials shows error
- [ ] Submit with valid broker credentials:
  - [ ] Broker email must exist in brokers table
  - [ ] Password must match (bcrypt verify)
  - [ ] Broker must have otp_code = null (verified)
  - [ ] Broker status must be "Active"
  - [ ] On success: User object returned with role='broker'
  - [ ] Redirected to BrokerDashboard

## BrokerDashboard Features
### Assignments Tab (📋 My Assignments)
- [ ] Tab displays correctly
- [ ] Empty state message if no assignments
- [ ] Fetches: `GET /api/brokers/:broker_id/selling-requests`
- [ ] Each assignment card shows:
  - [ ] User username
  - [ ] User email (emali field)
  - [ ] User mobile (moblie_no field)
  - [ ] User address and pincode
  - [ ] Stock per mound value
  - [ ] Customer price value
  - [ ] Our price value
  - [ ] Status badge: ✅ Accepted or 📅 Scheduled
- [ ] If scheduled, shows:
  - [ ] "Scheduled on: [DATE]"
  - [ ] "Visit time: [TIME]"

### Schedule Visit Form
- [ ] Date picker loads correctly
- [ ] Time picker loads correctly
- [ ] "Schedule" button enables only when both fields filled
- [ ] Submit triggers: `PUT /api/brokers/selling-requests/:id/schedule`
- [ ] On success:
  - [ ] Status badge updates to 📅 Scheduled
  - [ ] Schedule info displays with Date and Time
  - [ ] Database visit_date updated
  - [ ] Database visit_time updated
- [ ] Success message shows briefly
- [ ] Error message displays on failure

### Profile Tab (👤 Profile)
- [ ] Tab displays correctly
- [ ] Shows broker's profile information
- [ ] All fields visible and readable

### Logout
- [ ] Logout button works
- [ ] Returns to home page
- [ ] User state cleared

## User Profile Modal (👤 Profile)
### Opening Profile
- [ ] Click "👤 Profile" opens modal (not page)
- [ ] Modal overlays content with semi-transparent background
- [ ] Modal has slide-up animation
- [ ] Close button (X) works
- [ ] Click outside doesn't close (modal behavior)

### Profile Info Tab
#### View Mode (Initial)
- [ ] Tab displays "Profile Info" title
- [ ] Shows current values:
  - [ ] Username
  - [ ] Email (emali field)
  - [ ] Mobile number (moblie_no field)
  - [ ] Address
  - [ ] Pincode
- [ ] All fields are read-only
- [ ] "Edit Profile" button visible

#### Edit Mode
- [ ] Click "Edit Profile" switches to edit form
- [ ] All fields become input elements:
  - [ ] Username (text input)
  - [ ] Email (email input)
  - [ ] Mobile (tel input)
  - [ ] Address (text input)
  - [ ] Pincode (text input)
- [ ] Fields pre-fill with current values
- [ ] "Save" and "Cancel" buttons appear
- [ ] Click "Cancel" returns to view mode without changes

#### Email Change OTP Flow
- [ ] Change email field to different value
- [ ] Click "Save"
- [ ] OTP modal appears
- [ ] Message shows: "OTP sent to [new-email]"
- [ ] 6-digit code input field
- [ ] "Verify" button
- [ ] Timer shows code validity (5 minutes)
- [ ] Enter incorrect code shows error: "Invalid OTP"
- [ ] Enter correct code:
  - [ ] `POST /api/users/verify-otp` succeeds
  - [ ] Email updated in database
  - [ ] OTP modal closes
  - [ ] Profile shows new email
  - [ ] Success message displays

#### No Email Change
- [ ] Edit other fields (username, mobile, address, pincode)
- [ ] Click "Save"
- [ ] `PUT /api/users/profile` called directly
- [ ] No OTP modal appears
- [ ] Changes saved immediately
- [ ] UI updates with new values
- [ ] Success message displays

### Selling Option Tab
#### View Elements
- [ ] Tab title shows "Selling Option" 
- [ ] Form fields visible:
  - [ ] "Stock per mound" (number input)
  - [ ] "Our Price" (read-only, auto-filled)
  - [ ] "Customer Price" (number input)
  - [ ] "Submit Selling Request" button

#### Getting Admin Price
- [ ] "Our Price" field fetches from: `GET /api/admin/global-price`
- [ ] On page load: Field shows latest global price
- [ ] Field is read-only (cannot edit)
- [ ] Displays current admin-set price

#### Creating Selling Request
- [ ] Enter any stock per mound value (e.g., 100)
- [ ] Enter any customer price (e.g., 5000)
- [ ] Click "Submit Selling Request"
- [ ] `POST /api/users/selling-requests` called with:
  - [ ] user_id: Current logged-in user's ID
  - [ ] stock_per_mound: User input value
  - [ ] customer_price: User input value
  - [ ] our_price: Admin-set price (read from earlier fetch)
- [ ] On success:
  - [ ] Message shows: "Request submitted successfully! Awaiting admin approval"
  - [ ] Form clears or shows success state
  - [ ] Request created in database with status='Pending'
  - [ ] seller_id (user_id) and other fields populated

#### Validation
- [ ] Empty stock value shows error
- [ ] Empty customer price shows error
- [ ] Non-numeric values show error
- [ ] Zero or negative values show error

## AdminSellingRequests Component
### Tab Navigation
- [ ] Three tabs visible with counts:
  - [ ]  Pending (count of status='Pending')
  - [ ]  Accepted (count of status='Accepted')
  - [ ]  Scheduled (count of status='Scheduled')
- [ ] Tab switching works smoothly
- [ ] Counts update after actions
- [ ] Active tab highlighted

### Request Cards (Grid Layout)
#### Card Display
- [ ] Cards arranged in responsive grid (3 columns on desktop)
- [ ] Each card shows:
  - [ ] User username as header
  - [ ] Status badge (color-coded)
  - [ ] User email (emali field)
  - [ ] User mobile (moblie_no field)
  - [ ] User address
  - [ ] **Pincode highlighted in yellow**
  - [ ] Stock per mound
  - [ ] Our price (admin's price)
  - [ ] Customer price (user's price)
  - [ ] "Select" button for action

#### Card Hover States
- [ ] Regular cards have subtle shadow
- [ ] Hover increases shadow and border color changes
- [ ] Selected card has blue border and light blue background

### Broker Selection Panel
#### Opening Panel
- [ ] Click "Select" on any Pending request
- [ ] Right-side panel slides up from bottom with animation
- [ ] Panel header shows: " Assign Broker to [username]"
- [ ] Panel shows: " Searching brokers for pincode: [pincode]"

#### Broker Filtering
- [ ] `GET /api/brokers/by-pincode/:pincode` called
- [ ] Only brokers matching request's pincode shown
- [ ] Only Active brokers shown
- [ ] Only verified brokers shown (otp_code=null)
- [ ] If no brokers: "No brokers available for this pincode"

#### Broker Selection
- [ ] Each available broker shown in radio option format
- [ ] Radio button clickable
- [ ] Broker info displayed:
  - [ ] Name
  - [ ] Email
  - [ ] Mobile number
  - [ ] Commission percentage
- [ ] Only one broker can be selected at a time
- [ ] Selected state highlights background
- [ ] "✓ Assign Broker" button enables only when broker selected

#### Assignment Action
- [ ] Click "✓ Assign Broker" with broker selected
- [ ] `PUT /api/admin/selling-requests/:id/accept` called with broker_id
- [ ] On success:
  - [ ] Status updates to 'Accepted'
  - [ ] Request card moves to "Accepted" tab
  - [ ] Broker info displays in the card
  - [ ] Panel closes with animation
  - [ ] Tab count updates

#### Panel Close
- [ ] "X" button closes panel
- [ ] Clicking outside panel doesn't close it (fixed position)
- [ ] No action taken if closed without assignment

### Status-Specific Display
#### Pending Tab
- [ ] Shows only requests with status='Pending'
- [ ] No broker assigned
- [ ] No visit schedule
- [ ] "Select" button enables admin action

#### Accepted Tab
- [ ] Shows requests with status='Accepted'
- [ ] Broker name, email, mobile displayed
- [ ] Commission percentage shown
- [ ] No visit schedule yet
- [ ] "Select" button disabled or shows different action

#### Scheduled Tab
- [ ] Shows requests with status='Scheduled'
- [ ] Broker information visible
- [ ] Visit schedule displayed:
  - [ ] "Scheduled on: [DATE]"
  - [ ] "Visit time: [TIME]"

## Database Verification
### Users Table (register)
- [ ] New user records created on signup
- [ ] Email field named `emali` (note typo)
- [ ] Mobile field named `moblie_no` (note typo)
- [ ] OTP fields: `otp_code` (6-digit), `otp_expiry` (timestamp)
- [ ] Role field set to 'user'

### Brokers Table (brokers)
- [ ] Brokers created by admin show all fields
- [ ] Email and password stored
- [ ] `status='Active'` for available brokers
- [ ] `otp_code=null` means broker verified
- [ ] Pincode field matches service area
- [ ] Commission percentage stored

### Selling Requests Table
- [ ] New requests have status='Pending'
- [ ] Fields populated: user_id, stock_per_mound, our_price, customer_price
- [ ] After assignment: broker_id populated, status='Accepted'
- [ ] After scheduling: visit_date, visit_time populated, status='Scheduled'
- [ ] timestamps created_at, updated_at work correctly

### Global Price Table
- [ ] Latest record has current_price value
- [ ] Update date reflects when admin changed price
- [ ] Fetched correctly by GET endpoint

## Complete End-to-End Flows

### Flow 1: Complete Broker Journey
- [ ] Admin creates broker in AdminDashboard
- [ ] Broker receives email with credentials (or gets them from admin)
- [ ] Broker visits app, clicks " Broker Portal"
- [ ] Broker logs in with email + password
- [ ] Redirected to BrokerDashboard
- [ ] Admin creates/assigns a selling request to this broker
- [ ] Broker sees assignment in "My Assignments" tab
- [ ] Broker views user's full details
- [ ] Broker schedules visit (date + time)
- [ ] Status updates to "Scheduled"
- [ ] Broker logs out
- [ ] Admin sees scheduled visit info in request card

### Flow 2: Complete User Selling Request Journey
- [ ] User registers and logs in
- [ ] User clicks " Profile" (if not visible, check navbar)
- [ ] UserProfile modal opens
- [ ] User views current profile info
- [ ] User switches to "Selling Option" tab
- [ ] Admin price displays (auto-fetch from global price)
- [ ] User enters stock quantity and customer price
- [ ] User submits selling request
- [ ] Request appears in AdminSellingRequests "Pending" tab
- [ ] Admin clicks "Select" on request
- [ ] Admin sees brokers matching user's pincode
- [ ] Admin selects appropriate broker
- [ ] Request moves to "Accepted" tab with broker info
- [ ] Broker logs in and sees assignment
- [ ] Broker schedules visit

### Flow 3: Email Change with OTP
- [ ] User in profile modal, edit mode
- [ ] User changes email field to new email
- [ ] User clicks "Save"
- [ ] OTP modal appears
- [ ] Verify code is sent to new email (check inbox)
- [ ] User enters code
- [ ] Success message
- [ ] Profile shows new email

## Performance & UX Checks
- [ ] All animations are smooth (not janky)
- [ ] No console errors when performing actions
- [ ] Modal overlays don't interfere with scrolling
- [ ] Responsive design works on:
  - [ ] Desktop (1920px width)
  - [ ] Laptop (1366px width)
  - [ ] Tablet (768px width)
  - [ ] Mobile (375px width)
- [ ] Loading states work (spinners/messages)
- [ ] Error messages are clear and helpful
- [ ] Success messages show appropriately

## Known Limitations (Document Any Variations)
- [ ] Field names: `emali` (email) and `moblie_no` (mobile) are intentional schema field names
- [ ] OTP validity: 5 minutes from generation
- [ ] Broker status: Must be "Active" in database
- [ ] Broker verification: otp_code must be NULL

## Test Results Summary
- **Total Test Cases**: ___ / 150+
- **Passed**: ___ / 150+
- **Failed**: ___ 
- **Skipped**: ___
- **Overall Status**: [ ] PASS [ ] FAIL [ ] IN PROGRESS

**Tested By**: _______________  
**Date**: _______________  
**Notes**: ___________________________________________________

---

## Quick Test Commands

### Check Backend is Running
```bash
curl http://localhost:5000/api/config
# Should return config JSON
```

### Create Test Broker (via AdminDashboard or API)
```bash
curl -X POST http://localhost:5000/api/admin/brokers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Broker",
    "email": "broker@test.com",
    "password": "password123",
    "mobile_no": "9876543210",
    "address": "Test Address",
    "pincode": "12345",
    "commission_percent": 5,
    "status": "Active"
  }'
```

### Verify Database Connections
```bash
# In MySQL console
USE dharti_oil_db;
SELECT COUNT(*) FROM brokers;
SELECT COUNT(*) FROM register;
SELECT COUNT(*) FROM selling_requests;
```
