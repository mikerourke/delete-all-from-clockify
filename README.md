# delete-all-from-clockify

This is a quick utility I whipped up to delete all of your clients, tags, tasks, 
projects, and time entries from Clockify.

I adapted it from a script I wrote for my [time transfer tool](https://github.com/mikerourke/toggl-to-clockify-web).

## Super Important Notes, Please Read!

- Running this tool deletes **everything** but your workspaces
- The changes are irreversible and there is **no confirmation** when you run the tool, so make sure you're ready
- It's not stateful in any way, you can cancel the transfer by bailing the process (i.e. hitting `Ctrl + C`)  

## Instructions

1. Run `npm install` to install the dependencies.
2. Rename the `creds.example.json` file in the root directory to `creds.json`.
3. Enter your Clockify API key in the `apiKey` field, [you can find it here](https://clockify.me/user/settings).

```json
{
  "apiKey": "abc123immatestkey"
}
```

4. Run `npm start` to start deleting your Clockify stuff.
5. **Grab a snack, it could take a while.**
