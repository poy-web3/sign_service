import express from 'express';
import { getApiInstance, getKeyringInstance } from './polkadotService.js';

const app = express();
app.use(express.json());

app.post('/get_ubi', async (req, res) => {
    try {
        const { suri } = req.body;
        if (!suri) {
            return res.status(400).send('Missing suri in request body');
        }
        // console.log(req.body);
        const api = await getApiInstance();
        const keyring = getKeyringInstance();
        const user_ = keyring.addFromUri(suri);
        const tx = api.tx.coinbase.getUbi();
        const signedTx = await tx.signAsync(user_);
        res.json({ signedTx: signedTx.toHex() });
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
