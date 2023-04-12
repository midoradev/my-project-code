const {
  EmbedBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const axios = require("axios");
const fetch = require('node-fetch')

module.exports = {
  name: "crypto",
  description: "Cryptocurrency",
  options: [
    {
      name: "coins",
      description: "Get some crypto coins price",
      type: 1,
      options: [
        {
          name: "id",
          description: "ID for the coins",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "list",
      type: 1,
      description: "List some id crypto coins",
    },
  ],
  cooldown: 5000,
  type: ApplicationCommandType.ChatInput,
  userPerms: ["SendMessages", "ViewChannel", "ReadMessageHistory"],
  botPerms: ["Administrator"],
  run: async (client, interaction) => {
    let option = interaction.options.getSubcommand();
    if (option === "list") {
      let button1 = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("1")
        .setDisabled(true)
        .setEmoji("◀");
      let button2 = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("2")
        .setEmoji("▶");

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `Crypto Coins List ( Page 1/2 )`,
          iconURL: client.user.displayAvatarURL(),
        })
        .addFields(
          { name: "**Bitcoin (BTC)**", value: `ID: \`bitcoin\``, inline: true },
          {
            name: "**Ethereum (ETH)**",
            value: `ID: \`ethereum\``,
            inline: true,
          },
          { name: "**Tether (USDT)**", value: `ID: \`tether\``, inline: true },
          {
            name: "**USD Coin (USDC)**",
            value: `ID: \`usd-coin\``,
            inline: true,
          },
          {
            name: "**Binance Coin (BNB)**",
            value: `ID: \`binancecoin\``,
            inline: true,
          },
          {
            name: "**Binance USD (BUSD)**",
            value: `ID: \`binance-usd\``,
            inline: true,
          },
          { name: "**XRP (XRP)**", value: `ID: \`ripple\``, inline: true },
          { name: "**Carnado (ADA)**", value: `ID: \`cardano\``, inline: true },
          { name: "**Solana (SOL)**", value: `ID: \`solana\``, inline: true },
          {
            name: "**Dogecoin (DOGE)**",
            value: `ID: \`dogecoin\``,
            inline: true,
          },
          {
            name: "**Polkadot (DOT)**",
            value: `ID: \`polkadot\``,
            inline: true,
          },
          {
            name: "**Shiba Inu (SHIB)**",
            value: `ID: \`shiba-inu\``,
            inline: true,
          },
          { name: "**Dai (DAI)**", value: `ID: \`dai\``, inline: true },
          {
            name: "**Lido Staked Ether (STETH)**",
            value: `ID: \`staked-ether\``,
            inline: true,
          },
          {
            name: "**Avalanche (AVAX)**",
            value: `ID: \`avalanche-2\``,
            inline: true,
          },
          { name: "**TRON (TRX)**", value: `ID: \`tron\``, inline: true },
          {
            name: "**Polygon (MATIC)**",
            value: `ID: \`matic-network\``,
            inline: true,
          },
          {
            name: "**Wrapped Bitcoin (WBTC)**",
            value: `ID: \`wrapped-bitcoin\``,
            inline: true,
          },
          {
            name: "**LEO Token (LEO)**",
            value: `ID: \`leo-token\``,
            inline: true,
          },
          { name: "**OKB (OKB)**", value: `ID: \`okb\``, inline: true },
          {
            name: "**Ethereum Classic (ETC)**",
            value: `ID: \`ethereum-classic\``,
            inline: true,
          },
          {
            name: "**Litecoin (LTC)**",
            value: `ID: \`litecoin\``,
            inline: true,
          },
          { name: "**FTX (FTT)**", value: `ID: \`ftx-token\``, inline: true },
          {
            name: "**Chainlink (LINK)**",
            value: `ID: \`chainlink\``,
            inline: true,
          }
        )
        .setFooter({ text: `Buy a Premium to show 100+ Crypto Coins` })
        .setColor("#2F3136");

      const embed2 = new EmbedBuilder()
        .setAuthor({
          name: `Crypto Coins List ( Page 2/2 )`,
          iconURL: client.user.displayAvatarURL(),
        })
        .addFields(
          { name: "**Uniswap (UNI)**", value: `ID: \`uniswap\``, inline: true },
          {
            name: "**NEAR Protocol (NEAR)**",
            value: `ID: \`near\``,
            inline: true,
          },
          {
            name: "**Cosmos Hub (ATOM)**",
            value: `ID: \`cosmos\``,
            inline: true,
          },
          { name: "**Monero (XMR)**", value: `ID: \`monero\``, inline: true },
          { name: "**Stellar (XLM)**", value: `ID: \`stellar\``, inline: true },
          {
            name: "**Bitcoin Cash (BCH)**",
            value: `ID: \`bitcoin-cash\``,
            inline: true,
          },
          { name: "**Flow (FLOW)**", value: `ID: \`flow\``, inline: true },
          {
            name: "**Algorand (ALGO)**",
            value: `ID: \`algorand\``,
            inline: true,
          },
          { name: "**Chain (XCN)**", value: `ID: \`chain-2\``, inline: true },
          { name: "**VeChain (VET)**", value: `ID: \`vechain\``, inline: true },
          {
            name: "**Filecoin (FIL))**",
            value: `ID: \`filecoin\``,
            inline: true,
          },
          {
            name: "**Internet Computer (ICP)**",
            value: `ID: \`internet-computer\``,
            inline: true,
          },
          { name: "**ApeCoin (APE)**", value: `ID: \`apecoin\``, inline: true },
          {
            name: "**Hedera (HBAR)**",
            value: `ID: \`hedera-hashgraph\``,
            inline: true,
          },
          { name: "**EOS (EOS)**", value: `ID: \`eos\``, inline: true },
          {
            name: "**Decentraland (MANA)**",
            value: `ID: \`decentraland\``,
            inline: true,
          },
          {
            name: "**The Sandbox (SAND)**",
            value: `ID: \`the-sandbox\``,
            inline: true,
          },
          {
            name: "**Quant (QNT)**",
            value: `ID: \`quant-network\``,
            inline: true,
          },
          { name: "**Frax (FRAX)**", value: `ID: \`frax\``, inline: true },
          { name: "**Tezos (XTZ)**", value: `ID: \`tezos\``, inline: true },
          {
            name: "**Axie Infinity (AXS)**",
            value: `ID: \`axie-infinity\``,
            inline: true,
          },
          {
            name: "**Elrond (EGLD)**",
            value: `ID: \`elrond-erd-2\``,
            inline: true,
          },
          {
            name: "**Theta Network (THETA)**",
            value: `ID: \`theta-token\``,
            inline: true,
          },
          { name: "**Aave (AAVE)**", value: `ID: \`aave\``, inline: true }
        )
        .setColor("#2F3136")
        .setTimestamp()
        .setFooter({ text: `Buy a Premium to show 100+ Crypto Coins` });

      const actionRow = new ActionRowBuilder().addComponents([
        button1,
        button2,
      ]);

      const msg = await interaction.reply({
        embeds: [embed],
        components: [actionRow],
        fetchReply: true,
      });

      const col = msg.createMessageComponentCollector({
        filter: (i) =>
          i.user.id === interaction.user.id || interaction.author.id,
        time: 10000,
      });
      col.on("collect", async (i) => {
        if (i.customId == "2") {
          i.update({
            embeds: [embed2],
            components: [
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("1")
                  .setEmoji("◀"),
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("2")
                  .setDisabled(true)
                  .setEmoji("▶"),
              ]),
            ],
          });
          col.resetTimer();
        } else if (i.customId === "1") {
          i.update({
            embeds: [embed],
            components: [
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("1")
                  .setDisabled(true)
                  .setEmoji("◀"),
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("2")
                  .setEmoji("▶"),
              ]),
            ],
          });
          col.resetTimer();
        }
      });
      col.on("end", () => {
        msg.edit({
          components: [],
        });
      });
    } else if (option === "coins") {
      let id = interaction.options.getString("id");

      axios
        .get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}`
        )
        .then((res) => {
          // If we got a valid response
          if (
            res.data &&
            res.data[0].current_price &&
            res.data[0].price_change_percentage_24h
          ) {
            let currentPrice = res.data[0].current_price || 0;
            let priceChange = res.data[0].price_change_percentage_24h || 0;
            let symbol = res.data[0].symbol || 0;
            let symbol1 = symbol.toUpperCase();
            let icon = res.image || client.user.displayAvatarURL();
            let name = res.data[0].name || 0;
            let high = res.data[0].high_24h || 0;
            let low = res.data[0].low_24h || 0;
            let rank = res.data[0].market_cap_rank || "N/A";
            let marketCap = res.data[0].market_cap || 0;
            let circulatingSuppy = res.data[0].circulating_supply || 0;
            let id_coin = res.data[0].id || 0;
            let ath = res.data[0].ath || 0;
            let atl = res.data[0].atl || 0;
            let volume = res.data[0].total_volume || 0;

            const cryptoList = `https://www.coingecko.com/`;
            const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;
            let reload = new ButtonBuilder()
              .setLabel("Invite Me")
              .setURL(inviteLink)
              .setStyle(ButtonStyle.Primary)
              .setCustomId('reload')
              .setEmoji("🔄️");
            let button = new ButtonBuilder()
              .setLabel("Get more info about Crypto")
              .setURL(cryptoList)
              .setStyle(ButtonStyle.Link)
              .setEmoji("📜");
            let button1 = new ButtonBuilder()
              .setLabel("Invite Me")
              .setURL(inviteLink)
              .setStyle(ButtonStyle.Link)
              .setEmoji("➕");

            const embed = new EmbedBuilder()
              .setAuthor({
                name: `Current price of ${name} (${symbol1})`,
                iconURL: client.user.displayAvatarURL(),
                url: `https://www.coingecko.com/en/coins/${id_coin}`,
              })
              .setTitle(`Rank: #${rank}`)
              .addFields(
                { name: "**Price**", value: `$${currentPrice}`, inline: true },
                {
                  name: "**Price Change (24h)**",
                  value: `${priceChange}%`,
                  inline: true,
                },
                {
                  name: "**Circulating Supply**",
                  value: `${circulatingSuppy || "?"}`,
                  inline: true,
                },
                {
                  name: "**High (24h)**",
                  value: `$${high || "?"}`,
                  inline: true,
                },
                {
                  name: "**Low (24h)**",
                  value: `$${low || "?"}`,
                  inline: true,
                },
                {
                  name: "**Market Cap**",
                  value: `$${marketCap || "?"}`,
                  inline: true,
                },
                {
                  name: "**All Time High (ATH)**",
                  value: `$${ath || "?"}`,
                  inline: true,
                },
                {
                  name: "**All Time Low (ATL)**",
                  value: `$${atl || "?"}`,
                  inline: true,
                },
                {
                  name: "**Total Volume**",
                  value: `$${volume || "?"}`,
                  inline: true,
                }
              )
              .setColor("#2F3136")
              .setThumbnail(icon)
              .setTimestamp()
              .setFooter({
                text: `Powered By: CoinGecko.com APIs`,
                iconURL: `https://media.discordapp.net/attachments/945579550769811457/1010574553426186310/unknown.png?width=606&height=606`,
              });
            const actionRow = new ActionRowBuilder().addComponents([
              reload,
              button1,
              button,
            ]);
            return interaction.reply({
              embeds: [embed],
              components: [actionRow]
            });
          } else {
            console.log(`🤔 | Could not load player count data!`);
          }
        })
        .catch((e) => {
          console.log("❌ | Error at api.coingecko.com data:", e),
            interaction.reply({
              content: `Hey ${interaction.user}, that id dont have in the API or my list!\nCheck out my list by type: \`/crypto list\`\n\n**If you use the correct id but \`${id}\` is not showing up, please use the command again or contact [midora#3234](<https://discord.com/users/89783807192244666>)**`,
              ephemeral: true,
            });
        });
    }
  },
};
