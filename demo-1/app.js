// Required dependencies
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const port = 3000;

// Keycloak configuration
const config = {
    realm: 'test-realm',
    authServerUrl: 'http://localhost:8080',
    clientId: 'dummy-app',
    clientSecret: 'your-client-secret', // Replace with your client secret
    redirectUri: 'http://localhost:3000/protected'
};

// Add this function at the top of your file
function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
    }
    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(payload);
}


// Session middleware setup
app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Home page
app.get('/', (req, res) => {
    res.send(`
        <h1>Keycloak Test App</h1>
        <a href="/login">Login</a>
    `);
});

// Login endpoint
app.get('/login', (req, res) => {
    const authUrl = `${config.authServerUrl}/realms/${config.realm}/protocol/openid-connect/auth`;
    const params = {
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: 'openid'
    };
    
    const url = `${authUrl}?${querystring.stringify(params)}`;
    res.redirect(url);
});

// Modify your protected route handler:
app.get('/protected', async (req, res) => {
    const code = req.query.code;
    
    if (!code) {
        return res.redirect('/login');
    }

    try {
        const tokenUrl = `${config.authServerUrl}/realms/${config.realm}/protocol/openid-connect/token`;
        const tokenResponse = await axios.post(tokenUrl, 
            querystring.stringify({
                grant_type: 'authorization_code',
                client_id: config.clientId,
                client_secret: config.clientSecret,
                code: code,
                redirect_uri: config.redirectUri
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        // Store tokens in session
        req.session.tokens = tokenResponse.data;

        // Decode the access token
        const decodedAccessToken = decodeJWT(tokenResponse.data.access_token);

        // Display success and token info
        res.send(`
            <h1>Authentication Successful!</h1>
            
            <h2>Decoded Access Token:</h2>
            <pre>${JSON.stringify(decodedAccessToken, null, 2)}</pre>
            
            <h2>Raw Access Token:</h2>
            <pre>${tokenResponse.data.access_token}</pre>
            
            <h2>ID Token:</h2>
            <pre>${tokenResponse.data.id_token}</pre>
            
            <h3>User Information:</h3>
            <ul>
                <li>Name: ${decodedAccessToken.name}</li>
                <li>Email: ${decodedAccessToken.email}</li>
                <li>Username: ${decodedAccessToken.preferred_username}</li>
                <li>Roles: ${JSON.stringify(decodedAccessToken.realm_access?.roles || [])}</li>
            </ul>
            
            <a href="/logout">Logout</a>
        `);
    } catch (error) {
        console.error('Token exchange error:', error.response?.data || error.message);
        res.status(500).send('Authentication failed');
    }
});

// Logout endpoint
app.get('/logout', (req, res) => {
    const logoutUrl = `${config.authServerUrl}/realms/${config.realm}/protocol/openid-connect/logout`;
    req.session.destroy();
    res.redirect(logoutUrl);
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});