import { debug, getInput, setFailed } from "@actions/core";
import { Client } from "./client";

async function run() {
  try {
    const status = getInput("status", { required: true }).toLowerCase();
    const mention = getInput("mention");
    const author_name = getInput("author_name");
    const if_mention = getInput("if_mention").toLowerCase();
    const text = getInput("text");
    const username = getInput("username");
    const icon_emoji = getInput("icon_emoji");
    const icon_url = getInput("icon_url");
    const channel = getInput("channel");
    const custom_payload = getInput("custom_payload");
    const payload = getInput("payload");
    const fields = getInput("fields");
    const job_name = getInput("job_name");
    const github_base_url = getInput("github_base_url");
    const github_token = getInput("github_token");

    debug(`status: ${status}`);
    debug(`mention: ${mention}`);
    debug(`author_name: ${author_name}`);
    debug(`if_mention: ${if_mention}`);
    debug(`text: ${text}`);
    debug(`username: ${username}`);
    debug(`icon_emoji: ${icon_emoji}`);
    debug(`icon_url: ${icon_url}`);
    debug(`channel: ${channel}`);
    debug(`custom_payload: ${custom_payload}`);
    debug(`payload: ${payload}`);
    debug(`fields: ${fields}`);
    debug(`job_name: ${job_name}`);
    debug(`github_base_url: ${github_base_url}`);

    const client = new Client(
      {
        status,
        mention,
        author_name,
        if_mention,
        username,
        icon_emoji,
        icon_url,
        channel,
        fields,
        job_name,
      },
      github_token,
      github_base_url,
      process.env.API_ENDPOINT
    );
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    }
  }
}

run();
