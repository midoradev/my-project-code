//------------------------------------------------------------------------------------------------------------------------------//

//app.ts
import * as builder from 'botbuilder';
import * as restify from 'restify';

const server = restify.createServer();
server.listen(process.env.PORT || 3978, () => {
    console.log(`${server.name} listening to ${server.url}`);
});

const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
})

server.post('/api/messages', connector.listen());

let bot = new builder.UniversalBot(connector, (session) => {
    session.send(`You said ${session.message.text}`)
})

//------------------------------------------------------------------------------------------------------------------------------//


//envConfiguratorService.ts
import { IConfigurator } from './../interfaces/IConfigurator';
import { IChatConnectorSettings } from 'botbuilder';

export class InvalidAppCredentialsError extends Error {}

export class EnvConfigurator implements IConfigurator {
    
    public get AppCredentials(): IChatConnectorSettings {
        if(!process.env.MicroSoftAppId) throw new InvalidAppCredentialsError('AppId not defined');
        if(!process.env.MicroSoftAppPassword) throw new InvalidAppCredentialsError('AppPassword not defined');

        return {
            appId: process.env.MicroSoftAppId,
            appPassword: process.env.MicroSoftAppPassword
        }
    }
}

//------------------------------------------------------------------------------------------------------------------------------//

//IConfigurator.ts
import { IChatConnectorSettings } from "botbuilder";

export interface IConfigurator {
    AppCredentials: IChatConnectorSettings;
}
