const { fetchSingle } = require("./apiFetchActions");
const deleteAllWorkspaceEntities = require("./deleteEntities");
const { logger, pause } = require("./utils");

deleteAllFromClockify();

/**
 * Deletes the time entries, clients, tags, tasks, and projects from all
 * workspaces.
 */
async function deleteAllFromClockify() {
  const workspaces = await fetchValidWorkspaces();

  // Wait 1 second between each entity group, just to hedge my bets:
  for (const workspace of workspaces) {
    logger.info(`Processing ${workspace.name}...`);
    await deleteAllWorkspaceEntities(workspace);
    logger.success(`Processing complete for ${workspace.name}`);
    await pause(1000);
  }
}

/**
 * Fetches the workspaces from Clockify and excludes one of the workspaces
 * I had an issue with.
 */
async function fetchValidWorkspaces() {
  const workspaceResults = await fetchSingle("/workspaces");
  return workspaceResults.reduce((acc, workspace) => {
    // This is due to an issue with one of my workspaces that wasn't deleted
    // properly (I suspect it may have been a Clockify bug). If I try deleting
    // stuff from here, I get all kinds of errors:
    if (/Pandera/.test(workspace.name)) {
      return acc;
    }

    return [...acc, workspace];
  }, []);
}
