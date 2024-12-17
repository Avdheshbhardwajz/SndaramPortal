module.exports = {
  apps: [
    {
      name: "My Application",
      script: "app.js",
      node_args: "-r dotenv/config",
    },
  ],
};
