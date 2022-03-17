//api
export interface ILoggerMethod {
    (msg: string, ...args: any[]): void
    (obj: object, msg?: string, ...args: any[]): void
}

export interface ILogger {
    debug: ILoggerMethod
    info: ILoggerMethod
    warn: ILoggerMethod
    error: ILoggerMethod
}

export interface IBotConfig {
    token: string
    commands: string[]
    game?: string
    username?: string
    idiots?: string[]
    idiotAnswer?: string
}

export interface IBotCommandHelp {
    caption: string
    description: string
}

export interface IBot {
    readonly commands: IBotCommand[]
    readonly logger: ILogger
    readonly allUsers: IUser[]
    readonly onlineUsers: IUser[]
    start(logger: ILogger, config: IBotConfig, commandsPath: string, dataPath: string): void
}

export interface IBotCommand {
    getHelp(): IBotCommandHelp
    init(bot: IBot, dataPath: string): void
    isValid(msg: string): boolean
    process(msg: string, answer: IBotMessage): Promise<void>
}

export interface IUser {
    id: string
    username: string
    discriminator: string
    tag: string
}

type MessageColor =
    [number, number, number]
    | number
    | string

export interface IBotMessage {
    readonly user: IUser
    setTextOnly(text: string): IBotMessage
    addField(name: string, value: string): IBotMessage
    addBlankField(): IBotMessage
    setColor(color: MessageColor): IBotMessage
    setDescription(description: string): IBotMessage
    setFooter(text: string, icon?: string): IBotMessage
    setImage(url: string): IBotMessage
    setThumbnail(url: string): IBotMessage
    setTitle(title: string): IBotMessage
    setURL(url: string): IBotMessage
}
      
//bot
import * as discord from 'discord.js'
import { RichEmbed } from 'discord.js'
import * as path from 'path'
import { IBot, IBotCommand, IBotConfig, ILogger } from './api'
import { BotMessage } from './message'

export class Bot implements IBot {
    public get commands(): IBotCommand[] { return this._commands }

    public get logger() { return this._logger }

    public get allUsers() { return this._client ? this._client.users.array().filter((i) => i.id !== '1') : [] }

    public get onlineUsers() { return this.allUsers.filter((i) => i.presence.status !== 'offline') }

    private readonly _commands: IBotCommand[] = []
    private _client: discord.Client
    private _config: IBotConfig
    private _logger: ILogger
    private _botId: string

    public start(logger: ILogger, config: IBotConfig, commandsPath: string, dataPath: string) {
        this._logger = logger
        this._config = config

        this.loadCommands(commandsPath, dataPath)

        if (!this._config.token) { throw new Error('invalid discord token') }

        this._client = new discord.Client()

        this._client.on('ready', () => {
            this._botId = this._client.user.id
            if (this._config.game) {
                this._client.user.setGame(this._config.game)
            }
            if (this._config.username && this._client.user.username !== this._config.username) {
                this._client.user.setUsername(this._config.username)
            }
            this._client.user.setStatus('online')
            this._logger.info('started...')
        })

        this._client.on('message', async (message) => {
            if (message.author.id !== this._botId) {
                const text = message.cleanContent
                this._logger.debug(`[${message.author.tag}] ${text}`)
                for (const cmd of this._commands) {
                    try {
                        if (cmd.isValid(text)) {
                            const answer = new BotMessage(message.author)
                            if (!this._config.idiots || !this._config.idiots.includes(message.author.id)) {
                                await cmd.process(text, answer)
                            } else {
                                if (this._config.idiotAnswer) {
                                    answer.setTextOnly(this._config.idiotAnswer)
                                }
                            }
                            if (answer.isValid()) {
                                message.reply(answer.text || { embed: answer.richText })
                            }
                            break
                        }
                    } catch (ex) {
                        this._logger.error(ex)
                        return
                    }
                }
            }
        })

        this._client.login(this._config.token)
    }

    private loadCommands(commandsPath: string, dataPath: string) {
        if (!this._config.commands || !Array.isArray(this._config.commands) || this._config.commands.length === 0) {
            throw new Error('Invalid / empty commands list')
        }
        for (const cmdName of this._config.commands) {
            const cmdClass = require(`${commandsPath}/${cmdName}`).default
            const command = new cmdClass() as IBotCommand
            command.init(this, path.resolve(`${dataPath}/${cmdName}`))
            this._commands.push(command)
            this._logger.info(`command "${cmdName}" loaded...`)
        }
    }
}

//message
import { RichEmbed } from 'discord.js'
import { IBotMessage, IUser } from './api'

export class BotMessage implements IBotMessage {
    public readonly user: IUser
    public richText?: RichEmbed
    public text?: string

    constructor(user: IUser) {
        this.user = user
    }

    public isValid(): boolean {
        return !!this.text || !!this.richText
    }

    public setTextOnly(text: string): IBotMessage {
        if (this.richText) { throw new Error('one of rich text methods was used') }
        this.text = text
        return this
    }

    public addField(name: string, value: string): IBotMessage {
        this.validateRichText().addField(name, value)
        return this
    }

    public addBlankField(): IBotMessage {
        this.validateRichText().addBlankField()
        return this
    }

    public setColor(color: string | number | [number, number, number]): IBotMessage {
        this.validateRichText().setColor(color)
        return this
    }

    public setDescription(description: string): IBotMessage {
        this.validateRichText().setDescription(description)
        return this
    }

    public setFooter(text: string, icon?: string | undefined): IBotMessage {
        this.validateRichText().setFooter(text, icon)
        return this
    }

    public setImage(url: string): IBotMessage {
        this.validateRichText().setImage(url)
        return this
    }

    public setThumbnail(url: string): IBotMessage {
        this.validateRichText().setThumbnail(url)
        return this
    }

    public setTitle(title: string): IBotMessage {
        this.validateRichText().setTitle(title)
        return this
    }

    public setURL(url: string): IBotMessage {
        this.validateRichText().setURL(url)
        return this
    }

    private validateRichText(): RichEmbed {
        if (this.text) { throw new Error('setTextOnly method was used') }
        if (!this.richText) { this.richText = new RichEmbed() }
        return this.richText
    }
}
