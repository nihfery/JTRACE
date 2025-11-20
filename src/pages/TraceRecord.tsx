import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { FileText, Loader2 } from "lucide-react";
import { ethers } from "ethers";
import contractAbi from "../abi/Jtrace.json";

const contractAddress = "0x7C162430F7D622A485D095F5C1cA87F38e0C7e70";

export default function TraceRecord() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Ambil total record dari contract
  const { data: totalRecords } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "recordCount",
  });

  useEffect(() => {
    const loadRecords = async () => {
      if (!totalRecords) return;

      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractAbi, provider);

      const total = Number(totalRecords);
      const temp: any[] = [];

      for (let i = 1; i <= total; i++) {
        try {
          const rec = await contract.getRecord(i);

          temp.push({
            id: rec[0].toString(),
            patient: rec[1],
            uploader: rec[2],
            ipfsHash: rec[3],
            recordType: rec[4],
            timestamp: rec[5].toString(),
          });
        } catch (e) {
          console.log("Record tidak bisa dibaca:", i);
        }
      }

      setRecords(temp);
      setLoading(false);
    };

    loadRecords();
  }, [totalRecords]);

  return (
    <div className="max-w-6xl mx-auto bg-gray-900/50 border border-white/10 rounded-lg p-6 mt-32 backdrop-blur-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-400" />
        Semua Riwayat Rekam Medis
      </h2>

      {loading && (
        <div className="flex items-center gap-2 mt-6 text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          Mengambil data dari blockchain...
        </div>
      )}

      {!loading && records.length === 0 && (
        <div className="p-3 mt-4 bg-red-600/20 text-red-400 rounded">
          Tidak ada data rekam medis.
        </div>
      )}

      {!loading && records.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm text-gray-300 border border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Uploader</th>
                <th className="px-4 py-2">IPFS</th>
                <th className="px-4 py-2">Jenis</th>
                <th className="px-4 py-2">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-t border-gray-700 hover:bg-gray-800/40">
                  <td className="px-4 py-2">{r.id}</td>
                  <td className="px-4 py-2">{r.patient}</td>
                  <td className="px-4 py-2">{r.uploader}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`https://ipfs.io/ipfs/${r.ipfsHash}`}
                      target="_blank"
                      className="text-blue-400 underline"
                    >
                      {r.ipfsHash.slice(0, 10)}...
                    </a>
                  </td>
                  <td className="px-4 py-2">{r.recordType}</td>
                  <td className="px-4 py-2">
                    {new Date(Number(r.timestamp) * 1000).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
