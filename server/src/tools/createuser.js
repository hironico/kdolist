const logger = require('../logger');

const readline = require('readline');
const bcrypt = require('bcrypt');
const { User } = require('../model/model');
const { addSocialAccount } = require('../controller/usercontroller');

// Read user information from standard input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function createUser () {
rl.question('Enter first name and last name: ', (names) => {
    rl.question('Enter login name: ', (username) => {
        rl.question('Enter email: ', (email) => {
            rl.question('Enter password: ', async (password) => {
                const hashedPass = await bcrypt.hash(password, 10);
                firstLast = names.split(' ');

                const user = await User.findOne({
                    where: {
                        username: username
                    }
                });

                if (user) {
                    const updates = {
                        firstname: firstLast[0],
                        lastname: firstLast[1],
                        email: email,
                        password: hashedPass
                    }
                    user.update(updates)
                        .then(() => {
                            logger.info('User updated successfully.')
                            rl.close();
                            process.exit(0);
                        })
                        .catch(error => {                            
                            logger.error(`Cannot update user: ${error}`);
                            rl.close();
                            process.exit(-2);
                        });
                } else {
                    User.create({
                        firstname: firstLast[0],
                        lastname: firstLast[1],
                        username: username,
                        email: email,
                        password: hashedPass
                    })
                        .then((user) => {
                            addSocialAccount(user.id, 'LOGIN', user.id)
                            .then(() => {
                                logger.info('User created successfully!');
                                rl.close();
                                process.exit(0)
                            });                            
                        })
                        .catch(error => {
                            logger.error('Error creating user:', error);
                            rl.close();
                            process.exit(-1)
                        })
                }
            });
        });
    })
})
}

(async () => createUser())();