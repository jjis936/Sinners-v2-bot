// index.js

const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN; // Use environment variable for security
const CLIENT_ID = process.env.CLIENT_ID; // Your bot's Client ID
const GUILD_ID = process.env.GUILD_ID;   // Your server's Guild ID

// Create a new Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Define slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create and send a styled embed message')
    .addStringOption(option => 
      option.setName('title')
        .setDescription('Title of the embed')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('description')
        .setDescription('Description of the embed')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('color')
        .setDescription('Color of the embed (hex or name)')
        .setRequired(false))
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('Channel to send to')
        .setRequired(false)),
  new SlashCommandBuilder()
    .setName('post')
    .setDescription('Send a message or embed to a channel')
    .addStringOption(option => 
      option.setName('content')
        .setDescription('Content of the message')
        .setRequired(true))
    .addBooleanOption(option => 
      option.setName('embed')
        .setDescription('Send as embed')
        .setRequired(false))
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('Channel to send to')
        .setRequired(false))
]
  .map(command => command.toJSON());

// Register commands function
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error(error);
  }
}

// Call registration on start
registerCommands();

// Bot login
client.login(TOKEN);

// Handle command interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // /embed command
  if (interaction.commandName === 'embed') {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color') || '#0099ff';
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = {
      title: title,
      description: description,
      color: color,
    };

    try {
      await targetChannel.send({ embeds: [embed] });
      await interaction.reply({ content: 'Embed sent!', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to send embed.', ephemeral: true });
    }
  }

  // /post command
  if (interaction.commandName === 'post') {
    const content = interaction.options.getString('content');
    const isEmbed = interaction.options.getBoolean('embed') || false;
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    try {
      if (isEmbed) {
        const embed = {
          description: content,
          color: '#00ff00',
        };
        await targetChannel.send({ embeds: [embed] });
      } else {
        await targetChannel.send(content);
      }
      await interaction.reply({ content: 'Message posted!', ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to send message.', ephemeral: true });
    }
  }
});
