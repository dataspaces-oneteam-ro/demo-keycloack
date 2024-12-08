# Keycloak Setup and Configuration Guide

## 1. Install Keycloak

### Using Docker

1. Ensure Docker is installed and running on your system
2. Run the following command to pull and start the Keycloak container:

```bash
docker run -d -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
```

This sets up Keycloak in development mode with the following admin credentials:
- Username: `admin`
- Password: `admin`

## 2. Access Keycloak

1. Open your browser and navigate to `http://localhost:8080`
2. Log in to the admin console using the credentials from installation:
    - Username: `admin`
    - Password: `admin`

## 3. Set Up a Realm

1. In the admin console, click "Create Realm"
2. Enter a name (e.g., `test-realm`)
3. Save the realm configuration

## 4. Configure a Dummy Application

### Create New Client

1. Navigate to "Clients" under the test-realm
2. Click "Create" and configure:
    - Client ID: `dummy-app`
    - Client Protocol: `openid-connect`
    - Root URL: `http://localhost:3000` (or your application URL)
3. Save the client

### Configure Client Settings

1. Access Type: Set to `public` (no secret needed for this example)
2. Valid Redirect URIs: Add `http://localhost:3000/*`
3. Save the changes

## 5. Add a Test User

1. Navigate to the Users section
2. Click "Add User" and configure:
    - Username: `test-user`
3. Enable the user and save

## 6. Test the Integration

1. Start application wit command 'node app.js'
2. Visit `http://localhost:3000` to access the public route
2. Visit `http://localhost:3000/protected` to access the protected route
    - You'll be redirected to the Keycloak login page
    - Log in with the test user credentials (`test-user`)
    - After successful authentication, you'll be redirected back to the application