"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldFactory = void 0;
const github_1 = require("@actions/github");
class FieldFactory {
    constructor(fields, jobName, gitHubBaseUrl, octokit) {
        this.fields = fields.replace(/ /g, "").split(",");
        this.jobName = jobName;
        this.octokit = octokit;
        this.gitHubBaseUrl =
            gitHubBaseUrl === "" ? "https://github.com" : gitHubBaseUrl;
    }
    includes(field) {
        return this.fields.includes(field) || this.fields.includes("all");
    }
    filterField(array, diff) {
        return array.filter((item) => item !== diff);
    }
    attachments() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.filterField([
                this.includes("repo")
                    ? createAttachment("repo", yield this.repo())
                    : undefined,
                this.includes("message")
                    ? createAttachment("message", yield this.message())
                    : undefined,
                this.includes("commit")
                    ? createAttachment("commit", yield this.commit())
                    : undefined,
                this.includes("author")
                    ? createAttachment("author", yield this.author())
                    : undefined,
                this.includes("action")
                    ? createAttachment("action", yield this.action())
                    : undefined,
                this.includes("job")
                    ? createAttachment("job", yield this.job())
                    : undefined,
                this.includes("took")
                    ? createAttachment("took", yield this.took())
                    : undefined,
                this.includes("eventName")
                    ? createAttachment("eventName", yield this.eventName())
                    : undefined,
                this.includes("ref")
                    ? createAttachment("ref", yield this.ref())
                    : undefined,
                this.includes("workflow")
                    ? createAttachment("workflow", yield this.workflow())
                    : undefined,
                this.includes("workflowRun")
                    ? createAttachment("workflowRun", yield this.workflowRun())
                    : undefined,
                this.includes("pullRequest")
                    ? createAttachment("pullRequest", yield this.pullRequest())
                    : undefined,
            ], undefined);
        });
    }
    message() {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.getCommit(this.octokit);
            const value = `<${resp.data.html_url}|${resp.data.commit.message
                .split("\n")[0]
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}>`;
            process.env.AS_MESSAGE = value;
            return value;
        });
    }
    author() {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.getCommit(this.octokit);
            const author = resp.data.commit.author;
            const value = `${author === null || author === void 0 ? void 0 : author.name}<${author === null || author === void 0 ? void 0 : author.email}>`;
            process.env.AS_AUTHOR = value;
            return value;
        });
    }
    took() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const jobs = yield ((_a = this.octokit) === null || _a === void 0 ? void 0 : _a.paginate((_b = this.octokit) === null || _b === void 0 ? void 0 : _b.rest.actions.listJobsForWorkflowRun, {
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                run_id: github_1.context.runId,
            }, (response, done) => {
                if (response.data.find((job) => this.isCurrentJobName(job.name))) {
                    done();
                }
                return response.data;
            }));
            const currentJob = jobs.find((job) => this.isCurrentJobName(job.name));
            if (currentJob === undefined) {
                process.env.AS_TOOK = this.jobIsNotFound;
                return this.jobIsNotFound;
            }
            let time = new Date().getTime() - new Date(currentJob.started_at).getTime();
            const h = Math.floor(time / (1000 * 60 * 60));
            time -= h * 1000 * 60 * 60;
            const m = Math.floor(time / (1000 * 60));
            time -= m * 1000 * 60;
            const s = Math.floor(time / 1000);
            let value = "";
            if (h > 0) {
                value += `${h} hour `;
            }
            if (m > 0) {
                value += `${m} min `;
            }
            if (s > 0) {
                value += `${s} sec`;
            }
            process.env.AS_TOOK = value;
            return value;
        });
    }
    job() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { owner } = github_1.context.repo;
            const jobs = yield ((_a = this.octokit) === null || _a === void 0 ? void 0 : _a.paginate((_b = this.octokit) === null || _b === void 0 ? void 0 : _b.rest.actions.listJobsForWorkflowRun, {
                owner,
                repo: github_1.context.repo.repo,
                run_id: github_1.context.runId,
            }, (response, done) => {
                if (response.data.find((job) => this.isCurrentJobName(job.name))) {
                    done();
                }
                return response.data;
            }));
            const currentJob = jobs.find((job) => this.isCurrentJobName(job.name));
            if (currentJob === undefined) {
                process.env.AS_JOB = this.jobIsNotFound;
                return this.jobIsNotFound;
            }
            const jobId = currentJob.id;
            const value = `<${this.gitHubBaseUrl}/${owner}/${github_1.context.repo.repo}/runs/${jobId}|${this.jobName}>`;
            process.env.AS_JOB = value;
            return value;
        });
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            const { sha } = github_1.context;
            const { owner, repo } = github_1.context.repo;
            const value = `<${this.gitHubBaseUrl}/${owner}/${repo}/commit/${sha}|${sha.slice(0, 8)}>`;
            process.env.AS_COMMIT = value;
            return value;
        });
    }
    repo() {
        return __awaiter(this, void 0, void 0, function* () {
            const { owner, repo } = github_1.context.repo;
            const value = `<${this.gitHubBaseUrl}/${owner}/${repo}|${owner}/${repo}>`;
            process.env.AS_REPO = value;
            return value;
        });
    }
    eventName() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = github_1.context.eventName;
            process.env.AS_EVENT_NAME = value;
            return value;
        });
    }
    ref() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = github_1.context.ref;
            process.env.AS_REF = value;
            return value;
        });
    }
    workflow() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const sha = (_b = (_a = github_1.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.head.sha) !== null && _b !== void 0 ? _b : github_1.context.sha;
            const { owner, repo } = github_1.context.repo;
            const value = `<${this.gitHubBaseUrl}/${owner}/${repo}/commit/${sha}/checks|${github_1.context.workflow}>`;
            process.env.AS_WORKFLOW = value;
            return value;
        });
    }
    workflowRun() {
        return __awaiter(this, void 0, void 0, function* () {
            const { owner, repo } = github_1.context.repo;
            const value = `<${this.gitHubBaseUrl}/${owner}/${repo}/actions/runs/${github_1.context.runId}|${github_1.context.workflow}>`;
            process.env.AS_WORKFLOW_RUN = value;
            return value;
        });
    }
    pullRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            let value;
            if (github_1.context.eventName.startsWith("pull_request")) {
                value = `<${(_a = github_1.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.html_url}|${(_e = (_d = (_c = (_b = github_1.context.payload.pull_request) === null || _b === void 0 ? void 0 : _b.title) === null || _c === void 0 ? void 0 : _c.replace(/&/g, "&amp;")) === null || _d === void 0 ? void 0 : _d.replace(/</g, "&lt;")) === null || _e === void 0 ? void 0 : _e.replace(/>/g, "&gt;")} #${(_f = github_1.context.payload.pull_request) === null || _f === void 0 ? void 0 : _f.number}>`;
            }
            else {
                value = "n/a";
            }
            process.env.AS_PULL_REQUEST = value;
            return value;
        });
    }
    action() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const sha = (_b = (_a = github_1.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.head.sha) !== null && _b !== void 0 ? _b : github_1.context.sha;
            const { owner, repo } = github_1.context.repo;
            const value = `<${this.gitHubBaseUrl}/${owner}/${repo}/commit/${sha}/checks|action>`;
            process.env.AS_ACTION = value;
            return value;
        });
    }
    getCommit(octokit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { owner, repo } = github_1.context.repo;
            const { sha: ref } = github_1.context;
            return yield octokit.rest.repos.getCommit({ owner, repo, ref });
        });
    }
    isCurrentJobName(name) {
        return name === this.jobName || name.endsWith(` / ${this.jobName}`);
    }
    get jobIsNotFound() {
        return "Job is not found.\nCheck <https://action-slack.netlify.app/usage/fields|the matrix> or <https://action-slack.netlify.app/usage/with#job_name|job name>.";
    }
}
exports.FieldFactory = FieldFactory;
function createAttachment(title, value, short) {
    if (short === undefined)
        short = true;
    return { title, value, short };
}
