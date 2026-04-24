const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  "projectId": "studio-3067503220-b7d50",
  "appId": "1:959904790225:web:2bd6934ed297c37eacf7f0",
  "apiKey": "AIzaSyD_qHaYdVYh4VrE2ryDmlJSqL61ha7A1D8",
  "authDomain": "studio-3067503220-b7d50.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "959904790225"
};

async function probe() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log("Probing CentrosDeNegocios...");
  const snap = await getDocs(query(collection(db, 'CentrosDeNegocios'), limit(10)));
  
  if (snap.empty) {
    console.log("Collection 'CentrosDeNegocios' is empty.");
    return;
  }
  
  for (const d of snap.docs) {
    console.log(`Document ID: ${d.id}`);
    console.log(`Data: ${JSON.stringify(d.data(), null, 2)}`);
    
    // Check for "Name" subcollection directly just in case based on user's wording
    const subSnap = await getDocs(collection(db, `CentrosDeNegocios/${d.id}/Name`));
    if (!subSnap.empty) {
      console.log(`  Subcollection 'Name' exists for doc ${d.id}:`);
      subSnap.forEach(sd => console.log(`    Subdoc ${sd.id}: ${JSON.stringify(sd.data())}`));
    }
  }
}

probe().catch(console.error);
