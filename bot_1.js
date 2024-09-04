const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

// Cria uma nova instância do cliente do Discord com as intents necessárias
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,  // Intents necessárias para interações de voz
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    // Ignora mensagens de outros bots
    if (message.author.bot) return;

    // Verifica se a mensagem é "!entrar"
    if (message.content.toLowerCase() === '!entrar') {
        // Verifica se o usuário está em um canal de voz
        if (message.member.voice.channel) {
            // Entra no canal de voz
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            message.channel.send('Entrei no canal de voz!');
        } else {
            message.channel.send('Você precisa estar em um canal de voz para me chamar!');
        }
    }
});

client.login('SUA KEY');