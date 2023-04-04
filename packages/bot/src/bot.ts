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
import { UserError } from './errors/user-error.js';

@injectable()
export class Bot {
  private applicationId: string;
  private token: string;
  private client: Client;

  private commands: SlashCommandBuilder[] = [];

  private commandInteractionHandlers: Record<
    string,
    (interaction: ChatInputCommandInteraction) => Promise<void> | void
  > = {};

  private buttonInteractionHandlers: Record<
    string,
    (interaction: ButtonInteraction) => Promise<void> | void
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
                case 'string':
                  command.addStringOption((option) => {
                    option
                      .setName(metadata.name)
                      .setDescription(metadata.description)
                      .setRequired(metadata.required ?? false);

                    if (metadata.choices !== undefined) {
                      option.setChoices(...metadata.choices);
                    }

                    return option;
                  });
                  break;
                case 'number':
                  command.addNumberOption((option) => {
                    option
                      .setName(metadata.name)
                      .setDescription(metadata.description)
                      .setRequired(metadata.required ?? false);

                    if (metadata.choices !== undefined) {
                      option.setChoices(...metadata.choices);
                    }

                    return option;
                  });
                  break;

                case 'boolean':
                  command.addBooleanOption((option) =>
                    option
                      .setName(metadata.name)
                      .setDescription(metadata.description)
                      .setRequired(metadata.required ?? false),
                  );
                  break;

                case 'channel':
                  command.addChannelOption((option) => {
                    option
                      .setName(metadata.name)
                      .setDescription(metadata.description)
                      .setRequired(metadata.required ?? false);

                    if (metadata.channelTypes !== undefined) {
                      option.addChannelTypes(...metadata.channelTypes);
                    }

                    return option;
                  });
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
  ): (interaction: ChatInputCommandInteraction) => Promise<void> | void;

  private getInteractionHandler(
    buttonMetadata: ButtonMetadata,
    controller: unknown,
    method: string,
  ): (interaction: ButtonInteraction) => Promise<void> | void;

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
              case 'string':
                args[metadata.parameterIndex] =
                  interaction.options.getString(
                    metadata.name,
                    metadata.required,
                  ) ?? undefined;
                break;
              case 'number':
                args[metadata.parameterIndex] =
                  interaction.options.getNumber(
                    metadata.name,
                    metadata.required,
                  ) ?? undefined;
                break;
              case 'boolean':
                args[metadata.parameterIndex] =
                  interaction.options.getBoolean(
                    metadata.name,
                    metadata.required,
                  ) ?? undefined;
                break;
              case 'channel':
                args[metadata.parameterIndex] =
                  interaction.options.getChannel(
                    metadata.name,
                    metadata.required,
                    metadata.channelTypes,
                  ) ?? undefined;
            }
          }
        }
      }

      (controller[method] as (...args: unknown[]) => Promise<void> | void)(
        ...args,
      );
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

    this.client.on('interactionCreate', async (interaction) => {
      let showError: ((message: string) => Promise<void> | void) | undefined =
        undefined;

      try {
        if (interaction.isChatInputCommand()) {
          showError = async (message: string) => {
            await interaction.reply({
              content: message,
              ephemeral: true,
            });
          };

          const command =
            this.commandInteractionHandlers[interaction.commandName];
          await command(interaction);
        }

        if (interaction.isButton()) {
          showError = async (message: string) => {
            await interaction.reply({ content: message, ephemeral: true });
          };

          const command = this.buttonInteractionHandlers[interaction.customId];
          await command(interaction);
        }
      } catch (e) {
        if (showError !== undefined) {
          if (e instanceof UserError) {
            await showError(e.message);
          } else {
            await showError('Internal error');
          }

          if (e instanceof Error) {
            console.log(e);
          }
        }
      }
    });

    console.log(`${this.commands.length} commands has registered.`);
  }
}

export const bindBot = async () =>
  new AsyncContainerModule(async (bind) => {
    bind(Bot).toSelf();
  });
