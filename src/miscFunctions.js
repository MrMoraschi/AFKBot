module.exports = {
    followOwner,
    notifierSend,
    attackMobs,
    embedConstructor,
    antiAFK,
    lookNearEntity
};

function followOwner(bot, Discord, channel, toDiscord, announcements, channel, defaultMove, GoalFollow, owner, printError)
{
    try {
        bot.pathfinder.setMovements(defaultMove);
        bot.pathfinder.setGoal(new GoalFollow(bot.nearestEntity(entity => entity.username === owner), 2), true)

        const pathFindEmbed =  embedConstructor(bot, Discord, announcements, ``, `Pathfind:`, `Target: Owner`);

        toDiscord(channel, pathFindEmbed);
    } catch(err) {
        printError(`An error occurred when attempting to pathfind:
        Something to check:
        - Make sure you are close to the bot
        - Make sure the bot is not already pathfinding to something
        - Make sure the username in misc.owner in the config.json
          is exactly the same as your username ingame
        The process was not terminated because the error is not critical,
        so you can attempt to resolve the error and
        try again without restart

        ERROR:    
        `, err, false, channel);
    };
};

//Function to send a Windows notif
function notifierSend(notifier, chalk, title, message)
{
    notifier.notify({
        title: `${title}`,
        message: (`${message}`),
        icon: 'projectlogo.jpg'
    }, (err) => {
        if (err) {
            console.log(chalk.redBright(` <STATUS> Couldn't send Windows Notification: `)+err)
        } else {
            console.log(chalk.greenBright(` <STATUS> Sent Windows Notification`))
        };
    });
};

//Function to attack mobs
function attackMobs(bot, printError)
{
    //Look at a mob, and attack it when an entity moves
    bot.on('entityMoved', (entity) => {
        if (entity.type === 'mob' && entity.position.distanceTo(bot.entity.position) < 8 && entity.mobType !== 'Armor Stand') {
            const mobFilter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 8 && e.mobType !== 'Armor Stand'
            
            //Get info about the closest mob
            try {
                global.mob = bot.nearestEntity(mobFilter);
            } catch(err) {
                printError(`
                An error occurred while attempting to get info to attack a mob.
                This error is not critical so the process will not be terminated

                ERROR:`, err, false, channel);
            };

            //Return if mob is undefined
            if (!mob) return
            try {
                global.pos = mob.position
            } catch(err) {
                console.log(`
                An error occurred while attempting to get info to attack a mob.
                This error is not critical so the process will not be terminated

                ERROR:`, err, false);
            };

            bot.lookAt(pos, true, () => {
                bot.setControlState('jump', true);

                setTimeout(() => {
                    bot.attack(mob);
                }, 500);

                bot.setControlState('jump', false);
            });
        };
    });
};

function embedConstructor(bot, Discord, announcements, message, name, value, name2, value2, name3, value3)
{
    const returnedEmbed = new Discord.MessageEmbed()
    .setAuthor(`${bot.username} Status: `, `https://crafatar.com/renders/head/${bot.player.uuid}`)
    .setColor(announcements.discordBot.embedHexColor)
    .setDescription(message)
    .addFields(
        { name: name, value: value},
    )
    .setFooter(`${bot.username}`);

    if (name2 && value2) {
        returnedEmbed.addFields({ name: name2, value: value2 });
    };

    if (name3 && value3) {
        returnedEmbed.addFields({ name: name3, value: value3 });
    };

    return returnedEmbed
};

function antiAFK(bot, timeouts)
{
    //Set the anti afk timeout
    setInterval(() => {
        setTimeout(() => {
            bot.setControlState('jump', false);
        }, 100);
            bot.setControlState('jump', true);
    }, timeouts.antiAFK);
};

//Function to look near an entity
function lookNearEntity(bot)
{
  setInterval(() => {
    const entity = bot.nearestEntity();
        if (entity !== null) {
            if (entity.type === 'player') {
                bot.lookAt(entity.position.offset(0, 1.6, 0));
            } else if (entity.type === 'mob') {
                bot.lookAt(entity.position);
            };
        };
    }, 50);
};