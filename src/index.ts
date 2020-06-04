import express from "express";
import config from "./config";
import { Webhooks } from "@octokit/webhooks";
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import * as fs from "fs";

const gh = new Octokit({
    authStrategy: createAppAuth,
    auth: {
        id: config.appId,
        privateKey: fs.readFileSync(config.privateKeyPath),
    },
});

console.log(config);
const ghWeb = new Webhooks({
    secret: config.githubSecret,
    path: config.web.webhookPath,
});

ghWeb.on("issue_comment.created", ev => {
    if (!config.allowedUsernames.includes(ev.payload.sender.login)) return; // ignore
    if (ev.payload.comment.body.trim() !== "#adhoc") return;
    gh.issues.createComment({
        body: "Hello!",
        issue_number: ev.payload.issue.number,
        owner: ev.payload.repository.owner.login,
        repo: ev.payload.repository.name,
    });
});

const app = express();
app.use(express.static(config.web.buildPaths));
app.use(express.json());

app.post(config.web.webhookPath, (req, res) => {
    ghWeb.verifyAndReceive({
        id: <string>req.headers['x-github-delivery'],
        name: <string>req.headers["x-github-event"],
        signature: <string>req.headers["x-hub-signature"],
        payload: req.body,
    }).then(() => {
        res.sendStatus(200);
    }).catch(e => {
        console.error(e);
        res.sendStatus(500);
    });
});

app.listen(config.web.port, config.web.address, () => {
    console.log("Web server running!");
});
