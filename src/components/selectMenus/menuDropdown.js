module.exports = {
    data: {
        name: 'menu'
    },
    async execute(interaction, client) {
        await interaction.reply({
            content: `You select: ${interaction.values[0]}`
        })
    }
}