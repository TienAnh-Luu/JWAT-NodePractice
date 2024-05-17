const express = require("express");
const app = express();
const port = 3000;

/*{
    "username": string,
    "fullname": string,
    "role": string,
    "projects": string[],
    "activeYn": "Y" | "N"
}*/
const userList = [];

app.use(express.json());

function filterUsers(query) {
  return userList.filter((user) => {
    return (
      (!query.username || user.username === query.username) &&
      (!query.fullname || user.fullname === query.fullname) &&
      (!query.role || user.role === query.role) &&
      (!query.activeYn || user.activeYn === query.activeYn) &&
      (!query.projects ||
        JSON.stringify(user.projects) === JSON.stringify(query.projects))
    );
  });
}

// Search for user
app.get("/users", (req, res) => {
  const filteredUsers = filterUsers(req.query);
  res.status(200).json({ users: filteredUsers });
});

// Insert new user data
app.post("/users", (req, res) => {
  const { username, fullname, role, activeYn } = req.query;
  const projects = JSON.parse(req.query.projects);

  // check if username is unique
  const isUserNameUnique = !userList.find((user) => user.username === username);

  // if username if unique and all data not null, push new data to array
  if (
    isUserNameUnique &&
    username &&
    fullname &&
    role &&
    activeYn &&
    Array.isArray(projects)
  ) {
    const newData = { username, fullname, role, activeYn, projects };
    userList.push(newData);
    res
      .status(200)
      .send(`Added new user successfully: ${JSON.stringify(newData)}`);
  } else {
    res
      .status(400)
      .send(
        `Error: Invalid input, cannot add new user\n ${JSON.stringify(
          req.query
        )}`
      );
  }
});

// Update user data
app.patch("/users", (req, res) => {
  const { username, fullname, role, activeYn } = req.query;
  const projects = JSON.parse(req.query.projects);

  if (
    !username ||
    !fullname ||
    !role ||
    !activeYn ||
    !Array.isArray(projects)
  ) {
    res.status(400).send(`Error: Invalid input\n ${JSON.stringify(req.query)}`);
    return;
  }

  const existingUser = userList.find((user) => user.username === username);
  if (existingUser) {
    existingUser.role = role;
    existingUser.fullname = fullname;
    existingUser.activeYn = activeYn;
    existingUser.projects = [...projects];
    res
      .status(200)
      .send(`Updated user successfully: ${JSON.stringify(userList)}`);
  } else {
    userList.push(req.query);
    res.status(200).send(`Created new user: ${JSON.stringify(userList)}`);
  }
});

// Delete user
app.delete("/users/:username", (req, res) => {
  const usernameToDelete = req.params.username;

  // Find the index of the user with the specified username
  const userIndex = userList.findIndex(
    (user) => user.username === usernameToDelete
  );

  if (userIndex !== -1) {
    // Remove the user from the array
    userList.splice(userIndex, 1);
    res.status(200).send(`User ${usernameToDelete} deleted successfully.`);
  } else {
    res.status(404).send(`User ${usernameToDelete} not found.`);
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
