const Command = require("../../structures/Command.js");
const { MessageActionRow, MessageSelectMenu } = require("discord.js");

module.exports = class Help extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: {
        content: "Shows the help menu",
        examples: ["help"],
        usage: "help",
      },
      category: "info",
      aliases: ["h"],
      cooldown: 3,
      args: false,
      player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: null,
      },
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      },
      slashCommand: true,
      options: [
        {
          name: "command",
          description: "The command you want to get info on",
          type: 3,
          required: false,
        },
      ],
    });
  }

  async run(client, ctx, args) {
    const embed = client.embed();
    const prefix = await client.db.getPrefix(ctx.guild.id);

    const commands = this.client.commands.filter(
      (cmd) => cmd.category !== "dev"
    );
    const categories = commands
      .map((cmd) => cmd.category)
      .filter((value, index, self) => self.indexOf(value) === index);

    // If no specific command is provided
    if (!args[0]) {
      // Create a dropdown (select menu) for categories
      const categoryOptions = categories.map((category) => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: category,
      }));

      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("help-menu")
          .setPlaceholder("Choisissez une catégorie")
          .addOptions(categoryOptions)
      );

      const helpEmbed = embed
        .setColor(this.client.color.main)
        .setTitle("Menu d'Aide")
        .setDescription(
          `Salut ! Je suis ${this.client.user.username}, un bot de musique. Utilisez \`${prefix.prefix}help <commande>\` pour obtenir plus d'infos sur une commande.`
        )
        .setFooter({
          text: `Utilisez ${prefix.prefix}help <commande> pour plus d'infos.`,
        });

      await ctx.sendMessage({ embeds: [helpEmbed], components: [row] });

      // Listen to the interaction for dropdown selection
      const filter = (interaction) =>
        interaction.customId === "help-menu" && interaction.user.id === ctx.author.id;

      const collector = ctx.channel.createMessageComponentCollector({
        filter,
        time: 60000, // 60 seconds
      });

      collector.on("collect", async (interaction) => {
        const selectedCategory = interaction.values[0];
        const selectedCommands = commands
          .filter((cmd) => cmd.category === selectedCategory)
          .map((cmd) => `\`${cmd.name}\``)
          .join("\n");

        const categoryEmbed = embed
          .setColor(this.client.color.main)
          .setTitle(`Catégorie: ${selectedCategory}`)
          .setDescription(selectedCommands);

        await interaction.update({ embeds: [categoryEmbed], components: [row] });
      });

      collector.on("end", async () => {
        // Optionally edit the message to disable dropdown after time ends
      });

    } else {
      // Show specific command details if provided
      const command = this.client.commands.get(args[0].toLowerCase());
      if (!command)
        return await ctx.sendMessage({
          embeds: [
            client
              .embed()
              .setColor(client.color.red)
              .setDescription(`Commande \`${args[0]}\` non trouvée.`),
          ],
        });

      const helpEmbed = embed
        .setColor(this.client.color.main)
        .setTitle(`Aide - ${command.name}`)
        .setDescription(`**Description:** ${command.description.content}
**Usage:** ${prefix.prefix}${command.description.usage}
**Exemples:** ${command.description.examples
        .map((example) => `${prefix.prefix}${example}`)
        .join(", ")}
**Alias:** ${command.aliases.map((alias) => `\`${alias}\``).join(", ")}
**Catégorie:** ${command.category}
**Cooldown:** ${command.cooldown} secondes
**Permissions utilisateur:** ${command.permissions.user.length > 0
          ? command.permissions.user.map((perm) => `\`${perm}\``).join(", ")
          : "Aucune"}
**Permissions bot:** ${command.permissions.client
          .map((perm) => `\`${perm}\``)
          .join(", ")}
**Slash Commande:** ${command.slashCommand ? "Oui" : "Non"}`);

      ctx.sendMessage({ embeds: [helpEmbed] });
    }
  }
};
