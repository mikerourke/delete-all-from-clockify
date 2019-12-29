const { fetchPaginated, fetchSingle } = require("./apiFetchActions");
const { API_DELAY } = require("./constants");
const { logger, pause } = require("./utils");

async function deleteEntityGroupRecords(baseUrl, entityRecords) {
  let currentRecord = 1;
  const recordCount = entityRecords.length;
  try {
    for (const { id } of entityRecords) {
      logger.info(`Deleting record ${currentRecord} of ${recordCount}...`);
      await fetchSingle(`${baseUrl}/${id}`, { method: "DELETE" });
      logger.success(`Record ${currentRecord} of ${recordCount} deleted!`);

      currentRecord += 1;
      await pause(API_DELAY);
    }
  } catch (err) {
    logger.error("Error deleting record:", err);
  }
}

async function fetchUserId() {
  try {
    const user = await fetchSingle("/user");
    return user.id;
  } catch (err) {
    logger.error("Unable to get user ID, make sure your API key is correct!");
    return null;
  }
}

/**
 * Fetches all time entries (for all years) for the specified workspace.
 */
async function deleteTimeEntriesInWorkspace(workspace) {
  logger.info(`Fetching time entries in ${workspace.name}...`);
  try {
    const userId = await fetchUserId();
    if (!userId) {
      return;
    }

    const allTimeEntries = await fetchPaginated(
      `/workspaces/${workspace.id}/user/${userId}/time-entries`,
    );

    if (allTimeEntries.length === 0) {
      logger.warn(`No time entries in ${workspace.name}`);
      return;
    }

    logger.success(
      `Fetched ${allTimeEntries.length} time entries in ${workspace.name}!`,
    );

    logger.info(`Deleting time entries in ${workspace.name}...`);
    await deleteEntityGroupRecords(
      `/workspaces/${workspace.id}/time-entries`,
      allTimeEntries,
    );
    logger.success(`All time entries deleted in ${workspace.name}`);
  } catch (err) {
    logger.error(`Error fetching time entries in ${workspace.name}:`, err);
  }
}

async function deleteClientsInWorkspace(workspace) {
  logger.info(`Fetching clients in ${workspace.name}...`);
  try {
    const allClients = await fetchPaginated(
      `/workspaces/${workspace.id}/clients`,
    );

    if (allClients.length === 0) {
      logger.warn(`No clients in ${workspace.name}`);
      return;
    }

    logger.success(
      `Fetched ${allClients.length} clients in ${workspace.name}!`,
    );

    logger.info(`Deleting clients in ${workspace.name}...`);
    await deleteEntityGroupRecords(
      `/workspaces/${workspace.id}/clients`,
      allClients,
    );
    logger.success(`All clients deleted in ${workspace.name}`);
  } catch (err) {
    logger.error(`Error fetching clients in ${workspace.name}:`, err);
  }
}

async function deleteTagsInWorkspace(workspace) {
  logger.info(`Fetching tags in ${workspace.name}...`);
  try {
    const allTags = await fetchPaginated(`/workspaces/${workspace.id}/tags`);

    if (allTags.length === 0) {
      logger.warn(`No tags in ${workspace.name}`);
      return;
    }

    logger.success(`Fetched ${allTags.length} tags in ${workspace.name}!`);

    logger.info(`Deleting tags in ${workspace.name}...`);
    await deleteEntityGroupRecords(`/workspaces/${workspace.id}/tags`, allTags);
    logger.success(`All tags deleted in ${workspace.name}`);
    return allTags;
  } catch (err) {
    logger.error(`Error fetching tags in ${workspace.name}:`, err);
  }
}

async function deleteProjectsAndTasksInWorkspace(workspace) {
  logger.info(`Fetching projects and tasks in ${workspace.name}...`);
  try {
    const allProjects = await fetchPaginated(
      `/workspaces/${workspace.id}/projects`,
    );
    const tasksByProjectId = {};

    for (const project of allProjects) {
      logger.info(`Fetching tasks in ${project.name} of ${workspace.name}...`);
      tasksByProjectId[project.id] = await fetchPaginated(
        `/workspaces/${workspace.id}/projects/${project.id}/tasks`,
      );
    }

    if (allProjects.length === 0) {
      logger.warn(`No projects in ${workspace.name}`);
      return;
    }

    logger.success(
      `Fetched ${allProjects.length} projects in ${workspace.name}!`,
    );

    for (const project of allProjects) {
      const projectTasks = tasksByProjectId[project.id] || [];
      if (projectTasks.length === 0) {
        logger.warn(`No tasks in project ${project.name} of ${workspace.name}`);
        continue;
      }

      logger.info(
        `Deleting tasks in project ${project.name} of ${workspace.name}`,
      );
      await deleteEntityGroupRecords(
        `/workspaces/${workspace.id}/projects/${project.id}/tasks`,
        projectTasks,
      );
      logger.success(
        `All tasks deleted in project ${project.name} of ${workspace.name}`,
      );
    }

    logger.info(`Deleting projects in ${workspace.name}...`);
    await deleteEntityGroupRecords(
      `/workspaces/${workspace.id}/projects`,
      allProjects,
    );
    logger.success(`All projects deleted in ${workspace.name}`);
  } catch (err) {
    logger.error(
      `Error fetching projects and tasks in ${workspace.name}:`,
      err,
    );
  }
}

async function deleteAllEntitiesInWorkspace(workspace) {
  await deleteTimeEntriesInWorkspace(workspace);
  await pause(1000);
  await deleteClientsInWorkspace(workspace);
  await pause(1000);
  await deleteTagsInWorkspace(workspace);
  await pause(1000);
  await deleteProjectsAndTasksInWorkspace(workspace);
}

module.exports = deleteAllEntitiesInWorkspace;
