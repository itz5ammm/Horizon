const { MessageEmbed } = require("discord.js");
const db = require("quick.db");

module.exports = {
  name: "warn",
  aliases: ["report"],
  category: "Moderation",
  description: "reports a user of the guild",
  usage: "[name | nickname | mention | ID] <reason> (optional)",
  execute: async (client, message, args) => {
    if (!message.member.hasPermission("MANAGE_MESSAGES"))
      return message.channel.send(
        "**You Dont Have The Permissions To Report Someone! - [MANAGE_MESSAGES]**"
      );
    if (!args[0]) return message.channel.send("**Please Enter A User!**");

    let target =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(
        r => r.user.username.toLowerCase() === args[0].toLocaleLowerCase()
      ) ||
      message.guild.members.cache.find(
        ro => ro.displayName.toLowerCase() === args[0].toLocaleLowerCase()
      );
    if (!target) return message.channel.send("**Please Enter A User!**");
    if (target.id === message.member.id)
      return message.channel.send("**Cannot Warn Yourself!**");

    let reason = args.slice(1).join(" ");

    if (
      target.roles.highest.comparePositionTo(message.guild.me.roles.highest) >=
      0
    )
      return message.channel.send("**Cannot Warn This User!**");
    if (target.hasPermission("ADMINISTRATOR") || target.user.bot)
      return message.channel.send("**Cannot Warn This User!**");
    try {
      const sembed2 = new MessageEmbed()
        .setColor("RED")
        .setDescription(
          `**You Have Been Warned In ${message.guild.name} for - ${reason ||
            "No Reason!"}**`
        )
        .setFooter(message.guild.name, message.guild.iconURL());
      target.send(sembed2);
    } catch {}
    if (reason) {
      const embed = new MessageEmbed()
        .setColor("GREEN")
        .setAuthor(`${message.guild.name}`, message.guild.iconURL())
        .setDescription(`***${target.user.tag} Was Warned -***  ${reason}`);
      message.channel.send(embed);
    } else {
      const embed = new MessageEmbed()
        .setColor("GREEN")
        .setAuthor(`${message.guild.name}`, message.guild.iconURL())
        .setDescription(`**${target.displayName} Has Been Warned!**`);
      message.channel.send(embed);
    }

    let channel = db.fetch(`modlog_${message.guild.id}`);
    if (!channel) return;

    const sembed = new MessageEmbed()
      .setColor("00FFFF")
      .setTimestamp()
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setFooter(message.guild.name, message.guild.iconURL())
      .setAuthor(`${message.guild.name} Modlogs`, message.guild.iconURL())
      .addField("**Moderation**", "report")
      .addField("**User Reported**", `${target}`)
      .addField("**User ID**", `${target.user.id}`)
      .addField("**Reported By**", `${message.member}`)
      .addField("**Reported in**", `${message.channel}`)
      .addField("**Reason**", `**${reason || "No Reason"}**`)
      .addField("**Date**", message.createdAt.toLocaleString());

    var sChannel = message.guild.channels.cache.get(channel);
    if (!sChannel) return;
    sChannel.send(sembed);
  }
};
