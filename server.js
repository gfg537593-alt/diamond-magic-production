// server.js - production-ready example to verify BEP20 ERC20 transfers and credit Firebase (Firestore)
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // download from Firebase Console

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const RPC_URL = process.env.BSC_RPC || 'https://bsc-dataseed.binance.org/';
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const TARGET_ADDRESS = (process.env.TARGET_ADDRESS || '0x610ba59b7a377a9d966aed765eea257906f15efe').toLowerCase();

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function decimals() view returns (uint8)"
];

const app = express();
app.use(bodyParser.json());

app.post('/api/verify-tx', async (req,res)=>{
  try{
    const { uid, txHash, tokenAddress, expectedAmount } = req.body;
    if(!uid || !txHash) return res.status(400).json({ error:'missing' });

    const payDoc = await db.collection('payments').doc(txHash).get();
    if(payDoc.exists) return res.status(400).json({ error:'already_processed' });

    const receipt = await provider.getTransactionReceipt(txHash);
    if(!receipt) return res.status(404).json({ error:'tx_not_found' });
    if(receipt.status !== 1) return res.status(400).json({ error:'tx_failed' });

    let credited = false;
    let creditedAmount = '0';
    let tokenAddrUsed = tokenAddress || null;

    for(const log of receipt.logs){
      if(tokenAddress && log.address.toLowerCase() !== tokenAddress.toLowerCase()) continue;
      try{
        const iface = new ethers.utils.Interface(ERC20_ABI);
        const parsed = iface.parseLog(log);
        if(parsed && parsed.name === 'Transfer'){
          const to = parsed.args.to.toLowerCase();
          const value = parsed.args.value;
          if(to === TARGET_ADDRESS){
            credited = true; creditedAmount = value.toString(); tokenAddrUsed = log.address.toLowerCase(); break;
          }
        }
      }catch(e){}
    }

    if(!credited) return res.status(400).json({ error:'no_transfer_to_target' });

    const tokenContract = new ethers.Contract(tokenAddrUsed, ERC20_ABI, provider);
    let decimals = 18;
    try{ decimals = await tokenContract.decimals(); }catch(e){ decimals = 18; }
    const humanAmount = ethers.utils.formatUnits(creditedAmount, decimals);

    if(expectedAmount && Number(humanAmount) < Number(expectedAmount)) return res.status(400).json({ error:'amount_too_small', found: humanAmount });

    await db.collection('payments').doc(txHash).set({ uid, txHash, token: tokenAddrUsed, amountRaw: creditedAmount, amount: humanAmount, decimals, to: TARGET_ADDRESS, processedAt: admin.firestore.FieldValue.serverTimestamp() });

    const userRef = db.collection('users').doc(uid);
    await db.runTransaction(async tx=>{
      const uDoc = await tx.get(userRef);
      const cur = uDoc.exists ? (uDoc.data().balance || 0) : 0;
      const newBal = Number(cur) + Number(humanAmount);
      tx.set(userRef, { balance: newBal }, { merge: true });
      const txRef = db.collection('transactions').doc();
      tx.set(txRef, { uid, type:'deposit', amount: humanAmount, token: tokenAddrUsed, txHash, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    });

    return res.json({ ok:true, amount: humanAmount, token: tokenAddrUsed });
  }catch(err){ console.error(err); return res.status(500).json({ error:'server_error', details: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on', PORT));
