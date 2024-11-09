"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = exports.Always = exports.Custom = exports.Cancelled = exports.Failure = exports.Success = void 0;
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const fields_1 = require("./fields");
const axios_1 = __importDefault(require("axios"));
exports.Success = "success";
exports.Failure = "failure";
exports.Cancelled = "cancelled";
exports.Custom = "custom";
exports.Always = "always";
class Client {
    constructor(props, token, gitHubBaseUrl, apiEndpoint) {
        this.with = props;
        if (this.with.fields === "")
            this.with.fields = "repo,commit";
        this.octokit = (0, github_1.getOctokit)(token);
        if (apiEndpoint === undefined ||
            apiEndpoint === null ||
            apiEndpoint === "") {
            throw new Error("Specify secrets.API_ENDPOINT");
        }
        this.client = axios_1.default.create({
            baseURL: apiEndpoint,
        });
        this.fieldFactory = new fields_1.FieldFactory(this.with.fields, this.jobName, gitHubBaseUrl, this.octokit);
    }
    get jobName() {
        const name = this.with.job_name === "" ? github_1.context.job : this.with.job_name;
        if (process.env.MATRIX_CONTEXT == null ||
            process.env.MATRIX_CONTEXT === "null")
            return name;
        const matrix = JSON.parse(process.env.MATRIX_CONTEXT);
        const value = Object.values(matrix).join(", ");
        return value !== "" ? `${name} (${value})` : name;
    }
    prepare(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const template = yield this.payloadTemplate();
            template.text = this.injectText(text);
            template.attachments[0].color = this.injectColor();
            return template;
        });
    }
    send(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            core.debug(JSON.stringify(github_1.context, null, 2));
            const headers = JSON.parse((_a = process.env.HEADERS) !== null && _a !== void 0 ? _a : "{}");
            yield this.client.post("", payload, {
                headers: Object.assign({ "Content-Type": "application/json" }, headers),
            });
            core.debug("send message");
        });
    }
    injectColor() {
        switch (this.with.status) {
            case exports.Success:
                return "good";
            case exports.Cancelled:
                return "warning";
            case exports.Failure:
                return "danger";
        }
        throw new Error(`invalid status: ${this.with.status}`);
    }
    injectText(value) {
        let text = "";
        switch (this.with.status) {
            case exports.Success:
                text += this.insertText(":white_check_mark: Succeeded GitHub Actions\n", value);
                return text;
            case exports.Cancelled:
                text += this.insertText(":warning: Canceled GitHub Actions\n", value);
                return text;
            case exports.Failure:
                text += this.insertText(":no_entry: Failed GitHub Actions\n", value);
                return text;
        }
        throw new Error(`invalid status: ${this.with.status}`);
    }
    insertText(defaultText, text) {
        return text === "" ? defaultText : text;
    }
    payloadTemplate() {
        return __awaiter(this, void 0, void 0, function* () {
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
                        fields: yield this.fieldFactory.attachments(),
                    },
                ],
            };
        });
    }
}
exports.Client = Client;
