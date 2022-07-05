import { FieldValue } from '@google-cloud/firestore';
import { admin, adminInit } from '../config.js';
import axios from 'axios';
adminInit();
/**
 * Read User from the database
 *
 * @param {string} user_id The Ory user id used as the document id of the user document in the database.
 *
 */
export async function readUserData(userId) {
    // get the user document from the database
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    // print the user document
    console.log(userDoc);
}
/**
 * Checking if a user document with the id exists, then creates a user document in the database.
 *
 * @param {string} userId The Ory user id used as the document id of the user document in the database.
 * @returns {Promise<boolean>} Returns true if the user document was created successfully.
 */
export async function writeUserData(userId, session_id, cookie) {
    // get the user document from the database
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    // read data from the database user document
    const userDocData = userDoc.data();
    const meta_data = 'meta data';
    // check if the user exists / the user document has any data
    if (userDocData === undefined) {
        // To Do: Remove this line later
        // create a new user document in the database
        await admin
            .firestore()
            .collection('users')
            .doc(userId)
            .set({ Device_Name: [session_id, cookie, meta_data] });
        // return true if the user document was created successfully
        return true;
    }
    else {
        // return error if the user document already exists
        throw new Error('User already exists');
    }
}
/**
 * Delete a user from the database
 * @param {string} userId The Ory user id used as the document id of the user document in the database.
 * @returns {Promise<boolean>} Returns true if the user document was deleted successfully.
 */
export async function deleteUserData(userId) {
    // get the user document from the database
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    // print the user document
    console.log('userDoc:', userDoc);
    // read data from the database user document
    const userDocData = userDoc.data();
    // If there is a user document with the user id
    if (userDocData !== undefined) {
        // delete the user document
        await admin.firestore().collection('users').doc(userId).delete();
        // return true if the user document was deleted successfully
        return true;
    }
    else {
        // return error if the user document does not exist
        throw new Error('User does not exist');
    }
}
/**
 * Remember Device
 * @param {string} userId The Ory user id used as the document id of the user document in the database.
 * @param {string} sessionId The session to remember.
 * @param {string} deviceName The device name to associated with the session.
 *
 * @returns {Promise<boolean>} Returns true if the user document was updated successfully.
 * @returns {Promise<boolean>} Returns nothing if the user document was created successfully.
 */
export async function rememberDevice(userId, sessionId, cookie) {
    // get the user document from the database
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    //print the user document
    console.log('userDoc:', userDoc);
    // read data from the database user document
    const userDocData = userDoc.data();
    const meta_data = 'meta data';
    if (userDocData !== undefined) {
        // update the user document
        await admin
            .firestore()
            .collection('users')
            .doc(userId)
            .update({
            Device_Name2: FieldValue.arrayUnion(sessionId, cookie, meta_data)
        });
        return true;
    }
    else {
        // create a new user document in the database
        await admin
            .firestore()
            .collection('users')
            .doc(userId)
            .set({ Device_Name2: [sessionId] });
    }
}
/**
 * Revoke Session
 * @param {string} user_id The Ory user id used as the document id of the user document in the database.
 * @param {string} session_id The session to revoke.
 * @param {string} cookie The cookie of the current session.
 * @returns {Promise<boolean>} Returns true if the session was removed from the database.
 */
export async function revoke_session(user_id, session_id, cookie) {
    // get the user document from the database
    const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(user_id)
        .get();
    // read data from the database user document
    const userDocData = userDoc.data();
    // Revoke the session at ory cloud
    try {
        const response = await axios.delete('http://hardcore-ramanujan-qv58dlw7k3.projects.oryapis.com/sessions/' +
            session_id, {
            headers: {
                Cookie: cookie
            }
        });
        console.log(response.status);
    }
    catch (err) {
        // console.log(err);
        console.log('Error status:' + err.response.status);
    }
    // If there is a user document with the user id
    if (userDocData !== undefined) {
        // delete the field value
        await admin
            .firestore()
            .collection('users')
            .doc(user_id)
            .update({ Device_Name: FieldValue.arrayRemove(session_id) });
        return true;
    }
    else {
        // return error if the user document does not exist
        throw new Error('User does not exist');
    }
}
/**
 * List Devices
 * @param {string} user_id The Ory user id.
 * @returns {Promise<string[]>} Returns a list of devices.
 */
export async function list_devices(user_id) {
    // get the user document from the database
    const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(user_id)
        .get();
    if (userDoc.data() !== undefined) {
        return userDoc.data();
    }
    else {
        // return error if the user document does not exist
        throw new Error('User does not exist');
    }
}
/**
 * Failed Logins
 */
export async function failed_logins(user_id) {
    // get the user document from the database
    const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(user_id)
        .get();
    if (userDoc.data() !== undefined) {
        await admin
            .firestore()
            .collection('users')
            .doc(user_id)
            .update({ Failed_Logins: FieldValue.increment(1) });
        await admin
            .firestore()
            .collection('data')
            .doc(user_id)
            .update({ Failed_Logins: FieldValue.increment(1) });
        return true;
    }
    else {
        // return error if the user document does not exist
        throw new Error('User does not exist');
    }
}
/**
 * Add user to data collection
 */
export async function add_user_data(user_id) {
    // get the user document from the database
    const userDoc = await admin.firestore().collection('data').doc(user_id).get();
    if (userDoc.data() == undefined) {
        await admin.firestore().collection('data').doc(user_id).set({
            Failed_Logins: 0,
            Last_Login: new Date(),
            Password_Resets: 0,
            MAUs: 0
        });
        await admin
            .firestore()
            .collection('General')
            .doc('New_Signups')
            .set({ New_Signups: FieldValue.increment(1) });
        return true;
    }
    else {
        // return error if the user document does not exist
        throw new Error('User already exists');
    }
}
/**
 * Password Resets
 */
export async function password_reset(user_id) {
    // get the user document from the database
    const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(user_id)
        .get();
    if (userDoc.data() !== undefined) {
        await admin
            .firestore()
            .collection('users')
            .doc(user_id)
            .update({ Password_Resets: FieldValue.increment(1) });
        await admin
            .firestore()
            .collection('data')
            .doc(user_id)
            .update({ Password_Resets: FieldValue.increment(1) });
        return true;
    }
    else {
        // return error if the user document does not exist
        throw new Error('User does not exist');
    }
}
/**
 * Delete User Data
 */
export async function delete_user_data(user_id) {
    // get the user document from the database
    const userDoc = await admin.firestore().collection('data').doc(user_id).get();
    if (userDoc.data() !== undefined) {
        await admin.firestore().collection('data').doc(user_id).delete();
        return true;
    }
    else {
        // return error if the user document does not exist
        throw new Error('User does not exist');
    }
}
