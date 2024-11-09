import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import { FieldFactory } from "./fields";
import axios, { AxiosInstance } from "axios";

export const Success = "success";
export const Failure = "failure";
export const Cancelled = "cancelled";
export const Custom = "custom";
export const Always = "always";

export type Octokit = InstanceType<typeof GitHub>;

export interface With {
  status: string;
  mention: string;
  author_name: string;
  if_mention: string;
  username: string;
  icon_emoji: string;
  icon_url: string;
  channel: string;
  fields: string;
  job_name: string;
}

export interface Field {
  title: string;
  value: string;
  short: boolean;
}

export class Client {
  private fieldFactory: FieldFactory;
  private octokit: Octokit;
  private with: With;
  private client: AxiosInstance;

  constructor(
    props: With,
    token: string,
    gitHubBaseUrl: string,
    apiEndpoint?: string | null
  ) {
    this.with = props;
    if (this.with.fields === "") this.with.fields = "repo,commit";

    this.octokit = getOctokit(token);

    if (
      apiEndpoint === undefined ||
      apiEndpoint === null ||
      apiEndpoint === ""
    ) {
      throw new Error("Specify secrets.API_ENDPOINT");
    }

    this.client = axios.create({
      baseURL: apiEndpoint,
    });

    this.fieldFactory = new FieldFactory(
      this.with.fields,
      this.jobName,
      gitHubBaseUrl,
      this.octokit
    );
  }

  private get jobName() {
    const name = this.with.job_name === "" ? context.job : this.with.job_name;
    if (
      process.env.MATRIX_CONTEXT == null ||
      process.env.MATRIX_CONTEXT === "null"
    )
      return name;
    const matrix = JSON.parse(process.env.MATRIX_CONTEXT);
    const value = Object.values(matrix).join(", ");
    return value !== "" ? `${name} (${value})` : name;
  }

  async prepare(text: string) {
    const template = await this.payloadTemplate();
    template.text = this.injectText(text);
    template.attachments[0].color = this.injectColor();
    return template;
  }

  async send(payload: string) {
    core.debug(JSON.stringify(context, null, 2));
    const headers = JSON.parse(process.env.HEADERS ?? "{}");
    await this.client.post("", payload, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    core.debug("send message");
  }

  injectColor() {
    switch (this.with.status) {
      case Success:
        return "good";
      case Cancelled:
        return "warning";
      case Failure:
        return "danger";
    }
    throw new Error(`invalid status: ${this.with.status}`);
  }

  injectText(value: string) {
    let text = "";
    switch (this.with.status) {
      case Success:
        text += this.insertText(
          ":white_check_mark: Succeeded GitHub Actions\n",
          value
        );
        return text;
      case Cancelled:
        text += this.insertText(":warning: Canceled GitHub Actions\n", value);
        return text;
      case Failure:
        text += this.insertText(":no_entry: Failed GitHub Actions\n", value);
        return text;
    }
    throw new Error(`invalid status: ${this.with.status}`);
  }

  private insertText(defaultText: string, text: string) {
    return text === "" ? defaultText : text;
  }

  private async payloadTemplate() {
    const text = "";
    const { username, icon_emoji, icon_url, channel } = this.with;

    return {
      text,
      username,
      icon_emoji,
      icon_url,
      channel,
      attachments: [
        {
          color: "",
          author_name: this.with.author_name,
          fields: await this.fieldFactory.attachments(),
        },
      ],
    };
  }
}
