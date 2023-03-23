import 'reflect-metadata';
import {
  injectable,
  AsyncContainerModule,
  inject,
  multiInject,
} from 'inversify';
import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  Interaction,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';
import { BotConfig } from './config.js';
import { ControllerSymbol } from './module/controller.js';
import { CommandMetadata, CommandSymbol } from './interaction/command.js';
import { OptionMetadata, OptionSymbol } from './interaction/option.js';
import {
  InteractionMetadata,
  InteractionSymbol,
} from './interaction/interaction.js';
import { ButtonMetadata, ButtonSymbol } from './interaction/button.js';

@injectable()
export class Bot {
  private applicationId: string;
  private token: string;
  private client: Client;

  private commands: SlashCommandBuilder[] = [];

  private commandInteractionHandlers: Record<
    string,
    (interaction: ChatInputCommandInteraction) => void
  > = {};

  private buttonInteractionHandlers: Record<
    string,
    (interaction: ButtonInteraction) => void
  > = {};

  constructor(
    @inject(BotConfig) config: BotConfig,
    @multiInject(ControllerSymbol) controllers: Record<string, unknown>[],
  ) {
    this.applicationId = config.applicationId;
    this.token = config.token;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
      ],
    });

    for (const controller of controllers) {
      const prototype = controller.constructor.prototype;
      const methods = Object.getOwnPropertyNames(prototype).filter(
        (name) =>
          typeof prototype[name] === 'function' &&
          prototype[name] !== controller.constructor,
      );

      for (const method of methods) {
        const commandMetadata: CommandMetadata | undefined =
          Reflect.getMetadata(CommandSymbol, prototype, method);

        const buttonMetadata: ButtonMetadata | undefined = Reflect.getMetadata(
          ButtonSymbol,
          prototype,
          method,
        );
        // 커맨드인 경우
        if (commandMetadata !== undefined) {
          const optionMetadata: OptionMetadata[] | undefined =
            Reflect.getMetadata(OptionSymbol, prototype, method);

          // 프로퍼티 설정
          const command = new SlashCommandBuilder().setName(
            commandMetadata.name,
          );

          if (commandMetadata.description !== undefined) {
            command.setDescription(commandMetadata.description);
          }

          // 옵션 추가
          if (optionMetadata !== undefined) {
            for (const metadata of optionMetadata.sort(
              (a, b) => a.parameterIndex - b.parameterIndex,
            )) {
              switch (metadata.type) {
                case String:
                  command.addStringOption((option) =>
                    option
                      .setName(metadata.name)
                      .setDescription(metadata.description)
                      .setRequired(metadata.required ?? false),
                  );
                  break;
                case Number:
                  command.addNumberOption((option) =>
                    option
                      .setName(metadata.name)
                      .setDescription(metadata.description)
                      .setRequired(metadata.required ?? false),
                  );
                  break;
              }
            }
          }

          // 커맨드 추가
          this.commands.push(command);
          this.commandInteractionHandlers[commandMetadata.name] =
            this.getInteractionHandler(
              commandMetadata,
              controller,
              method,
              optionMetadata,
            );
        }

        // 버튼인 경우
        if (buttonMetadata !== undefined) {
          this.buttonInteractionHandlers[buttonMetadata.id] =
            this.getInteractionHandler(buttonMetadata, controller, method);
        }
      }
    }
  }

  private getInteractionHandler(
    commandMetadata: CommandMetadata,
    controller: unknown,
    method: string,
    optionMetadata?: OptionMetadata[],
  ): (interaction: ChatInputCommandInteraction) => void;

  private getInteractionHandler(
    buttonMetadata: ButtonMetadata,
    controller: unknown,
    method: string,
  ): (interaction: ButtonInteraction) => void;

  private getInteractionHandler(
    _metadata: unknown,
    controller: Record<string, unknown>,
    method: string,
    optionMetadata?: OptionMetadata[],
  ) {
    const prototype = controller.constructor.prototype;
    return (interaction: Interaction) => {
      const args: unknown[] = [];
      // Interaction 파라미터
      const interactionMetadata: InteractionMetadata | undefined =
        Reflect.getMetadata(InteractionSymbol, prototype, method);

      if (interactionMetadata !== undefined) {
        args[interactionMetadata] = interaction;
      }

      if (interaction.isChatInputCommand()) {
        if (optionMetadata !== undefined) {
          for (const metadata of optionMetadata) {
            switch (metadata.type) {
              case String:
                args[metadata.parameterIndex] =
                  interaction.options.getString(
                    metadata.name,
                    metadata.required,
                  ) ?? undefined;
                break;
              case Number:
                args[metadata.parameterIndex] =
                  interaction.options.getNumber(
                    metadata.name,
                    metadata.required,
                  ) ?? undefined;
                break;
            }
          }
        }
      }

      (controller[method] as (...args: unknown[]) => void)(...args);
    };
  }

  async start() {
    await this.client.login(this.token);
    console.log('Bot is now online.');

    const guilds = await this.client.guilds.fetch();

    for (const [guildId] of guilds) {
      this.client.rest.put(
        Routes.applicationGuildCommands(this.applicationId, guildId),
        { body: this.commands.map((command) => command.toJSON()) },
      );
    }

    this.client.on('interactionCreate', (interaction) => {
      if (interaction.isChatInputCommand()) {
        const command =
          this.commandInteractionHandlers[interaction.commandName];
        command(interaction);
      }

      if (interaction.isButton()) {
        const command = this.buttonInteractionHandlers[interaction.customId];
        command(interaction);
      }
    });

    console.log(`${this.commands.length} commands has registered.`);
  }
}

export const bindBot = async () =>
  new AsyncContainerModule(async (bind) => {
    bind(Bot).toSelf();
  });
