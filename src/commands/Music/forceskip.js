const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "forceskip",
    aliases: ["fs"],
    category: "Music",
    description: "To force skip the current playing song.",
    args: false,
    usage: "",
    permission: [],
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {

        const player = client.manager.players.get(message.guild.id);
        if (!player.current) {
          let thing = new MessageEmbed()
            .setColor("RED")
            .setDescription("There is no music playing.");
          return message.reply({ embeds: [thing] });
        }
        const song = player.current;

        player.player.stopTrack();

        const emojiskip = message.client.emoji.skip;

        let thing = new MessageEmbed()
            .setDescription(`${emojiskip} Skipped [${song.title}](${song.uri})`)
            .setColor(client.embedColor)
        return message.reply({ embeds: [thing] })

    }
};