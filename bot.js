const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { spawn } = require('child_process');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

let soxProcess;
let connection;

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === '!entrar') {
        if (message.member.voice.channel) {
            connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            // CONFIGURAÇÃO SOX
            soxProcess = spawn('sox', [
                '-t', 'waveaudio', 'default', // Captura o áudio do microfone padrão
                '-c', '2', // Estéreo
                '-r', '44100', // Frequência de amostragem
                '-e', 'float', // Formato de áudio
                '-b', '32', // Buffer
                '-t', 'wav', '-', // Saída no formato WAV diretamente no pipe (stdout)
            ]);

            const player = createAudioPlayer();
            const resource = createAudioResource(soxProcess.stdout);

            // Marca o momento da captura do áudio
            const startCaptureTime = Date.now();

            /* Quando o áudio começar a ser transmitido, calcula o atraso
            player.on('stateChange', (oldState, newState) => {
                if (newState.status === 'playing') {
                    const startTransmitTime = Date.now();
                    const delay = startTransmitTime - startCaptureTime; // Atraso em milissegundos
                    console.log(`Atraso de transmissão: ${delay} ms`);
                    message.channel.send(`Atraso de transmissão: ${delay} ms`);
                }
            });*/

            player.play(resource);
            connection.subscribe(player);

            player.on('error', error => {
                console.error('Erro no player de áudio:', error);
            });

            soxProcess.on('close', (code) => {
                console.log(`SoX saiu com código ${code}`);
            });

            message.channel.send('Transmitindo áudio do seu microfone com SoX!');
        } else {
            message.channel.send('Você precisa estar em um canal de voz para me chamar!');
        }
    }

    if (message.content.toLowerCase() === '!parar') {
        if (soxProcess) {
            soxProcess.kill(); // Encerra o processo SoX
            if (connection) {
                connection.destroy(); // Desconecta o bot do canal de voz
            }
            message.channel.send('Transmissão de áudio parada e bot desconectado.');
        } else {
            message.channel.send('Nenhuma transmissão está em andamento.');
        }
    }
});

client.login('SUA KEY');
