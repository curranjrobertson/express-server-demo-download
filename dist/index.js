/**
 * Instantiating environment
 */
import express from 'express';
import { checkSession } from './utilities/router.js';
import { readUserData, writeUserData, deleteUserData, rememberDevice, revoke_session, list_devices, failed_logins, password_reset } from './utilities/database.js';
import dotenv from 'dotenv';
dotenv.config();
/**
 * Defining the port from the .env file
 */
const port = process.env.PORT || 3000;
/**
 * Instantiating express app.
 */
const app = express();
/**
 * Checking cookies on the home page
 */
app.use(checkSession);
/**
 * Listening for traffic
 */
app.listen(port, () => {
    console.log(`rest api listening on port ${port}`);
});
console.log();
/**
 * home page
 */
app.get('/', (req, res) => {
    res.status(200).json({
        page: 'home, authenticated'
    });
});
/**
 * Read User
 */
app.get('/my-profile', async (req, res) => {
    console.log('get my profile');
    const user_id = req.body.ory.identity.id;
    console.log('user_id is', user_id);
    const coockie = req.body.ory.cookie;
    console.log('cookie is');
    console.log(coockie);
    const session_id = req.body.ory.id;
    console.log('session_id is', session_id);
    const userDocument = await readUserData(user_id);
    console.log(userDocument);
    res.json({ ory: req.body.ory });
});
/**
 * Create a new user in the database
 */
app.get('/new-user', async (req, res) => {
    try {
        // get the user id from ory
        const user_id = req.body.ory.identity.id;
        // get the session id from ory
        const session_id = req.body.ory.id;
        // get the cookie from ory
        const cookie = req.body.ory.cookie;
        console.log('cookie is: ', cookie);
        // get user document from the function writeUserData
        const userDocument = await writeUserData(user_id, session_id, cookie);
        // if there is already a user with the user id from ory
        if (userDocument !== true) {
            // throw error
            throw new Error(`Unexpected error when creating user document`);
        }
        return (res
            // return a success message if a user has been created
            .status(200)
            .json({ message: 'User document created successfully' }));
    }
    catch (err) {
        // return an error message if there is an error
        return res.status(405).json({ message: err.message });
    }
});
/**
 * Delete user
 */
app.get('/delete-user', async (req, res) => {
    try {
        // get the user id from ory
        const user_id = req.body.ory.identity.id;
        // get user document from the function deleteUserData
        const userDocument = await deleteUserData(user_id);
        // if there is no user with the user id from ory
        if (userDocument !== true) {
            throw new Error(`Unexpected error when deleting user document`);
        }
        return (res
            .status(200)
            // return a success message if a user has been deleted
            .json({ message: 'User document deleted successfully' }));
    }
    catch (err) {
        // return an error message if there is an error
        return res.status(405).json({ message: err.message });
    }
});
/**
 * Remember Device
 */
app.get('/remember-device', async (req, res) => {
    try {
        // get the user id from ory
        const user_id = req.body.ory.identity.id;
        // get the session id from ory
        const session_id = req.body.ory.id;
        // get cookie from ory
        const cookie = req.body.ory.cookie;
        console.log(cookie);
        // get user document from the function rememberDevice
        const userDocument = await rememberDevice(user_id, session_id, cookie);
        // if there is no user with the user id from ory
        if (userDocument !== true) {
            // return message that a new user was created because there was no user in the database with the ory id
            throw new Error(`User document not found. User has been created.`);
        }
        return (res
            .status(200)
            // return a success message if a device has been added to the user document
            .json({ message: 'Device remembered successfully' }));
    }
    catch (err) {
        // return an error message if there is an error
        return res.status(405).json({ message: err.message });
    }
});
/**
 * Revoke Session
 */
app.get('/revoke-session', async (req, res) => {
    try {
        // get the user id from ory
        const user_id = req.body.ory.identity.id;
        console.log('user_id is', user_id);
        const doc = req.body.ory;
        console.log('doc is: ', doc);
        // get the provided session id
        const session_id = '2c9030e5-41ac-4775-ac06-0ae8fc398296';
        // get cookie from ory
        const cookie = req.body.ory.cookie;
        console.log(cookie);
        // get user document from the function revokeSession
        const userDocument = await revoke_session(user_id, session_id, cookie);
        console.log(userDocument);
        // if there is no user with the user id from ory
        if (userDocument !== true) {
            //return error message
            throw new Error(`Unexpected error when revoking session`);
        }
        // else return success message
        return res.status(200).json({ message: 'Session revoked successfully' });
    }
    catch (err) {
        // return an error message if there is an error
        return res.status(405).json({ message: err.message });
    }
});
/**
 * List Devices
 */
app.get('/list-devices', async (req, res) => {
    try {
        // get the user id from ory
        const user_id = req.body.ory.identity.id;
        console.log('user_id is', user_id);
        //get the device list from the list_devices function
        const userDocument = await list_devices(user_id);
        console.log(userDocument);
        return res.status(200).json({ message: 'List of devices' });
    }
    catch (err) {
        // return error message if there is an error
        return res.status(405).json({ message: err.message });
    }
});
/**
 * Failed Logins
 */
app.get('/failed-login', async (req, res) => {
    try {
        //
        const user_id = req.body.ory.identity.id;
        const login = await failed_logins(user_id);
        if (login) {
            return res
                .status(200)
                .json({ message: 'Failed login added to database successfully' });
        }
        else {
            return res
                .status(405)
                .json({ message: 'Failed login not added to database' });
        }
    }
    catch (err) {
        // return error message if there is an error
        return res.status(405).json({ message: err.message });
    }
});
/**
 * Password reset
 */
app.get('/password-reset', async (req, res) => {
    try {
        //
        const user_id = req.body.ory.identity.id;
        const login = await password_reset(user_id);
        if (login) {
            return res
                .status(200)
                .json({ message: 'Password Reset added to database successfully' });
        }
        else {
            return res
                .status(405)
                .json({ message: 'Password Reset not added to database' });
        }
    }
    catch (err) {
        // return error message if there is an error
        return res.status(405).json({ message: err.message });
    }
});
