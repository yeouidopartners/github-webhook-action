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
const core_1 = require("@actions/core");
const client_1 = require("./client");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const status = (0, core_1.getInput)("status", { required: true }).toLowerCase();
            const mention = (0, core_1.getInput)("mention");
            const author_name = (0, core_1.getInput)("author_name");
            const if_mention = (0, core_1.getInput)("if_mention").toLowerCase();
            const text = (0, core_1.getInput)("text");
            const username = (0, core_1.getInput)("username");
            const icon_emoji = (0, core_1.getInput)("icon_emoji");
            const icon_url = (0, core_1.getInput)("icon_url");
            const channel = (0, core_1.getInput)("channel");
            const custom_payload = (0, core_1.getInput)("custom_payload");
            const payload = (0, core_1.getInput)("payload");
            const fields = (0, core_1.getInput)("fields");
            const job_name = (0, core_1.getInput)("job_name");
            const github_base_url = (0, core_1.getInput)("github_base_url");
            const github_token = (0, core_1.getInput)("github_token");
            (0, core_1.debug)(`status: ${status}`);
            (0, core_1.debug)(`mention: ${mention}`);
            (0, core_1.debug)(`author_name: ${author_name}`);
            (0, core_1.debug)(`if_mention: ${if_mention}`);
            (0, core_1.debug)(`text: ${text}`);
            (0, core_1.debug)(`username: ${username}`);
            (0, core_1.debug)(`icon_emoji: ${icon_emoji}`);
            (0, core_1.debug)(`icon_url: ${icon_url}`);
            (0, core_1.debug)(`channel: ${channel}`);
            (0, core_1.debug)(`custom_payload: ${custom_payload}`);
            (0, core_1.debug)(`payload: ${payload}`);
            (0, core_1.debug)(`fields: ${fields}`);
            (0, core_1.debug)(`job_name: ${job_name}`);
            (0, core_1.debug)(`github_base_url: ${github_base_url}`);
            const client = new client_1.Client({
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
            }, github_token, github_base_url, process.env.API_ENDPOINT);
        }
        catch (error) {
            if (error instanceof Error) {
                (0, core_1.setFailed)(error.message);
            }
        }
    });
}
run();
