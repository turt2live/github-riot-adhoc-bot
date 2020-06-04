import * as config from "config";

interface IConfig {
    allowedUsernames: string[];
    githubSecret: string;
    appId: number;
    privateKeyPath: string;
    web: {
        address: string;
        port: number;
        webhookPath: string;
        buildPaths: string;
    };
}

export default <IConfig>config;
