const express = require("express");
const basicAuth = require("express-basic-auth");

const app = express();
const port = process.env.PORT || 3000;

// Sample users for basic authentication
const users = {
  username1: "password1",
  username2: "password2",
};

// Middleware for basic authentication
const authenticate = basicAuth({
  users,
  //   challenge: true, // Display the login dialog when unauthorized
  unauthorizedResponse: "Unauthorized",
});

// Unprotected route
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send(
    "This is basic auth mock API.\n\nTry /protected route with basic authentication.\n\nUsername: username1, Password: password1\nUsername: username2, Password: password2\n\nIf you provide wrong credentials, you will get 401 Unauthorized response. Otherwise, you will get 200 OK response."
  );
});

// Protected route that requires basic authentication
app.get("/protected", authenticate, (req, res) => {
  res.send("Successfully authenticated!");
});

// Unprotected route
app.get("/unprotected", (req, res) => {
  res.send("This route is unprotected.");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
