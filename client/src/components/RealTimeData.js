import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase-config";  // Impor konfigurasi Firebase

const RealTimeData = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const dataRef = ref(database, "path/to/data");  // Ganti dengan path data Firebase Anda
    onValue(dataRef, (snapshot) => {
      const dataVal = snapshot.val();
      setData(dataVal);
    });
  }, []);

  return (
    <div>
      <h1>Data Real-Time</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default RealTimeData;
