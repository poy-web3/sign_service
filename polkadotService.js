import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";

const wsProvider = new WsProvider("ws://127.0.0.1:9944");

let apiInstance = null;
let keyringInstance = null;
let reconnectAttempts = 0;
const keyRingType = "sr25519";
const maxReconnectAttempts = 5; // Max number of reconnection attempts
const reconnectDelay = 1000; // Initial delay in milliseconds

async function createApiInstance() {
    const api = await ApiPromise.create({ provider: wsProvider });

    // Reset reconnect attempts on successful connection
    reconnectAttempts = 0;

    // Handle disconnection
    api.on('disconnected', async (event) => {
        console.log('Disconnected from the API:', event);
        initiateReconnection();
    });

    // Handle errors
    api.on('error', (error) => {
        console.error('API error:', error);
    });

    return api;
}

async function initiateReconnection() {
    if (reconnectAttempts < maxReconnectAttempts) {
        const delay = reconnectDelay * Math.pow(2, reconnectAttempts); // Exponential backoff
        console.log(`Attempting to reconnect in ${delay} ms`);
        setTimeout(async () => {
            try {
                console.log(`Reconnecting attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
                apiInstance = await createApiInstance(); // Attempt to recreate the API instance
            } catch (error) {
                console.error('Reconnection failed:', error);
                reconnectAttempts++;
                initiateReconnection(); // Try to reconnect again
            }
        }, delay);
    } else {
        console.error('Max reconnection attempts reached. Please check your network or WebSocket server.');
    }
}

export async function getApiInstance() {
    if (!apiInstance) {
        try {
            apiInstance = await createApiInstance();
        } catch (error) {
            console.error('Failed to create API instance:', error);
            initiateReconnection(); // Try to reconnect
        }
    }
    return apiInstance;
}

export function getKeyringInstance() {
    if (!keyringInstance) {
        keyringInstance = new Keyring({ type: keyRingType });
    }
    return keyringInstance;
}
